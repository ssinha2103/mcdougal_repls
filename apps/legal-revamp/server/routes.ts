import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactInquirySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body using the schema
      const validatedData = insertContactInquirySchema.parse(req.body);
      
      // Create the contact inquiry
      const inquiry = await storage.createContactInquiry(validatedData);
      
      // In a real application, you might want to:
      // - Send an email notification to the team
      // - Send a confirmation email to the client
      // - Integrate with a CRM system
      
      res.json({ 
        success: true, 
        message: "Contact inquiry submitted successfully",
        inquiryId: inquiry.id
      });
    } catch (error) {
      console.error("Error creating contact inquiry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Get contact inquiries (for admin purposes)
  app.get("/api/contact", async (req, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Get specific contact inquiry
  app.get("/api/contact/:id", async (req, res) => {
    try {
      const inquiry = await storage.getContactInquiry(req.params.id);
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Contact inquiry not found"
        });
      }
      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching contact inquiry:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Update contact inquiry status
  app.patch("/api/contact/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const inquiry = await storage.updateContactInquiryStatus(req.params.id, status);
      
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Contact inquiry not found"
        });
      }
      
      res.json({
        success: true,
        message: "Contact inquiry updated successfully",
        inquiry
      });
    } catch (error) {
      console.error("Error updating contact inquiry:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
