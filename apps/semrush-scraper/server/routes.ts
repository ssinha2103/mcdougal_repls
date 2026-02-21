import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SEMrushCrawler, type CrawlerConfig } from "./crawler";
import { processCrawlResults } from "./gemini";
import { ObjectStorageService } from "./objectStorage";
import { generateDomainPDF } from "./pdfGenerator";
import {
  insertDomainSchema,
  insertRunSchema,
  insertScheduledRunSchema,
} from "@shared/schema";
import { crawlEventBroadcaster } from "./websocket";
import { scheduleRun, cancelScheduledRun, runNow } from "./scheduler";
import archiver from "archiver";
import { z } from "zod";
import cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorage = new ObjectStorageService();

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all domains with latest metrics
  app.get("/api/domains", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error: any) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ error: "Failed to fetch domains" });
    }
  });

  // Get ranked domains
  app.get("/api/domains/ranked", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      // Sort by prospect score descending
      const ranked = domains.sort((a, b) => {
        const scoreA = a.latestSnapshot?.metrics?.prospectScore || 0;
        const scoreB = b.latestSnapshot?.metrics?.prospectScore || 0;
        return scoreB - scoreA;
      });
      res.json(ranked);
    } catch (error: any) {
      console.error("Error fetching ranked domains:", error);
      res.status(500).json({ error: "Failed to fetch ranked domains" });
    }
  });

  // Get single domain
  app.get("/api/domains/:id", async (req, res) => {
    try {
      const domain = await storage.getDomain(req.params.id);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }
      res.json(domain);
    } catch (error: any) {
      console.error("Error fetching domain:", error);
      res.status(500).json({ error: "Failed to fetch domain" });
    }
  });

  // Discover selectors for a domain
  app.get("/api/domains/:id/discover-selectors", async (req, res) => {
    const crawler = new SEMrushCrawler({
      database: "us",
      maxRequestsPerHour: 120,
      enableAI: false,
      developmentMode: false,
      selectorDiscoveryMode: true,
    });

    try {
      const domain = await storage.getDomain(req.params.id);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }

      console.log(`[API] Starting selector discovery for ${domain.domain}`);

      // Create a special discovery run
      const run = await storage.createRun({
        name: `Selector Discovery - ${domain.domain}`,
        database: "us",
        totalDomains: 1,
        completedDomains: 0,
        failedDomains: 0,
        status: "running",
        config: {
          database: "us",
          maxRequestsPerHour: 120,
          enableAI: false,
          developmentMode: false,
          selectorDiscoveryMode: true,
        },
      });

      // Create snapshot
      const snapshot = await storage.createSnapshot({
        domainId: domain.id,
        runId: run.id,
        status: "crawling",
      });

      // Log start
      await storage.createLog({
        runId: run.id,
        snapshotId: snapshot.id,
        level: "info",
        message: `Starting selector discovery for ${domain.domain}`,
        metadata: { mode: "discovery" },
      });

      // Initialize crawler and run discovery synchronously
      await crawler.initialize();
      const result = await crawler.crawlDomain(domain.domain, run.id);

      // Extract discovery data from result
      let discoveryData = null;
      if (result.success && result.sections.length > 0) {
        // Discovery data is in sections[0].extractedData
        const discoverySection = result.sections[0];
        if (discoverySection && discoverySection.extractedData) {
          discoveryData = discoverySection.extractedData;
        }

        // Save sections to database
        for (const sectionData of result.sections) {
          await storage.createSection({
            snapshotId: snapshot.id,
            sectionType: sectionData.sectionType,
            screenshotPath: sectionData.screenshotPath,
            extractedData: sectionData.extractedData,
            extractionMethod: sectionData.extractionMethod,
            notes: sectionData.notes || "Discovery mode",
          });
        }

        await storage.updateSnapshotStatus(snapshot.id, "completed");
        await storage.updateRunProgress(run.id, 1, 0);
        await storage.updateRunStatus(run.id, "completed");

        await storage.createLog({
          runId: run.id,
          snapshotId: snapshot.id,
          level: "info",
          message: `Selector discovery completed for ${domain.domain}`,
          metadata: { 
            elementsFound: discoveryData?.summary?.totalElements || 0 
          },
        });

        console.log(`[API] Discovery completed successfully for ${domain.domain}`);

        // Return discovery data in response
        res.json({
          success: true,
          runId: run.id,
          snapshotId: snapshot.id,
          domain: domain.domain,
          domStructure: discoveryData,
        });
      } else {
        // Discovery failed
        await storage.updateSnapshotStatus(
          snapshot.id,
          "failed",
          result.error || "Discovery failed"
        );
        await storage.updateRunProgress(run.id, 0, 1);
        await storage.updateRunStatus(run.id, "failed");

        await storage.createLog({
          runId: run.id,
          snapshotId: snapshot.id,
          level: "error",
          message: `Selector discovery failed for ${domain.domain}: ${result.error}`,
          metadata: {},
        });

        res.status(500).json({
          success: false,
          error: result.error || "Discovery failed",
          runId: run.id,
          snapshotId: snapshot.id,
        });
      }
    } catch (error: any) {
      console.error("Error in selector discovery:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to run selector discovery" 
      });
    } finally {
      await crawler.close();
    }
  });

  // Create domains and start crawl
  app.post("/api/domains/crawl", async (req, res) => {
    try {
      // Validate request body with Zod
      const requestSchema = z.object({
        domains: z
          .array(z.string().min(1))
          .min(1, "At least one domain is required"),
        config: z
          .object({
            runName: z.string().optional(),
            database: z.string().default("us"),
            maxRequestsPerHour: z.number().min(10).max(300).default(120),
            enableAI: z.boolean().default(true),
          })
          .optional(),
      });

      const validated = requestSchema.parse(req.body);
      const { domains: domainList, config } = validated;

      // Validate config
      const crawlerConfig: CrawlerConfig = {
        database: config?.database || "us",
        maxRequestsPerHour: config?.maxRequestsPerHour || 120,
        enableAI: config?.enableAI !== false,
        developmentMode: false, // Auto-enable in dev
      };

      // Create run
      const run = await storage.createRun({
        name: config?.runName,
        database: crawlerConfig.database,
        totalDomains: domainList.length,
        completedDomains: 0,
        failedDomains: 0,
        status: "pending",
        config: crawlerConfig,
      });

      // Create or update domains
      const createdDomains = await Promise.all(
        domainList.map(async (domainName: string) => {
          const existing = await storage.getDomainByName(domainName);
          if (existing) {
            await storage.updateDomainStatus(existing.id, "queued");
            return existing;
          }
          return await storage.createDomain({
            domain: domainName,
            status: "queued",
          });
        }),
      );

      // Create snapshots
      await Promise.all(
        createdDomains.map((domain) =>
          storage.createSnapshot({
            domainId: domain.id,
            runId: run.id,
            status: "pending",
          }),
        ),
      );

      // Start crawl in background
      setTimeout(() => startCrawlJob(run.id, crawlerConfig), 100);

      res.json({ run, domains: createdDomains });
    } catch (error: any) {
      console.error("Error starting crawl:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to start crawl" });
    }
  });

  // Get all runs
  app.get("/api/runs", async (req, res) => {
    try {
      const runs = await storage.getAllRuns();
      res.json(runs);
    } catch (error: any) {
      console.error("Error fetching runs:", error);
      res.status(500).json({ error: "Failed to fetch runs" });
    }
  });

  // Get single run
  app.get("/api/runs/:id", async (req, res) => {
    try {
      const run = await storage.getRun(req.params.id);
      if (!run) {
        return res.status(404).json({ error: "Run not found" });
      }

      const snapshots = await storage.getSnapshotsByRun(req.params.id);
      res.json({ ...run, snapshots });
    } catch (error: any) {
      console.error("Error fetching run:", error);
      res.status(500).json({ error: "Failed to fetch run" });
    }
  });

  // Get run logs
  app.get("/api/runs/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getLogsByRun(req.params.id);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Get snapshot details
  app.get("/api/snapshots/:id", async (req, res) => {
    try {
      const snapshot = await storage.getSnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      res.json(snapshot);
    } catch (error: any) {
      console.error("Error fetching snapshot:", error);
      res.status(500).json({ error: "Failed to fetch snapshot" });
    }
  });

  // Generate PDF one-pager for snapshot
  app.get("/api/snapshots/:id/pdf", async (req, res) => {
    try {
      const snapshot = await storage.getSnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }

      const domain = snapshot.domain;
      if (!domain) {
        return res.status(404).json({ error: "Domain not found for snapshot" });
      }

      console.log(`[PDF API] Generating PDF for ${domain.domain}`);

      const pdfBuffer = await generateDomainPDF(req.params.id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${domain.domain}-report.pdf"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);

      console.log(`[PDF API] Successfully generated PDF for ${domain.domain}`);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to generate PDF",
          message: error.message,
        });
      }
    }
  });

  // Get screenshot
  app.get("/api/screenshots/:path(*)", async (req, res) => {
    try {
      const screenshotPath = req.params.path;
      await objectStorage.downloadScreenshot(screenshotPath, res);
    } catch (error: any) {
      console.error("Error downloading screenshot:", error);
      res.status(500).json({ error: "Failed to download screenshot" });
    }
  });

  // Export run as ZIP
  app.get("/api/runs/:id/export", async (req, res) => {
    try {
      const run = await storage.getRun(req.params.id);
      if (!run) {
        return res.status(404).json({ error: "Run not found" });
      }

      const snapshots = await storage.getSnapshotsByRun(req.params.id);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="run-${run.id}-export.zip"`,
      );

      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to create archive" });
        }
      });

      archive.pipe(res);

      const errors: string[] = [];
      const csvData: any[] = [];

      // Process all snapshots and collect data
      for (const snapshot of snapshots) {
        try {
          const domain = await storage.getDomain(snapshot.domainId);
          if (!domain) {
            errors.push(`Domain not found for snapshot ${snapshot.id}`);
            continue;
          }

          const sections = await storage.getSectionsBySnapshot(snapshot.id);
          const metrics = await storage.getMetricsBySnapshot(snapshot.id);
          const insights = await storage.getInsightsBySnapshot(snapshot.id);

          // Create domain folder structure
          const domainFolder = `snapshots/${domain.domain}`;

          // Add snapshot metadata JSON
          const snapshotMetadata = {
            id: snapshot.id,
            domainId: snapshot.domainId,
            domain: domain.domain,
            runId: snapshot.runId,
            status: snapshot.status,
            errorMessage: snapshot.errorMessage,
            startedAt: snapshot.startedAt,
            completedAt: snapshot.completedAt,
            createdAt: snapshot.createdAt,
            sections: sections.map((s) => ({
              id: s.id,
              sectionType: s.sectionType,
              extractedData: s.extractedData,
              extractionMethod: s.extractionMethod,
              notes: s.notes,
              screenshotPath: s.screenshotPath,
            })),
          };

          archive.append(JSON.stringify(snapshotMetadata, null, 2), {
            name: `${domainFolder}/snapshot-metadata.json`,
          });

          // Add metrics JSON
          if (metrics) {
            archive.append(JSON.stringify(metrics, null, 2), {
              name: `${domainFolder}/metrics.json`,
            });
          }

          // Add insights JSON
          if (insights && insights.length > 0) {
            archive.append(JSON.stringify(insights, null, 2), {
              name: `${domainFolder}/insights.json`,
            });
          }

          // Download and add screenshots
          for (const section of sections) {
            if (section.screenshotPath) {
              try {
                const screenshotBuffer =
                  await objectStorage.getScreenshotBuffer(
                    section.screenshotPath,
                  );
                if (screenshotBuffer) {
                  archive.append(screenshotBuffer, {
                    name: `${domainFolder}/screenshots/${section.sectionType}.png`,
                  });
                } else {
                  errors.push(
                    `Screenshot not found: ${section.screenshotPath}`,
                  );
                }
              } catch (screenshotError: any) {
                errors.push(
                  `Failed to download screenshot ${section.screenshotPath}: ${screenshotError.message}`,
                );
              }
            }
          }

          // Collect data for CSV
          csvData.push({
            domain: domain.domain,
            status: snapshot.status,
            prospectScore: metrics?.prospectScore || 0,
            organicTraffic: metrics?.organicTraffic || 0,
            totalKeywords: metrics?.totalKeywords || 0,
            trafficCost: metrics?.trafficCost || 0,
            monthlyChange:
              (metrics?.positionsImproved || 0) -
              (metrics?.positionsDeclined || 0),
            top3Keywords: metrics?.top3Keywords || 0,
            top10Keywords: metrics?.top10Keywords || 0,
            insightsCount: insights?.length || 0,
            crawledAt: snapshot.completedAt || snapshot.createdAt,
          });
        } catch (snapshotError: any) {
          errors.push(
            `Error processing snapshot ${snapshot.id}: ${snapshotError.message}`,
          );
        }
      }

      // Create run metadata with summary stats
      const runMetadata = {
        ...run,
        summary: {
          totalSnapshots: snapshots.length,
          completedSnapshots: snapshots.filter((s) => s.status === "completed")
            .length,
          failedSnapshots: snapshots.filter((s) => s.status === "failed")
            .length,
          avgProspectScore:
            csvData.length > 0
              ? Math.round(
                  csvData.reduce((sum, d) => sum + d.prospectScore, 0) /
                    csvData.length,
                )
              : 0,
          totalOrganicTraffic: csvData.reduce(
            (sum, d) => sum + d.organicTraffic,
            0,
          ),
        },
        errors: errors.length > 0 ? errors : undefined,
      };

      archive.append(JSON.stringify(runMetadata, null, 2), {
        name: "run-metadata.json",
      });

      // Generate CSV reports
      const csvHeaders = [
        "Domain",
        "Status",
        "Prospect Score",
        "Organic Traffic",
        "Keywords",
        "Traffic Cost",
        "Monthly Change",
        "Top 3 Keywords",
        "Top 10 Keywords",
        "Insights Count",
        "Crawled At",
      ];

      // Helper function to escape CSV values
      const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Helper function to generate CSV
      const generateCsv = (data: any[]): string => {
        const rows = [csvHeaders.join(",")];
        for (const row of data) {
          rows.push(
            [
              escapeCsv(row.domain),
              escapeCsv(row.status),
              escapeCsv(row.prospectScore),
              escapeCsv(row.organicTraffic),
              escapeCsv(row.totalKeywords),
              escapeCsv(row.trafficCost),
              escapeCsv(row.monthlyChange),
              escapeCsv(row.top3Keywords),
              escapeCsv(row.top10Keywords),
              escapeCsv(row.insightsCount),
              escapeCsv(
                row.crawledAt ? new Date(row.crawledAt).toISOString() : "",
              ),
            ].join(","),
          );
        }
        return rows.join("\n");
      };

      // All domains CSV
      const allDomainsCsv = generateCsv(csvData);
      archive.append(allDomainsCsv, {
        name: "reports/all-domains-metrics.csv",
      });

      // High priority domains CSV (score >= 70)
      const highPriorityData = csvData
        .filter((d) => d.prospectScore >= 70)
        .sort((a, b) => b.prospectScore - a.prospectScore);

      if (highPriorityData.length > 0) {
        const highPriorityCsv = generateCsv(highPriorityData);
        archive.append(highPriorityCsv, {
          name: "reports/high-priority-domains.csv",
        });
      }

      await archive.finalize();
    } catch (error: any) {
      console.error("Error exporting run:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to export run" });
      }
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      const runs = await storage.getAllRuns();

      const activeCrawls = runs.filter((r) => r.status === "running").length;

      const completedRuns = runs.filter((r) => r.status === "completed");
      const totalDomains = completedRuns.reduce(
        (sum, r) => sum + r.totalDomains,
        0,
      );
      const successfulDomains = completedRuns.reduce(
        (sum, r) => sum + r.completedDomains,
        0,
      );
      const successRate =
        totalDomains > 0
          ? Math.round((successfulDomains / totalDomains) * 100)
          : 0;

      const domainsWithScores = domains.filter(
        (d) => d.latestSnapshot?.metrics?.prospectScore,
      );
      const avgScore =
        domainsWithScores.length > 0
          ? Math.round(
              domainsWithScores.reduce(
                (sum, d) =>
                  sum + (d.latestSnapshot?.metrics?.prospectScore || 0),
                0,
              ) / domainsWithScores.length,
            )
          : 0;

      res.json({
        totalDomains: domains.length,
        activeCrawls,
        successRate,
        avgScore,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Export comparison data as CSV
  app.post("/api/compare/export", async (req, res) => {
    try {
      const requestSchema = z.object({
        domainIds: z.array(z.string()),
        weights: z.object({
          trafficDecline: z.number(),
          keywordLoss: z.number(),
          competitionGap: z.number(),
          intentMix: z.number(),
        }),
        filters: z.object({
          prospectScoreMin: z.number(),
          prospectScoreMax: z.number(),
          trafficMin: z.number(),
          trafficMax: z.number(),
          keywordsMin: z.number(),
          keywordsMax: z.number(),
          status: z.string(),
        }),
      });

      const { domainIds, weights, filters } = requestSchema.parse(req.body);

      // Fetch domains
      const allDomains = await storage.getAllDomains();
      const domains =
        domainIds.length > 0
          ? allDomains.filter((d) => domainIds.includes(d.id))
          : allDomains;

      // Calculate weighted scores for each domain
      const csvData = domains.map((domain) => {
        const metrics = domain.latestSnapshot?.metrics;
        const insights = domain.latestSnapshot?.insights || [];

        // Calculate weighted score
        const declineScore = metrics?.declineScore || 0;
        const lossScore = metrics?.positionsLost
          ? (metrics.positionsLost / Math.max(metrics.totalKeywords || 1, 1)) *
            100
          : 0;
        const gapScore = metrics?.opportunityScore || 0;
        const intentScore = metrics?.prospectScore || 0;

        const weightedScore = Math.round(
          (declineScore * weights.trafficDecline) / 100 +
            (lossScore * weights.keywordLoss) / 100 +
            (gapScore * weights.competitionGap) / 100 +
            (intentScore * weights.intentMix) / 100,
        );

        const monthlyChange =
          (metrics?.positionsImproved || 0) - (metrics?.positionsDeclined || 0);
        const topInsight = insights[0];

        return {
          domain: domain.domain,
          status: domain.latestSnapshot?.status || "pending",
          weightedScore,
          originalScore: metrics?.prospectScore || 0,
          organicTraffic: metrics?.organicTraffic || 0,
          totalKeywords: metrics?.totalKeywords || 0,
          trafficCost: metrics?.trafficCost || 0,
          monthlyChange,
          top3Keywords: metrics?.top3Keywords || 0,
          top10Keywords: metrics?.top10Keywords || 0,
          top100Keywords: metrics?.top100Keywords || 0,
          declineScore: metrics?.declineScore || 0,
          opportunityScore: metrics?.opportunityScore || 0,
          positionsImproved: metrics?.positionsImproved || 0,
          positionsDeclined: metrics?.positionsDeclined || 0,
          positionsNew: metrics?.positionsNew || 0,
          positionsLost: metrics?.positionsLost || 0,
          topInsightTitle: topInsight?.title || "",
          topInsightSeverity: topInsight?.severity || "",
          insightsCount: insights.length,
          crawledAt:
            domain.latestSnapshot?.completedAt || domain.lastCrawledAt || "",
        };
      });

      // Helper function to escape CSV values
      const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Generate CSV
      const csvHeaders = [
        "Domain",
        "Status",
        "Weighted Score",
        "Original Score",
        "Organic Traffic",
        "Total Keywords",
        "Traffic Cost",
        "Monthly Change",
        "Top 3 Keywords",
        "Top 10 Keywords",
        "Top 100 Keywords",
        "Decline Score",
        "Opportunity Score",
        "Positions Improved",
        "Positions Declined",
        "Positions New",
        "Positions Lost",
        "Top Insight Title",
        "Top Insight Severity",
        "Insights Count",
        "Crawled At",
      ];

      const csvRows = [csvHeaders.join(",")];
      for (const row of csvData) {
        csvRows.push(
          [
            escapeCsv(row.domain),
            escapeCsv(row.status),
            escapeCsv(row.weightedScore),
            escapeCsv(row.originalScore),
            escapeCsv(row.organicTraffic),
            escapeCsv(row.totalKeywords),
            escapeCsv(row.trafficCost),
            escapeCsv(row.monthlyChange),
            escapeCsv(row.top3Keywords),
            escapeCsv(row.top10Keywords),
            escapeCsv(row.top100Keywords),
            escapeCsv(row.declineScore),
            escapeCsv(row.opportunityScore),
            escapeCsv(row.positionsImproved),
            escapeCsv(row.positionsDeclined),
            escapeCsv(row.positionsNew),
            escapeCsv(row.positionsLost),
            escapeCsv(row.topInsightTitle),
            escapeCsv(row.topInsightSeverity),
            escapeCsv(row.insightsCount),
            escapeCsv(
              row.crawledAt ? new Date(row.crawledAt).toISOString() : "",
            ),
          ].join(","),
        );
      }

      const csvContent = csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="comparison-export-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send(csvContent);
    } catch (error: any) {
      console.error("Error exporting comparison:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to export comparison data" });
    }
  });

  // ============ Scheduled Runs API ============

  // Get all scheduled runs
  app.get("/api/scheduled-runs", async (req, res) => {
    try {
      const scheduledRuns = await storage.getAllScheduledRuns();
      res.json(scheduledRuns);
    } catch (error: any) {
      console.error("Error fetching scheduled runs:", error);
      res.status(500).json({ error: "Failed to fetch scheduled runs" });
    }
  });

  // Get single scheduled run
  app.get("/api/scheduled-runs/:id", async (req, res) => {
    try {
      const scheduledRun = await storage.getScheduledRun(req.params.id);
      if (!scheduledRun) {
        return res.status(404).json({ error: "Scheduled run not found" });
      }
      res.json(scheduledRun);
    } catch (error: any) {
      console.error("Error fetching scheduled run:", error);
      res.status(500).json({ error: "Failed to fetch scheduled run" });
    }
  });

  // Create scheduled run
  app.post("/api/scheduled-runs", async (req, res) => {
    try {
      const validated = insertScheduledRunSchema.parse(req.body);

      // Validate cron expression
      if (!cron.validate(validated.cronSchedule)) {
        return res.status(400).json({ error: "Invalid cron expression" });
      }

      const scheduledRun = await storage.createScheduledRun(validated);

      // Schedule the run if enabled
      if (scheduledRun.enabled) {
        scheduleRun(scheduledRun);
      }

      res.json(scheduledRun);
    } catch (error: any) {
      console.error("Error creating scheduled run:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to create scheduled run" });
    }
  });

  // Update scheduled run
  app.patch("/api/scheduled-runs/:id", async (req, res) => {
    try {
      const scheduledRun = await storage.getScheduledRun(req.params.id);
      if (!scheduledRun) {
        return res.status(404).json({ error: "Scheduled run not found" });
      }

      const updates = req.body;

      // Validate cron expression if updating schedule
      if (updates.cronSchedule && !cron.validate(updates.cronSchedule)) {
        return res.status(400).json({ error: "Invalid cron expression" });
      }

      await storage.updateScheduledRun(req.params.id, updates);

      // Reload the schedule
      const updatedRun = await storage.getScheduledRun(req.params.id);
      if (updatedRun && updatedRun.enabled) {
        scheduleRun(updatedRun);
      } else {
        cancelScheduledRun(req.params.id);
      }

      res.json(updatedRun);
    } catch (error: any) {
      console.error("Error updating scheduled run:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }

      res.status(500).json({ error: "Failed to update scheduled run" });
    }
  });

  // Toggle scheduled run (enable/disable)
  app.post("/api/scheduled-runs/:id/toggle", async (req, res) => {
    try {
      const scheduledRun = await storage.getScheduledRun(req.params.id);
      if (!scheduledRun) {
        return res.status(404).json({ error: "Scheduled run not found" });
      }

      const newEnabledState = !scheduledRun.enabled;
      await storage.toggleScheduledRun(req.params.id, newEnabledState);

      if (newEnabledState) {
        const updatedRun = await storage.getScheduledRun(req.params.id);
        if (updatedRun) {
          scheduleRun(updatedRun);
        }
      } else {
        cancelScheduledRun(req.params.id);
      }

      const updatedRun = await storage.getScheduledRun(req.params.id);
      res.json(updatedRun);
    } catch (error: any) {
      console.error("Error toggling scheduled run:", error);
      res.status(500).json({ error: "Failed to toggle scheduled run" });
    }
  });

  // Delete scheduled run
  app.delete("/api/scheduled-runs/:id", async (req, res) => {
    try {
      const scheduledRun = await storage.getScheduledRun(req.params.id);
      if (!scheduledRun) {
        return res.status(404).json({ error: "Scheduled run not found" });
      }

      cancelScheduledRun(req.params.id);
      await storage.deleteScheduledRun(req.params.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting scheduled run:", error);
      res.status(500).json({ error: "Failed to delete scheduled run" });
    }
  });

  // Manually trigger scheduled run
  app.post("/api/scheduled-runs/:id/run-now", async (req, res) => {
    try {
      const scheduledRun = await storage.getScheduledRun(req.params.id);
      if (!scheduledRun) {
        return res.status(404).json({ error: "Scheduled run not found" });
      }

      // Trigger the run asynchronously
      runNow(req.params.id).catch((error) => {
        console.error(`Error running scheduled run ${req.params.id}:`, error);
      });

      res.json({ success: true, message: "Scheduled run triggered" });
    } catch (error: any) {
      console.error("Error triggering scheduled run:", error);
      res.status(500).json({ error: "Failed to trigger scheduled run" });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server for real-time updates
  crawlEventBroadcaster.initialize(httpServer);

  return httpServer;
}

/**
 * Background job to crawl domains
 */
async function startCrawlJob(runId: string, config: CrawlerConfig) {
  const crawler = new SEMrushCrawler(config);

  try {
    await storage.updateRunStatus(runId, "running");
    crawlEventBroadcaster.broadcastRunStatus(runId, "running");
    await crawler.initialize();

    const snapshots = await storage.getSnapshotsByRun(runId);
    let completed = 0;
    let failed = 0;
    const total = snapshots.length;

    for (const snapshot of snapshots) {
      try {
        // Get domain
        const domain = await storage.getDomain(snapshot.domainId);
        if (!domain) continue;

        // Update status
        await storage.updateSnapshotStatus(snapshot.id, "crawling");
        await storage.updateDomainStatus(domain.id, "crawling");

        // Broadcast real-time update
        crawlEventBroadcaster.broadcastSnapshotUpdate(
          runId,
          snapshot.id,
          domain.id,
          domain.domain,
          "crawling",
        );
        crawlEventBroadcaster.broadcastProgress(
          runId,
          completed,
          failed,
          total,
          domain.domain,
        );

        // Log
        await storage.createLog({
          runId,
          snapshotId: snapshot.id,
          level: "info",
          message: `Starting crawl for ${domain.domain}`,
          metadata: {},
        });

        // Crawl
        const result = await crawler.crawlDomain(domain.domain, runId);

        if (result.success) {
          // Save sections
          for (const sectionData of result.sections) {
            await storage.createSection({
              snapshotId: snapshot.id,
              sectionType: sectionData.sectionType,
              screenshotPath: sectionData.screenshotPath,
              extractedData: sectionData.extractedData,
              extractionMethod: sectionData.extractionMethod,
              notes: sectionData.notes,
            });
          }

          // Process and save metrics
          const { metrics: crawlMetrics, insights: crawlInsights } =
            await processCrawlResults(
              result.sections,
              config.enableAI,
              domain.domain,
            );

          await storage.createMetrics({
            snapshotId: snapshot.id,
            ...crawlMetrics,
          });

          // Save insights
          for (const insight of crawlInsights) {
            if (insight.insightType && insight.title && insight.summary) {
              await storage.createInsight({
                snapshotId: snapshot.id,
                insightType: insight.insightType,
                title: insight.title,
                summary: insight.summary,
                details: insight.details,
                severity: insight.severity,
                confidence: insight.confidence,
              });
            }
          }

          await storage.updateSnapshotStatus(snapshot.id, "completed");
          await storage.updateDomainStatus(domain.id, "completed", new Date());
          completed++;

          // Broadcast success
          crawlEventBroadcaster.broadcastSnapshotUpdate(
            runId,
            snapshot.id,
            domain.id,
            domain.domain,
            "completed",
          );

          await storage.createLog({
            runId,
            snapshotId: snapshot.id,
            level: "info",
            message: `Successfully crawled ${domain.domain}`,
            metadata: { sectionsCount: result.sections.length },
          });
        } else {
          await storage.updateSnapshotStatus(
            snapshot.id,
            "failed",
            result.error,
          );
          await storage.updateDomainStatus(domain.id, "failed");
          failed++;

          // Broadcast failure
          crawlEventBroadcaster.broadcastSnapshotUpdate(
            runId,
            snapshot.id,
            domain.id,
            domain.domain,
            "failed",
          );

          await storage.createLog({
            runId,
            snapshotId: snapshot.id,
            level: "error",
            message: `Failed to crawl ${domain.domain}: ${result.error}`,
            metadata: {},
          });
        }

        await storage.updateRunProgress(runId, completed, failed);
        crawlEventBroadcaster.broadcastProgress(
          runId,
          completed,
          failed,
          total,
        );
      } catch (error: any) {
        console.error(`Error processing snapshot ${snapshot.id}:`, error);
        failed++;

        // Update snapshot and domain status on error
        const domain = await storage.getDomain(snapshot.domainId);
        if (domain) {
          await storage.updateSnapshotStatus(
            snapshot.id,
            "failed",
            error.message || "Unknown error",
          );
          await storage.updateDomainStatus(domain.id, "failed");

          // Broadcast failure
          crawlEventBroadcaster.broadcastSnapshotUpdate(
            runId,
            snapshot.id,
            domain.id,
            domain.domain,
            "failed",
          );

          await storage.createLog({
            runId,
            snapshotId: snapshot.id,
            level: "error",
            message: `Exception during crawl: ${error.message}`,
            metadata: {},
          });
        }

        await storage.updateRunProgress(runId, completed, failed);
        crawlEventBroadcaster.broadcastProgress(
          runId,
          completed,
          failed,
          total,
        );
      }
    }

    await storage.updateRunStatus(runId, "completed");
    crawlEventBroadcaster.broadcastRunStatus(runId, "completed");
    crawlEventBroadcaster.broadcastProgress(runId, completed, failed, total);

    await storage.createLog({
      runId,
      level: "info",
      message: `Crawl completed: ${completed} successful, ${failed} failed`,
      metadata: { completed, failed },
    });
  } catch (error: any) {
    console.error(`Fatal error in crawl job ${runId}:`, error);

    // Mark all remaining snapshots and domains as failed
    const snapshots = await storage.getSnapshotsByRun(runId);
    const abortedDomains: string[] = [];

    for (const snapshot of snapshots) {
      // Only update if still pending/crawling
      if (snapshot.status === "pending" || snapshot.status === "crawling") {
        const domain = await storage.getDomain(snapshot.domainId);
        if (domain) {
          await storage.updateSnapshotStatus(
            snapshot.id,
            "failed",
            "Run aborted due to fatal error",
          );
          await storage.updateDomainStatus(domain.id, "failed");

          // Broadcast failure for each aborted snapshot
          crawlEventBroadcaster.broadcastSnapshotUpdate(
            runId,
            snapshot.id,
            domain.id,
            domain.domain,
            "failed",
          );

          abortedDomains.push(domain.domain);
        }
      }
    }

    // Get final counts
    const run = await storage.getRun(runId);
    const finalCompleted = run?.completedDomains || 0;
    const finalFailed = run?.failedDomains || 0;
    const total = run?.totalDomains || snapshots.length;

    await storage.updateRunStatus(runId, "failed");
    crawlEventBroadcaster.broadcastRunStatus(runId, "failed");
    crawlEventBroadcaster.broadcastProgress(
      runId,
      finalCompleted,
      finalFailed,
      total,
    );

    await storage.createLog({
      runId,
      level: "error",
      message: `Fatal error: ${error.message}. Aborted ${abortedDomains.length} domains: ${abortedDomains.join(", ")}`,
      metadata: { abortedDomains },
    });
  } finally {
    await crawler.close();
  }
}

/**
 * Background job to discover selectors for a single domain
 */
async function discoverSelectorsJob(runId: string, domainName: string) {
  const config: CrawlerConfig = {
    database: "us",
    maxRequestsPerHour: 120,
    enableAI: false,
    developmentMode: false,
    selectorDiscoveryMode: true,
  };
  
  const crawler = new SEMrushCrawler(config);

  try {
    console.log(`[DISCOVERY] Starting selector discovery for ${domainName}`);
    
    await storage.updateRunStatus(runId, "running");
    await crawler.initialize();

    const snapshots = await storage.getSnapshotsByRun(runId);
    const snapshot = snapshots[0];
    
    if (!snapshot) {
      throw new Error("No snapshot found for discovery run");
    }

    // Update status
    await storage.updateSnapshotStatus(snapshot.id, "crawling");
    
    // Log
    await storage.createLog({
      runId,
      snapshotId: snapshot.id,
      level: "info",
      message: `Starting selector discovery for ${domainName}`,
      metadata: { mode: "discovery" },
    });

    // Crawl with discovery mode enabled
    const result = await crawler.crawlDomain(domainName, runId);

    if (result.success || result.sections.length > 0) {
      // Save sections (they will mostly be empty, but that's OK for discovery)
      for (const sectionData of result.sections) {
        await storage.createSection({
          snapshotId: snapshot.id,
          sectionType: sectionData.sectionType,
          screenshotPath: sectionData.screenshotPath,
          extractedData: sectionData.extractedData,
          extractionMethod: sectionData.extractionMethod,
          notes: sectionData.notes || "Discovery mode",
        });
      }

      await storage.updateSnapshotStatus(snapshot.id, "completed");
      await storage.updateRunProgress(runId, 1, 0);
      
      await storage.createLog({
        runId,
        snapshotId: snapshot.id,
        level: "info",
        message: `Selector discovery completed for ${domainName}. Check server logs for JSON file path.`,
        metadata: { sectionsCount: result.sections.length },
      });
    } else {
      await storage.updateSnapshotStatus(
        snapshot.id,
        "failed",
        result.error || "Discovery failed",
      );
      await storage.updateRunProgress(runId, 0, 1);
      
      await storage.createLog({
        runId,
        snapshotId: snapshot.id,
        level: "error",
        message: `Selector discovery failed for ${domainName}: ${result.error}`,
        metadata: {},
      });
    }

    await storage.updateRunStatus(runId, "completed");
    
    console.log(`[DISCOVERY] Completed selector discovery for ${domainName}`);
  } catch (error: any) {
    console.error(`[DISCOVERY] Fatal error for ${domainName}:`, error);

    const snapshots = await storage.getSnapshotsByRun(runId);
    if (snapshots[0]) {
      await storage.updateSnapshotStatus(
        snapshots[0].id,
        "failed",
        error.message || "Discovery error",
      );
      
      await storage.createLog({
        runId,
        snapshotId: snapshots[0].id,
        level: "error",
        message: `Discovery error: ${error.message}`,
        metadata: {},
      });
    }

    await storage.updateRunStatus(runId, "failed");
  } finally {
    await crawler.close();
  }
}
