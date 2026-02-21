import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Domain enrichment job tracking
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  totalDomains: integer("total_domains").notNull(),
  processedDomains: integer("processed_domains").notNull().default(0),
  failedDomains: integer("failed_domains").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Enriched domain data
export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  webAddress: text("web_address").notNull(),
  category: text("category").notNull().default("MA"), // MA or National
  
  // SEMrush metrics
  organicTraffic: integer("organic_traffic"),
  keywordsTop100: integer("keywords_top_100"),
  trafficValue: real("traffic_value"),
  trafficTrend3mo: real("traffic_trend_3mo"), // percentage change
  pagesIndexed: integer("pages_indexed"),
  
  // PageSpeed Insights metrics
  performanceScore: integer("performance_score"), // 0-100 overall score
  mobileScore: integer("mobile_score"), // 0-100 mobile score
  desktopScore: integer("desktop_score"), // 0-100 desktop score
  fcp: real("fcp"), // First Contentful Paint in milliseconds
  lcp: real("lcp"), // Largest Contentful Paint in milliseconds
  fid: real("fid"), // First Input Delay in milliseconds
  cls: real("cls"), // Cumulative Layout Shift score
  lastPerformanceCheck: timestamp("last_performance_check"),
  
  // Urgency flag: urgent (red), review (orange), healthy (green)
  urgencyFlag: text("urgency_flag"),
  
  // Priority score: 0-100 composite score for prospect prioritization
  priorityScore: integer("priority_score"),
  
  // Data source tracking: which API provided the data
  dataSource: text("data_source"), // "semrush" | "dataforseo" | "mock"
  
  // AI Overview metrics
  aiOverviewPresent: integer("ai_overview_present"), // boolean stored as 0/1 or null
  aiOverviewMentioned: integer("ai_overview_mentioned"), // boolean stored as 0/1 or null
  aiOverviewVisibilityScore: integer("ai_overview_visibility_score"), // 0-100 score or null
  
  // Error tracking
  error: text("error"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Failed domain logs
export const failedDomains = pgTable("failed_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  error: text("error").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
});

export const insertFailedDomainSchema = createInsertSchema(failedDomains).omit({
  id: true,
  createdAt: true,
});

// Upload schema for file processing
export const uploadFileSchema = z.object({
  filename: z.string(),
  domains: z.array(z.object({
    companyName: z.string(),
    webAddress: z.string(),
    category: z.enum(["MA", "National"]).default("MA"),
  })),
});

// Export types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;

export type FailedDomain = typeof failedDomains.$inferSelect;
export type InsertFailedDomain = z.infer<typeof insertFailedDomainSchema>;

export type UploadFile = z.infer<typeof uploadFileSchema>;
