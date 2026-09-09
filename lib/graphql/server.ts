import { ApolloServer } from '@apollo/server';
import { db } from '../db/db';
import { relations } from '../db/schema';
import SchemaBuilder from "@pothos/core";
import DrizzlePlugin from "@pothos/plugin-drizzle";
import PothosDrizzleGeneratorPlugin from "pothos-drizzle-generator";
import { getTableConfig } from "drizzle-orm/pg-core";

export interface PothosTypes {
  DrizzleRelations: typeof relations;
  Context: { userId?: string };
}

const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    DrizzlePlugin,
    PothosDrizzleGeneratorPlugin, // Register the generator plugin
  ],
  drizzle: {
    client: () => db,
    relations,
    getTableConfig,
  },
  pothosDrizzleGenerator: {
    // Define your global and model-specific rules here
  },
});

const schema = builder.toSchema();

export const server = new ApolloServer({schema});
