import { ApolloServer } from '@apollo/server';
import { db } from '../db/db';
import { relations } from '../db/schema';
import SchemaBuilder from "@pothos/core";
import DrizzlePlugin from "@pothos/plugin-drizzle";
import PothosDrizzleGeneratorPlugin, { isOperation } from "pothos-drizzle-generator";
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
    getTableConfig
  },
  pothosDrizzleGenerator: {
    all: {
      // Mutations require an authenticated user; reads remain public.
      executable: ({ ctx, operation }) =>
        isOperation("mutation", operation) ? Boolean(ctx.userId) : true,
    },
    models: {
      userProfile: {
        // Force the profile owner to the authenticated user; client-supplied user_id is ignored.
        inputData: ({ ctx, operation }) =>
          isOperation("mutation", operation) ? { user_id: ctx.userId } : undefined,
      },
      drawingBoard: {
        // Force the owner to the authenticated user; client-supplied owner_id is ignored.
        inputData: ({ ctx, operation }) =>
          isOperation("mutation", operation) ? { owner_id: ctx.userId } : undefined,
      },
      drawingBoardMember: {
        // Only the board owner can create, update, or delete membership rows.
        inputData: ({ ctx, operation }) =>
          isOperation("mutation", operation) ? { drawingBoard: { owner_id: ctx.userId } } : undefined,
      }
    },
  },
});

const schema = builder.toSchema();

export const server = new ApolloServer({schema});
