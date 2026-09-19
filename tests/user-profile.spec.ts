import { test, expect, type APIRequestContext } from "playwright/test";
import { testUsers } from "./fixtures/users";
import { loginAs, graphql, getSessionUserId } from "./helpers/api";

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

async function getOwnerProfile(context: APIRequestContext) {
  const result = await graphql<{
    findFirstuser_profile: { id: string; user_id: string; username: string; first_name: string; last_name: string } | null;
  }>(
    context,
    `query($userId: String!) {
      findFirstuser_profile(where: { user_id: { eq: $userId } }) {
        id user_id username first_name last_name
      }
    }`,
    { userId: ownerId },
  );
  if (result.errors?.length) throw new Error(`Failed to query user profile: ${JSON.stringify(result.errors)}`);
  return result.data?.findFirstuser_profile ?? null;
}



test.describe("user profile permissions", () => {

  
  test("allows the owner to update their own profile", async () => {
    const before = await getOwnerProfile(owner);
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
    const before = await getOwnerProfile(owner);
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
    expect(await getOwnerProfile(owner)).toEqual(before);
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
          id: crypto.randomUUID(),
          username: `second-owner-profile-${crypto.randomUUID()}`,
          user_id: ownerId,
          first_name: "Second",
          last_name: "Profile",
        },
      },
    );
    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    // expect(result.errors?.[0].message).toMatch(/unique|duplicate/i);
    expect(await getOwnerProfile(owner)).not.toBeNull();
  });

  test("does not allow duplicate profile usernames", async () => {
    const ownerProfile = await getOwnerProfile(owner);
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
