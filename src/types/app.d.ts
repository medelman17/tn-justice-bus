// Application-specific types

// Preferred contact method options (mirrors the database enum)
export type PreferredContactMethod = "email" | "phone" | "sms";

// Case priority options
export type CasePriority = "urgent" | "high" | "medium" | "low";

// Case status options
export type CaseStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

// Appointment status options
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";
