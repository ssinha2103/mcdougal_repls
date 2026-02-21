import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      service: "LegalService Schema Markup Generator",
      timestamp: new Date().toISOString()
    });
  });

  // All schema generation, validation, and export logic is handled client-side
  // No additional API endpoints are required for this frontend-only tool

  const httpServer = createServer(app);
  return httpServer;
}
