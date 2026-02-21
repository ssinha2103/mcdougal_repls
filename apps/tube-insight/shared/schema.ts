import { z } from "zod";

export const videoResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  channelTitle: z.string(),
  publishedAt: z.string(),
  thumbnailUrl: z.string(),
  viewCount: z.string(),
  likeCount: z.string().optional(),
  commentCount: z.string().optional(),
  tags: z.array(z.string()).optional(),
  channelId: z.string(),
});

export const searchRequestSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  maxResults: z.number().min(1).max(50).optional().default(12),
  order: z.enum(["relevance", "date", "viewCount", "rating"]).optional().default("relevance"),
});

export const searchResponseSchema = z.object({
  videos: z.array(videoResultSchema),
  totalResults: z.number(),
  keyword: z.string(),
});

export type VideoResult = z.infer<typeof videoResultSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
