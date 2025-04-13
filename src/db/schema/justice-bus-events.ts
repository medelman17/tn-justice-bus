import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";

export const justiceBusEvents = pgTable("justice_bus_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: jsonb("data").notNull(), // Stores the entire JSON structure
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Types
export type JusticeBusEvent = typeof justiceBusEvents.$inferSelect;
export type NewJusticeBusEvent = typeof justiceBusEvents.$inferInsert;
