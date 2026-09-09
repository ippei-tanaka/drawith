import { pgTable, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { defineRelations } from "drizzle-orm";
import { user } from '@/lib/auth/schema';

export const userProfile = pgTable('user_profile', {
  id: uuid('id').notNull().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const drawingBoard = pgTable('drawing_board', {
  id: uuid('id').notNull().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const relations = defineRelations(
  { user, userProfile, drawingBoard },
  (r) => ({
    user: {
      profile: r.one.userProfile({
        from: r.user.id,
        to: r.userProfile.userId,
        optional: false
      }),
      drawingBoards: r.many.drawingBoard(),
    },
    drawingBoard: {
      owner: r.one.user({
        from: r.drawingBoard.ownerId,
        to: r.user.id,
        optional: false
      }),
    }
  }),
);