import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { graphql } from "./helpers/api";
import { loginAs, getSessionUserId } from "./helpers/auth";
import { findUserProfileById } from "./helpers/utilities";

let owner: APIRequestContext;
let intruder: APIRequestContext;
let ownerId: string;

test.beforeAll(async () => {
  owner = await loginAs(testUsers.owner);
  intruder = await loginAs(testUsers.intruder);
  ownerId = await getSessionUserId(owner);
});

test.afterAll(async () => {
  await Promise.all([owner.dispose(), intruder.dispose()]);
});


test.describe("user profile permissions", () => {

  
  test("allows the owner to update their own profile", async () => {
    const before = await findUserProfileById(owner, ownerId);
    expect(before).not.toBeNull();

    const result = await graphql<{
      updateuser_profile: Array<{ id: string; user_id: string; first_name: string }>;
    }>(
      owner,
      `mutation($where: user_profileWhere, $input: user_profileUpdate!) {
        updateuser_profile(where: $where, input: $input) { id user_id first_name }
      }`,
      {
        where: { user_id: { eq: ownerId } },
        input: { first_name: "Updated owner" },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.updateuser_profile[0].user_id).toBe(ownerId);
    expect(result.data?.updateuser_profile[0].first_name).toBe("Updated owner");

    await graphql(
      owner,
      `mutation($where: user_profileWhere, $input: user_profileUpdate!) {
        updateuser_profile(where: $where, input: $input) { id }
      }`,
      {
        where: { user_id: { eq: ownerId } },
        input: { first_name: before!.first_name },
      },
    );
  });



  test("does not allow another user to update the owner's profile", async () => {
    const before = await findUserProfileById(owner, ownerId);
    expect(before).not.toBeNull();

    const result = await graphql<{
      updateuser_profile: Array<{ id: string; first_name: string }>;
    }>(
      intruder,
      `mutation($where: user_profileWhere, $input: user_profileUpdate!) {
        updateuser_profile(where: $where, input: $input) { id first_name }
      }`,
      {
        where: { user_id: { eq: ownerId } },
        input: { first_name: "Hijacked" },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.updateuser_profile).toEqual([]);
    expect(await findUserProfileById(owner, ownerId)).toEqual(before);
  });



  test("does not allow the owner to create a second profile", async () => {
    const result = await graphql<{
      createOneuser_profile: null;
    }>(
      owner,
      `mutation($input: user_profileCreate!) {
        createOneuser_profile(input: $input) { id user_id username }
      }`,
      {
        input: {
          username: `second-owner-profile-${crypto.getRandomValues(new Uint32Array(1))[0]}`,
          user_id: ownerId,
          first_name: "Second",
          last_name: "Profile",
        },
      },
    );
    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    // expect(result.errors?.[0].message).toMatch(/unique|duplicate/i);
    expect(await findUserProfileById(owner, ownerId)).not.toBeNull();
  });

  test("does not allow duplicate profile usernames", async () => {
    const ownerProfile = await findUserProfileById(owner, ownerId);
    expect(ownerProfile).not.toBeNull();

    const intruderProfile = await graphql<{
      findFirstuser_profile: { id: string; username: string } | null;
    }>(
      intruder,
      `query($userId: String!) {
        findFirstuser_profile(where: { user_id: { eq: $userId } }) { id username }
      }`,
      { userId: await getSessionUserId(intruder) },
    );
    const profile = intruderProfile.data?.findFirstuser_profile;

    const result = await graphql<{
      updateuser_profile: Array<{ id: string; username: string }>;
    }>(
      intruder,
      `mutation($where: user_profileWhere, $input: user_profileUpdate!) {
        updateuser_profile(where: $where, input: $input) { id username }
      }`,
      {
        where: { id: { eq: profile!.id } },
        input: { username: ownerProfile!.username },
      },
    );

    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(await graphql(
      intruder,
      `query($userId: String!) {
        findFirstuser_profile(where: { user_id: { eq: $userId } }) { id username }
      }`,
      { userId: await getSessionUserId(intruder) },
    )).toMatchObject({
      data: { findFirstuser_profile: profile },
    });
  });
});
