/*
 * AI SEO PageScore Database Schema
 * © 2025 McDougall Interactive. All rights reserved.
 * Proprietary schema for competitive SEO analysis with AI Trust Score metrics
 * Unauthorized copying, distribution, or reverse engineering prohibited
 */

import { pgTable, text, serial, integer, bigint, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analysisJobs = pgTable("analysis_jobs", {
  id: serial("id").primaryKey(),
  urls: text("urls").array().notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  results: jsonb("results"),
  progress: integer("progress").default(0), // 0-100 percentage
  currentStep: text("current_step"), // Current analysis step description
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const seoMetrics = pgTable("seo_metrics", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  indexedPages: bigint("indexed_pages", { mode: "number" }),
  referringDomains: integer("referring_domains"),
  backlinks: bigint("backlinks", { mode: "number" }),
  organicKeywords: bigint("organic_keywords", { mode: "number" }),
  organicTraffic: bigint("organic_traffic", { mode: "number" }),
  trafficCost: text("traffic_cost"), // Changed to text to handle currency formatting
  top100Keywords: bigint("top_100_keywords", { mode: "number" }), // New field for top 100 ranking keywords
  keywordPositions: text("keyword_positions"), // JSON string for detailed keyword data
  competitorGap: integer("competitor_gap"), // Keywords competitors rank for but this site doesn't
  pageSpeed: text("page_speed"), // Changed to text for better formatting
  // E-E-A-T and AI Overview signals
  hasAuthorBox: boolean("has_author_box").default(false),
  hasLinkedAuthor: boolean("has_linked_author").default(false),
  hasStructuredData: boolean("has_structured_data").default(false),
  structuredContentScore: integer("structured_content_score").default(0), // Count of lists, tables
  experienceSignals: integer("experience_signals").default(0), // Count of first-person language
  originalMediaCount: integer("original_media_count").default(0), // Videos, images
  trustSignalsScore: integer("trust_signals_score").default(0), // Combined trust score
  // Google Reviews data
  googleReviewsCount: integer("google_reviews_count"),
  googleRating: decimal("google_rating", { precision: 3, scale: 2 }),
  // YouTube Analytics
  youtubeChannelUrl: text("youtube_channel_url"),
  youtubeSubscribers: bigint("youtube_subscribers", { mode: "number" }),
  youtubeTotalViews: bigint("youtube_total_views", { mode: "number" }),
  youtubeVideoCount: integer("youtube_video_count"),
  youtubePostingFrequency: text("youtube_posting_frequency"), // weekly, monthly, sporadic
  youtubeEngagementRate: text("youtube_engagement_rate"),
  youtubeChannelAge: integer("youtube_channel_age"), // in days
  // Social Media Analytics
  socialMediaClicks: jsonb("social_media_clicks"), // {facebook: 123, instagram: 456, etc}
  socialMediaPresence: text("social_media_presence").array(), // ['facebook', 'instagram', 'linkedin']
  socialMediaAnalytics: jsonb("social_media_analytics"), // {facebook: {followers: 1000, activity: 'active'}, etc}
  // Technology Stack
  technologies: jsonb("technologies"), // {cms: 'WordPress', analytics: ['Google Analytics'], etc}
  securityScore: integer("security_score").default(0), // SSL, security headers
  mobileOptimization: boolean("mobile_optimization").default(false),
  // Competitive Intelligence
  competitiveStrength: text("competitive_strength"), // 'weak', 'average', 'strong', 'dominant'
  contentGaps: text("content_gaps").array(), // Missing topic areas vs competitors
  // New DataForSEO calculated metrics
  avgCPC: text("avg_cpc"), // Average cost per click (implied)
  top10Coverage: text("top_10_coverage"), // Percentage of keywords in top 10
  top3Keywords: bigint("top_3_keywords", { mode: "number" }), // Count of keywords in positions 1-3
  top3Percentage: text("top_3_percentage"), // Percentage of keywords in top 3
  visibilityScore: text("visibility_score"), // Custom visibility index 0-100
  newKeywords: bigint("new_keywords", { mode: "number" }), // Recently gained keywords
  improvedKeywords: bigint("improved_keywords", { mode: "number" }), // Keywords with improved rankings
  declinedKeywords: bigint("declined_keywords", { mode: "number" }), // Keywords with declined rankings
  lostKeywords: bigint("lost_keywords", { mode: "number" }), // Recently lost keywords
  analysisJobId: integer("analysis_job_id").references(() => analysisJobs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisJobSchema = createInsertSchema(analysisJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertSeoMetricsSchema = createInsertSchema(seoMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysisJob = z.infer<typeof insertAnalysisJobSchema>;
export type AnalysisJob = typeof analysisJobs.$inferSelect;
export type InsertSeoMetrics = z.infer<typeof insertSeoMetricsSchema>;
export type SeoMetrics = typeof seoMetrics.$inferSelect;
