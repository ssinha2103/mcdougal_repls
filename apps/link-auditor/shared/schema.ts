import { z } from "zod";
import { pgTable, text, integer, timestamp, json, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const analyzeLinkSchema = z.object({
  url: z.string()
    .min(1, "URL is required")
    .transform((val) => {
      const trimmed = val.trim();
      // If URL doesn't start with http:// or https://, prepend https://
      if (!trimmed.match(/^https?:\/\//i)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    })
    .pipe(z.string().url("Please enter a valid URL")),
});

export type AnalyzeLinkRequest = z.infer<typeof analyzeLinkSchema>;

// Database tables for scan history
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  sourceUrl: text("source_url").notNull(),
  totalLinks: integer("total_links").notNull(),
  results: json("results").notNull().$type<LinkResult[]>(),
  summary: json("summary").notNull().$type<{
    success: number;
    redirects: number;
    clientErrors: number;
    serverErrors: number;
    errors: number;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

// Zod schemas for validation
const redirectStepSchema = z.object({
  url: z.string(),
  statusCode: z.number(),
  statusText: z.string(),
});

const linkResultSchema = z.object({
  url: z.string(),
  statusCode: z.number(),
  statusText: z.string(),
  finalUrl: z.string().optional(),
  error: z.string().optional(),
  redirectChain: z.array(redirectStepSchema).optional(),
});

const summarySchema = z.object({
  success: z.number(),
  redirects: z.number(),
  clientErrors: z.number(),
  serverErrors: z.number(),
  errors: z.number(),
});

export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true }).extend({
  results: z.array(linkResultSchema),
  summary: summarySchema,
});
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

export interface RedirectStep {
  url: string;
  statusCode: number;
  statusText: string;
}

export interface LinkResult {
  url: string;
  statusCode: number;
  statusText: string;
  finalUrl?: string;
  error?: string;
  redirectChain?: RedirectStep[];
}

export interface LinkAnalysisResult {
  sourceUrl: string;
  totalLinks: number;
  results: LinkResult[];
  summary: {
    success: number;
    redirects: number;
    clientErrors: number;
    serverErrors: number;
    errors: number;
  };
}
