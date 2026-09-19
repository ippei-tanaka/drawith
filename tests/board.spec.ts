import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { graphql } from "./helpers/api";
import { loginAs, getSessionUserId } from "./helpers/auth";
import { createBoard, findBoardById } from "./helpers/utilities";

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


test.describe("board ownership", () => {

  test("a non-owner cannot rename another user's board", async () => {
    const board = await createBoard(owner);
    const originalDisplayName = board.display_name;

    await graphql(
      intruder,
      `mutation($where: drawing_boardWhere, $input: drawing_boardUpdate!) {
        updatedrawing_board(where: $where, input: $input) { id display_name }
      }`,
      { where: { id: { eq: board.id } }, input: { display_name: "Hijacked" } },
    );

    const stillOwnedBoard = await findBoardById(owner, board.id);
    expect(stillOwnedBoard?.display_name).toBe(originalDisplayName);
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

    const stillExists = await findBoardById(owner, board.id);
    expect(stillExists?.id).toBe(board.id);
  });

});
