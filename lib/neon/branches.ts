/**
 * Service for managing Neon Postgres branches via the Neon API.
 * https://neon.com/docs/guides/branching-neon-api
 */

const NEON_API_BASE_URL = "https://console.neon.tech/api/v2";

export interface NeonBranch {
  id: string;
  project_id: string;
  parent_id?: string;
  name: string;
  default: boolean;
  current_state: string;
  created_at: string;
  updated_at: string;
}

export interface NeonEndpoint {
  id: string;
  host: string;
  branch_id: string;
  type: "read_write" | "read_only";
  current_state: string;
}

export interface CreateBranchResult {
  branch: NeonBranch;
  endpoints: NeonEndpoint[];
}

function getNeonCredentials() {
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID;

  if (!apiKey) throw new Error("Missing required environment variable: NEON_API_KEY");
  if (!projectId) throw new Error("Missing required environment variable: NEON_PROJECT_ID");

  return { apiKey, projectId };
}

async function neonRequest<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${NEON_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Neon API request failed (${res.status} ${res.statusText}): ${body}`);
  }

  return res.json() as Promise<T>;
}

/** Lists all branches for the configured Neon project. */
export async function listBranches(): Promise<NeonBranch[]> {
  const { apiKey, projectId } = getNeonCredentials();
  const data = await neonRequest<{ branches: NeonBranch[] }>(`/projects/${projectId}/branches`, apiKey);
  return data.branches;
}

/** Finds the project's default branch (typically named "main"). */
export async function getMainBranch(): Promise<NeonBranch> {
  const branches = await listBranches();
  const main = branches.find((b) => b.default) ?? branches.find((b) => b.name === "main");

  if (!main) throw new Error("Could not find a default/main branch for the Neon project");

  return main;
}

export interface CreateDevBranchOptions {
  /** Name for the new branch. Defaults to a generated `dev/<timestamp>` name. */
  name?: string;
  /** Whether to provision a read-write compute endpoint for the branch. Defaults to true. */
  withEndpoint?: boolean;
  /** Auto-delete the branch after this many hours. Omit to disable expiration. */
  expiresInHours?: number;
}

/** Creates a new branch off the project's main branch, intended for development use. */
export async function createDevBranch(options: CreateDevBranchOptions = {}): Promise<CreateBranchResult> {
  const { apiKey, projectId } = getNeonCredentials();
  const mainBranch = await getMainBranch();
  const name = options.name ?? `dev/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const withEndpoint = options.withEndpoint ?? true;
  const expiresAt = options.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000).toISOString()
    : undefined;

  return neonRequest<CreateBranchResult>(`/projects/${projectId}/branches`, apiKey, {
    method: "POST",
    body: JSON.stringify({
      branch: {
        parent_id: mainBranch.id,
        name,
        ...(expiresAt ? { expires_at: expiresAt } : {}),
      },
      endpoints: withEndpoint ? [{ type: "read_write" }] : [],
    }),
  });
}

/** Fetches a pooled or direct Postgres connection URI for a branch/database/role. */
export async function getConnectionUri(
  branchId: string,
  databaseName: string,
  roleName: string,
  pooled = true,
): Promise<string> {
  const { apiKey, projectId } = getNeonCredentials();
  const params = new URLSearchParams({
    branch_id: branchId,
    database_name: databaseName,
    role_name: roleName,
    pooled: String(pooled),
  });

  const data = await neonRequest<{ uri: string }>(`/projects/${projectId}/connection_uri?${params}`, apiKey);
  return data.uri;
}

export interface NeonAuthConfig {
  base_url: string;
  jwks_url: string;
  db_name: string;
}

/** Retrieves the Neon Auth (Managed Better Auth) configuration for a branch. */
export async function getBranchAuthConfig(branchId: string): Promise<NeonAuthConfig> {
  const { apiKey, projectId } = getNeonCredentials();
  return neonRequest<NeonAuthConfig>(`/projects/${projectId}/branches/${branchId}/auth`, apiKey);
}

/** Deletes a branch by id from the configured Neon project. */
export async function deleteBranch(branchId: string): Promise<void> {
  const { apiKey, projectId } = getNeonCredentials();
  await neonRequest(`/projects/${projectId}/branches/${branchId}`, apiKey, { method: "DELETE" });
}
