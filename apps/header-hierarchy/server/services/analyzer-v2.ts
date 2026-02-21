import * as cheerio from "cheerio";
import { browserPool } from "./browser-pool";
import { checkRobotsTxt } from "./robots-checker";
import { type Heading, type SEOError, type AnalysisResult } from "@shared/schema";
import { Browser, Page } from "puppeteer";
import { setTimeout as sleep } from "node:timers/promises";

// User agent rotation pool - updated with latest versions
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];


// Enhanced error classification
function classifyError(error: any): { type: string; message: string; retryable: boolean } {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Puppeteer/Browser errors
  if (errorMessage.includes('Browser closed') || errorMessage.includes('Target closed')) {
    return {
      type: 'BROWSER_CLOSED',
      message: 'Browser connection lost. Please try again.',
      retryable: true
    };
  }

  if (errorMessage.includes('Protocol error') || errorMessage.includes('Session closed')) {
    return {
      type: 'PROTOCOL_ERROR',
      message: 'Browser communication error. Retrying with different strategy.',
      retryable: true
    };
  }

  // Bot detection / Cloudflare
  if (errorMessage.includes('cloudflare') || errorMessage.includes('challenge')) {
    return {
      type: 'BOT_DETECTED',
      message: 'Website is using bot protection (Cloudflare/similar). Trying alternative method.',
      retryable: true
    };
  }

  // DNS resolution errors
  if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
    return {
      type: 'DNS_ERROR',
      message: 'Could not resolve domain name. Please check the URL and try again.',
      retryable: false
    };
  }
  
  // Connection timeout
  if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout') || errorMessage.includes('Navigation timeout')) {
    return {
      type: 'TIMEOUT',
      message: 'Connection timed out. The website might be slow or unreachable.',
      retryable: true
    };
  }
  
  // SSL/TLS errors
  if (errorMessage.includes('SSL') || errorMessage.includes('certificate') || errorMessage.includes('CERT_')) {
    return {
      type: 'SSL_ERROR',
      message: 'SSL certificate error. The website might have an invalid or expired certificate.',
      retryable: false
    };
  }
  
  // Connection refused
  if (errorMessage.includes('ECONNREFUSED')) {
    return {
      type: 'CONNECTION_REFUSED',
      message: 'Connection refused. The server might be down or blocking requests.',
      retryable: true
    };
  }
  
  // Network unreachable
  if (errorMessage.includes('ENETUNREACH')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network unreachable. Please check your internet connection.',
      retryable: false
    };
  }

  // Too many redirects
  if (errorMessage.includes('redirect') && errorMessage.includes('20')) {
    return {
      type: 'TOO_MANY_REDIRECTS',
      message: 'Too many redirects. The website might have a redirect loop.',
      retryable: false
    };
  }
  
  // HTTP status errors
  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return {
        type: 'AUTH_REQUIRED',
        message: `HTTP ${status}: Authentication or access denied.`,
        retryable: false
      };
    }
    if (status === 404) {
      return {
        type: 'NOT_FOUND',
        message: 'Page not found (404).',
        retryable: false
      };
    }
    if (status === 429) {
      return {
        type: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again later.',
        retryable: true
      };
    }
    if (status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: `HTTP ${status}: Server error. The website might be experiencing issues.`,
        retryable: true
      };
    }
  }
  
  return {
    type: 'UNKNOWN',
    message: errorMessage,
    retryable: true
  };
}

// Fallback fetch with cheerio (no JavaScript execution)
async function fetchWithHttp(url: string): Promise<string> {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw { response: { status: response.status } };
  }

  return await response.text();
}

