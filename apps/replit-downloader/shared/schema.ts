import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replitUrl: text("replit_url").notNull(),
  replName: text("repl_name").notNull(),
  username: text("username").notNull(),
  status: text("status").notNull().default("completed"),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

export const downloadRequestSchema = z.object({
  url: z.string().url().refine(
    (url) => {
      const patterns = [
        /^https?:\/\/replit\.com\/@[\w-]+\/[\w-]+/,
        /^https?:\/\/replit\.com\/t\/[\w-]+\/repls\/[\w-]+/,
        /^https?:\/\/replit\.com\/[\w-]+\/[\w-]+/,
      ];
      return patterns.some((p) => p.test(url));
    },
    { message: "Please enter a valid Replit project URL (e.g., https://replit.com/@username/project-name or https://replit.com/t/team/repls/project)" }
  ),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
