import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

if (process.env.npm_lifecycle_script === "drizzle-kit") {
  config({ path: '.env.local' });
} else {
  config({ path: '.env' });
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
