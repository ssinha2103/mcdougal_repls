import puppeteer, { Browser, Page } from "puppeteer";
import { ObjectStorageService } from "./objectStorage";
import type { SectionType } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import { crawlEventBroadcaster } from "./websocket";

export interface CrawlerConfig {
  database: string;
  maxRequestsPerHour: number;
  enableAI: boolean;
  userAgent?: string;
  developmentMode?: boolean;
  selectorDiscoveryMode?: boolean;
}

export interface SectionData {
  sectionType: SectionType;
  screenshotPath: string | null;
  extractedData: any;
  extractionMethod: "dom" | "ai_vision" | "hybrid" | "pending";
  notes?: string;
}

export interface CrawlResult {
  success: boolean;
  sections: SectionData[];
  error?: string;
}

/**
 * SEMrush crawler with Puppeteer
 * 
 * BROWSER CONFIGURATION:
 * This crawler uses Chromium installed via Nix system dependencies.
 * The browser path is automatically detected using 'which chromium'.
 * 
 * DEVELOPMENT MODE:
 * When developmentMode: true, the crawler returns mock data instead of launching
 * a real browser. This is useful for testing the application flow without making
 * actual SEMrush requests.
 * 
 * PRODUCTION MODE:
 * Set developmentMode: false to enable real browser automation and SEMrush crawling.
 * Requires Chromium to be installed (already configured via Nix in this Replit).
 * 
 * SELECTOR DISCOVERY MODE:
 * To find the correct SEMrush selectors:
 * 1. Set selectorDiscoveryMode: true in config
 * 2. Crawl a single domain
 * 3. Inspect the generated semrush-dom-structure-{timestamp}.json file
 * 4. Update sectionConfigs with the discovered selectors
 * 
 * Discovery mode works in both development and production modes.
 * When enabled, it will dump the entire DOM structure to help identify
 * the correct selectors for each section on the SEMrush analytics page.
 */
export class SEMrushCrawler {
  private browser: Browser | null = null;
  private config: CrawlerConfig;
  private objectStorage: ObjectStorageService;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private isLoggedIn: boolean = false;
  private readonly MAX_RETRIES = 2;

  constructor(config: CrawlerConfig) {
    this.config = config;
    this.objectStorage = new ObjectStorageService();
  }

