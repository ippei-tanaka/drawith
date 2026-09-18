import { ApolloServer } from '@apollo/server';
import { db } from '../db/db';
import { relations, drawingBoard, drawingBoardMembership } from '../db/schema';
import SchemaBuilder from "@pothos/core";
import DrizzlePlugin from "@pothos/plugin-drizzle";
import PothosDrizzleGeneratorPlugin, { isOperation } from "pothos-drizzle-generator";
import { and, or, eq } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

export interface PothosTypes {
  DrizzleRelations: typeof relations;
  Context: { userId?: string };
  Objects: { 
    DrawingBoardMembership: typeof drawingBoardMembership.$inferSelect
  };
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
    use: { 
      exclude: [
        "account", 
        "session", 
        "verification"
      ]
    },
    all: {
      executable: ({ ctx, operation }) => 
        isOperation("mutation", operation) ? Boolean(ctx.userId) : true,
    },
    models: {
      user: {
        operations: () => ({ exclude: ["mutation", "createOne", "createMany"] }),
        where: ({ ctx, operation }) => ({ id: ctx.userId })
      },
      userProfile: {
        operations: () => ({ exclude: ["createMany"] }),
        where: ({ ctx, operation }) =>
          isOperation(["update", "delete"], operation)
            ? { user_id: ctx.userId }
            : {},
        inputData: ({ ctx, operation }) =>
          isOperation(["createOne"], operation)
            ? { user_id: ctx.userId }
            : undefined,
      },
      drawingBoard: {
        where: ({ ctx, operation }) => {
          if (isOperation("mutation", operation)) {
            return { owner_id: ctx.userId };
          }
        },
        inputData: ({ ctx, operation }) =>
          isOperation("mutation", operation)
            ? { owner_id: ctx.userId }
            : undefined,
      },
      drawingBoardMembership: {
        operations: () => ({ include: ["query"] })
      }
    },
  },
});

builder.objectType("DrawingBoardMembership", {
  fields: (t) => ({
    id: t.exposeString("id"),
    drawing_board_id: t.exposeString("drawing_board_id"),
    member_id: t.exposeString("member_id"),
    created_at: t.field({
      type: "String",
      resolve: (membership) => membership.created_at.toISOString(),
    }),
    updated_at: t.field({
      type: "String",
      resolve: (membership) => membership.updated_at.toISOString(),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({

    createBoardMembership: t.field({
      type: "DrawingBoardMembership",
      args: {
        drawingBoardId: t.arg.string({ required: true }),
        memberId: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.userId) {
          throw new Error("Authentication required");
        }
        const [ownedBoard] = await db
          .select({ id: drawingBoard.id })
          .from(drawingBoard)
          .where(
            and(
              eq(drawingBoard.id, args.drawingBoardId),
              eq(drawingBoard.owner_id, ctx.userId),
            ),
          )
          .limit(1);
        if (!ownedBoard) {
          throw new Error("Only the board owner can add memberships");
        }
        const [membership] = await db
          .insert(drawingBoardMembership)
          .values({
            id: crypto.randomUUID(),
            drawing_board_id: args.drawingBoardId,
            member_id: args.memberId,
          })
          .returning();
        return membership;
      },
    }),

    deleteBoardMembership: t.field({
      type: "DrawingBoardMembership",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.userId) {
          throw new Error("Authentication required");
        }

        const [membership] = await db
          .select({ id: drawingBoardMembership.id })
          .from(drawingBoardMembership)
          .leftJoin(drawingBoard, eq(drawingBoard.id, drawingBoardMembership.drawing_board_id))
          .where(
            or(
              and(
                eq(drawingBoardMembership.id, args.id),
                eq(drawingBoardMembership.member_id, ctx.userId),
              ),
              and(
                eq(drawingBoard.id, drawingBoardMembership.drawing_board_id),
                eq(drawingBoard.owner_id, ctx.userId),
              ),
            ),
          )
          .limit(1);

        if (!membership) {
          throw new Error("Membership not found or you do not have permission to delete it");
        }

        const [deletedMembership] = await db
          .delete(drawingBoardMembership)
          .where(eq(drawingBoardMembership.id, membership.id))
          .returning();

        return deletedMembership;
      },
    }),
  }),
});

const schema = builder.toSchema();

export const server = new ApolloServer({schema});
