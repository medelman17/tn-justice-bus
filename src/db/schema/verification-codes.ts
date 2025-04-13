import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const verificationCodes = pgTable("verification_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  code: varchar("code", { length: 6 }).notNull(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
