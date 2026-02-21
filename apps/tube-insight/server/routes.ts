import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchRequestSchema, searchResponseSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

export async function registerRoutes(app: Express): Promise<Server> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY is not set in environment variables");
  }

  const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/api/search", searchLimiter, async (req, res) => {
    try {
      const { keyword, maxResults = 12, order = "relevance" } = searchRequestSchema.parse({
        keyword: req.query.q,
        maxResults: req.query.maxResults ? parseInt(req.query.maxResults as string) : 12,
        order: req.query.order || "relevance",
      });

      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ 
          error: "YouTube API key not configured. Please add YOUTUBE_API_KEY to your environment variables." 
        });
      }

      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.append("part", "snippet");
      searchUrl.searchParams.append("q", keyword);
      searchUrl.searchParams.append("type", "video");
      searchUrl.searchParams.append("maxResults", maxResults.toString());
      searchUrl.searchParams.append("order", order);
      searchUrl.searchParams.append("key", YOUTUBE_API_KEY);

      const searchResponse = await fetch(searchUrl.toString());
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error("YouTube API error:", errorData);
        return res.status(searchResponse.status).json({ 
          error: errorData.error?.message || "Failed to search videos" 
        });
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        const response = searchResponseSchema.parse({
          videos: [],
          totalResults: 0,
          keyword,
        });
        return res.json(response);
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videosUrl.searchParams.append("part", "snippet,statistics");
      videosUrl.searchParams.append("id", videoIds);
      videosUrl.searchParams.append("key", YOUTUBE_API_KEY);

      const videosResponse = await fetch(videosUrl.toString());
      
      if (!videosResponse.ok) {
        const errorData = await videosResponse.json();
        console.error("YouTube API error:", errorData);
        return res.status(videosResponse.status).json({ 
          error: errorData.error?.message || "Failed to fetch video details" 
        });
      }

      const videosData = await videosResponse.json();

      const videos = videosData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        tags: item.snippet.tags || [],
        channelId: item.snippet.channelId,
      }));

      const response = searchResponseSchema.parse({
        videos,
        totalResults: searchData.pageInfo.totalResults,
        keyword,
      });

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request parameters",
          details: error.errors 
        });
      }

      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to search videos" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
