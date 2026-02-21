import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBiteReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit dog bite report
  app.post("/api/bite-reports", async (req, res) => {
    try {
      const validatedData = insertBiteReportSchema.parse(req.body);
      const report = await storage.createBiteReport(validatedData);
      
      // In a real implementation, this would:
      // 1. Send email notification to law firm
      // 2. Send confirmation email to client with PDF checklist
      // 3. Add to CRM system
      // 4. Schedule follow-up
      
      res.json({ 
        success: true, 
        message: "Thank you for your submission. A member of our team will contact you within 24 hours to discuss your case.",
        reportId: report.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all bite reports (for admin/internal use)
  app.get("/api/bite-reports", async (req, res) => {
    try {
      const reports = await storage.getBiteReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve reports" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
