import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { FileParser } from "./file-parser";
import { semrushService } from "./semrush-service";
import { dataForSeoService } from "./dataforseo-service";
import { pageSpeedService } from "./pagespeed-service";
import { serpApiService } from "./serp-service";
import { ExcelExportService } from "./excel-export";
import { EmailTemplateService } from "./email-template";
import { semrushComprehensiveService } from "./semrush-comprehensive-service";
import { MockDataService } from "./mock-data-service";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get domains for a job
  app.get("/api/jobs/:id/domains", async (req, res) => {
    try {
      const domains = await storage.getDomainsByJobId(req.params.id);
      res.json(domains);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get comprehensive SEMrush data for a domain (async with progress)
  app.get("/api/domains/:id/comprehensive", async (req, res) => {
    try {
      const domain = await storage.getDomainById(req.params.id);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }

      // Set up SSE for progress updates
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      let comprehensiveData;
      let usedMockData = false;

      // Try SEMrush if configured
      if (semrushComprehensiveService.isConfigured()) {
        try {
          comprehensiveData = await semrushComprehensiveService.getComprehensiveDomainData(
            domain.webAddress,
            {
              database: "us",
              device: "desktop",
              onProgress: (progress, message) => {
                res.write(`data: ${JSON.stringify({ progress, message })}\n\n`);
              }
            }
          );
        } catch (semrushError: any) {
          console.log(`SEMrush comprehensive failed for ${domain.webAddress}, using mock data:`, semrushError.message);
          usedMockData = true;
          
          // Generate mock comprehensive data
          const basicData = domain.dataSource === 'mock' ? {
            organicTraffic: domain.organicTraffic || 0,
            keywordsTop100: domain.keywordsTop100 || 0,
            trafficValue: domain.trafficValue || 0,
            previousTraffic: Math.round((domain.organicTraffic || 0) / (1 + (domain.trafficTrend3mo || 0) / 100))
          } : undefined;
          
          comprehensiveData = MockDataService.generateComprehensiveData(domain.webAddress, basicData);
        }
      } else {
        // No SEMrush configured, use mock data
        usedMockData = true;
        const basicData = {
          organicTraffic: domain.organicTraffic || 0,
          keywordsTop100: domain.keywordsTop100 || 0,
          trafficValue: domain.trafficValue || 0,
          previousTraffic: Math.round((domain.organicTraffic || 0) / (1 + (domain.trafficTrend3mo || 0) / 100))
        };
        comprehensiveData = MockDataService.generateComprehensiveData(domain.webAddress, basicData);
      }

      // Send final data with mock flag
      res.write(`data: ${JSON.stringify({ 
        complete: true, 
        data: comprehensiveData,
        isMockData: usedMockData 
      })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Comprehensive data fetch error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // Upload file and start enrichment
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse file
      const parsedDomains = FileParser.parseFile(req.file.buffer, req.file.originalname);

      // Create job
      const job = await storage.createJob({
        filename: req.file.originalname,
        totalDomains: parsedDomains.length,
        processedDomains: 0,
        failedDomains: 0,
        status: "processing",
      });

      // Start background processing
      processDomainsInBackground(job.id, parsedDomains);

      res.json({
        jobId: job.id,
        totalDomains: parsedDomains.length,
        message: "Processing started",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get historical comparison data for selected domains
  app.post("/api/jobs/:id/comparison", async (req, res) => {
    try {
      const { domainIds } = req.body;
      
      if (!Array.isArray(domainIds) || domainIds.length === 0) {
        return res.status(400).json({ error: "Domain IDs are required" });
      }

      const domains = await storage.getDomainsByJobId(req.params.id);
      const selectedDomains = domains.filter(d => domainIds.includes(d.id));

      // Generate historical data points (mock for now, would fetch from SEMrush in production)
      const comparisonData = selectedDomains.map(domain => ({
        id: domain.id,
        companyName: domain.companyName,
        currentTraffic: domain.organicTraffic,
        currentKeywords: domain.keywordsTop100,
        trend: domain.trafficTrend3mo,
        // Calculate historical points based on trend
        historicalData: generateHistoricalPoints(domain),
      }));

      res.json(comparisonData);
    } catch (error: any) {
      console.error("Comparison data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Export enriched data
  app.get("/api/jobs/:id/export", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      const domains = await storage.getDomainsByJobId(req.params.id);
      const buffer = ExcelExportService.generateExport(domains, job.filename);

      const exportFilename = job.filename.replace(/\.[^/.]+$/, "") + "_enriched.xlsx";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${exportFilename}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate email template for a domain
  app.post("/api/domains/:id/generate-email", async (req, res) => {
    try {
      const domainId = req.params.id;
      const {
        ctaLink,
        senderName,
        senderCompany,
        competitorAvgKeywords,
        format = "html"
      } = req.body;

      // Fetch the domain from storage
      // First, get all jobs and find the domain
      const jobs = await storage.getAllJobs();
      let domain = null;
      
      for (const job of jobs) {
        const domains = await storage.getDomainsByJobId(job.id);
        const found = domains.find(d => d.id === domainId);
        if (found) {
          domain = found;
          break;
        }
      }

      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }

      const options = {
        ctaLink,
        senderName,
        senderCompany,
        competitorAvgKeywords,
      };

      if (format === "text") {
        const plainText = EmailTemplateService.generatePlainText(domain, options);
        res.json({ text: plainText });
      } else {
        const html = await EmailTemplateService.generateEmail(domain, options);
        res.json({ html });
      }
    } catch (error: any) {
      console.error("Email generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get trend data for a domain (for detail modal)
  app.get("/api/domains/:id/trends", async (req, res) => {
    try {
      const domainId = req.params.id;
      
      // Find the domain
      const jobs = await storage.getAllJobs();
      let domain = null;
      
      for (const job of jobs) {
        const domains = await storage.getDomainsByJobId(job.id);
        const found = domains.find(d => d.id === domainId);
        if (found) {
          domain = found;
          break;
        }
      }

      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }

      // Debug logging to check stored data
      console.log(`[DEBUG] Domain trend data request for: ${domain.companyName}`);
      console.log(`[DEBUG] Stored domain data:`, {
        keywords: domain.keywordsTop100,
        traffic: domain.organicTraffic,
        trafficValue: domain.trafficValue,
        trend: domain.trafficTrend3mo,
      });

      // Return actual stored data with minimal mock data for visualization
      const trendData = {
        // Use actual stored SEMrush data for metric cards
        metricCards: {
          keywords: {
            value: domain.keywordsTop100 || 0,
            change: domain.trafficTrend3mo || 0,
            sparkline: generateSparkline(domain.keywordsTop100 || 0, domain.trafficTrend3mo || 0),
          },
          traffic: {
            value: domain.organicTraffic || 0,
            change: domain.trafficTrend3mo || 0,
            sparkline: generateSparkline(domain.organicTraffic || 0, domain.trafficTrend3mo || 0),
          },
          trafficCost: {
            value: domain.trafficValue || 0,
            change: domain.trafficTrend3mo || 0,
            sparkline: generateSparkline(domain.trafficValue || 0, domain.trafficTrend3mo || 0),
          },
          brandedTraffic: {
            value: Math.round((domain.organicTraffic || 0) * 0.35), // Estimate 35% branded
            change: domain.trafficTrend3mo || 0,
            sparkline: generateSparkline(Math.round((domain.organicTraffic || 0) * 0.35), domain.trafficTrend3mo || 0),
          },
          nonBrandedTraffic: {
            value: Math.round((domain.organicTraffic || 0) * 0.65), // Estimate 65% non-branded
            change: domain.trafficTrend3mo || 0,
            sparkline: generateSparkline(Math.round((domain.organicTraffic || 0) * 0.65), domain.trafficTrend3mo || 0),
          },
        },
        // Generate minimal visualization data
        keywordTrend: generateKeywordTrend(domain.keywordsTop100 || 0, domain.trafficTrend3mo || 0),
        topKeywords: generateTopKeywords(domain.keywordsTop100 || 0, domain.organicTraffic || 0, domain.companyName),
        keywordsByIntent: generateKeywordsByIntent(domain.keywordsTop100 || 0, domain.organicTraffic || 0),
        positionChanges: generatePositionChanges(domain.keywordsTop100 || 0, domain.trafficTrend3mo || 0),
        topPages: generateTopPages(domain.webAddress, domain.organicTraffic || 0, domain.keywordsTop100 || 0),
        competitors: generateCompetitors(domain.webAddress, domain.keywordsTop100 || 0),
      };
      
      res.json(trendData);
    } catch (error: any) {
      console.error("Trend data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to generate historical data points
function generateHistoricalPoints(domain: any) {
  const currentTraffic = domain.organicTraffic || 0;
  const trend = domain.trafficTrend3mo || 0;
  
  const points = [];
  const months = ["3 months ago", "2 months ago", "1 month ago", "Current"];
  
  for (let i = 0; i < months.length; i++) {
    if (i === 3) {
      points.push({ month: months[i], traffic: currentTraffic });
    } else {
      const monthsBack = 3 - i;
      const trendFactor = 1 + (trend / 100) * (monthsBack / 3);
      const historicalValue = Math.round(currentTraffic / trendFactor);
      points.push({ month: months[i], traffic: historicalValue });
    }
  }
  
  return points;
}

// Helper function to calculate historical value from current value and trend
function calculateHistoricalPoint(currentValue: number, monthsAgo: number, trend3mo: number): number {
  if (!currentValue || currentValue === 0) return 0;
  
  // Clamp trend to avoid mathematical issues
  const safeTrend = Math.max(-98, Math.min(200, trend3mo));
  
  // Handle edge case where trend is effectively -100%
  if (safeTrend <= -99) {
    return currentValue; // Return flat historical values
  }
  
  const monthlyTrendRate = Math.pow(1 + (safeTrend / 100), 1/3);
  
  // Avoid division by zero
  if (monthlyTrendRate <= 0) {
    return currentValue;
  }
  
  const baseValue = currentValue / Math.pow(monthlyTrendRate, monthsAgo);
  const variance = (Math.random() - 0.5) * 0.1;
  return Math.max(0, Math.round(baseValue * (1 + variance))); // Ensure non-negative
}

// Helper function to distribute keywords across position groups
function distributeKeywords(totalKeywords: number) {
  return {
    top3: Math.round(totalKeywords * 0.10),
    range4_10: Math.round(totalKeywords * 0.15),
    range11_20: Math.round(totalKeywords * 0.20),
    range21_50: Math.round(totalKeywords * 0.30),
    range51_100: Math.round(totalKeywords * 0.25),
  };
}

// Helper function to generate sparkline data (last 30 days)
function generateSparkline(currentValue: number, trend: number): number[] {
  const sparkline = [];
  
  // Handle edge cases: zero value or -100% trend
  if (currentValue === 0 || trend <= -99) {
    // Return flat line at current value or zeros
    return Array(30).fill(Math.max(0, currentValue));
  }
  
  // Clamp trend to avoid mathematical issues
  const safeTrend = Math.max(-98, Math.min(200, trend)); // Clamp between -98% and +200%
  
  for (let i = 29; i >= 0; i--) {
    const monthlyRate = Math.pow(1 + (safeTrend / 100), 1/3);
    const dailyRate = Math.pow(monthlyRate, 1/30);
    
    // Avoid division by zero or negative values
    if (dailyRate <= 0) {
      sparkline.push(currentValue);
      continue;
    }
    
    const value = currentValue / Math.pow(dailyRate, i);
    const variance = (Math.random() - 0.5) * 0.05;
    const finalValue = Math.max(0, Math.round(value * (1 + variance))); // Ensure non-negative
    sparkline.push(finalValue);
  }
  
  return sparkline;
}

// Helper function to generate keyword trend data for chart
function generateKeywordTrend(currentKeywords: number, trend3mo: number) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const keywordTrend = [];
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
    
    const historicalKeywords = calculateHistoricalPoint(currentKeywords, i, trend3mo);
    const distribution = distributeKeywords(historicalKeywords);
    
    keywordTrend.push({
      month: monthLabel,
      top3: distribution.top3,
      range4_10: distribution.range4_10,
      range11_20: distribution.range11_20,
      range21_50: distribution.range21_50,
      range51_100: distribution.range51_100,
      total: historicalKeywords,
    });
  }
  
  return keywordTrend;
}

// Helper function to generate comprehensive trend data for domain detail modal (DEPRECATED - kept for compatibility)
function generateTrendData(domain: any) {
  const currentKeywords = domain.keywordsTop100 || 0;
  const currentTraffic = domain.organicTraffic || 0;
  const currentValue = domain.trafficValue || 0;
  const trend3mo = domain.trafficTrend3mo || 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  
  // Generate 24 months of keyword trend data to support 2Y range
  const keywordTrend = [];
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
    
    const historicalKeywords = calculateHistoricalPoint(currentKeywords, i, trend3mo);
    const distribution = distributeKeywords(historicalKeywords);
    
    keywordTrend.push({
      month: monthLabel,
      top3: distribution.top3,
      range4_10: distribution.range4_10,
      range11_20: distribution.range11_20,
      range21_50: distribution.range21_50,
      range51_100: distribution.range51_100,
      total: historicalKeywords,
    });
  }

  // Generate sparkline data (last 30 days with daily granularity)
  const generateSparkline = (currentValue: number, trend: number): number[] => {
    const sparkline = [];
    for (let i = 29; i >= 0; i--) {
      const daysAgo = i / 30;
      const monthlyRate = Math.pow(1 + (trend / 100), 1/3);
      const dailyRate = Math.pow(monthlyRate, 1/30);
      const value = currentValue / Math.pow(dailyRate, i);
      const variance = (Math.random() - 0.5) * 0.05;
      sparkline.push(Math.round(value * (1 + variance)));
    }
    return sparkline;
  };

  // Calculate branded vs non-branded traffic estimates
  const brandedTraffic = Math.round(currentTraffic * 0.35);
  const nonBrandedTraffic = Math.round(currentTraffic * 0.65);

  // Generate top keywords data
  const topKeywords = generateTopKeywords(currentKeywords, currentTraffic, domain.companyName);
  
  // Generate keywords by intent
  const keywordsByIntent = generateKeywordsByIntent(currentKeywords, currentTraffic);
  
  // Generate position changes
  const positionChanges = generatePositionChanges(currentKeywords, trend3mo);
  
  // Generate top pages
  const topPages = generateTopPages(domain.webAddress, currentTraffic, currentKeywords);
  
  // Generate competitors
  const competitors = generateCompetitors(domain.webAddress, currentKeywords);

  return {
    metricCards: {
      keywords: {
        value: currentKeywords,
        change: trend3mo,
        sparkline: generateSparkline(currentKeywords, trend3mo),
      },
      traffic: {
        value: currentTraffic,
        change: trend3mo,
        sparkline: generateSparkline(currentTraffic, trend3mo),
      },
      trafficCost: {
        value: currentValue,
        change: trend3mo,
        sparkline: generateSparkline(currentValue, trend3mo),
      },
      brandedTraffic: {
        value: brandedTraffic,
        change: trend3mo * 0.8,
        sparkline: generateSparkline(brandedTraffic, trend3mo * 0.8),
      },
      nonBrandedTraffic: {
        value: nonBrandedTraffic,
        change: trend3mo * 1.2,
        sparkline: generateSparkline(nonBrandedTraffic, trend3mo * 1.2),
      },
    },
    keywordTrend,
    topKeywords,
    keywordsByIntent,
    positionChanges,
    topPages,
    competitors,
  };
}

// Generate top keywords data
function generateTopKeywords(totalKeywords: number, totalTraffic: number, companyName: string): any[] {
  const keywords = [];
  const keywordTerms = [
    `${companyName.split(' ')[0].toLowerCase()} lawyer`,
    `${companyName.split(' ')[0].toLowerCase()} attorney`,
    `personal injury lawyer near me`,
    `car accident attorney`,
    `slip and fall lawyer`,
    `workers compensation attorney`,
    `medical malpractice lawyer`,
    `wrongful death attorney`,
    `employment law attorney`,
    `divorce lawyer near me`,
  ];
  
  const count = Math.min(10, totalKeywords);
  let remainingTraffic = totalTraffic;
  
  for (let i = 0; i < count; i++) {
    const position = i < 3 ? i + 1 : Math.floor(Math.random() * 20) + 4;
    const volume = Math.floor(Math.random() * 50000) + 1000;
    const trafficPct = i === 0 ? 25 : Math.floor(Math.random() * 15) + 5;
    const serpFeatures = Math.random() > 0.5 ? ['Local Pack', 'People Also Ask'] : ['People Also Ask'];
    
    keywords.push({
      keyword: keywordTerms[i] || `keyword ${i + 1}`,
      position,
      volume,
      trafficPercent: trafficPct,
      serpFeatures,
    });
    
    remainingTraffic -= (totalTraffic * trafficPct / 100);
  }
  
  return keywords;
}

// Generate keywords by intent
function generateKeywordsByIntent(totalKeywords: number, totalTraffic: number) {
  return [
    {
      intent: 'Informational',
      keywords: Math.round(totalKeywords * 0.35),
      traffic: Math.round(totalTraffic * 0.20),
    },
    {
      intent: 'Commercial',
      keywords: Math.round(totalKeywords * 0.30),
      traffic: Math.round(totalTraffic * 0.45),
    },
    {
      intent: 'Transactional',
      keywords: Math.round(totalKeywords * 0.20),
      traffic: Math.round(totalTraffic * 0.25),
    },
    {
      intent: 'Navigational',
      keywords: Math.round(totalKeywords * 0.15),
      traffic: Math.round(totalTraffic * 0.10),
    },
  ];
}

// Generate position changes
function generatePositionChanges(totalKeywords: number, trend: number) {
  const changeRate = Math.abs(trend) / 100;
  
  return {
    new: Math.round(totalKeywords * 0.10 * changeRate),
    lost: Math.round(totalKeywords * 0.08 * changeRate),
    improved: trend > 0 ? Math.round(totalKeywords * 0.15) : Math.round(totalKeywords * 0.08),
    declined: trend < 0 ? Math.round(totalKeywords * 0.15) : Math.round(totalKeywords * 0.08),
    keywords: [
      {
        keyword: 'personal injury attorney',
        previous: 12,
        current: 8,
        volume: 33100,
        trafficPercent: 12,
        type: 'improved',
      },
      {
        keyword: 'car accident lawyer',
        previous: 5,
        current: 15,
        volume: 22000,
        trafficPercent: 8,
        type: 'declined',
      },
      {
        keyword: 'wrongful death lawyer',
        previous: null,
        current: 7,
        volume: 18000,
        trafficPercent: 10,
        type: 'new',
      },
    ],
  };
}

// Generate top pages
function generateTopPages(domain: string, totalTraffic: number, totalKeywords: number) {
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/practice-areas/personal-injury', name: 'Personal Injury' },
    { path: '/practice-areas/car-accidents', name: 'Car Accidents' },
    { path: '/about', name: 'About Us' },
    { path: '/contact', name: 'Contact' },
  ];
  
  let remainingTraffic = 100;
  return pages.map((page, i) => {
    const trafficPct = i === 0 ? 35 : Math.floor(Math.random() * 20) + 10;
    remainingTraffic -= trafficPct;
    
    return {
      url: `${domain}${page.path}`,
      trafficPercent: Math.min(trafficPct, remainingTraffic + trafficPct),
      keywords: Math.floor(totalKeywords * (trafficPct / 100)),
    };
  });
}

// Generate competitors
function generateCompetitors(domain: string, totalKeywords: number) {
  const competitors = [
    'competitor1-law.com',
    'competitor2-attorneys.com',
    'competitor3-legal.com',
    'competitor4-law.com',
  ];
  
  return competitors.map(competitor => ({
    domain: competitor,
    commonKeywords: Math.floor(Math.random() * totalKeywords * 0.5) + Math.floor(totalKeywords * 0.1),
    competitionLevel: Math.floor(Math.random() * 30) + 40,
  }));
}

// Background processing function
async function processDomainsInBackground(
  jobId: string,
  parsedDomains: { companyName: string; webAddress: string; category: "MA" | "National" }[]
) {
  let processed = 0;
  let failed = 0;

  for (const parsedDomain of parsedDomains) {
    try {
      let overview = null;
      let historical = null;
      let dataSource: "semrush" | "dataforseo" | "mock" = "mock";
      let semrushError: string | undefined;
      let dataForSeoError: string | undefined;

      // Try SEMrush first
      try {
        overview = await semrushService.getDomainOverview(parsedDomain.webAddress);
        if (overview && (overview.organicTraffic !== null || overview.keywordsTop100 !== null)) {
          historical = await semrushService.getHistoricalData(parsedDomain.webAddress);
          dataSource = "semrush";
          console.log(`Successfully fetched data from SEMrush for ${parsedDomain.webAddress}`);
        }
      } catch (error: any) {
        semrushError = error.message;
        console.log(`SEMrush failed for ${parsedDomain.webAddress}: ${semrushError}`);
      }

      // If SEMrush failed, try DataForSEO as fallback
      if (dataSource === "mock" && dataForSeoService.isConfigured()) {
        console.log(`Trying DataForSEO as fallback for ${parsedDomain.webAddress}...`);
        try {
          const dataForSeoOverview = await dataForSeoService.getDomainOverview(parsedDomain.webAddress);
          if (dataForSeoOverview && (dataForSeoOverview.organicTraffic !== null || dataForSeoOverview.keywordsTop100 !== null)) {
            overview = dataForSeoOverview;
            dataSource = "dataforseo";
            historical = { previousTraffic: null };
            console.log(`Successfully fetched data from DataForSEO for ${parsedDomain.webAddress}`);
          }
        } catch (error: any) {
          dataForSeoError = error.message;
          console.log(`DataForSEO failed for ${parsedDomain.webAddress}: ${dataForSeoError}`);
        }
      }

      // If both APIs failed, use mock data as final fallback
      if (!overview || dataSource === "mock") {
        console.log(`Using mock data for ${parsedDomain.webAddress}`);
        const mockData = MockDataService.generateMockData(parsedDomain.webAddress);
        overview = {
          organicTraffic: mockData.organicTraffic,
          keywordsTop100: mockData.keywordsTop100,
          trafficValue: mockData.trafficValue,
        };
        historical = {
          previousTraffic: mockData.previousTraffic,
        };
        dataSource = "mock";
      }

      // Calculate trend
      const trend = semrushService.calculateTrend(
        overview.organicTraffic,
        historical?.previousTraffic || null
      );

      // Determine urgency flag
      const urgencyFlag = semrushService.getUrgencyFlag(trend);

      // Fetch PageSpeed Insights metrics
      console.log(`Fetching PageSpeed metrics for ${parsedDomain.webAddress}...`);
      const performanceMetrics = await pageSpeedService.getPerformanceMetrics(parsedDomain.webAddress);

      // Check AI Overview visibility
      let aiOverviewPresent: number | null = null;
      let aiOverviewMentioned: number | null = null;
      let aiOverviewVisibilityScore: number | null = null;

      if (serpApiService.isConfigured()) {
        try {
          console.log(`Checking AI Overview for ${parsedDomain.companyName}...`);
          const aiOverviewResult = await serpApiService.checkAIOverview(
            parsedDomain.companyName,
            parsedDomain.webAddress
          );

          if (aiOverviewResult) {
            aiOverviewPresent = aiOverviewResult.present ? 1 : 0;
            aiOverviewMentioned = aiOverviewResult.mentioned ? 1 : 0;
            aiOverviewVisibilityScore = aiOverviewResult.score;
          }
        } catch (aiError: any) {
          console.error(`AI Overview check failed for ${parsedDomain.webAddress}:`, aiError.message);
          // Continue processing even if AI Overview check fails
        }
      } else {
        console.log("SerpApi not configured - skipping AI Overview checks");
      }

      // Calculate priority score based on all collected metrics
      const priorityScore = semrushService.calculatePriorityScore({
        trafficTrend3mo: trend,
        organicTraffic: overview.organicTraffic,
        keywordsTop100: overview.keywordsTop100,
        performanceScore: performanceMetrics.performanceScore,
        aiOverviewVisibilityScore,
      });

      // Create domain record with all metrics
      await storage.createDomain({
        jobId,
        companyName: parsedDomain.companyName,
        webAddress: parsedDomain.webAddress,
        category: parsedDomain.category,
        organicTraffic: overview.organicTraffic,
        keywordsTop100: overview.keywordsTop100,
        trafficValue: overview.trafficValue,
        trafficTrend3mo: trend,
        pagesIndexed: null, // Not available in basic SEMrush API
        performanceScore: performanceMetrics.performanceScore,
        mobileScore: performanceMetrics.mobileScore,
        desktopScore: performanceMetrics.desktopScore,
        fcp: performanceMetrics.fcp,
        lcp: performanceMetrics.lcp,
        fid: performanceMetrics.fid,
        cls: performanceMetrics.cls,
        lastPerformanceCheck: performanceMetrics.performanceScore !== null ? new Date() : null,
        aiOverviewPresent,
        aiOverviewMentioned,
        aiOverviewVisibilityScore,
        dataSource,
        urgencyFlag,
        priorityScore,
        error: null,
      });

      processed++;

      // Rate limiting: wait 500ms between requests to respect both SEMrush and PageSpeed limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`Failed to process ${parsedDomain.webAddress}:`, error.message);

      // Log failed domain
      await storage.createFailedDomain({
        jobId,
        domain: parsedDomain.webAddress,
        error: error.message,
      });

      failed++;
    }

    // Update job progress
    await storage.updateJob(jobId, {
      processedDomains: processed,
      failedDomains: failed,
    });
  }

  // Mark job as completed
  await storage.updateJob(jobId, {
    status: "completed",
    completedAt: new Date(),
  });

  console.log(`Job ${jobId} completed: ${processed} processed, ${failed} failed`);
}
