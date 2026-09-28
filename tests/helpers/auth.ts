import { request as apiRequest, type APIRequestContext } from "playwright/test";

export type Credentials = { email: string; password: string };

/** Logs in as the given user and returns a request context carrying their session cookie. */
export async function loginAs(user: Credentials): Promise<APIRequestContext> {
  const context = await apiRequest.newContext({ baseURL: process.env.DRAWITH_TEST_APP_URL });
  const response = await context.post("/api/auth/sign-in/email", {
    data: { email: user.email, password: user.password },
  });
  if (!response.ok()) {
    throw new Error(`Login failed for ${user.email}: ${response.status()} ${await response.text()}`);
  }
  return context;
}

type BetterAuthSessionResponse = {
  user?: { id: string } | null;
  session?: unknown | null;
};

/** Gets the authenticated user id from Better Auth for this request context. */
export async function getSessionUserId(context: APIRequestContext): Promise<string> {
  const response = await context.get("/api/auth/get-session");
  const result = (await response.json()) as BetterAuthSessionResponse | null;
  const id = result?.user?.id;
  if (!response.ok() || !id) {
    throw new Error(`Could not get the authenticated Better Auth user: ${response.status()} ${JSON.stringify(result)}`);
  }
  return id;
}
