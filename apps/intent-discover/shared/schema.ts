import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Search query schema
export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  timestamp: true,
});

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

// API Response Types (not stored in DB, just TypeScript interfaces)
export interface PAAQuestion {
  question: string;
  answer?: string;
}

export interface RelatedSearch {
  query: string;
}

export interface SearchResult {
  keyword: string;
  paaQuestions: PAAQuestion[];
  relatedSearches: RelatedSearch[];
  timestamp: string;
}

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: string;
}