// Fetch with Puppeteer
async function fetchWithPuppeteer(url: string, attempt: number = 1): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await browserPool.getBrowser();
    page = await browserPool.createPage(browser);

    // Rotate user agent
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(userAgent);

    // Set additional headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // Randomize viewport
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1680, height: 1050 }
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(viewport);

    // Simulate human-like mouse movement
    await page.mouse.move(
      Math.floor(Math.random() * viewport.width),
      Math.floor(Math.random() * viewport.height)
    );

    // Override navigator.webdriver and other bot detection methods
    await page.evaluateOnNewDocument(() => {
      // Override webdriver property
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Override Chrome detection
      (window as any).chrome = {
        runtime: {},
        app: {
          isInstalled: false,
        }
      };
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as any) :
          originalQuery(parameters);
      
      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Track response status
    let responseStatus: number | null = null;
    page.on('response', response => {
      if (response.url() === url || response.url() === page!.url()) {
        responseStatus = response.status();
      }
    });

    // Dismiss dialogs automatically
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    // Enhanced navigation with timeout based on attempt
    const timeout = 30000 + (attempt * 10000); // Increase timeout on retries
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout
      });
    } catch (navError: any) {
      // If networkidle2 fails, try with domcontentloaded
      if (navError.message?.includes('timeout')) {
        console.log('[Analyzer] Retrying with domcontentloaded strategy');
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
      } else {
        throw navError;
      }
    }

    // Check response status
    if (responseStatus && responseStatus >= 400) {
      throw { response: { status: responseStatus } };
    }

    // Wait for content
    await sleep(1000);

    // Try to wait for headings
    try {
      await page.waitForSelector('h1, h2, h3, h4, h5, h6, [role="heading"]', { timeout: 5000 });
    } catch {
      // No headings found immediately, continue anyway
    }

    // Try to dismiss cookie banners and popups
    try {
      const commonSelectors = [
        '[class*="cookie"] button',
        '[id*="cookie"] button', 
        '.modal button[class*="close"]',
        '[class*="consent"] button[class*="accept"]'
      ];

      for (const selector of commonSelectors) {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          await elements[0].click();
          await sleep(500);
        }
      }
    } catch {
      // Ignore errors from popup dismissal
    }

    // Handle iframes and frames
    const frames = page.frames();
    let allHtml = await page.content();

    // Extract from iframes if same-origin
    for (const frame of frames) {
      if (frame !== page.mainFrame()) {
        try {
          const frameContent = await frame.content();
          allHtml += '\n' + frameContent;
        } catch {
          // Cross-origin frame, skip
        }
      }
    }

    return allHtml;

  } finally {
    if (page) {
      await browserPool.closePage(page);
    }
    if (browser) {
      await browserPool.releaseBrowser(browser);
    }
  }
}

