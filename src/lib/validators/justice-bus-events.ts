import { z } from "zod";

// Event Type enum validation
export const eventTypeEnum = z.enum([
  "Legal Clinic",
  "General Legal Advice",
  "Expungement",
  "Resource Fair",
  "Re-Entry",
  "Community Education",
  "Conference",
]);

// Event Status enum validation
export const eventStatusEnum = z.enum([
  "Open to Public",
  "Registration Required",
  "Registration Closed",
  "Closed to Public",
]);

// Location accessibility validation
export const locationAccessibilitySchema = z.object({
  publicTransport: z.boolean().optional(),
  wheelchairAccessible: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
});

// Coordinates validation
export const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional(),
});

// GIS data validation
export const gisDataSchema = z.object({
  coordinates: coordinatesSchema.optional(),
  polygon: z.array(z.array(z.number()).min(2)).optional(),
  censusTracts: z.array(z.string()).optional(),
  countyFIPS: z.string().optional(),
  isRural: z.boolean().optional(),
  distanceToNearestLegalAid: z.number().optional(),
  locationAccessibility: locationAccessibilitySchema.optional(),
});

// Address validation
export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().default("TN"),
  zipCode: z.string(),
});

// Location validation
export const locationSchema = z.object({
  name: z.string(),
  county: z.string(),
  address: addressSchema.optional(),
  isPrivate: z.boolean().default(false),
  gisData: gisDataSchema.optional(),
});

// Event validation
export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  location: locationSchema,
  eventType: z.array(eventTypeEnum),
  description: z.string().optional(),
  organizer: z.string().optional(),
  status: eventStatusEnum,
  notes: z.string().optional(),
  services: z.array(z.string()).optional(),
  attorneyPresent: z.boolean().default(true),
  targetAudience: z.string().optional(),
  registrationUrl: z.string().url().optional(),
});

// Social media validation
export const socialMediaSchema = z.object({
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
});

// Contact info validation
export const contactInfoSchema = z.object({
  email: z.string().email().default("justicebus@tncourts.gov"),
  socialMedia: socialMediaSchema.optional(),
  website: z
    .string()
    .url()
    .default("https://justiceforalltn.org/upcoming-events/"),
  requestFormUrl: z.string().url().optional(),
});

// Complete justice bus events data validation
export const justiceBusEventsSchema = z.object({
  events: z.array(eventSchema),
  lastUpdated: z.string().datetime(),
  contactInfo: contactInfoSchema,
});

// Types based on Zod schemas
export type LocationAccessibility = z.infer<typeof locationAccessibilitySchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type GisData = z.infer<typeof gisDataSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Event = z.infer<typeof eventSchema>;
export type SocialMedia = z.infer<typeof socialMediaSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type JusticeBusEventsData = z.infer<typeof justiceBusEventsSchema>;
