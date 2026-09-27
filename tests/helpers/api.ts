import { type APIRequestContext } from "playwright/test";

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
