import {
  pgTable,
  uuid,
  varchar,
  date,
  time,
  integer,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const justiceBusVisits = pgTable("justice_bus_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationName: varchar("location_name", { length: 255 }).notNull(),
  addressLine1: varchar("address_line1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  visitDate: date("visit_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  availableSlots: integer("available_slots").notNull(),
  bookedSlots: integer("booked_slots").default(0),
  legalServicesOffered: text("legal_services_offered").array(),
  additionalNotes: text("additional_notes"),
  isCancelled: boolean("is_cancelled").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type for inserting a justice bus visit
export type NewJusticeBusVisit = typeof justiceBusVisits.$inferInsert;

// Type for selecting a justice bus visit
export type JusticeBusVisit = typeof justiceBusVisits.$inferSelect;
