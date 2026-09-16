import { request as apiRequest, type APIRequestContext } from "playwright/test";

export type Credentials = { email: string; password: string };

/** Logs in as the given user and returns a request context carrying their session cookie. */
export async function loginAs(user: Credentials): Promise<APIRequestContext> {
  const context = await apiRequest.newContext({ baseURL: process.env.APP_URL });
  const response = await context.post("/api/auth/sign-in/email", {
    data: { email: user.email, password: user.password },
  });
  if (!response.ok()) {
    throw new Error(`Login failed for ${user.email}: ${response.status()} ${await response.text()}`);
  }
  return context;
}

export type GraphQLResponse<T> = {
  data?: T | null;
  errors?: Array<{ message: string }>;
};

/** Sends a GraphQL request through the given (already authenticated, or anonymous) context. */
export async function graphql<T = unknown>(
  context: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLResponse<T>> {
  const response = await context.post("/api/graphql", {
    data: { query, variables },
  });
  return response.json();
}

/** Looks up a seeded test user's internal id by email (public read, no auth needed). */
export async function findUserIdByEmail(context: APIRequestContext, email: string): Promise<string> {
  const result = await graphql<{ findFirstuser: { id: string } | null }>(
    context,
    `query($email: String!) {
      findFirstuser(where: { email: { eq: $email } }) { id }
    }`,
    { email },
  );
  const id = result.data?.findFirstuser?.id;
  if (!id) {
    throw new Error(`Could not find seeded user with email ${email}: ${JSON.stringify(result.errors)}`);
  }
  return id;
}
