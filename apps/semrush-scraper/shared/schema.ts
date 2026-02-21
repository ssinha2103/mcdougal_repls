import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Section types for SEMrush data
export const sectionTypes = [
  "header_kpis",
  "organic_trend",
  "top_keywords",
  "intent_distribution",
  "search_positions",
  "position_changes",
  "page_changes",
  "competitive_map",
  "organic_pages",
  "discovery"
] as const;

export type SectionType = typeof sectionTypes[number];

// Domain statuses
export const domainStatuses = [
  "pending",
  "queued",
  "crawling",
  "completed",
  "failed",
  "paused"
] as const;

export type DomainStatus = typeof domainStatuses[number];

// Run statuses
export const runStatuses = [
  "pending",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled"
] as const;

export type RunStatus = typeof runStatuses[number];

// Extraction methods
export const extractionMethods = ["dom", "ai_vision", "hybrid", "pending"] as const;
export type ExtractionMethod = typeof extractionMethods[number];

// Domains table
export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain").notNull().unique(),
  status: text("status").notNull().default("pending"),
  lastCrawledAt: timestamp("last_crawled_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Runs table - tracks crawl sessions
export const runs = pgTable("runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  status: text("status").notNull().default("pending"),
  database: text("database").notNull().default("us"), // SEMrush database (us, uk, etc)
  totalDomains: integer("total_domains").notNull().default(0),
  completedDomains: integer("completed_domains").notNull().default(0),
  failedDomains: integer("failed_domains").notNull().default(0),
  config: jsonb("config"), // Rate limits, pacing, section selection
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Snapshots - one per domain per run
export const snapshots = pgTable("snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  runId: varchar("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Sections - screenshot + extracted data per section
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotId: varchar("snapshot_id").notNull().references(() => snapshots.id, { onDelete: "cascade" }),
  sectionType: text("section_type").notNull(),
  screenshotPath: text("screenshot_path"),
  extractedData: jsonb("extracted_data"), // Raw extracted JSON
  extractionMethod: text("extraction_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Metrics rollup - normalized metrics per snapshot
export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotId: varchar("snapshot_id").notNull().references(() => snapshots.id, { onDelete: "cascade" }),
  
  // Header KPIs
  totalKeywords: integer("total_keywords"),
  organicTraffic: integer("organic_traffic"),
  trafficCost: integer("traffic_cost"),
  brandedTraffic: integer("branded_traffic"),
  nonBrandedTraffic: integer("non_branded_traffic"),
  
  // Keyword distribution
  top3Keywords: integer("top3_keywords"),
  top10Keywords: integer("top10_keywords"),
  top20Keywords: integer("top20_keywords"),
  top50Keywords: integer("top50_keywords"),
  top100Keywords: integer("top100_keywords"),
  
  // Intent distribution
  intentInformational: integer("intent_informational"),
  intentNavigational: integer("intent_navigational"),
  intentCommercial: integer("intent_commercial"),
  intentTransactional: integer("intent_transactional"),
  
  // Position changes
  positionsImproved: integer("positions_improved"),
  positionsDeclined: integer("positions_declined"),
  positionsNew: integer("positions_new"),
  positionsLost: integer("positions_lost"),
  
  // Competitive metrics
  competitorsCount: integer("competitors_count"),
  
  // Calculated scores
  prospectScore: integer("prospect_score"), // 0-100
  declineScore: integer("decline_score"), // Higher = more decline
  opportunityScore: integer("opportunity_score"), // Higher = more opportunity
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// AI Insights - Gemini-generated analysis
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotId: varchar("snapshot_id").notNull().references(() => snapshots.id, { onDelete: "cascade" }),
  insightType: text("insight_type").notNull(), // decline_pattern, opportunity, competitive_gap, etc
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  severity: text("severity"), // low, medium, high
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Crawler logs
export const crawlerLogs = pgTable("crawler_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").references(() => runs.id, { onDelete: "cascade" }),
  snapshotId: varchar("snapshot_id").references(() => snapshots.id, { onDelete: "cascade" }),
  level: text("level").notNull(), // info, warning, error
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Scheduled Runs - automated recurring crawls
export const scheduledRuns = pgTable("scheduled_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  domains: text("domains").array().notNull(),
  config: jsonb("config"), // Crawler configuration (database, rate limit, AI toggle)
  cronSchedule: text("cron_schedule").notNull(), // Cron expression
  dailyCap: integer("daily_cap").notNull().default(100), // Max domains per day
  cooldownStart: text("cooldown_start"), // HH:MM format (e.g., "22:00")
  cooldownEnd: text("cooldown_end"), // HH:MM format (e.g., "06:00")
  enabled: boolean("enabled").notNull().default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  lastCrawledAt: true,
}).extend({
  domain: z.string().min(1, "Domain is required"),
});

export const insertRunSchema = createInsertSchema(runs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
}).extend({
  name: z.string().optional(),
  database: z.string().default("us"),
  config: z.any().optional(),
});

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

export const insertCrawlerLogSchema = createInsertSchema(crawlerLogs).omit({
  id: true,
  createdAt: true,
});

export const insertScheduledRunSchema = createInsertSchema(scheduledRuns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
  nextRunAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  domains: z.array(z.string().min(1)).min(1, "At least one domain is required"),
  cronSchedule: z.string().min(1, "Cron schedule is required"),
  dailyCap: z.number().min(1, "Daily cap must be at least 1"),
  cooldownStart: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  cooldownEnd: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
});

// Types
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runs.$inferSelect;

export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;
export type Snapshot = typeof snapshots.$inferSelect;

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

export type InsertCrawlerLog = z.infer<typeof insertCrawlerLogSchema>;
export type CrawlerLog = typeof crawlerLogs.$inferSelect;

export type InsertScheduledRun = z.infer<typeof insertScheduledRunSchema>;
export type ScheduledRun = typeof scheduledRuns.$inferSelect;

// Extended types for frontend
export type DomainWithMetrics = Domain & {
  latestSnapshot?: Snapshot & {
    metrics?: Metrics;
    insights?: Insight[];
  };
};

export type RunWithProgress = Run & {
  domains?: Domain[];
  snapshots?: Snapshot[];
};

export type SnapshotWithDetails = Snapshot & {
  domain?: Domain;
  sections?: Section[];
  metrics?: Metrics;
  insights?: Insight[];
};
