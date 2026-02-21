import { z } from "zod";

// Tool Schema
export const insertToolSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  screenshot: z.string().optional(),
  usageGuide: z.string().optional(),
});

export type InsertTool = z.infer<typeof insertToolSchema>;

export interface Tool extends InsertTool {
  id: string;
  createdAt: string;
}

// Analytics Schema
export const insertAnalyticsSchema = z.object({
  toolId: z.string(),
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export interface Analytics {
  id: string;
  toolId: string;
  clickedAt: string;
}

// User Schema
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: number;
}
