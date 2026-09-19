import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { graphql } from "./helpers/api";
import { loginAs, getSessionUserId } from "./helpers/auth";
import { createBoard, createInvitation, findInvitationById } from "./helpers/utilities";

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

test.describe("board invitation ownership", () => {
  test("a board owner can create an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id, inviteeId);

    expect(invitation.drawing_board_id).toBe(board.id);
    expect(invitation.invitee_id).toBe(inviteeId);
    expect(await findInvitationById(owner, invitation.id)).not.toBeNull();
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
    const invitation = await createInvitation(owner, board.id, inviteeId);
    const result = await graphql<{ deleteDrawingBoardInvitation: { id: string } }>(
      invitee,
      `mutation($id: String!) {
        deleteDrawingBoardInvitation(id: $id) { id }
      }`,
      { id: invitation.id },
    );

    expect(result.data?.deleteDrawingBoardInvitation.id).toBe(invitation.id);
    expect(await findInvitationById(owner, invitation.id)).toBeNull();
  });

  test("a board owner can remove an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id, inviteeId);
    const result = await graphql<{ deleteDrawingBoardInvitation: { id: string } }>(
      owner,
      `mutation($id: String!) {
        deleteDrawingBoardInvitation(id: $id) { id }
      }`,
      { id: invitation.id },
    );

    expect(result.data?.deleteDrawingBoardInvitation.id).toBe(invitation.id);
    expect(await findInvitationById(owner, invitation.id)).toBeNull();
  });

  test("a non-owner and non-invitee cannot remove an invitation", async () => {
    const board = await createBoard(owner);
    const invitation = await createInvitation(owner, board.id, inviteeId);
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
    expect(await findInvitationById(owner, invitation.id)).not.toBeNull();
  });
});