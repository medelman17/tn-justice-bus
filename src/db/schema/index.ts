import { pgSchema } from "drizzle-orm/pg-core";

// Import all schema entities to expose to drizzle-kit
// import { users } from "./users";
// import { cases } from "./cases";
// import { justiceBusVisits } from "./justice-bus-visits";
import { justiceBusEvents } from "./justice-bus-events";
// import { appointments } from "./appointments";
// import { documents } from "./documents";
// import { intakeResponses } from "./intake-responses";
// import { clientSessions } from "./client-sessions";
import {
  preferredContactMethodEnum,
  casePriorityEnum,
  caseStatusEnum,
  appointmentStatusEnum,
} from "./types";

// Use a different schema name to avoid conflicts
// Not exported to prevent migration errors
const appSchema = pgSchema("app");

// Export everything for drizzle-kit migrations
export {
  // Tables
  // users,
  // cases,
  // justiceBusVisits,
  justiceBusEvents,
  // appointments,
  // documents,
  // intakeResponses,
  // clientSessions,

  // Enums
  preferredContactMethodEnum,
  casePriorityEnum,
  caseStatusEnum,
  appointmentStatusEnum,
};

// Re-export types and schemas for convenience
export * from "./users";
export * from "./cases";
// export * from "./justice-bus-visits";
export * from "./justice-bus-events";
export * from "./appointments";
export * from "./documents";
export * from "./intake-responses";
export * from "./client-sessions";
export * from "./types";
