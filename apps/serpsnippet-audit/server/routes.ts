import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ScrapingService } from "./services/scraper";
import { urlAnalysisRequestSchema, bulkUrlAnalysisRequestSchema, type BulkUrlAnalysisResponse } from "@shared/schema";
import { z } from "zod";

// Helper function to normalize URLs (add protocol if missing)
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // If no protocol, add https://
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  
  // Validate the URL format
  try {
    const urlObj = new URL(normalized);
    return urlObj.href;
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }
}

// Helper function to perform URL analysis
async function performAnalysis(url: string) {
  const scrapingResult = await ScrapingService.scrapeUrl(url);
  
  if (scrapingResult.error) {
    throw new Error(`Failed to analyze URL: ${scrapingResult.error}`);
  }

  const analysis = ScrapingService.analyzeContent(
    scrapingResult.title,
    scrapingResult.metaDescription,
    url
  );

  return await storage.saveAnalysis(analysis);
}

// Process bulk job asynchronously
async function processBulkJob(jobId: string, urls: string[]) {
  try {
    await storage.updateBulkJob(jobId, { status: 'processing' });
    
    let processedUrls = 0;
    let failedUrls = 0;
    const results: Array<{ url: string; analysisId?: number; error?: string }> = [];
    const errors: Array<{ url: string; error: string }> = [];
    
    for (const url of urls) {
      try {
        // Check for existing analysis first
        let analysis = await storage.getAnalysis(url);
        if (analysis) {
          const ageInMinutes = (Date.now() - analysis.scrapedAt.getTime()) / (1000 * 60);
          if (ageInMinutes >= 10) { // Re-analyze if older than 10 minutes
            analysis = await performAnalysis(url);
          }
        } else {
          analysis = await performAnalysis(url);
        }
        
        results.push({ url, analysisId: analysis.id });
        processedUrls++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        results.push({ url, error: errorMessage });
        errors.push({ url, error: errorMessage });
        failedUrls++;
      }
      
      // Update job progress after each URL
      await storage.updateBulkJob(jobId, {
        processedUrls: processedUrls + failedUrls,
        failedUrls,
        results,
        errors
      });
    }
    
    // Mark job as completed
    await storage.updateBulkJob(jobId, { status: 'completed' });
  } catch (error) {
    console.error(`Bulk job ${jobId} failed:`, error);
    await storage.updateBulkJob(jobId, { 
      status: 'failed',
      errors: [{ url: 'SYSTEM', error: 'Job processing failed' }]
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze URL endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      let { url } = urlAnalysisRequestSchema.parse(req.body);
      
      // Normalize the URL (add protocol if missing)
      url = normalizeUrl(url);
      
      // Check if we have a recent analysis
      const existingAnalysis = await storage.getAnalysis(url);
      if (existingAnalysis) {
        const ageInMinutes = (Date.now() - existingAnalysis.scrapedAt.getTime()) / (1000 * 60);
        if (ageInMinutes < 10) { // Use cached result if less than 10 minutes old
          return res.json(existingAnalysis);
        }
      }

      // Scrape the URL
      const scrapingResult = await ScrapingService.scrapeUrl(url);
      
      if (scrapingResult.error) {
        return res.status(400).json({ 
          message: `Failed to analyze URL: ${scrapingResult.error}` 
        });
      }

      // Analyze the content
      const analysis = ScrapingService.analyzeContent(
        scrapingResult.title,
        scrapingResult.metaDescription,
        url
      );

      // Save the analysis
      const savedAnalysis = await storage.saveAnalysis(analysis);
      
      res.json(savedAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid URL format" 
        });
      }
      
      console.error('Analysis error:', error);
      res.status(500).json({ 
        message: "Internal server error during analysis" 
      });
    }
  });

  // Bulk URL analysis endpoint - starts a bulk job
  app.post("/api/analyze/bulk", async (req, res) => {
    try {
      const { urls } = bulkUrlAnalysisRequestSchema.parse(req.body);
      
      // Normalize all URLs (add protocol if missing)
      const normalizedUrls = urls.map(url => {
        try {
          return normalizeUrl(url);
        } catch (error) {
          throw new Error(`Invalid URL: ${url}`);
        }
      });
      
      // Create a new bulk job in the database
      const job = await storage.createBulkJob({
        totalUrls: normalizedUrls.length,
        processedUrls: 0,
        failedUrls: 0,
        status: 'pending',
        results: [],
        errors: []
      });

      // Return the job info immediately
      res.json({
        jobId: job.id,
        totalUrls: job.totalUrls,
        processedUrls: job.processedUrls,
        failedUrls: job.failedUrls,
        status: job.status,
        results: [],
        errors: []
      });

      // Start processing URLs asynchronously with normalized URLs
      setImmediate(async () => {
        await processBulkJob(job.id, normalizedUrls);
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid bulk analysis request" 
        });
      }
      
      console.error('Bulk analysis error:', error);
      res.status(500).json({ 
        message: "Internal server error during bulk analysis" 
      });
    }
  });

  // Bulk job status polling endpoint
  app.get("/api/analyze/bulk/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getBulkJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Get full analyses for completed results
      type JobResult = { url: string; analysisId?: number; error?: string };
      const jobResults = job.results as JobResult[];
      const analysisIds = jobResults
        .filter((r): r is { url: string; analysisId: number; error?: string } => r.analysisId !== undefined)
        .map(r => r.analysisId);
        
      const analyses = analysisIds.length > 0 
        ? await storage.getAnalysesByIds(analysisIds)
        : [];

      res.json({
        jobId: job.id,
        totalUrls: job.totalUrls,
        processedUrls: job.processedUrls,
        failedUrls: job.failedUrls,
        status: job.status,
        results: analyses,
        errors: job.errors
      });
    } catch (error) {
      console.error('Bulk job status error:', error);
      res.status(500).json({ 
        message: "Failed to fetch job status" 
      });
    }
  });

  // Get recent analyses
  app.get("/api/recent", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const recent = await storage.getRecentAnalyses(limit);
      res.json(recent);
    } catch (error) {
      console.error('Recent analyses error:', error);
      res.status(500).json({ message: "Failed to fetch recent analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
