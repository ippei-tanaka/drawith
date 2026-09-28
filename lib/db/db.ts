import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schema";

const databaseURL = process.env.DRAWITH_DATABASE_URL ?? "";

export const db = drizzle({
  connection: databaseURL,
  relations,
  // logger: true,
});
