/**
 * Seeds the fixed set of test users (tests/fixtures/users.ts) into the
 * test-only database used by docker-compose.test.yml. Runs inside the app
 * container so it can reuse better-auth's own password hashing/session setup
 * instead of hand-rolling password hashes.
 *
 * Safe to run multiple times: existing users are skipped.
 */
import { randomUUID } from "crypto";
import { auth } from "../lib/auth/server";
import { db } from "../lib/db/db";
import { userProfile } from "../lib/db/schema";
import { testUsers } from "../tests/fixtures/users";

async function seedUser(user: (typeof testUsers)[keyof typeof testUsers]) {
  const result = await auth.api.signUpEmail({
    body: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      password: user.password,
    },
  });

  await db.insert(userProfile).values({
    id: randomUUID(),
    first_name: user.firstName,
    last_name: user.lastName,
    username: `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
    user_id: result.user.id,
  });

  return result.user.id;
}

async function main() {
  for (const user of Object.values(testUsers)) {
    try {
      const id = await seedUser(user);
      console.log(`[seed-test-users] seeded ${user.email} (${id})`);
    } catch (error) {
      console.log(`[seed-test-users] skipped ${user.email}: ${(error as Error).message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed-test-users] failed", error);
    process.exit(1);
  });
