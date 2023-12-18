import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator(
  (name) => `bowl-game-picks-23-24_${name}`,
);

export const games = mysqlTable("game", {
  id: int("id").notNull().primaryKey(),
  date: timestamp("date", { mode: "date" }).notNull(),
  awayTeam: varchar("awayTeam", { length: 255 }).notNull(),
  homeTeam: varchar("homeTeam", { length: 255 }).notNull(),
  startTime: timestamp("startTime", { mode: "date" }).notNull(),
  spread: varchar("spread", { length: 255 }).notNull(),
  total: varchar("total", { length: 255 }).notNull(),
  awayScore: int("awayScore"),
  homeScore: int("homeScore"),
  status: varchar("status", { length: 255 }).notNull(),
  winner: varchar("winner", { length: 255 }),
});

export const createGameSchema = createInsertSchema(games);

export const gamesRelations = relations(games, ({ many }) => ({
  picks: many(picks),
}));

export const picks = mysqlTable(
  "pick",
  {
    id: int("id").notNull().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    gameId: int("gameId").notNull(),
    pick: varchar("pick", { length: 255 }).notNull(),
    awayScore: int("awayScore"),
    homeScore: int("homeScore"),
  },
  (pick) => ({
    userIdIdx: index("userId_idx").on(pick.userId),
    gameIdIdx: index("gameId_idx").on(pick.gameId),
  }),
);

export const picksRelations = relations(picks, ({ one }) => ({
  user: one(users, { fields: [picks.userId], references: [users.id] }),
  game: one(games, { fields: [picks.gameId], references: [games.id] }),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  picks: many(picks),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
