import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/hospitals/search", async (req, res) => {
    try {
      const zip = req.query.zip as string;
      const riskLevel = (req.query.riskLevel as 'low' | 'medium' | 'high') || 'low';
      const maxDistance = parseInt(req.query.maxDistance as string) || 50;

      console.log(`Search request: zip="${zip}", riskLevel="${riskLevel}", maxDistance=${maxDistance}`);

      if (!zip) {
        console.log("No ZIP code provided");
        return res.status(400).json({ error: "ZIP code is required" });
      }

      const hospitals = await storage.searchHospitals(zip, riskLevel, maxDistance);
      console.log(`Found ${hospitals.length} hospitals`);
      res.json(hospitals);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid hospital ID" });
      }

      const hospital = await storage.getHospitalById(id);
      
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      res.json(hospital);
    } catch (error) {
      console.error("Get hospital error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
