import { z } from "zod";
import { pgTable, text, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// Database table for saved analyses
export const savedAnalyses = pgTable("saved_analyses", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  headings: jsonb("headings").notNull(),
  errors: jsonb("errors").notNull(),
  statistics: jsonb("statistics").notNull(),
  accessibility: jsonb("accessibility").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  urlIdx: index("url_idx").on(table.url),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export const insertSavedAnalysisSchema = createInsertSchema(savedAnalyses).omit({
  id: true,
  createdAt: true,
});

export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;

// Heading data structure
export const headingSchema = z.object({
  level: z.number().min(1).max(6),
  text: z.string(),
  position: z.number(),
});

export type Heading = z.infer<typeof headingSchema>;

// SEO error types
export const seoErrorSchema = z.object({
  type: z.enum(['missing_h1', 'multiple_h1', 'hierarchy_gap', 'empty_heading']),
  message: z.string(),
  details: z.string().optional(),
  affectedHeadings: z.array(z.number()).optional(),
});

export type SEOError = z.infer<typeof seoErrorSchema>;

// Accessibility assessment
export const accessibilityAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type AccessibilityAssessment = z.infer<typeof accessibilityAssessmentSchema>;

// Analysis result
export const analysisResultSchema = z.object({
  url: z.string().url(),
  headings: z.array(headingSchema),
  errors: z.array(seoErrorSchema),
  statistics: z.object({
    total: z.number(),
    h1Count: z.number(),
    h2Count: z.number(),
    h3Count: z.number(),
    h4Count: z.number(),
    h5Count: z.number(),
    h6Count: z.number(),
  }),
  accessibility: accessibilityAssessmentSchema,
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Request schema
export const analyzeUrlSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a URL")
    .max(2048, "URL is too long (maximum 2048 characters)")
    .transform((val) => {
      // Trim whitespace and remove multiple consecutive slashes (except after protocol)
      val = val.trim();
      
      // Remove spaces that might be typos
      val = val.replace(/\s+/g, '');
      
      // Fix common typos: double slashes (except after protocol)
      val = val.replace(/([^:])\/\/+/g, '$1/');
      
      // If it's localhost or an IP without protocol, add http://
      if (/^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?/.test(val)) {
        val = `http://${val}`;
      }
      
      // If it doesn't start with a protocol, add https://
      if (!val.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
        val = `https://${val}`;
      }
      
      return val;
    })
    .refine((val) => {
      // Check for file:// protocol
      if (val.startsWith('file://')) {
        return false;
      }
      return true;
    }, "File URLs are not supported. Please use http:// or https:// URLs")
    .refine((val) => {
      try {
        const url = new URL(val);
        
        // Block internal/private IP ranges to prevent SSRF
        const hostname = url.hostname;
        
        // Check for private IP ranges
        const privateIPRanges = [
          /^0\./,  // 0.0.0.0/8
          /^169\.254\./,  // Link-local
          /^::1$/,  // IPv6 loopback
          /^fc00::/,  // IPv6 unique local
          /^fe80::/,  // IPv6 link-local
        ];
        
        // Allow localhost and common private IPs for development
        const isLocalDev = hostname === 'localhost' || 
                          hostname === '127.0.0.1' ||
                          hostname.startsWith('192.168.') ||
                          hostname.startsWith('10.') ||
                          /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
        
        // Check if it's a blocked private IP (not including dev IPs)
        const isBlockedPrivate = privateIPRanges.some(regex => regex.test(hostname)) && !isLocalDev;
        
        if (isBlockedPrivate) {
          return false;
        }
        
        // Validate protocol
        if (!['http:', 'https:'].includes(url.protocol)) {
          return false;
        }
        
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL. Localhost and private IPs are supported for development")
    .refine((val) => {
      try {
        const url = new URL(val);
        // Check for authentication credentials (warn but allow)
        if (url.username || url.password) {
          console.warn('URL contains authentication credentials. These will be included in the request.');
        }
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL format"),
});

export type AnalyzeUrlRequest = z.infer<typeof analyzeUrlSchema>;
