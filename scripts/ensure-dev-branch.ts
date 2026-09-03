/**
 * Runs automatically before `next dev` (see package.json `predev`).
 * Creates a fresh Neon dev branch off main and points .env.local at it.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { createDevBranch, getBranchAuthConfig, getConnectionUri } from "../lib/neon/branches";

const ENV_LOCAL_PATH = ".env.local";
const STATE_FILE_PATH = ".neon-dev-branch.json";
// Belt-and-suspenders: auto-delete via Neon too, in case postdev never runs (e.g. process killed).
const BRANCH_TTL_HOURS = 24;

function setEnvVar(contents: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(contents) ? contents.replace(pattern, line) : `${contents.trimEnd()}\n${line}\n`;
}

async function main() {
  if (!existsSync(ENV_LOCAL_PATH)) {
    throw new Error(`${ENV_LOCAL_PATH} not found; cannot update it with new branch credentials`);
  }

  const existingDatabaseUrl = process.env.DATABASE_URL;
  if (!existingDatabaseUrl) {
    throw new Error("DATABASE_URL must already be set in .env.local so the role/database can be reused");
  }

  const parsed = new URL(existingDatabaseUrl);
  const roleName = decodeURIComponent(parsed.username);
  const databaseName = decodeURIComponent(parsed.pathname.slice(1));

  const { branch } = await createDevBranch({ expiresInHours: BRANCH_TTL_HOURS });
  console.log(`Created Neon dev branch "${branch.name}" (${branch.id}), expires in ${BRANCH_TTL_HOURS}h`);

  const [databaseUrl, authConfig] = await Promise.all([
    getConnectionUri(branch.id, databaseName, roleName, true),
    getBranchAuthConfig(branch.id),
  ]);

  let envContents = readFileSync(ENV_LOCAL_PATH, "utf8");
  envContents = setEnvVar(envContents, "DATABASE_URL", databaseUrl);
  envContents = setEnvVar(envContents, "NEON_AUTH_BASE_URL", authConfig.base_url);
  writeFileSync(ENV_LOCAL_PATH, envContents);

  writeFileSync(STATE_FILE_PATH, JSON.stringify({ id: branch.id, name: branch.name }, null, 2));

  console.log(`Updated ${ENV_LOCAL_PATH} with DATABASE_URL and NEON_AUTH_BASE_URL for the new branch`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