export async function analyzeHeadings(url: string, maxRetries: number = 3): Promise<AnalysisResult> {
  let html: string | null = null;
  let lastError: any;
  let usedFallback = false;

  // Check robots.txt compliance
  const robotsCheck = await checkRobotsTxt(url);
  if (!robotsCheck.allowed) {
    throw new Error(robotsCheck.reason || 'Access disallowed by robots.txt');
  }

  // Try Puppeteer first, fall back to HTTP fetch
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Try Puppeteer on first attempts
      if (attempt <= 2) {
        console.log(`[Analyzer] Attempt ${attempt}/${maxRetries} with Puppeteer`);
        html = await fetchWithPuppeteer(url, attempt);
        break;
      } else {
        // Fallback to HTTP fetch on last attempt
        console.log(`[Analyzer] Attempt ${attempt}/${maxRetries} with HTTP fallback`);
        html = await fetchWithHttp(url);
        usedFallback = true;
        break;
      }
    } catch (error) {
      lastError = error;
      const errorInfo = classifyError(error);

      console.log(`[Analyzer] Attempt ${attempt}/${maxRetries} failed: ${errorInfo.type} - ${errorInfo.message}`);

      // If bot detected or protocol error, try HTTP fallback immediately
      if (errorInfo.type === 'BOT_DETECTED' || errorInfo.type === 'PROTOCOL_ERROR' || errorInfo.type === 'BROWSER_CLOSED') {
        try {
          console.log('[Analyzer] Switching to HTTP fallback due to browser issues');
          html = await fetchWithHttp(url);
          usedFallback = true;
          break;
        } catch (fallbackError) {
          lastError = fallbackError;
        }
      }

      if (!errorInfo.retryable || attempt === maxRetries) {
        throw new Error(errorInfo.message);
      }

      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`[Analyzer] Retrying in ${backoffTime}ms...`);
      await sleep(backoffTime);
    }
  }

  if (!html) {
    throw new Error(lastError?.message || "Unable to fetch URL after multiple attempts");
  }

  // Log if fallback was used
  if (usedFallback) {
    console.log('[Analyzer] Successfully analyzed using HTTP fallback (no JavaScript)');
  }

  // Check for empty pages
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  if (!textContent || textContent.length < 10) {
    console.warn('[Analyzer] Page appears to be empty or contains minimal content');
  }

  // Check page size
  const pageSize = new TextEncoder().encode(html).length;
  if (pageSize > 10 * 1024 * 1024) { // 10MB
    console.warn(`[Analyzer] Large page detected (${(pageSize / 1024 / 1024).toFixed(2)}MB)`);
    if (pageSize > 20 * 1024 * 1024) {
      html = html.substring(0, 20 * 1024 * 1024);
    }
  }

  // Parse HTML with cheerio (handles malformed HTML)
  const $ = cheerio.load(html, {
    xml: {
      xmlMode: false, // HTML mode for better error handling
    }
  });

  const headings: Heading[] = [];

  // Extract headings (case-insensitive, handles ARIA roles)
  $("h1, h2, h3, h4, h5, h6, H1, H2, H3, H4, H5, H6, [role='heading']").each((index, element) => {
    const tagName = element.tagName?.toLowerCase() || '';
    let level = 1;

    if (tagName.match(/^h[1-6]$/)) {
      level = parseInt(tagName.charAt(1));
    } else if ($(element).attr('aria-level')) {
      // Handle ARIA heading level
      level = parseInt($(element).attr('aria-level') || '1');
      level = Math.max(1, Math.min(6, level)); // Clamp to 1-6
    }

    // Extract text with various fallbacks
    let text = $(element).text().trim();
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Handle aria-label
    if (!text && $(element).attr('aria-label')) {
      text = $(element).attr('aria-label')!.trim();
    }

    // Handle title attribute
    if (!text && $(element).attr('title')) {
      text = $(element).attr('title')!.trim();
    }

    // Handle visibility - skip if display:none or hidden
    const style = $(element).attr('style') || '';
    const ariaHidden = $(element).attr('aria-hidden');
    if (style.includes('display:none') || style.includes('display: none') || ariaHidden === 'true') {
      return; // Skip hidden headings
    }

    headings.push({
      level,
      text,
      position: index,
    });
  });

  const errors = detectSEOErrors(headings);
  const statistics = calculateStatistics(headings);
  const accessibility = assessAccessibility(headings, errors, $);

  return {
    url,
    headings,
    errors,
    statistics,
    accessibility,
  };
}

function detectSEOErrors(headings: Heading[]): SEOError[] {
  const errors: SEOError[] = [];
  
  const h1Headings = headings.filter(h => h.level === 1);
  
  if (h1Headings.length === 0) {
    errors.push({
      type: "missing_h1",
      message: "No H1 tag found on the page.",
      details: "Every page should have exactly one H1 tag that describes the main topic of the page.",
    });
  } else if (h1Headings.length > 1) {
    errors.push({
      type: "multiple_h1",
      message: `Found ${h1Headings.length} H1 tags on the page.`,
      details: "Best practice is to have only one H1 tag per page for better SEO and content hierarchy.",
      affectedHeadings: h1Headings.map(h => h.position),
    });
  }

  // Check for empty headings
  for (const heading of headings) {
    if (!heading.text || heading.text.length === 0) {
      const existingError = errors.find(e => e.type === "empty_heading");
      if (existingError) {
        existingError.affectedHeadings?.push(heading.position);
      } else {
        errors.push({
          type: "empty_heading",
          message: "Empty heading tags found.",
          details: "Headings should contain descriptive text for SEO and accessibility.",
          affectedHeadings: [heading.position],
        });
      }
    }
  }

  // Check hierarchy
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i];
    const previous = headings[i - 1];
    const levelDiff = current.level - previous.level;
    
    if (levelDiff > 1) {
      errors.push({
        type: "hierarchy_gap",
        message: `Heading hierarchy gap: H${previous.level} followed by H${current.level}`,
        details: `Heading levels should not skip levels (e.g., H1 to H3). Use consecutive levels.`,
        affectedHeadings: [previous.position, current.position],
      });
    }
  }

  return errors;
}

