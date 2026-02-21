import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateMetaDescriptionSchema } from "@shared/schema";
import { generateMetaDescriptions } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Meta Description Generation Endpoint
  app.post("/api/generate-meta-description", async (req, res) => {
    try {
      // Validate request body
      const validationResult = generateMetaDescriptionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.issues,
        });
      }

      const { topic, primaryKeyword, secondaryKeyword } = validationResult.data;

      // Generate meta descriptions using Gemini AI
      const descriptions = await generateMetaDescriptions(
        topic,
        primaryKeyword,
        secondaryKeyword
      );

      res.json({ descriptions });
    } catch (error) {
      console.error("Error generating meta descriptions:", error);
      res.status(500).json({
        error: "Failed to generate meta descriptions",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
