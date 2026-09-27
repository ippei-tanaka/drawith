import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schema";

const databaseURL =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`;

export const db = drizzle({
  connection: databaseURL,
  relations,
  // logger: true,
});
