/**
 * Runs automatically after `next dev` exits (see package.json `postdev`).
 * Deletes the Neon dev branch that `predev` created for this session.
 *
 * Note: npm only runs `postdev` if `dev` exits with status 0. Stopping the
 * dev server with Ctrl+C may skip this; the branch still auto-expires
 * (see BRANCH_TTL_HOURS in ensure-dev-branch.ts) as a fallback.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { deleteBranch } from "../lib/neon/branches";

const STATE_FILE_PATH = ".neon-dev-branch.json";

async function main() {
  if (!existsSync(STATE_FILE_PATH)) {
    console.log("No Neon dev branch recorded; nothing to clean up");
    return;
  }

  const { id, name } = JSON.parse(readFileSync(STATE_FILE_PATH, "utf8")) as { id: string; name: string };

  await deleteBranch(id);
  rmSync(STATE_FILE_PATH);

  console.log(`Deleted Neon dev branch "${name}" (${id})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
