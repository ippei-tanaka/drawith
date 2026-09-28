import { defineConfig } from "drizzle-kit";

const databaseURL = process.env.DRAWITH_DATABASE_URL ?? "";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseURL,
  },
});
