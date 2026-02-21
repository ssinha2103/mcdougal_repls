import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { type Heading, type SEOError, type AnalysisResult } from "@shared/schema";

// User agent rotation pool
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Helper function for exponential backoff
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced error classification
function classifyError(error: any): { type: string; message: string; retryable: boolean } {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // DNS resolution errors
  if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
    return {
      type: 'DNS_ERROR',
      message: 'Could not resolve domain name. Please check the URL and try again.',
      retryable: false
    };
  }
  
  // Connection timeout
  if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: 'Connection timed out. The website might be slow or unreachable.',
      retryable: true
    };
  }
  
  // SSL/TLS errors
  if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
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
  
  // HTTP status errors
  if (error?.response?.status) {
    const status = error.response.status;
    if (status >= 400 && status < 500) {
      return {
        type: 'CLIENT_ERROR',
        message: `HTTP ${status} error: ${status === 404 ? 'Page not found' : status === 403 ? 'Access forbidden' : 'Client error'}`,
        retryable: false
      };
    }
    if (status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: `HTTP ${status} error: Server error. The website might be experiencing issues.`,
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

export async function analyzeHeadings(url: string, maxRetries: number = 3): Promise<AnalysisResult> {
  let html: string;
  let browser;
  let lastError: any;
  let redirectChain: string[] = [];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });
      
      const page = await browser.newPage();
      
      // Rotate user agent
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      await page.setUserAgent(userAgent);
      
      // Set additional headers to avoid detection
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      });
      
      // Track redirects
      page.on('response', response => {
        const chain = response.request().redirectChain();
        if (chain.length > 0) {
          redirectChain = chain.map(req => req.url());
        }
      });
      
      // Track response status
      let responseStatus: number | null = null;
      page.on('response', response => {
        if (response.url() === url || response.url() === page.url()) {
          responseStatus = response.status();
        }
      });
      
      // Enhanced navigation with granular timeouts
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: attempt === 1 ? 30000 : 45000 + (attempt * 5000) // Increase timeout on retries
      });
      
      // Check response status
      if (responseStatus && responseStatus >= 400) {
        throw { response: { status: responseStatus } };
      }
      
      // Wait a bit for JS-rendered content
      await page.waitForTimeout(1000);
      
      // Try to wait for common content patterns
      try {
        await page.waitForSelector('h1, h2, h3, h4, h5, h6', { timeout: 5000 });
      } catch {
        // Content might not have headings, continue anyway
      }
      
      // Handle iframes and frames
      const frames = page.frames();
      let allHeadingsHtml = await page.content();
      
      // Try to extract content from iframes (if same-origin)
      for (const frame of frames) {
        if (frame !== page.mainFrame()) {
          try {
            const frameContent = await frame.content();
            allHeadingsHtml += '\n' + frameContent;
          } catch {
            // Cross-origin frame, skip
          }
        }
      }
      
      html = allHeadingsHtml;
      
      // Check page size to prevent memory issues
      const pageSize = new TextEncoder().encode(html).length;
      if (pageSize > 10 * 1024 * 1024) { // 10MB limit
        console.warn(`Large page detected (${(pageSize / 1024 / 1024).toFixed(2)}MB), processing may be slow`);
        // Truncate if too large
        if (pageSize > 20 * 1024 * 1024) {
          html = html.substring(0, 20 * 1024 * 1024);
        }
      }
      
      await browser.close();
      
      // Log redirect information if any
      if (redirectChain.length > 0) {
        console.log(`Redirect chain: ${redirectChain.join(' -> ')} -> ${page.url()}`);
      }
      
      break; // Success, exit retry loop
      
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      
      lastError = error;
      const errorInfo = classifyError(error);
      
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${errorInfo.type} - ${errorInfo.message}`);
      
      if (!errorInfo.retryable || attempt === maxRetries) {
        throw new Error(errorInfo.message);
      }
      
      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying in ${backoffTime}ms...`);
      await sleep(backoffTime);
    }
  }
  
  if (!html!) {
    throw new Error(lastError?.message || "Unable to fetch URL after multiple attempts");
  }

  // Check for empty or whitespace-only pages
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  if (!textContent || textContent.length < 10) {
    console.warn('Page appears to be empty or contains minimal content');
  }
  
  // Load HTML with cheerio, handling encoding issues
  const $ = cheerio.load(html, {
    decodeEntities: true,
    normalizeWhitespace: true,
  });
  
  const headings: Heading[] = [];
  
  // Enhanced heading extraction to handle malformed HTML
  $("h1, h2, h3, h4, h5, h6").each((index, element) => {
    const tagName = element.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1));
    
    // Extract text, handling nested elements
    let text = $(element).text().trim();
    
    // Handle aria-label for accessibility
    const ariaLabel = $(element).attr('aria-label');
    if (!text && ariaLabel) {
      text = ariaLabel;
    }
    
    // Handle title attribute as fallback
    const title = $(element).attr('title');
    if (!text && title) {
      text = title;
    }
    
    headings.push({
      level,
      text,
      position: index,
    });
  });

  const errors = detectSEOErrors(headings);
  const statistics = calculateStatistics(headings);
  const accessibility = assessAccessibility(headings, errors);

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

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    
    if (!current.text || current.text.length === 0) {
      const existingEmptyError = errors.find(e => e.type === "empty_heading");
      if (existingEmptyError) {
        existingEmptyError.affectedHeadings?.push(current.position);
      } else {
        errors.push({
          type: "empty_heading",
          message: "Empty heading tags found.",
          details: "Headings should contain descriptive text for SEO and accessibility.",
          affectedHeadings: [current.position],
        });
      }
    }

    if (i > 0) {
      const previous = headings[i - 1];
      const levelDifference = current.level - previous.level;
      
      if (levelDifference > 1) {
        errors.push({
          type: "hierarchy_gap",
          message: `Heading hierarchy gap: H${previous.level} followed by H${current.level}`,
          details: `Heading levels should not skip levels when going deeper (e.g., H1 to H3). Use consecutive levels for proper hierarchy.`,
          affectedHeadings: [previous.position, current.position],
        });
      }
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

function assessAccessibility(headings: Heading[], errors: SEOError[]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Enhanced accessibility assessment with more WCAG criteria
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

  const hierarchyGaps = errors.filter(e => e.type === "hierarchy_gap");
  if (hierarchyGaps.length > 0) {
    issues.push(`${hierarchyGaps.length} heading hierarchy gap(s) detected (WCAG 2.4.1)`);
    recommendations.push("Maintain sequential heading levels for proper document outline");
    score -= Math.min(hierarchyGaps.length * 10, 30);
  }

  const emptyHeadings = errors.filter(e => e.type === "empty_heading");
  if (emptyHeadings.length > 0) {
    issues.push(`${emptyHeadings.length} empty heading(s) found`);
    recommendations.push("All headings should contain descriptive text for screen readers");
    score -= Math.min(emptyHeadings.length * 5, 20);
  }

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

  // Check for very long headings
  const longHeadings = headings.filter(h => h.text.length > 100);
  if (longHeadings.length > 0) {
    issues.push(`${longHeadings.length} heading(s) exceed recommended length`);
    recommendations.push("Keep headings concise (under 100 characters) for better readability");
    score -= Math.min(longHeadings.length * 2, 10);
  }

  // Check for headings that are too short (potential issues)
  const shortHeadings = headings.filter(h => h.text.length > 0 && h.text.length < 3);
  if (shortHeadings.length > 0) {
    issues.push(`${shortHeadings.length} heading(s) may be too short to be descriptive`);
    recommendations.push("Use descriptive headings that clearly indicate section content");
    score -= Math.min(shortHeadings.length * 2, 10);
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