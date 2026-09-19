import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { graphql } from "./helpers/api";
import { loginAs, getSessionUserId } from "./helpers/auth";
import { createBoard } from "./helpers/utilities";

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


test.describe("board member ownership", () => {

  test("a owner can remove a board membership", async () => {
    const board = await createBoard(owner);
    const membershipResult = await graphql<{ createBoardMembership: { id: string } }>(
      owner,
      `mutation($drawingBoardId: String!, $memberId: String!) {
          createBoardMembership(drawingBoardId: $drawingBoardId, memberId: $memberId) 
          { id }
      }`,
      { drawingBoardId: board.id, memberId: inviteeId },
    );
    const membership = membershipResult.data?.createBoardMembership;
    if (!membership) throw new Error(`Failed to create board membership: ${JSON.stringify(membershipResult.errors)}`);

    const deleteResult = await graphql(
      owner,
      `mutation($id: String!) {
        deleteBoardMembership(id: $id) { id }
      }`,
      { id: membership.id },
    );

    const check = await graphql<{ findFirstdrawing_board_membership: { id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_membership(where: { id: { eq: $id } }) { id }
      }`,
      { id: membership.id },
    );
    expect(check.data?.findFirstdrawing_board_membership).toBeNull();
  });



  test("a member can remove their board membership", async () => {
    const board = await createBoard(owner);
    const membershipResult = await graphql<{ createBoardMembership: { id: string } }>(
      owner,
      `mutation($drawingBoardId: String!, $memberId: String!) {
          createBoardMembership(drawingBoardId: $drawingBoardId, memberId: $memberId) 
          { id }
      }`,
      { drawingBoardId: board.id, memberId: inviteeId },
    );
    const membership = membershipResult.data?.createBoardMembership;
    if (!membership) throw new Error(`Failed to create board membership: ${JSON.stringify(membershipResult.errors)}`);

    const deleteResult = await graphql(
      invitee,
      `mutation($id: String!) {
        deleteBoardMembership(id: $id) { id }
      }`,
      { id: membership.id },
    );

    const check = await graphql<{ findFirstdrawing_board_membership: { id: string } | null }>(
      invitee,
      `query($id: String!) {
        findFirstdrawing_board_membership(where: { id: { eq: $id } }) { id }
      }`,
      { id: membership.id },
    );
    
    expect(check.data?.findFirstdrawing_board_membership).toBeNull();
  });


  test("a non-owner cannot remove another owner's board membership", async () => {
    const board = await createBoard(owner);
    const membershipResult = await graphql<{ createBoardMembership: { id: string } }>(
      owner,
      `mutation($drawingBoardId: String!, $memberId: String!) {
          createBoardMembership(drawingBoardId: $drawingBoardId, memberId: $memberId) 
          { id }
      }`,
      { drawingBoardId: board.id, memberId: inviteeId },
    );
    const membership = membershipResult.data?.createBoardMembership;
    if (!membership) throw new Error(`Failed to create board membership: ${JSON.stringify(membershipResult.errors)}`);

    const deleteResult = await graphql(
      intruder,
      `mutation($id: String!) {
        deleteBoardMembership(id: $id) { id }
      }`,
      { id: membership.id },
    );

    const check = await graphql<{ findFirstdrawing_board_membership: { id: string } | null }>(
      owner,
      `query($id: String!) {
        findFirstdrawing_board_membership(where: { id: { eq: $id } }) { id }
      }`,
      { id: membership.id },
    );
    // console.log("CHECK", check);
    expect(check.data?.findFirstdrawing_board_membership).not.toBeNull();
  });

});