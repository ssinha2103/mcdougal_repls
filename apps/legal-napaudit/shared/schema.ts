import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// NAP Data structure (Name, Address, Phone)
export const napDataSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
});

export type NAPData = z.infer<typeof napDataSchema>;

// Search request schema
export const searchRequestSchema = z.object({
  firmName: z.string().min(1, "Law firm name is required"),
  location: z.string().min(1, "Location is required"),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

// Directory check result
export const directoryResultSchema = z.object({
  directoryName: z.string(),
  directoryUrl: z.string().optional(),
  found: z.boolean(),
  napData: napDataSchema.optional(),
  nameMatch: z.enum(["consistent", "inconsistent", "missing"]),
  addressMatch: z.enum(["consistent", "inconsistent", "missing"]),
  phoneMatch: z.enum(["consistent", "inconsistent", "missing"]),
});

export type DirectoryResult = z.infer<typeof directoryResultSchema>;

// Full NAP check response
export const napCheckResponseSchema = z.object({
  canonicalNAP: napDataSchema,
  googlePlacesId: z.string().optional(),
  directoryResults: z.array(directoryResultSchema),
  checkedAt: z.string(),
  summary: z.object({
    totalDirectories: z.number(),
    consistent: z.number(),
    inconsistent: z.number(),
    missing: z.number(),
  }),
});

export type NAPCheckResponse = z.infer<typeof napCheckResponseSchema>;

// Export request schema
export const exportRequestSchema = z.object({
  format: z.enum(["pdf", "csv"]),
  data: napCheckResponseSchema,
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;

// Database Tables

// NAP Checks table - stores each check performed
export const napChecks = pgTable("nap_checks", {
  id: serial("id").primaryKey(),
  firmName: varchar("firm_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  canonicalName: varchar("canonical_name", { length: 255 }).notNull(),
  canonicalAddress: text("canonical_address").notNull(),
  canonicalPhone: varchar("canonical_phone", { length: 50 }).notNull(),
  googlePlacesId: varchar("google_places_id", { length: 255 }),
  totalDirectories: integer("total_directories").notNull(),
  consistentCount: integer("consistent_count").notNull(),
  inconsistentCount: integer("inconsistent_count").notNull(),
  missingCount: integer("missing_count").notNull(),
  checkedAt: timestamp("checked_at").notNull().defaultNow(),
  batchId: integer("batch_id").references(() => batchChecks.id, { onDelete: "set null" }),
  monitoringEnabled: boolean("monitoring_enabled").default(false),
  monitoringFrequency: varchar("monitoring_frequency", { length: 50 }),
});

export type NAPCheck = typeof napChecks.$inferSelect;
export const insertNAPCheckSchema = createInsertSchema(napChecks).omit({ id: true, checkedAt: true });
export type InsertNAPCheck = z.infer<typeof insertNAPCheckSchema>;

// Directory Results table - stores individual directory check results
export const directoryResults = pgTable("directory_results", {
  id: serial("id").primaryKey(),
  checkId: integer("check_id").notNull().references(() => napChecks.id, { onDelete: "cascade" }),
  directoryName: varchar("directory_name", { length: 100 }).notNull(),
  directoryUrl: text("directory_url"),
  found: boolean("found").notNull(),
  napData: jsonb("nap_data"),
  nameMatch: varchar("name_match", { length: 20 }).notNull(),
  addressMatch: varchar("address_match", { length: 20 }).notNull(),
  phoneMatch: varchar("phone_match", { length: 20 }).notNull(),
});

export type DirectoryResultRow = typeof directoryResults.$inferSelect;
export const insertDirectoryResultSchema = createInsertSchema(directoryResults).omit({ id: true });
export type InsertDirectoryResult = z.infer<typeof insertDirectoryResultSchema>;

// Batch Checks table - groups multiple checks together
export const batchChecks = pgTable("batch_checks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  totalFirms: integer("total_firms").notNull(),
  completedFirms: integer("completed_firms").notNull().default(0),
});

export type BatchCheck = typeof batchChecks.$inferSelect;
export const insertBatchCheckSchema = createInsertSchema(batchChecks).omit({ id: true, createdAt: true });
export type InsertBatchCheck = z.infer<typeof insertBatchCheckSchema>;
