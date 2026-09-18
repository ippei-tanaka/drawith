import { randomUUID } from "crypto";
import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { loginAs, graphql, getSessionUserId } from "./helpers/api";

let owner: APIRequestContext;
let intruder: APIRequestContext;
let invitee: APIRequestContext;
let ownerId: string;
let inviteeId: string;

test.beforeAll(async () => {
  owner = await loginAs(testUsers.owner);
  intruder = await loginAs(testUsers.intruder);
  invitee = await loginAs(testUsers.invitee);
  ownerId = await getSessionUserId(owner);
  inviteeId = await getSessionUserId(invitee);
});

test.afterAll(async () => {
  await Promise.all([owner.dispose(), intruder.dispose(), invitee.dispose()]);
});

async function createBoard(ownerContext: APIRequestContext) {
  const id = randomUUID();
  const name = `board-${id}`;
  const result = await graphql<{ createOnedrawing_board: { id: string; name: string; display_name: string } }>(
    ownerContext,
    `mutation($input: drawing_boardCreate!) {
      createOnedrawing_board(input: $input) { id name display_name }
    }`,
    { input: { id, name, display_name: "Original name", owner_id: ownerId } },
  );
  const board = result.data?.createOnedrawing_board;
  if (!board) throw new Error(`Failed to create board: ${JSON.stringify(result.errors)}`);
  return board;
}

async function getBoardById(context: APIRequestContext, id: string) {
  const result = await graphql<{ findFirstdrawing_board: { id: string; display_name: string } | null }>(
    context,
    `query($id: String!) {
      findFirstdrawing_board(where: { id: { eq: $id } }) { id display_name }
    }`,
    { id },
  );
  return result.data?.findFirstdrawing_board ?? null;
}


test.describe("board ownership", () => {

  test("a non-owner cannot rename another user's board", async () => {
    const board = await createBoard(owner);

    await graphql(
      intruder,
      `mutation($where: drawing_boardWhere, $input: drawing_boardUpdate!) {
        updatedrawing_board(where: $where, input: $input) { id display_name }
      }`,
      { where: { id: { eq: board.id } }, input: { display_name: "Hijacked" } },
    );

    const stillOwnedBoard = await getBoardById(owner, board.id);
    expect(stillOwnedBoard?.display_name).toBe("Original name");
  });



  test("a non-owner cannot delete another user's board", async () => {
    const board = await createBoard(owner);

    await graphql(
      intruder,
      `mutation($where: drawing_boardWhere) {
        deletedrawing_board(where: $where) { id }
      }`,
      { where: { id: { eq: board.id } } },
    );

    const stillExists = await getBoardById(owner, board.id);
    expect(stillExists?.id).toBe(board.id);
  });

});
