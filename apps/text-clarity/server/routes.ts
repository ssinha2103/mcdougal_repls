import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeTextSchema } from "@shared/schema";
import { analyzeText } from "./text-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Text analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validation = analyzeTextSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.issues 
        });
      }

      const { text, keyword } = validation.data;
      const analysis = analyzeText(text, keyword);

      return res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      return res.status(500).json({ 
        error: "Failed to analyze text" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
