import { pgSchema } from "drizzle-orm/pg-core";

// Import all schema entities to expose to drizzle-kit
import { users } from "./users";
import { cases } from "./cases";
import { justiceBusVisits } from "./justice-bus-visits";
import { appointments } from "./appointments";
import { documents } from "./documents";
import { intakeResponses } from "./intake-responses";
import { clientSessions } from "./client-sessions";
import {
  preferredContactMethodEnum,
  casePriorityEnum,
  caseStatusEnum,
  appointmentStatusEnum,
} from "./types";

// Create auth schema (for future use)
export const authSchema = pgSchema("auth");

// Export everything for drizzle-kit migrations
export {
  // Tables
  users,
  cases,
  justiceBusVisits,
  appointments,
  documents,
  intakeResponses,
  clientSessions,

  // Enums
  preferredContactMethodEnum,
  casePriorityEnum,
  caseStatusEnum,
  appointmentStatusEnum,
};

// Re-export types and schemas for convenience
export * from "./users";
export * from "./cases";
export * from "./justice-bus-visits";
export * from "./appointments";
export * from "./documents";
export * from "./intake-responses";
export * from "./client-sessions";
export * from "./types";
