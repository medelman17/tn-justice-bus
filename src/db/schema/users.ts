import { pgTable, uuid, varchar, date, timestamp } from "drizzle-orm/pg-core";
import { preferredContactMethodEnum } from "./types";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  dateOfBirth: date("date_of_birth"),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  preferredContactMethod: preferredContactMethodEnum(
    "preferred_contact_method"
  ),
  preferredLanguage: varchar("preferred_language", { length: 50 }).default(
    "english"
  ),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
});

// Type for inserting a user (all fields except id, timestamps can be optional)
export type NewUser = typeof users.$inferInsert;

// Type for selecting a user (includes all fields)
export type User = typeof users.$inferSelect;

// Relations and other helper functions can be defined here