  async initialize(): Promise<void> {
    if (this.config.developmentMode) {
      console.log("[CRAWLER] Running in development mode - browser automation disabled");
      console.log("[CRAWLER] MOCKED LOGIN: Skipping actual SEMrush authentication in development mode");
      this.isLoggedIn = true; // Mock login state in dev mode
      return;
    }

    try {
      // Detect browser executable path based on environment
      let chromiumPath: string | undefined;
      
      // 1. Check for explicit Puppeteer executable path (Docker environment)
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log(`[CRAWLER] Using PUPPETEER_EXECUTABLE_PATH: ${chromiumPath}`);
      } 
      // 2. Try to find Chrome/Chromium in common Docker locations
      else if (fs.existsSync("/usr/bin/google-chrome-stable")) {
        chromiumPath = "/usr/bin/google-chrome-stable";
        console.log(`[CRAWLER] Found Chrome at: ${chromiumPath}`);
      } 
      else if (fs.existsSync("/usr/bin/chromium")) {
        chromiumPath = "/usr/bin/chromium";
        console.log(`[CRAWLER] Found Chromium at: ${chromiumPath}`);
      }
      // 3. Try Nix Chromium (Replit environment)
      else {
        try {
          chromiumPath = execSync("which chromium", { encoding: "utf-8" }).trim();
          console.log(`[CRAWLER] Found Chromium via 'which': ${chromiumPath}`);
        } catch (e) {
          console.log("[CRAWLER] No system Chrome/Chromium found, using Puppeteer's bundled version");
        }
      }

      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: chromiumPath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
      });
      console.log("[CRAWLER] Browser initialized successfully");

      // Attempt to login to SEMrush - this will throw if login fails
      try {
        await this.loginToSemrush();
      } catch (loginError) {
        // Clean up browser on login failure
        await this.close();
        throw loginError; // Re-throw to abort initialization
      }
    } catch (error) {
      console.error("[CRAWLER] Failed to initialize browser:", error);
      throw new Error("Failed to initialize browser. Run in developmentMode for testing without Chrome.");
    }
  }

  /**
   * Login to SEMrush using credentials from environment variables
   * 
   * AUTHENTICATION REQUIREMENTS:
   * - SEMrush credentials are MANDATORY for crawling
   * - This method will throw an error if credentials are missing or login fails
   * - 2FA is NOT supported - will throw error if detected
   * 
   * LIMITATIONS:
   * - Two-Factor Authentication (2FA) is not supported
   * - If your account has 2FA enabled, you must either:
   *   1. Disable 2FA on your SEMrush account, or
   *   2. Use session cookies (not currently implemented)
   * 
   * @throws Error if credentials are missing
   * @throws Error if login fails (wrong credentials, blocked)
   * @throws Error if 2FA is detected
   * @throws Error if authentication cannot be verified
   */
  private async loginToSemrush(): Promise<void> {
    const email = process.env.SEMRUSH_EMAIL;
    const password = process.env.SEMRUSH_PASSWORD;

    // CRITICAL: Credentials are mandatory - throw error if missing
    if (!email || !password) {
      throw new Error(
        "SEMrush credentials not found. Set SEMRUSH_EMAIL and SEMRUSH_PASSWORD environment variables."
      );
    }

    if (!this.browser) {
      throw new Error("Browser not initialized, cannot login");
    }

    console.log("[CRAWLER] Attempting to login to SEMrush...");
    const page = await this.browser.newPage();

    try {
      // Navigate to login page
      await page.goto("https://www.semrush.com/login/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      console.log("[CRAWLER] Login page loaded");

      // Wait for email input field
      await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });

      // Fill in email
      await page.type('input[name="email"], input[type="email"]', email);
      console.log("[CRAWLER] Email entered");

      // Fill in password
      await page.type('input[name="password"], input[type="password"]', password);
      console.log("[CRAWLER] Password entered");

      // Click login button
      await page.click('button[type="submit"], button.srf-button--primary, .login-form button');
      console.log("[CRAWLER] Login button clicked");

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

      console.log("[CRAWLER] Navigation completed after login attempt");

      // Check if we're still on login page (login failed)
      const onLoginPage = await page.$('form[action*="login"], input[name="email"], input[type="email"]') !== null;
      
      if (onLoginPage) {
        throw new Error(
          "Login failed - incorrect credentials or SEMrush blocked the login. Please verify your SEMRUSH_EMAIL and SEMRUSH_PASSWORD."
        );
      }

      // Check for 2FA challenge page
      const on2FAPage = await page.$('[data-test="2fa-code"], input[name="code"], .two-factor, .twofa') !== null;
      
      if (on2FAPage) {
        throw new Error(
          "2FA authentication required - manual authentication required. Please disable 2FA on your SEMrush account or use session cookies."
        );
      }

      // Verify we're on authenticated page by looking for user profile indicators
      const isDashboard = 
        (await page.$('[data-test="user-profile"]')) !== null || 
        (await page.$('[data-test="user-menu"]')) !== null ||
        (await page.$('.user-profile')) !== null ||
        (await page.$('.user-menu')) !== null ||
        (await page.$('.account-menu')) !== null;
      
      if (!isDashboard) {
        // Additional check: see if we're on a page that requires login
        const hasLoginRedirect = await page.$('a[href*="login"]') !== null;
        
        if (hasLoginRedirect) {
          throw new Error(
            "Login verification failed - could not confirm authentication. You may have been redirected."
          );
        }
        
        // If we can't find dashboard elements but also no login indicators,
        // log a warning but proceed (SEMrush UI may have changed)
        console.warn("[CRAWLER] Could not find expected dashboard elements, but no login page detected either");
        console.warn("[CRAWLER] Proceeding with caution - SEMrush UI may have changed");
      }

      // Only set isLoggedIn to true after all checks pass
      this.isLoggedIn = true;
      console.log("[CRAWLER] ✓ Successfully authenticated with SEMrush");
    } catch (error: any) {
      // If it's already our custom error, re-throw it
      if (error.message.includes("credentials not found") ||
          error.message.includes("Login failed") ||
          error.message.includes("2FA") ||
          error.message.includes("verification failed")) {
        throw error;
      }
      
      // Otherwise, wrap it in a more informative error
      throw new Error(`SEMrush login error: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log("[CRAWLER] Browser closed");
    }
  }

  /**
   * Rate limiting with random jitter
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const baseInterval = (3600 * 1000) / this.config.maxRequestsPerHour;
    
    // Add ±20% random jitter to appear more human
    const jitter = baseInterval * 0.2 * (Math.random() * 2 - 1);
    const minInterval = baseInterval + jitter;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      console.log(`[CRAWLER] Throttling: waiting ${Math.round(waitTime)}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Crawl a single domain
   * 
   * AUTHENTICATION REQUIRED:
   * - This method requires successful authentication with SEMrush
   * - Will throw error if not authenticated
   * - Will throw error if redirected to login page during crawl
   */
  async crawlDomain(domain: string, runId: string): Promise<CrawlResult> {
    if (this.config.developmentMode) {
      return this.mockCrawlDomain(domain, runId);
    }

    // CRITICAL: Verify authentication before proceeding
    if (!this.isLoggedIn) {
      throw new Error(
        "Not authenticated with SEMrush. Cannot crawl domain without valid authentication."
      );
    }

    if (!this.browser) {
      throw new Error("Crawler not initialized");
    }

    const page = await this.browser.newPage();

    try {
      await this.throttle();

      // Set viewport to 1920x1080 for consistent screenshots
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });

      // Set user agent
      await page.setUserAgent(
        this.config.userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Navigate to SEMrush organic overview (updated URL format)
      const url = `https://www.semrush.com/analytics/organic/overview/?db=${this.config.database}&searchType=domain&domain=${domain}`;
      
      console.log(`[CRAWLER] Navigating to: ${url}`);

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // CRITICAL: Verify we're on the SEMrush analytics page, not redirected to login
      console.log("[CRAWLER] Verifying page is authenticated (not redirected to login)...");
      
      const hasLoginForm = await page.$('form[action*="login"], input[name="email"][type="email"]') !== null;
      
      if (hasLoginForm) {
        throw new Error(
          "Authentication failed - redirected to login page. Your session may have expired."
        );
      }

      // Check for analytics page indicators
      const isAnalyticsPage = 
        (await page.$('.organic-overview')) !== null ||
        (await page.$('[data-test="overview-header"]')) !== null ||
        (await page.$('.overview-header')) !== null ||
        (await page.title()).includes('Overview') ||
        (await page.title()).includes('SEMrush');

      if (!isAnalyticsPage) {
        console.warn("[CRAWLER] Could not verify analytics page elements - SEMrush UI may have changed");
      } else {
        console.log("[CRAWLER] ✓ Confirmed on SEMrush analytics page");
      }

      // Wait for page to stabilize and key elements to render
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Capture sections with retry logic
      const sections = await this.captureSections(page, domain, runId);

      await page.close();

      // Determine if crawl was successful
      let success = false;

      // Special handling for discovery mode
      if (this.config.selectorDiscoveryMode) {
        // Discovery runs are successful if they captured the discovery data
        const hasDiscoveryData = sections.some(s => 
          s.sectionType === "discovery" && s.extractedData && 
          Object.keys(s.extractedData).length > 0
        );
        
        if (hasDiscoveryData) {
          success = true;
          console.log(`[CRAWLER] ✓ Discovery mode completed successfully for ${domain}`);
        } else {
          console.error(`[CRAWLER] Discovery mode failed - no discovery data captured for ${domain}`);
        }
      } else {
        // Normal crawl mode: Consider it successful if we got at least some critical sections
        const criticalSections = ["header_kpis", "organic_trend", "top_keywords"];
        const capturedCritical = sections.filter(s => 
          criticalSections.includes(s.sectionType) && s.screenshotPath
        );

        success = capturedCritical.length > 0;
        console.log(`[CRAWLER] Crawl completed for ${domain}: ${sections.length} sections captured, ${capturedCritical.length} critical`);
      }

      return {
        success,
        sections,
      };
    } catch (error: any) {
      await page.close().catch(() => {});
      console.error(`[CRAWLER] Failed to crawl ${domain}:`, error);
      
      // Re-throw authentication errors to ensure they're not silently caught
      if (error.message.includes("Not authenticated") || 
          error.message.includes("Authentication failed")) {
        throw error;
      }
      
      return {
        success: false,
        sections: [],
        error: error.message,
      };
    }
  }

  /**
   * Mock crawl for development mode
   */
  private async mockCrawlDomain(domain: string, runId: string): Promise<CrawlResult> {
    console.log(`[CRAWLER] Mock crawling ${domain} (development mode)`);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const mockSections: SectionData[] = [
      {
        sectionType: "header_kpis",
        screenshotPath: `mock/screenshots/${runId}/${domain}/header_kpis.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "organic_trend",
        screenshotPath: `mock/screenshots/${runId}/${domain}/organic_trend.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "top_keywords",
        screenshotPath: `mock/screenshots/${runId}/${domain}/top_keywords.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "intent_distribution",
        screenshotPath: `mock/screenshots/${runId}/${domain}/intent_distribution.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "position_changes",
        screenshotPath: `mock/screenshots/${runId}/${domain}/position_changes.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "competitive_map",
        screenshotPath: `mock/screenshots/${runId}/${domain}/competitive_map.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
      {
        sectionType: "organic_pages",
        screenshotPath: `mock/screenshots/${runId}/${domain}/organic_pages.png`,
        extractedData: {},
        extractionMethod: "pending",
        notes: "Mock data - development mode",
      },
    ];

    return {
      success: true,
      sections: mockSections,
    };
  }

  /**
   * Discover DOM selectors by analyzing page structure
   * 
   * This method analyzes the SEMrush page and returns a focused data structure
   * containing only likely section elements to help identify correct selectors.
   * 
   * @returns Discovery data structure with filtered elements and confidence scores
   */
  private async discoverSelectors(
    page: Page,
    domain: string,
    runId: string
  ): Promise<any> {
    console.log("[CRAWLER] Starting selector discovery mode...");

    try {
      // Take full page screenshot for reference
      const tempDir = os.tmpdir();
      const screenshotFileName = `semrush-fullpage-${domain.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
      const screenshotPath = path.join(tempDir, screenshotFileName);
      
      await page.screenshot({ 
        path: screenshotPath as `${string}.png`,
        fullPage: true,
      });
      
      console.log(`[CRAWLER] Full page screenshot saved to: ${screenshotPath}`);

      // Evaluate page to extract DOM structure - FOCUSED ON LIKELY SELECTORS
      // Using simpler approach to avoid any compilation issues
      const likelyElements = await page.evaluate(() => {
        'use strict';
        const elements = [];
        
        // Helper to check if element has a chart
        function hasChart(el) {
          return !!(
            el.querySelector('svg') || 
            el.querySelector('canvas') ||
            el.querySelector('[class*="chart"]') ||
            el.querySelector('[class*="graph"]')
          );
        }

        // Helper to check if element has a table
        function hasTable(el) {
          return !!(
            el.querySelector('table') ||
            el.querySelector('[role="table"]') ||
            el.querySelector('[class*="table"]') ||
            el.querySelector('[class*="grid"]')
          );
        }

        // Helper to check if element has headings
        function hasHeadings(el) {
          return !!(
            el.querySelector('h1') ||
            el.querySelector('h2') ||
            el.querySelector('h3') ||
            el.querySelector('h4') ||
            el.querySelector('h5') ||
            el.querySelector('h6')
          );
        }

        // Helper to get meaningful text preview
        function getTextPreview(el) {
          const text = el.textContent?.trim() || '';
          // Get first line or first 80 chars
          const firstLine = text.split('\n')[0].trim();
          return firstLine.substring(0, 80);
        }

        // Helper to build CSS selector
        function buildSelector(el) {
          if (el.id) {
            return `#${el.id}`;
          }
          
          let selector = el.tagName.toLowerCase();
          
          if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ').filter(c => c.trim());
            if (classes.length > 0 && classes.length <= 4) {
              // Only use first 4 classes to keep selector manageable
              selector += '.' + classes.slice(0, 4).join('.');
            }
          }
          
          return selector;
        }

        // Calculate confidence score for an element
        function calculateConfidence(el, info) {
          let score = 0;
          
          // High value indicators
          if (el.id) score += 3;
          if (info.dataTest) score += 3;
          if (info.hasChart) score += 2;
          if (info.hasTable) score += 2;
          if (info.hasHeadings) score += 1;
          if (info.childrenCount >= 3) score += 1;
          
          // Class name hints
          const classStr = (el.className || '').toLowerCase();
          if (classStr.includes('overview') || classStr.includes('header')) score += 2;
          if (classStr.includes('kpi') || classStr.includes('metric')) score += 2;
          if (classStr.includes('trend') || classStr.includes('chart')) score += 2;
          if (classStr.includes('keyword') || classStr.includes('table')) score += 1;
          if (classStr.includes('position') || classStr.includes('rank')) score += 1;
          
          if (score >= 5) return 'high';
          if (score >= 3) return 'medium';
          return 'low';
        }

        // Filter to only likely section elements
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach((el) => {
          // Skip script, style, meta, etc.
          if (['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT', 'BR', 'HR'].includes(el.tagName)) {
            return;
          }

          const hasId = !!el.id;
          const hasDataTest = el.hasAttribute('data-test') || el.hasAttribute('data-testid');
          const hasDataAttributes = Array.from(el.attributes).some(attr => attr.name.startsWith('data-'));
          const isStructuralElement = ['SECTION', 'ARTICLE', 'DIV', 'MAIN', 'HEADER', 'NAV', 'ASIDE'].includes(el.tagName);
          const childCount = el.children.length;
          
          // FILTERING CRITERIA: Only capture likely section elements
          const isLikelySelector = 
            hasId ||
            hasDataTest ||
            (isStructuralElement && childCount >= 2) ||
            hasChart(el) ||
            hasTable(el);
          
          if (!isLikelySelector) {
            return;
          }

          const elementInfo = {
            selector: buildSelector(el),
            type: hasId ? 'id' : (hasDataTest ? 'data-test' : 'class'),
            tagName: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: (el.className && typeof el.className === 'string') 
              ? el.className.split(' ').filter(c => c.trim()).slice(0, 10)
              : [],
            dataTest: el.getAttribute('data-test') || el.getAttribute('data-testid') || null,
            hasChart: hasChart(el),
            hasTable: hasTable(el),
            hasHeadings: hasHeadings(el),
            childrenCount: childCount,
            textPreview: getTextPreview(el),
          };

          // Collect data-* attributes
          const dataAttrs = {};
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              dataAttrs[attr.name] = attr.value;
            }
          });
          if (Object.keys(dataAttrs).length > 0) {
            elementInfo.dataAttributes = dataAttrs;
          }

          // Add role if present
          const role = el.getAttribute('role');
          if (role) {
            elementInfo.role = role;
          }

          // Calculate confidence
          elementInfo.confidence = calculateConfidence(el, elementInfo);

          elements.push(elementInfo);
        });

        return elements;
      });

      // Sort by confidence (high -> medium -> low) and limit to top 200
      const sortedElements = likelyElements.sort((a: any, b: any) => {
        const confOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const scoreA = confOrder[a.confidence] || 0;
        const scoreB = confOrder[b.confidence] || 0;
        
        if (scoreA !== scoreB) return scoreB - scoreA;
        
        // Secondary sort: prefer elements with IDs
        if (a.id && !b.id) return -1;
        if (!a.id && b.id) return 1;
        
        // Tertiary sort: prefer elements with data-test
        if (a.dataTest && !b.dataTest) return -1;
        if (!a.dataTest && b.dataTest) return 1;
        
        return 0;
      });

      const limitedElements = sortedElements.slice(0, 200);

      // Build focused output structure
      const discoveryData = {
        url: page.url(),
        timestamp: new Date().toISOString(),
        title: await page.title(),
        domain,
        summary: {
          totalElements: limitedElements.length,
          elementsWithIds: limitedElements.filter((e: any) => e.id).length,
          elementsWithDataTest: limitedElements.filter((e: any) => e.dataTest).length,
          charts: limitedElements.filter((e: any) => e.hasChart).length,
          tables: limitedElements.filter((e: any) => e.hasTable).length,
          highConfidence: limitedElements.filter((e: any) => e.confidence === 'high').length,
          mediumConfidence: limitedElements.filter((e: any) => e.confidence === 'medium').length,
          lowConfidence: limitedElements.filter((e: any) => e.confidence === 'low').length,
        },
        likelySelectors: limitedElements,
        hints: [
          "Focus on elements with confidence='high' first",
          "Elements with IDs are most stable for selection",
          "Elements with data-test attributes are purpose-built for testing/automation",
          "Elements with hasChart=true contain visualizations",
          "Elements with hasTable=true contain data tables",
          "Look for class names containing 'overview', 'header', 'kpi', 'metric', 'trend', 'keyword'",
        ],
      };

      // Save to JSON file for debugging (optional)
      const jsonFileName = `semrush-discovery-${domain.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
      const jsonPath = path.join(tempDir, jsonFileName);
      
      try {
        fs.writeFileSync(jsonPath, JSON.stringify(discoveryData, null, 2), 'utf-8');
        console.log(`[CRAWLER] ✓ Discovery data saved to: ${jsonPath} (for debugging)`);
      } catch (fileError) {
        console.warn(`[CRAWLER] Could not save debug file: ${fileError}`);
      }
      
      console.log(`[CRAWLER] ✓ Filtered to ${discoveryData.summary.totalElements} likely selectors`);
      console.log(`[CRAWLER] ✓ High confidence: ${discoveryData.summary.highConfidence}`);
      console.log(`[CRAWLER] ✓ Medium confidence: ${discoveryData.summary.mediumConfidence}`);
      console.log(`[CRAWLER] ✓ Low confidence: ${discoveryData.summary.lowConfidence}`);
      console.log(`[CRAWLER] ✓ Elements with IDs: ${discoveryData.summary.elementsWithIds}`);
      console.log(`[CRAWLER] ✓ Elements with data-test: ${discoveryData.summary.elementsWithDataTest}`);
      console.log(`[CRAWLER] ✓ Charts: ${discoveryData.summary.charts}, Tables: ${discoveryData.summary.tables}`);
      
      return discoveryData;
    } catch (error) {
      console.error("[CRAWLER] Failed to discover selectors:", error);
      throw error;
    }
  }

  /**
   * Capture all SEMrush sections
   */
  private async captureSections(
    page: Page,
    domain: string,
    runId: string
  ): Promise<SectionData[]> {
    // SELECTOR DISCOVERY MODE: Skip normal section capture entirely
    if (this.config.selectorDiscoveryMode) {
      console.log("[CRAWLER] ═══════════════════════════════════════════════════════");
      console.log("[CRAWLER] SELECTOR DISCOVERY MODE ACTIVE");
      console.log("[CRAWLER] Skipping normal section capture - analyzing DOM instead");
      console.log("[CRAWLER] ═══════════════════════════════════════════════════════");
      
      try {
        const discoveryData = await this.discoverSelectors(page, domain, runId);
        
        console.log(`[CRAWLER] Discovery completed - returning ${discoveryData.summary.totalElements} likely selectors`);
        
        // Return discovery data wrapped in a special section format
        return [{
          sectionType: "discovery",
          screenshotPath: null,
          extractedData: discoveryData,
          extractionMethod: "dom",
          notes: "Selector discovery mode - DOM structure analysis complete"
        }];
      } catch (discoveryError) {
        console.error("[CRAWLER] Failed to run selector discovery:", discoveryError);
        throw discoveryError;
      }
    }

    const sections: SectionData[] = [];

    // Define section selectors based on SEMrush structure
    // NOTE: These selectors may need adjustment based on actual SEMrush UI
    // Updated selectors that are more likely to work with SEMrush's actual UI
    // These are based on common patterns used by analytics platforms
    const sectionConfigs: Array<{
      type: SectionType;
      selector: string;
      extractPrompt: string;
      critical: boolean;
    }> = [
      {
        type: "header_kpis",
        selector: '[class*="overview__header"], [class*="kpi"], [class*="metrics"], [class*="summary"], .sc-overview-header, [id*="overview-header"], [data-ui-name*="overview"]',
        extractPrompt: "Extract the header KPIs: Keywords count, Traffic, Traffic Cost, Branded/Non-Branded Traffic",
        critical: true,
      },
      {
        type: "organic_trend",
        selector: '[class*="trend-chart"], [class*="positions-chart"], [class*="keywords-chart"], [id*="trend"], svg[class*="chart"], canvas[class*="chart"], [data-ui-name*="trend"]',
        extractPrompt: "Extract the organic keywords trend data including Top 3, 4-10, 11-20, 21-50, 51-100 distribution over time",
        critical: true,
      },
      {
        type: "top_keywords",
        selector: '[class*="keywords-table"], [class*="top-keywords"], table[class*="keyword"], [data-ui-name*="keywords"], [id*="keywords-table"], .sc-keywords-table',
        extractPrompt: "Extract the top keywords table with columns: keyword, position, volume, traffic %, KD",
        critical: true,
      },
      {
        type: "intent_distribution",
        selector: '[class*="intent"], [class*="distribution"], [data-ui-name*="intent"], [id*="intent-dist"], .sc-intent-chart',
        extractPrompt: "Extract intent distribution: informational, navigational, commercial, transactional percentages",
        critical: false,
      },
      {
        type: "search_positions",
        selector: '[class*="positions-table"], [class*="serp"], table[class*="position"], [data-ui-name*="positions"], .sc-positions-table',
        extractPrompt: "Extract search positions table: keyword, intent, position, SERP features, traffic, volume, KD, URL",
        critical: false,
      },
      {
        type: "position_changes",
        selector: '[class*="position-changes"], [class*="changes-chart"], [data-ui-name*="changes"], [id*="position-changes"], .sc-changes-chart',
        extractPrompt: "Extract position changes: Improved, Declined, New, Lost counts",
        critical: false,
      },
      {
        type: "page_changes",
        selector: '[class*="page-changes"], [class*="pages-table"], table[class*="pages"], [data-ui-name*="pages"], .sc-pages-table',
        extractPrompt: "Extract top page changes: URL, traffic, traffic diff",
        critical: false,
      },
      {
        type: "competitive_map",
        selector: '[class*="competitive"], [class*="competitors"], [data-ui-name*="competitive"], [id*="competitors"], .sc-competitive-map',
        extractPrompt: "Extract competitive positioning and organic competitors table",
        critical: false,
      },
      {
        type: "organic_pages",
        selector: '[class*="organic-pages"], [class*="landing-pages"], table[class*="pages"], [data-ui-name*="organic-pages"], .sc-organic-pages',
        extractPrompt: "Extract organic pages: URL, traffic, traffic %, keywords count",
        critical: false,
      },
    ];

    // First, take a full page screenshot as a fallback
    try {
      console.log("[CRAWLER] Taking full page screenshot as backup...");
      
      // Scroll to bottom to load all content
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take full page screenshot to temp file
      const tempDir = os.tmpdir();
      const fileName = `${domain.replace(/[^a-z0-9]/gi, '-')}-full_page-${Date.now()}.png`;
      const screenshotPath = path.join(tempDir, fileName);
      
      await page.screenshot({
        path: screenshotPath as `${string}.png`,
        fullPage: true,
        type: "png",
      });
      
      console.log("[CRAWLER] Full page screenshot saved to temp file");
      
      // Upload to object storage
      const storagePath = await this.objectStorage.uploadScreenshot(
        screenshotPath,
        domain,
        runId,
        "full_page" as SectionType
      );
      
      // Add as a full_page section
      sections.push({
        sectionType: "full_page" as SectionType,
        screenshotPath: storagePath,
        extractedData: { note: "Full page screenshot for AI analysis" },
        error: null,
      });
      
      console.log("[CRAWLER] Full page screenshot captured successfully");
    } catch (error) {
      console.log("[CRAWLER] Failed to capture full page screenshot:", error);
    }

    for (const config of sectionConfigs) {
      try {
        // Broadcast that we're starting to capture this section
        crawlEventBroadcaster.broadcastSectionProgress(
          runId,
          domain,
          config.type,
          config.type,
          "capturing"
        );

        const sectionData = await this.captureSectionWithRetry(
          page,
          domain,
          runId,
          config.type,
          config.selector,
          config.extractPrompt,
          config.critical
        );
        
        if (sectionData) {
          sections.push(sectionData);
          // Broadcast success
          crawlEventBroadcaster.broadcastSectionProgress(
            runId,
            domain,
            config.type,
            config.type,
            "captured"
          );
        } else {
          // Broadcast failure if no data returned
          crawlEventBroadcaster.broadcastSectionProgress(
            runId,
            domain,
            config.type,
            config.type,
            "failed"
          );
        }
      } catch (error) {
        console.error(`[CRAWLER] Failed to capture ${config.type}:`, error);
        
        // Broadcast failure
        crawlEventBroadcaster.broadcastSectionProgress(
          runId,
          domain,
            config.type,
            config.type,
          "failed"
        );
        
        // Continue with other sections
        sections.push({
          sectionType: config.type,
          screenshotPath: null,
          extractedData: {},
          extractionMethod: "pending",
          notes: `Failed to capture: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return sections;
  }

  /**
   * Capture a single section with retry logic
   */
  private async captureSectionWithRetry(
    page: Page,
    domain: string,
    runId: string,
    sectionType: SectionType,
    selector: string,
    extractPrompt: string,
    critical: boolean
  ): Promise<SectionData | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[CRAWLER] Retry ${attempt}/${this.MAX_RETRIES} for ${sectionType}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retry
        }

        const sectionData = await this.captureSection(
          page,
          domain,
          runId,
          sectionType,
          selector,
          extractPrompt
        );

        if (sectionData) {
          return sectionData;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[CRAWLER] Attempt ${attempt + 1} failed for ${sectionType}:`, error);
      }
    }

    // All retries failed
    if (critical) {
      console.error(`[CRAWLER] Critical section ${sectionType} failed after ${this.MAX_RETRIES} retries`);
    }

    return null;
  }

  /**
   * Capture a single section
   */
  private async captureSection(
    page: Page,
    domain: string,
    runId: string,
    sectionType: SectionType,
    selector: string,
    extractPrompt: string
  ): Promise<SectionData | null> {
    try {
      // Try multiple selector strategies
      const selectors = selector.split(',').map(s => s.trim());
      let element = null;

      for (const sel of selectors) {
        try {
          element = await page.$(sel);
          if (element) {
            console.log(`[CRAWLER] Found ${sectionType} with selector: ${sel}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!element) {
        console.log(`[CRAWLER] Section ${sectionType} not found with any selector: ${selector}`);
        return {
          sectionType,
          screenshotPath: null,
          extractedData: {},
          extractionMethod: "pending",
          notes: `Element not found on page`,
        };
      }

      // Scroll element into view and ensure it's visible
      try {
        await page.evaluate((el) => {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, element);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if element is visible
        const isVisible = await page.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && 
                 rect.height > 0 && 
                 style.visibility !== 'hidden' && 
                 style.display !== 'none' &&
                 style.opacity !== '0';
        }, element);
        
        if (!isVisible) {
          console.log(`[CRAWLER] Element for ${sectionType} is not visible, trying to expand...`);
          
          // Try clicking parent elements to expand collapsed sections
          await page.evaluate((el) => {
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
              // Look for expandable elements
              const clickables = parent.querySelectorAll('button, a, [role="button"], .expand, .toggle, .collapse');
              clickables.forEach(clickable => {
                if (clickable.textContent?.toLowerCase().includes('show') || 
                    clickable.textContent?.toLowerCase().includes('expand') ||
                    clickable.textContent?.toLowerCase().includes('more')) {
                  (clickable as HTMLElement).click();
                }
              });
              parent = parent.parentElement;
            }
          }, element);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (scrollError) {
        console.log(`[CRAWLER] Error scrolling to ${sectionType}:`, scrollError);
      }

      // Take screenshot
      const tempDir = os.tmpdir();
      const fileName = `${domain.replace(/[^a-z0-9]/gi, '-')}-${sectionType}-${Date.now()}.png`;
      const screenshotPath = path.join(tempDir, fileName);
      
      await element.screenshot({ 
        path: screenshotPath as `${string}.png`,
      });

      console.log(`[CRAWLER] Screenshot captured for ${sectionType}`);

      // Upload to object storage
      const storagePath = await this.objectStorage.uploadScreenshot(
        screenshotPath,
        domain,
        runId,
        sectionType
      );

      console.log(`[CRAWLER] Screenshot uploaded to: ${storagePath}`);

      // Try DOM extraction first (basic implementation)
      let extractedData: any = {};
      let extractionMethod: "dom" | "ai_vision" | "hybrid" | "pending" = "pending";

      try {
        extractedData = await this.extractDataFromDOM(page, sectionType, selectors[0]);
        if (Object.keys(extractedData).length > 0) {
          extractionMethod = "dom";
        }
      } catch (domError) {
        console.log(`[CRAWLER] DOM extraction failed for ${sectionType}, will use AI later`);
      }

      // Note: AI vision extraction will be done in a separate step (Task 2)
      // For now, we just capture screenshots and mark as pending

      // Clean up temp file
      try {
        fs.unlinkSync(screenshotPath);
      } catch (e) {
        console.warn(`[CRAWLER] Failed to delete temp file: ${screenshotPath}`);
      }

      return {
        sectionType,
        screenshotPath: storagePath,
        extractedData,
        extractionMethod,
        notes: extractionMethod === "dom" ? "DOM extraction successful" : "Screenshot captured, awaiting AI extraction",
      };
    } catch (error) {
      console.error(`[CRAWLER] Error capturing section ${sectionType}:`, error);
      throw error;
    }
  }

  /**
   * Extract data from DOM (basic implementation)
   * This is a simplified version - actual implementation would need specific
   * selectors for each data point within each section type
   */
  private async extractDataFromDOM(
    page: Page,
    sectionType: SectionType,
    selector: string
  ): Promise<any> {
    try {
      const text = await page.$eval(selector, (el) => el.textContent || "");
      
      // Basic text extraction - in production would parse specific elements
      const result = { 
        rawText: text.trim().substring(0, 500), // Limit to 500 chars
        timestamp: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error(`[CRAWLER] DOM extraction failed for ${sectionType}:`, error);
      return {};
    }
  }

}
