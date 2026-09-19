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
  const id = crypto.randomUUID();
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

async function createInvitation(ownerContext: APIRequestContext, boardId: string) {
  const result = await graphql<{ createDrawingBoardInvitation: { id: string; drawing_board_id: string; invitee_id: string } }>(
    ownerContext,
    `mutation($drawingBoardId: String!, $inviteeId: String!) {
      createDrawingBoardInvitation(drawingBoardId: $drawingBoardId, inviteeId: $inviteeId) {
        id drawing_board_id invitee_id
      }
    }`,
    { drawingBoardId: boardId, inviteeId },
  );
  const invitation = result.data?.createDrawingBoardInvitation;
  if (!invitation) throw new Error(`Failed to create invitation: ${JSON.stringify(result.errors)}`);
  return invitation;
}

async function findInvitation(context: APIRequestContext, id: string) {
  const result = await graphql<{ findFirstdrawing_board_invitation: { id: string } | null }>(
    context,
    `query($id: String!) {
      findFirstdrawing_board_invitation(where: { id: { eq: $id } }) { id }
    }`,
    { id },
  );
  return result.data?.findFirstdrawing_board_invitation;
}

test.describe("board invitation ownership", () => {
  test("a board owner can create an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id);

    expect(invitation.drawing_board_id).toBe(board.id);
    expect(invitation.invitee_id).toBe(inviteeId);
    expect(await findInvitation(owner, invitation.id)).not.toBeNull();
  });

  test("a non-owner cannot create an invitation", async () => {
    const board = await createBoard(owner);
    const result = await graphql(
      intruder,
      `mutation($drawingBoardId: String!, $inviteeId: String!) {
        createDrawingBoardInvitation(drawingBoardId: $drawingBoardId, inviteeId: $inviteeId) { id }
      }`,
      { drawingBoardId: board.id, inviteeId },
    );

    expect(result.errors?.map((error) => error.message).join(" ")).toContain("Only the board owner can create invitations");
  });

  test("an invitee can remove their invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id);
    const result = await graphql<{ deleteDrawingBoardInvitation: { id: string } }>(
      invitee,
      `mutation($id: String!) {
        deleteDrawingBoardInvitation(id: $id) { id }
      }`,
      { id: invitation.id },
    );

    expect(result.data?.deleteDrawingBoardInvitation.id).toBe(invitation.id);
    expect(await findInvitation(owner, invitation.id)).toBeNull();
  });

  test("a board owner can remove an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id);
    const result = await graphql<{ deleteDrawingBoardInvitation: { id: string } }>(
      owner,
      `mutation($id: String!) {
        deleteDrawingBoardInvitation(id: $id) { id }
      }`,
      { id: invitation.id },
    );

    expect(result.data?.deleteDrawingBoardInvitation.id).toBe(invitation.id);
    expect(await findInvitation(owner, invitation.id)).toBeNull();
  });

  test("a non-owner and non-invitee cannot remove an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id);
    const result = await graphql(
      intruder,
      `mutation($id: String!) {
        deleteDrawingBoardInvitation(id: $id) { id }
      }`,
      { id: invitation.id },
    );

    expect(result.errors?.map((error) => error.message).join(" ")).toContain(
      "Invitation not found or you do not have permission to delete it",
    );
    expect(await findInvitation(owner, invitation.id)).not.toBeNull();
  });
});