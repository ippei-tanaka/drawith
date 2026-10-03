import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schema";

const databaseURL = `postgresql://${process.env.DRAWITH_DATABASE_USER}:${process.env.DRAWITH_DATABASE_PASSWORD}@${process.env.DRAWITH_DATABASE_HOST}:${process.env.DRAWITH_DATABASE_PORT}/${process.env.DRAWITH_DATABASE_NAME}${process.env.DRAWITH_DATABASE_CONNECTION_PARAMS ? `?${process.env.DRAWITH_DATABASE_CONNECTION_PARAMS}` : ""}`;

export const db = drizzle({
  connection: databaseURL,
  relations,
  // logger: true,
});
