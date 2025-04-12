import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { cases } from "./cases";

export const intakeResponses = pgTable("intake_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  questionId: varchar("question_id", { length: 100 }).notNull(),
  questionText: text("question_text").notNull(),
  response: text("response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type for inserting an intake response
export type NewIntakeResponse = typeof intakeResponses.$inferInsert;

// Type for selecting an intake response
export type IntakeResponse = typeof intakeResponses.$inferSelect;
