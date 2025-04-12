import { pgEnum } from "drizzle-orm/pg-core";

// Enum for preferred contact method
export const preferredContactMethodEnum = pgEnum("preferred_contact_method", [
  "email",
  "phone",
  "sms",
]);

// Enum for case priority
export const casePriorityEnum = pgEnum("priority", [
  "urgent",
  "high",
  "medium",
  "low",
]);

// Enum for case status
export const caseStatusEnum = pgEnum("case_status", [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

// Enum for appointment status
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

// Timestamp-related columns that can be reused across tables
export const timestamps = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};
