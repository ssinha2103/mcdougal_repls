import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateHeadlinesSchema } from "@shared/schema";
import { generateHeadlines } from "./gemini";
import { scoreHeadlines } from "./scoring";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/headlines", async (req, res) => {
    try {
      const topic = req.query.topic as string;
      const tone = req.query.tone as string | undefined;
      
      const validation = generateHeadlinesSchema.safeParse({ topic, tone });
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors[0].message 
        });
      }

      const rawHeadlines = await generateHeadlines(
        validation.data.topic, 
        validation.data.tone || "professional"
      );

      const headlines = scoreHeadlines(rawHeadlines, validation.data.topic);

      res.json({ headlines });
    } catch (error) {
      console.error("Error generating headlines:", error);
      res.status(500).json({ 
        error: "Failed to generate headlines",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
