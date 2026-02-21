import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const asbestosSites = pgTable("asbestos_sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  siteType: text("site_type").notNull(), // superfund, vermiculite, factory, mine, shipyard, construction
  exposurePeriod: text("exposure_period").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // Cleaned Up, Under Cleanup, Partially Cleaned, Contaminated
  agencySource: text("agency_source").notNull(), // EPA, ATSDR, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  exposureLocation: text("exposure_location").notNull(),
  siteType: text("site_type").notNull(),
  exposurePeriod: text("exposure_period").notNull(),
  relationship: text("relationship").notNull(),
  symptoms: text("symptoms"),
  additionalInfo: text("additional_info"),
  consent: boolean("consent").notNull().default(false),
  status: text("status").notNull().default("new"), // new, contacted, qualified, rejected, case_opened
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  assignedLawyer: varchar("assigned_lawyer"),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const featuredSites = pgTable("featured_sites", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  imageBase64: text("image_base64").notNull(), // Base64 encoded image data
  imageMimeType: text("image_mime_type").notNull(), // image/jpeg, image/png, etc.
  description: text("description").notNull(),
  exposurePeriod: text("exposure_period").notNull(),
  siteType: text("site_type").notNull(), 
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



export const insertAsbestosSiteSchema = createInsertSchema(asbestosSites).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

export const insertFeaturedSiteSchema = createInsertSchema(featuredSites).omit({
  createdAt: true,
});



export type InsertAsbestosSite = z.infer<typeof insertAsbestosSiteSchema>;
export type AsbestosSite = typeof asbestosSites.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertFeaturedSite = z.infer<typeof insertFeaturedSiteSchema>;
export type FeaturedSite = typeof featuredSites.$inferSelect;

