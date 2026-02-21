import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import * as cheerio from "cheerio";
import { analyzeLinkSchema, type LinkAnalysisResult, type LinkResult } from "@shared/schema";
import { storage } from "./storage";
import { validateUrl, createSafeAxiosConfig } from "./security";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
      const validationResult = analyzeLinkSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validationResult.error.errors,
        });
      }

      const { url } = validationResult.data;

      // SECURITY: Validate URL and create safe config to prevent SSRF attacks
      const urlValidation = await validateUrl(url);
      if (!urlValidation.isValid) {
        return res.status(400).json({
          error: "Invalid URL",
          message: urlValidation.error,
        });
      }

      // SECURITY: Get safe axios config with DNS rebinding protection
      const safeConfig = await createSafeAxiosConfig(url);
      if (safeConfig.error) {
        return res.status(400).json({
          error: "Security validation failed",
          message: safeConfig.error,
        });
      }

      let pageHtml: string;
      try {
        const response = await axios.get(url, {
          ...safeConfig.config,
          timeout: 10000,
          maxContentLength: 10 * 1024 * 1024, // 10MB limit
          maxBodyLength: 10 * 1024 * 1024,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });
        pageHtml = response.data;
      } catch (error) {
        return res.status(400).json({
          error: "Failed to fetch the page",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }

      const $ = cheerio.load(pageHtml);
      const links: string[] = [];
      
      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            if (!links.includes(absoluteUrl)) {
              links.push(absoluteUrl);
            }
          } catch {
            // Skip invalid URLs
          }
        }
      });

      const results: LinkResult[] = await Promise.all(
        links.map(async (link) => {
          try {
            // SECURITY: Validate each link before checking it
            const linkValidation = await validateUrl(link);
            if (!linkValidation.isValid) {
              return {
                url: link,
                statusCode: 0,
                statusText: "Error",
                error: `Security: ${linkValidation.error}`,
              };
            }

            // SECURITY: Get safe axios config with DNS rebinding protection
            const linkSafeConfig = await createSafeAxiosConfig(link);
            if (linkSafeConfig.error) {
              return {
                url: link,
                statusCode: 0,
                statusText: "Error",
                error: `Security: ${linkSafeConfig.error}`,
              };
            }

            // Follow redirects manually to track the chain
            const redirectChain: Array<{ url: string; statusCode: number; statusText: string }> = [];
            let currentUrl = link;
            let maxRedirects = 5;
            let finalStatusCode = 0;
            let finalStatusText = "";

            while (maxRedirects > 0) {
              // For redirects after the first request, get new safe config
              const currentSafeConfig = currentUrl === link 
                ? linkSafeConfig 
                : await createSafeAxiosConfig(currentUrl);
              
              if (currentSafeConfig.error) {
                return {
                  url: link,
                  statusCode: 0,
                  statusText: "Error",
                  error: `Security: ${currentSafeConfig.error}`,
                };
              }

              const response = await axios.head(currentUrl, {
                ...currentSafeConfig.config,
                timeout: 5000,
                maxRedirects: 0,
                validateStatus: () => true,
                maxContentLength: 1024 * 1024, // 1MB limit for HEAD requests
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                  "Accept-Language": "en-US,en;q=0.5",
                },
              });

              finalStatusCode = response.status;
              finalStatusText = response.statusText;

              // If it's a redirect, track it and follow
              if (response.status >= 300 && response.status < 400 && response.headers.location) {
                redirectChain.push({
                  url: currentUrl,
                  statusCode: response.status,
                  statusText: response.statusText,
                });

                // Resolve the next URL (could be relative or absolute)
                try {
                  const nextUrl = new URL(response.headers.location, currentUrl).toString();
                  
                  // SECURITY: Validate redirect target before following
                  const redirectValidation = await validateUrl(nextUrl);
                  if (!redirectValidation.isValid) {
                    // Stop following redirects if target is unsafe
                    return {
                      url: link,
                      statusCode: finalStatusCode,
                      statusText: finalStatusText,
                      error: `Security: Unsafe redirect - ${redirectValidation.error}`,
                      redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
                    };
                  }
                  
                  currentUrl = nextUrl;
                } catch {
                  // Invalid redirect URL
                  break;
                }
                maxRedirects--;
              } else {
                // Not a redirect, we're done
                break;
              }
            }

            const finalUrl = redirectChain.length > 0 ? currentUrl : undefined;

            return {
              url: link,
              statusCode: finalStatusCode,
              statusText: finalStatusText,
              finalUrl,
              redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
            };
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              return {
                url: link,
                statusCode: error.response.status,
                statusText: error.response.statusText,
              };
            }
            
            return {
              url: link,
              statusCode: 0,
              statusText: "Error",
              error: error instanceof Error ? error.message : "Request failed",
            };
          }
        })
      );

      const summary = {
        success: results.filter((r) => r.statusCode >= 200 && r.statusCode < 300).length,
        redirects: results.filter((r) => r.statusCode >= 300 && r.statusCode < 400).length,
        clientErrors: results.filter((r) => r.statusCode >= 400 && r.statusCode < 500).length,
        serverErrors: results.filter((r) => r.statusCode >= 500).length,
        errors: results.filter((r) => r.statusCode === 0).length,
      };

      const analysisResult: LinkAnalysisResult = {
        sourceUrl: url,
        totalLinks: links.length,
        results,
        summary,
      };

      // Save scan to database
      try {
        await storage.createScan({
          sourceUrl: url,
          totalLinks: links.length,
          results,
          summary,
        });
      } catch (dbError) {
        console.error("Failed to save scan:", dbError);
        // Continue anyway - don't fail the request if storage fails
      }

      res.json(analysisResult);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get scan history
  app.get("/api/scans", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const scans = await storage.getScans(limit);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({
        error: "Failed to fetch scan history",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get single scan by ID
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scan ID" });
      }

      const scan = await storage.getScanById(id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({
        error: "Failed to fetch scan",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
