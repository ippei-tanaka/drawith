import { defineConfig } from "drizzle-kit";

const databaseURL = `postgresql://${process.env.DRAWITH_DATABASE_USER}:${process.env.DRAWITH_DATABASE_PASSWORD}@${process.env.DRAWITH_DATABASE_HOST}:${process.env.DRAWITH_DATABASE_PORT}/${process.env.DRAWITH_DATABASE_NAME}${process.env.DRAWITH_DATABASE_CONNECTION_PARAMS ? `?${process.env.DRAWITH_DATABASE_CONNECTION_PARAMS}` : ""}`;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseURL,
  },
});
