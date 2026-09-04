import { createNeonAuth } from "@neondatabase/auth/next/server";

/*
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? (isBuildPhase ? "https://build.invalid" : ""),
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET ?? (isBuildPhase ? "build-only-secret-not-for-runtime" : ""),
  },
});

import { createNeonAuth } from '@neondatabase/auth/next/server';
*/

console.log("NEON_AUTH_BASE_URL:", process.env.NEON_AUTH_BASE_URL);
console.log("NEON_AUTH_COOKIE_SECRET:", process.env.NEON_AUTH_COOKIE_SECRET);

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});