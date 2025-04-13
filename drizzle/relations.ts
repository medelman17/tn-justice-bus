import { relations } from "drizzle-orm/relations";
import { cases, intakeResponses, appointments, justiceBusVisits, users, clientSessions, documents } from "./schema";

export const intakeResponsesRelations = relations(intakeResponses, ({one}) => ({
	case: one(cases, {
		fields: [intakeResponses.caseId],
		references: [cases.id]
	}),
}));

export const casesRelations = relations(cases, ({one, many}) => ({
	intakeResponses: many(intakeResponses),
	appointments: many(appointments),
	user: one(users, {
		fields: [cases.userId],
		references: [users.id]
	}),
	documents: many(documents),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	case: one(cases, {
		fields: [appointments.caseId],
		references: [cases.id]
	}),
	justiceBusVisit: one(justiceBusVisits, {
		fields: [appointments.justiceBusVisitId],
		references: [justiceBusVisits.id]
	}),
	user: one(users, {
		fields: [appointments.userId],
		references: [users.id]
	}),
}));

export const justiceBusVisitsRelations = relations(justiceBusVisits, ({many}) => ({
	appointments: many(appointments),
}));

export const usersRelations = relations(users, ({many}) => ({
	appointments: many(appointments),
	cases: many(cases),
	clientSessions: many(clientSessions),
	documents: many(documents),
}));

export const clientSessionsRelations = relations(clientSessions, ({one}) => ({
	user: one(users, {
		fields: [clientSessions.userId],
		references: [users.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	case: one(cases, {
		fields: [documents.caseId],
		references: [cases.id]
	}),
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
}));