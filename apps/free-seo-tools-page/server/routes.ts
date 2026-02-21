import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertToolSchema, insertAnalyticsSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

// Simple session type
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    isAdmin?: boolean;
  }
}

// Simple admin check middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin === 1;
      
      res.json({ 
        id: user.id, 
        username: user.username,
        isAdmin: user.isAdmin === 1
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      id: req.session.userId,
      username: req.session.username,
      isAdmin: req.session.isAdmin
    });
  });

  // Public tool routes
  app.get("/api/tools", async (_req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool" });
    }
  });

  // Protected admin routes
  app.post("/api/tools", requireAdmin, async (req, res) => {
    try {
      const validatedTool = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(validatedTool);
      res.status(201).json(tool);
    } catch (error) {
      res.status(400).json({ error: "Invalid tool data" });
    }
  });

  app.patch("/api/tools/:id", requireAdmin, async (req, res) => {
    try {
      const tool = await storage.updateTool(req.params.id, req.body);
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(400).json({ error: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTool(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tool" });
    }
  });

  app.post("/api/analytics/click", async (req, res) => {
    try {
      const validated = insertAnalyticsSchema.parse(req.body);
      const click = await storage.trackClick(validated.toolId);
      res.status(201).json(click);
    } catch (error) {
      res.status(400).json({ error: "Invalid analytics data" });
    }
  });

  app.get("/api/analytics/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const popular = await storage.getPopularTools(limit);
      res.json(popular);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular tools" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
