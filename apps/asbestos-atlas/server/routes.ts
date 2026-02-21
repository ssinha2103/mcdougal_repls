import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { featuredSites } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all asbestos sites
  app.get("/api/asbestos-sites", async (req, res) => {
    try {
      const { state, siteType, exposurePeriod, search } = req.query;
      
      const filters = {
        state: state as string,
        siteType: siteType as string,
        exposurePeriod: exposurePeriod as string,
        searchTerm: search as string
      };

      const sites = await storage.getAsbestosSitesByFilter(filters);
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asbestos sites" });
    }
  });

  // Get specific asbestos site by ID
  app.get("/api/asbestos-sites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const site = await storage.getAsbestosSiteById(id);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site details" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json({ message: "Contact form submitted successfully", id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit contact form" });
      }
    }
  });

  // Get all contact submissions (for internal use)
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // Get featured sites with images
  app.get("/api/featured-sites", async (req, res) => {
    try {
      const sites = await db.select().from(featuredSites).orderBy(featuredSites.id);
      
      // Return sites with properly formatted images
      const sitesWithImages = sites.map(site => ({
        ...site,
        image: `data:${site.imageMimeType};base64,${site.imageBase64}`
      }));
      
      res.json(sitesWithImages);
    } catch (error) {
      console.error('Error fetching featured sites:', error);
      res.status(500).json({ message: "Failed to fetch featured sites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
