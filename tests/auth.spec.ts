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

test.describe("auth schema permissions", () => {

  test("does not let intruder query or mutate other users", async () => {
    const query = await graphql<{ findFirstuser: { id: string; email: string } | null }>(
      intruder,
      `query($email: String!) {
        findFirstuser(where: { email: { eq: $email } }) { id email }
      }`,
      { email: testUsers.owner.email },
    );
    expect(query.errors).toBeUndefined();
    expect(query.data?.findFirstuser?.id).toBeUndefined();

    const mutation = await graphql(
      intruder,
      `mutation($where: userWhere, $input: userUpdate!) {
        updateuser(where: $where, input: $input) { id name }
      }`,
      { where: { id: { eq: ownerId } }, input: { name: "Not allowed" } },
    );
    expect(mutation.errors?.length).toBeGreaterThan(0);
  });

  test("does let owner query their own user data", async () => {
    const query = await graphql<{ findFirstuser: { id: string; email: string } | null }>(
      owner,
      `query($email: String!) {
        findFirstuser(where: { email: { eq: $email } }) { id email }
      }`,
      { email: testUsers.owner.email },
    );
    expect(query.errors).toBeUndefined();
    expect(query.data?.findFirstuser?.id).toBe(ownerId);
  });

  test("does not let owner mutate their own user data (via graphql)", async () => {
    const mutation = await graphql(
      owner,
      `mutation($where: userWhere, $input: userUpdate!) {
        updateuser(where: $where, input: $input) { id name }
      }`,
      { where: { id: { eq: ownerId } }, input: { name: "Allowed" } },
    );
    expect(mutation.errors?.length).toBeGreaterThan(0);
  });

  test("does not expose session queries or mutations", async () => {
    const query = await graphql(
      intruder,
      `query {
        findFirstsession { id }
      }`,
    );

    expect(query.errors?.length).toBeGreaterThan(0);

    const mutation = await graphql(
      intruder,
      `mutation($where: sessionWhere, $input: sessionUpdate!) {
        updatesession(where: $where, input: $input) { id }
      }`,
      { where: { id: { eq: "not-a-real-session" } }, input: { token: "Not allowed" } },
    );

    expect(mutation.errors?.length).toBeGreaterThan(0);
  });

  test("does not expose account queries or mutations", async () => {
    const query = await graphql(
      intruder,
      `query {
        findFirstaccount { id }
      }`,
    );

    expect(query.errors?.length).toBeGreaterThan(0);

    const mutation = await graphql(
      intruder,
      `mutation($where: accountWhere, $input: accountUpdate!) {
        updateaccount(where: $where, input: $input) { id }
      }`,
      { where: { id: { eq: "not-a-real-account" } }, input: { password: "Not allowed" } },
    );

    expect(mutation.errors?.length).toBeGreaterThan(0);
  });

  test("does not expose verification queries or mutations", async () => {
    const query = await graphql(
      intruder,
      `query {
        findFirstverification { id }
      }`,
    );

    expect(query.errors?.length).toBeGreaterThan(0);

    const mutation = await graphql(
      intruder,
      `mutation($where: verificationWhere, $input: verificationUpdate!) {
        updateverification(where: $where, input: $input) { id }
      }`,
      { where: { id: { eq: "not-a-real-verification" } }, input: { value: "Not allowed" } },
    );

    expect(mutation.errors?.length).toBeGreaterThan(0);
  });
});
