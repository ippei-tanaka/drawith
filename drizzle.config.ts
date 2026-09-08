import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./lib/auth/schema.ts", "./src/schema.ts"],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
