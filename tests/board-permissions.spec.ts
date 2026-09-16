import { randomUUID } from "crypto";
import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { loginAs, graphql, findUserIdByEmail } from "./helpers/api";

/**
 * These tests exercise the "another user must not be able to modify or delete
 * resources they don't own" rule for boards, board members, and board
 * invitations. They run against the ephemeral docker-compose.test.yml stack
 * seeded with the fixed users in tests/fixtures/users.ts.
 */

let owner: APIRequestContext;
let intruder: APIRequestContext;
let invitee: APIRequestContext;
let ownerId: string;
let inviteeId: string;

test.beforeAll(async () => {
  owner = await loginAs(testUsers.owner);
  intruder = await loginAs(testUsers.intruder);
  invitee = await loginAs(testUsers.invitee);
  ownerId = await findUserIdByEmail(owner, testUsers.owner.email);
  inviteeId = await findUserIdByEmail(owner, testUsers.invitee.email);
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
    expect(stillExists).not.toBeNull();
  });
});

test.describe("board member ownership", () => {
  test("a non-owner cannot remove another owner's board member", async () => {
    const board = await createBoard(owner);
    const memberResult = await graphql<{ createOnedrawing_board_member: { id: string } }>(
      owner,
      `mutation($input: drawing_board_memberCreate!) {
        createOnedrawing_board_member(input: $input) { id }
      }`,
      { input: { id: randomUUID(), drawing_board_id: board.id, member_id: inviteeId } },
    );
    const member = memberResult.data?.createOnedrawing_board_member;
    if (!member) throw new Error(`Failed to create board member: ${JSON.stringify(memberResult.errors)}`);

    await graphql(
      intruder,
      `mutation($where: drawing_board_memberWhere) {
        deletedrawing_board_member(where: $where) { id }
      }`,
      { where: { id: { eq: member.id } } },
    );

    const check = await graphql<{ findFirstdrawing_board_member: { id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_member(where: { id: { eq: $id } }) { id }
      }`,
      { id: member.id },
    );
    expect(check.data?.findFirstdrawing_board_member).not.toBeNull();
  });

  test("a non-owner cannot reassign another owner's board member", async () => {
    const board = await createBoard(owner);
    const memberResult = await graphql<{ createOnedrawing_board_member: { id: string } }>(
      owner,
      `mutation($input: drawing_board_memberCreate!) {
        createOnedrawing_board_member(input: $input) { id }
      }`,
      { input: { id: randomUUID(), drawing_board_id: board.id, member_id: inviteeId } },
    );
    const member = memberResult.data?.createOnedrawing_board_member;
    if (!member) throw new Error(`Failed to create board member: ${JSON.stringify(memberResult.errors)}`);
    const intruderId = await findUserIdByEmail(owner, testUsers.intruder.email);

    await graphql(
      intruder,
      `mutation($where: drawing_board_memberWhere, $input: drawing_board_memberUpdate!) {
        updatedrawing_board_member(where: $where, input: $input) { id member_id }
      }`,
      { where: { id: { eq: member.id } }, input: { member_id: intruderId } },
    );

    const check = await graphql<{ findFirstdrawing_board_member: { member_id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_member(where: { id: { eq: $id } }) { member_id }
      }`,
      { id: member.id },
    );
    expect(check.data?.findFirstdrawing_board_member?.member_id).toBe(inviteeId);
  });
});

test.describe("board invitation ownership", () => {
  test("a non-owner cannot delete another owner's board invitation", async () => {
    const board = await createBoard(owner);
    const invitationResult = await graphql<{ createOnedrawing_board_invitation: { id: string } }>(
      owner,
      `mutation($input: drawing_board_invitationCreate!) {
        createOnedrawing_board_invitation(input: $input) { id }
      }`,
      { input: { id: randomUUID(), drawing_board_id: board.id, invitee_id: inviteeId } },
    );
    const invitation = invitationResult.data?.createOnedrawing_board_invitation;
    if (!invitation) throw new Error(`Failed to create invitation: ${JSON.stringify(invitationResult.errors)}`);

    await graphql(
      intruder,
      `mutation($where: drawing_board_invitationWhere) {
        deletedrawing_board_invitation(where: $where) { id }
      }`,
      { where: { id: { eq: invitation.id } } },
    );

    const check = await graphql<{ findFirstdrawing_board_invitation: { id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_invitation(where: { id: { eq: $id } }) { id }
      }`,
      { id: invitation.id },
    );
    expect(check.data?.findFirstdrawing_board_invitation).not.toBeNull();
  });

  test("a non-owner cannot modify another owner's board invitation", async () => {
    const board = await createBoard(owner);
    const invitationResult = await graphql<{ createOnedrawing_board_invitation: { id: string } }>(
      owner,
      `mutation($input: drawing_board_invitationCreate!) {
        createOnedrawing_board_invitation(input: $input) { id }
      }`,
      { input: { id: randomUUID(), drawing_board_id: board.id, invitee_id: inviteeId } },
    );
    const invitation = invitationResult.data?.createOnedrawing_board_invitation;
    if (!invitation) throw new Error(`Failed to create invitation: ${JSON.stringify(invitationResult.errors)}`);
    const intruderId = await findUserIdByEmail(owner, testUsers.intruder.email);

    await graphql(
      intruder,
      `mutation($where: drawing_board_invitationWhere, $input: drawing_board_invitationUpdate!) {
        updatedrawing_board_invitation(where: $where, input: $input) { id invitee_id }
      }`,
      { where: { id: { eq: invitation.id } }, input: { invitee_id: intruderId } },
    );

    const check = await graphql<{ findFirstdrawing_board_invitation: { invitee_id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_invitation(where: { id: { eq: $id } }) { invitee_id }
      }`,
      { id: invitation.id },
    );
    expect(check.data?.findFirstdrawing_board_invitation?.invitee_id).toBe(inviteeId);
  });
});
