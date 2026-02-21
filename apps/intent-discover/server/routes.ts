import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchDataForSEO } from "./dataforseo";
import { insertSearchSchema } from "@shared/schema";
import type { SearchResult } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const validatedData = insertSearchSchema.parse(req.body);
      const { keyword } = validatedData;

      // Fetch data from DataForSEO
      const { paaQuestions, relatedSearches } = await searchDataForSEO(keyword);

      // Store search in history
      await storage.createSearch({ keyword });

      const result: SearchResult = {
        keyword,
        paaQuestions,
        relatedSearches,
        timestamp: new Date().toISOString(),
      };

      res.json(result);
    } catch (error) {
      console.error('Search error:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          message: error.message || 'Failed to perform search' 
        });
      } else {
        res.status(500).json({ 
          message: 'An unexpected error occurred' 
        });
      }
    }
  });

  // Get search history
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch search history' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
