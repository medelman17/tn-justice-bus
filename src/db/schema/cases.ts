import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { casePriorityEnum, caseStatusEnum } from "./types";
import { users } from "./users";

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  legalCategory: varchar("legal_category", { length: 100 }).notNull(),
  legalSubcategory: varchar("legal_subcategory", { length: 100 }),
  priority: casePriorityEnum("priority"),
  status: caseStatusEnum("status").default("pending"),
  conflictCheckCompleted: boolean("conflict_check_completed").default(false),
  hasDeadline: boolean("has_deadline").default(false),
  deadlineDate: date("deadline_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type for inserting a case
export type NewCase = typeof cases.$inferInsert;

// Type for selecting a case
export type Case = typeof cases.$inferSelect;

// Note: Relations will be handled in the main db client configuration
