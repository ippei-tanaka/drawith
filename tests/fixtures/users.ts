/**
 * Hardcoded credentials for the users seeded into the test-only database
 * (docker-compose.test.yml). Do not reuse these for anything but automated
 * permission tests against the ephemeral test environment.
 */
export const testUsers = {
  owner: {
    email: "owner@test.drawith.local",
    password: "owner-test-pw1",
    firstName: "Owner",
    lastName: "Test",
  },
  intruder: {
    email: "intruder@test.drawith.local",
    password: "intruder-test-pw1",
    firstName: "Intruder",
    lastName: "Test",
  },
  invitee: {
    email: "invitee@test.drawith.local",
    password: "invitee-test-pw1",
    firstName: "Invitee",
    lastName: "Test",
  },
} as const;

export type TestUserKey = keyof typeof testUsers;
