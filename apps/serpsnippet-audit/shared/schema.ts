import { z } from "zod";
import { pgTable, serial, text, timestamp, integer, jsonb, index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// Database Tables
export const urlAnalyses = pgTable("url_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  metaDescription: text("meta_description"),
  titleLength: integer("title_length").default(0).notNull(),
  descriptionLength: integer("description_length").default(0).notNull(),
  issues: jsonb("issues").$type<Array<{
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
  }>>().default([]).notNull(),
  recommendations: jsonb("recommendations").$type<Array<{
    title: string;
    description: string;
  }>>().default([]).notNull(),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  urlIdx: index("url_idx").on(table.url),
  scrapedAtIdx: index("scraped_at_idx").on(table.scrapedAt)
}));

export const bulkJobs = pgTable("bulk_jobs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  totalUrls: integer("total_urls").notNull(),
  processedUrls: integer("processed_urls").default(0).notNull(),
  failedUrls: integer("failed_urls").default(0).notNull(),
  status: text("status", { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending').notNull(),
  results: jsonb("results").$type<Array<{
    url: string;
    analysisId?: number;
    error?: string;
  }>>().default([]).notNull(),
  errors: jsonb("errors").$type<Array<{
    url: string;
    error: string;
  }>>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("bulk_created_at_idx").on(table.createdAt)
}));

// Zod Schemas for validation
export const urlAnalysisSchema = createSelectSchema(urlAnalyses);
export const insertUrlAnalysisSchema = createInsertSchema(urlAnalyses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Custom URL validation that accepts URLs with or without protocol
const flexibleUrlSchema = z.string()
  .min(1, "URL cannot be empty")
  .refine((url) => {
    // Remove protocol if present for validation
    const urlWithoutProtocol = url.replace(/^https?:\/\//i, '');
    // Check if it looks like a valid domain (contains at least one dot)
    return urlWithoutProtocol.includes('.') && urlWithoutProtocol.length > 3;
  }, "Please enter a valid URL (e.g., example.com or https://example.com)");

export const urlAnalysisRequestSchema = z.object({
  url: flexibleUrlSchema
});

export const bulkJobSchema = createSelectSchema(bulkJobs);
export const insertBulkJobSchema = createInsertSchema(bulkJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Bulk URL processing schemas
export const bulkUrlAnalysisRequestSchema = z.object({
  urls: z.array(flexibleUrlSchema).min(1, "At least one URL is required").max(50, "Maximum 50 URLs allowed")
});

export const bulkUrlAnalysisResponseSchema = z.object({
  jobId: z.string(),
  totalUrls: z.number(),
  processedUrls: z.number().default(0),
  failedUrls: z.number().default(0),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  results: z.array(urlAnalysisSchema).default([]),
  errors: z.array(z.object({
    url: z.string(),
    error: z.string()
  })).default([])
});

// Types
export type UrlAnalysis = z.infer<typeof urlAnalysisSchema>;
export type InsertUrlAnalysis = z.infer<typeof insertUrlAnalysisSchema>;
export type UrlAnalysisRequest = z.infer<typeof urlAnalysisRequestSchema>;
export type BulkJob = z.infer<typeof bulkJobSchema>;
export type InsertBulkJob = z.infer<typeof insertBulkJobSchema>;
export type BulkUrlAnalysisRequest = z.infer<typeof bulkUrlAnalysisRequestSchema>;
export type BulkUrlAnalysisResponse = z.infer<typeof bulkUrlAnalysisResponseSchema>;
