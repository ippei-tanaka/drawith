import { pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// const neonAuth = pgSchema('neon_auth');

// // Managed by Neon Auth. It is declared here solely as the foreign-key target.
// const neonAuthUsers = neonAuth.table('user', {
//   id: uuid('id').primaryKey(),
// });

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .notNull()
    .primaryKey(),
    // .references(() => neonAuthUsers.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type SelectUserProfile = typeof userProfiles.$inferSelect;

