// import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

// config({ path: '.env' });

// console.log('DATABASE_URL', process.env.DATABASE_URL);

// const databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/${process.env.POSTGRES_DB}`

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
