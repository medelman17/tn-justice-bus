import { pgTable, uuid, jsonb, timestamp, foreignKey, varchar, text, unique, date, uniqueIndex, time, boolean, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const appointmentStatus = pgEnum("appointment_status", ['scheduled', 'completed', 'cancelled', 'no_show'])
export const caseStatus = pgEnum("case_status", ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'])
export const preferredContactMethod = pgEnum("preferred_contact_method", ['email', 'phone', 'sms'])
export const priority = pgEnum("priority", ['urgent', 'high', 'medium', 'low'])


export const justiceBusEvents = pgTable("justice_bus_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	data: jsonb().notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const intakeResponses = pgTable("intake_responses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	caseId: uuid("case_id").notNull(),
	questionId: varchar("question_id", { length: 100 }).notNull(),
	questionText: text("question_text").notNull(),
	response: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.id],
			name: "intake_responses_case_id_cases_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	dateOfBirth: date("date_of_birth"),
	addressLine1: varchar("address_line1", { length: 255 }),
	addressLine2: varchar("address_line2", { length: 255 }),
	city: varchar({ length: 100 }),
	state: varchar({ length: 2 }),
	zipCode: varchar("zip_code", { length: 10 }),
	preferredContactMethod: preferredContactMethod("preferred_contact_method"),
	preferredLanguage: varchar("preferred_language", { length: 50 }).default('english'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_phone_unique").on(table.phone),
]);

export const appointments = pgTable("appointments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	caseId: uuid("case_id").notNull(),
	justiceBusVisitId: uuid("justice_bus_visit_id").notNull(),
	appointmentDate: date("appointment_date").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	status: appointmentStatus().default('scheduled'),
	notes: text(),
	reminderSent: boolean("reminder_sent").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("user_justice_bus_visit_unique").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.justiceBusVisitId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.id],
			name: "appointments_case_id_cases_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.justiceBusVisitId],
			foreignColumns: [justiceBusVisits.id],
			name: "appointments_justice_bus_visit_id_justice_bus_visits_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "appointments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const cases = pgTable("cases", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	legalCategory: varchar("legal_category", { length: 100 }).notNull(),
	legalSubcategory: varchar("legal_subcategory", { length: 100 }),
	priority: priority(),
	status: caseStatus().default('pending'),
	conflictCheckCompleted: boolean("conflict_check_completed").default(false),
	hasDeadline: boolean("has_deadline").default(false),
	deadlineDate: date("deadline_date"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cases_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const justiceBusVisits = pgTable("justice_bus_visits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	locationName: varchar("location_name", { length: 255 }).notNull(),
	addressLine1: varchar("address_line1", { length: 255 }).notNull(),
	addressLine2: varchar("address_line2", { length: 255 }),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 2 }).notNull(),
	zipCode: varchar("zip_code", { length: 10 }).notNull(),
	visitDate: date("visit_date").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	availableSlots: integer("available_slots").notNull(),
	bookedSlots: integer("booked_slots").default(0),
	legalServicesOffered: text("legal_services_offered").array(),
	additionalNotes: text("additional_notes"),
	isCancelled: boolean("is_cancelled").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const clientSessions = pgTable("client_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	sessionData: jsonb("session_data").notNull(),
	expired: boolean().default(false),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "client_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	caseId: uuid("case_id").notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 100 }).notNull(),
	fileSize: integer("file_size").notNull(),
	documentType: varchar("document_type", { length: 100 }).notNull(),
	description: text(),
	blobUrl: text("blob_url").notNull(),
	blobKey: text("blob_key").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.id],
			name: "documents_case_id_cases_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const verificationCodes = pgTable("verification_codes", {
	id: text().primaryKey().notNull(),
	phone: varchar({ length: 15 }),
	code: varchar({ length: 6 }).notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	email: varchar({ length: 255 }),
});
