import {
  pgTable,
  uuid,
  date,
  time,
  timestamp,
  text,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { appointmentStatusEnum } from "./types";
import { users } from "./users";
import { cases } from "./cases";
import { justiceBusVisits } from "./justice-bus-visits";

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    justiceBusVisitId: uuid("justice_bus_visit_id")
      .notNull()
      .references(() => justiceBusVisits.id, { onDelete: "cascade" }),
    appointmentDate: date("appointment_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: appointmentStatusEnum("status").default("scheduled"),
    notes: text("notes"),
    reminderSent: boolean("reminder_sent").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      userVisitUnique: uniqueIndex("user_justice_bus_visit_unique").on(
        table.userId,
        table.justiceBusVisitId
      ),
    };
  }
);

// Type for inserting an appointment
export type NewAppointment = typeof appointments.$inferInsert;

// Type for selecting an appointment
export type Appointment = typeof appointments.$inferSelect;
