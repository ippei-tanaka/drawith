import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const userProfile = pgTable('user_profile', {
  userId: uuid('user_id').notNull().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// export type InsertUserProfile = typeof userProfile.$inferInsert;
// export type SelectUserProfile = typeof userProfile.$inferSelect;

export const drawingBoard = pgTable('drawing_board', {
  id: uuid('id').notNull().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => userProfile.userId),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});