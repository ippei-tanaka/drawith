import type { APIRequestContext } from "playwright/test";
import { graphql } from "./api";
import { getSessionUserId } from "./auth";

export async function createBoard(ownerContext: APIRequestContext) {
  const name = `board-${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  const display_name = `Board Name ${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  const result = await graphql<{ createOnedrawing_board: { id: string; name: string; display_name: string } }>(
    ownerContext,
    `mutation($input: drawing_boardCreate!) {
      createOnedrawing_board(input: $input) { id name display_name }
    }`,
    { input: { name, display_name, owner_id: await getSessionUserId(ownerContext) } },
  );
  const board = result.data?.createOnedrawing_board;
  if (!board) throw new Error(`Failed to create board: ${JSON.stringify(result.errors)}`);
  return board;
};

export async function createInvitation(ownerContext: APIRequestContext, boardId: string, inviteeId: string) {
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

export async function findInvitationById(context: APIRequestContext, id: string) {
  const result = await graphql<{ findFirstdrawing_board_invitation: { id: string } | null }>(
    context,
    `query($id: String!) {
      findFirstdrawing_board_invitation(where: { id: { eq: $id } }) { id }
    }`,
    { id },
  );
  return result.data?.findFirstdrawing_board_invitation;
}

export async function findBoardById(context: APIRequestContext, id: string) {
  const result = await graphql<{ findFirstdrawing_board: { id: string; display_name: string } | null }>(
    context,
    `query($id: String!) {
      findFirstdrawing_board(where: { id: { eq: $id } }) { id display_name }
    }`,
    { id },
  );
  return result.data?.findFirstdrawing_board ?? null;
}

export async function findUserProfileById(context: APIRequestContext, userId: string) {
  const result = await graphql<{
    findFirstuser_profile: { id: string; user_id: string; username: string; first_name: string; last_name: string } | null;
  }>(
    context,
    `query($userId: String!) {
      findFirstuser_profile(where: { user_id: { eq: $userId } }) {
        id user_id username first_name last_name
      }
    }`,
    { userId },
  );
  if (result.errors?.length) throw new Error(`Failed to query user profile: ${JSON.stringify(result.errors)}`);
  return result.data?.findFirstuser_profile ?? null;
}
