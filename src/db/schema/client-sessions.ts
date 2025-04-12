import { pgTable, uuid, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const clientSessions = pgTable("client_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionData: jsonb("session_data").notNull(),
  expired: boolean("expired").default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type for inserting a client session
export type NewClientSession = typeof clientSessions.$inferInsert;

// Type for selecting a client session
export type ClientSession = typeof clientSessions.$inferSelect;
