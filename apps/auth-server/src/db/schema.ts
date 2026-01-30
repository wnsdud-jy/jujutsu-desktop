import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
    id: text('id').primaryKey(),
    githubId: integer('github_id').unique().notNull(),
    username: text('username').notNull(),
    accessToken: text('access_token'),
});

export const sessionTable = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => userTable.id),
    expiresAt: integer('expires_at').notNull(),
});
