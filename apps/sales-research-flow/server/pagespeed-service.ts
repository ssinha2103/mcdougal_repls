import axios from "axios";

interface PageSpeedMetrics {
  performanceScore: number | null;
  mobileScore: number | null;
  desktopScore: number | null;
  fcp: number | null; // milliseconds
  lcp: number | null; // milliseconds
  fid: number | null; // milliseconds
  cls: number | null; // score
}

interface CoreWebVitals {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
}

export class PageSpeedService {
  private baseUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  /**
   * Fetch PageSpeed Insights metrics for both mobile and desktop
   */
  async getPerformanceMetrics(domain: string): Promise<PageSpeedMetrics> {
    try {
      // Clean and format domain
      const cleanDomain = this.cleanDomain(domain);
      const url = cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`;

      // Fetch mobile and desktop scores in parallel
      const [mobileData, desktopData] = await Promise.all([
        this.fetchStrategy(url, "mobile"),
        this.fetchStrategy(url, "desktop"),
      ]);

      // Extract mobile metrics
      const mobileScore = this.extractPerformanceScore(mobileData);
      const mobileVitals = this.extractCoreWebVitals(mobileData);

      // Extract desktop metrics
      const desktopScore = this.extractPerformanceScore(desktopData);
      const desktopVitals = this.extractCoreWebVitals(desktopData);

      // Use mobile vitals as primary (more important for SEO)
      // Calculate overall score as average of mobile and desktop
      const performanceScore =
        mobileScore !== null && desktopScore !== null
          ? Math.round((mobileScore + desktopScore) / 2)
          : mobileScore ?? desktopScore;

      return {
        performanceScore,
        mobileScore,
        desktopScore,
        fcp: mobileVitals.fcp ?? desktopVitals.fcp,
        lcp: mobileVitals.lcp ?? desktopVitals.lcp,
        fid: mobileVitals.fid ?? desktopVitals.fid,
        cls: mobileVitals.cls ?? desktopVitals.cls,
      };
    } catch (error: any) {
      console.error(`PageSpeed fetch error for ${domain}:`, error.message);
      
      // Return null metrics on error
      return {
        performanceScore: null,
        mobileScore: null,
        desktopScore: null,
        fcp: null,
        lcp: null,
        fid: null,
        cls: null,
      };
    }
  }

  /**
   * Fetch PageSpeed data for a specific strategy (mobile or desktop)
   */
  private async fetchStrategy(url: string, strategy: "mobile" | "desktop"): Promise<any> {
    const params: any = {
      url,
      strategy,
      category: "performance",
    };

    // Add API key if available
    if (this.apiKey) {
      params.key = this.apiKey;
    }

    const response = await axios.get(this.baseUrl, {
      params,
      timeout: 60000, // 60 second timeout (PageSpeed can be slow)
    });

    return response.data;
  }

  /**
   * Extract performance score from PageSpeed response
   */
  private extractPerformanceScore(data: any): number | null {
    try {
      const score = data?.lighthouseResult?.categories?.performance?.score;
      if (score === null || score === undefined) return null;
      
      // Convert from 0-1 to 0-100
      return Math.round(score * 100);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract Core Web Vitals from PageSpeed response
   */
  private extractCoreWebVitals(data: any): CoreWebVitals {
    try {
      const audits = data?.lighthouseResult?.audits;
      
      if (!audits) {
        return { fcp: null, lcp: null, fid: null, cls: null };
      }

      // Extract FCP (First Contentful Paint)
      const fcp = audits["first-contentful-paint"]?.numericValue ?? null;

      // Extract LCP (Largest Contentful Paint)
      const lcp = audits["largest-contentful-paint"]?.numericValue ?? null;

      // Extract FID (First Input Delay) - estimate from TBT (Total Blocking Time)
      // Note: FID is hard to measure, TBT is a good proxy
      const fid = audits["max-potential-fid"]?.numericValue ?? audits["total-blocking-time"]?.numericValue ?? null;

      // Extract CLS (Cumulative Layout Shift)
      const cls = audits["cumulative-layout-shift"]?.numericValue ?? null;

      return {
        fcp: fcp !== null ? Math.round(fcp) : null,
        lcp: lcp !== null ? Math.round(lcp) : null,
        fid: fid !== null ? Math.round(fid) : null,
        cls: cls !== null ? Math.round(cls * 1000) / 1000 : null, // Round to 3 decimals
      };
    } catch (error) {
      return { fcp: null, lcp: null, fid: null, cls: null };
    }
  }

  /**
   * Clean domain for PageSpeed API
   */
  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }

  /**
   * Get performance badge color based on score
   */
  static getPerformanceBadge(score: number | null): "poor" | "needs-improvement" | "good" | null {
    if (score === null || score === undefined) return null;
    if (score < 50) return "poor";
    if (score < 90) return "needs-improvement";
    return "good";
  }
}

export const pageSpeedService = new PageSpeedService(process.env.PAGESPEED_API_KEY);
