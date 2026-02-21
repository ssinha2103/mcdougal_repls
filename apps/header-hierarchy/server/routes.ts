import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeUrlSchema, analysisResultSchema } from "@shared/schema";
import { analyzeHeadings } from "./services/analyzer-v2";
import { storage } from "./storage";
import { ZodError } from "zod";
import { createRateLimiter } from "./middleware/security";
import { analysisCache } from "./services/cache";
import { concurrencyManager } from "./services/concurrency-manager";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to analysis endpoint
  app.post("/api/analyze", createRateLimiter('analysis'), async (req, res) => {
    try {
      const validatedData = analyzeUrlSchema.parse(req.body);
      
      // Check cache first
      const cached = analysisCache.get(validatedData.url);
      if (cached) {
        console.log(`[Routes] Returning cached result for ${validatedData.url}`);
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }
      
      // Analyze with concurrency control
      const result = await concurrencyManager.run(() => analyzeHeadings(validatedData.url));
      
      // Store in cache
      analysisCache.set(validatedData.url, result);
      res.setHeader('X-Cache', 'MISS');
      
      res.json(result);
    } catch (error) {
      // Structured error response
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Invalid request",
          type: "VALIDATION_ERROR",
          details: error.errors,
          retryable: false
        });
      } else if (error instanceof Error) {
        // Determine if error is retryable based on message
        const isRetryable = error.message.includes('timeout') || 
                           error.message.includes('connection') ||
                           error.message.includes('retry') ||
                           error.message.includes('rate limit');
        
        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('forbidden') || error.message.includes('denied') ? 403 :
                          error.message.includes('rate limit') ? 429 : 400;
        
        res.status(statusCode).json({
          error: error.message || "Failed to analyze URL",
          type: "ANALYSIS_ERROR",
          retryable: isRetryable
        });
      } else {
        res.status(500).json({
          error: "An unexpected error occurred",
          type: "INTERNAL_ERROR",
          retryable: true
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
