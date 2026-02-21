import { z } from "zod";
import { pgTable, serial, text, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Search request schema
export const searchRequestSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  location: z.string().min(1, "Location is required"),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

// Local Pack Result
export const localPackResultSchema = z.object({
  position: z.number(),
  title: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  placeId: z.string().optional(),
  claimed: z.boolean().optional(),
  category: z.string().optional(),
  hours: z.string().optional(),
});

export type LocalPackResult = z.infer<typeof localPackResultSchema>;

// Organic Result
export const organicResultSchema = z.object({
  position: z.number(),
  title: z.string(),
  url: z.string(),
  domain: z.string().optional(),
  description: z.string().optional(),
  placeId: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  claimed: z.boolean().optional(),
});

export type OrganicResult = z.infer<typeof organicResultSchema>;

// Complete Analysis Response
export const analysisResponseSchema = z.object({
  keyword: z.string(),
  location: z.string(),
  timestamp: z.string(),
  localPack: z.array(localPackResultSchema),
  organic: z.array(organicResultSchema),
  summary: z.object({
    totalResults: z.number(),
    avgRating: z.number().optional(),
    claimedPercentage: z.number().optional(),
    topCompetitor: z.string().optional(),
  }),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

// Database Tables

// Saved Searches table
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  location: text("location").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastRun: timestamp("last_run"),
  emailReportEnabled: boolean("email_report_enabled").default(false).notNull(),
  emailAddress: text("email_address"),
  reportFrequency: text("report_frequency").default("weekly").notNull(),
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({ id: true, createdAt: true });
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;

// Search Results table (for historical tracking)
export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  savedSearchId: integer("saved_search_id").references(() => savedSearches.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  localPackData: jsonb("local_pack_data").notNull(),
  organicData: jsonb("organic_data").notNull(),
  totalResults: integer("total_results").notNull(),
  avgRating: real("avg_rating"),
  claimedPercentage: integer("claimed_percentage"),
  topCompetitor: text("top_competitor"),
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({ id: true, timestamp: true });
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;
export type SearchResult = typeof searchResults.$inferSelect;

// Relations
export const savedSearchesRelations = relations(savedSearches, ({ many }) => ({
  results: many(searchResults),
}));

export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  savedSearch: one(savedSearches, {
    fields: [searchResults.savedSearchId],
    references: [savedSearches.id],
  }),
}));