function calculateStatistics(headings: Heading[]) {
  return {
    total: headings.length,
    h1Count: headings.filter(h => h.level === 1).length,
    h2Count: headings.filter(h => h.level === 2).length,
    h3Count: headings.filter(h => h.level === 3).length,
    h4Count: headings.filter(h => h.level === 4).length,
    h5Count: headings.filter(h => h.level === 5).length,
    h6Count: headings.filter(h => h.level === 6).length,
  };
}

function assessAccessibility(headings: Heading[], errors: SEOError[], $: cheerio.CheerioAPI) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for H1
  if (errors.some(e => e.type === "missing_h1")) {
    issues.push("Missing H1 tag impacts screen reader navigation (WCAG 2.4.6)");
    recommendations.push("Add a descriptive H1 tag as the main page heading");
    score -= 30;
  }

  if (errors.some(e => e.type === "multiple_h1")) {
    issues.push("Multiple H1 tags can confuse screen reader users");
    recommendations.push("Use only one H1 tag per page for clear page structure");
    score -= 15;
  }

  // Hierarchy gaps
  const hierarchyGaps = errors.filter(e => e.type === "hierarchy_gap");
  if (hierarchyGaps.length > 0) {
    issues.push(`${hierarchyGaps.length} heading hierarchy gap(s) detected (WCAG 2.4.1)`);
    recommendations.push("Maintain sequential heading levels for proper document outline");
    score -= Math.min(hierarchyGaps.length * 10, 30);
  }

  // Empty headings
  const emptyHeadings = errors.filter(e => e.type === "empty_heading");
  if (emptyHeadings.length > 0) {
    issues.push(`${emptyHeadings.length} empty heading(s) found`);
    recommendations.push("All headings should contain descriptive text");
    score -= Math.min(emptyHeadings.length * 5, 20);
  }

  // No headings at all
  if (headings.length === 0) {
    issues.push("No headings found on page (WCAG 2.4.2)");
    recommendations.push("Add proper heading structure for accessibility and SEO");
    score = 0;
  } else if (headings.length < 3) {
    recommendations.push("Consider adding more headings to improve content structure");
  } else if (headings.length > 50) {
    issues.push("Excessive number of headings may impact usability");
    recommendations.push("Consider consolidating content sections");
    score -= 5;
  }

  // Long headings
  const longHeadings = headings.filter(h => h.text.length > 100);
  if (longHeadings.length > 0) {
    issues.push(`${longHeadings.length} heading(s) exceed recommended length`);
    recommendations.push("Keep headings concise (under 100 characters)");
    score -= Math.min(longHeadings.length * 2, 10);
  }

  // Very short headings
  const shortHeadings = headings.filter(h => h.text.length > 0 && h.text.length < 3);
  if (shortHeadings.length > 0) {
    issues.push(`${shortHeadings.length} heading(s) may be too short`);
    recommendations.push("Use descriptive headings that clearly indicate section content");
    score -= Math.min(shortHeadings.length * 2, 10);
  }

  // Check for landmarks
  const hasMain = $('main, [role="main"]').length > 0;
  const hasNav = $('nav, [role="navigation"]').length > 0;
  
  if (!hasMain) {
    recommendations.push("Consider adding a <main> landmark for better navigation");
  }

  if (issues.length === 0) {
    recommendations.push("Heading structure follows accessibility best practices");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    recommendations,
  };
}
