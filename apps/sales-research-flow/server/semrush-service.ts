import axios from "axios";

interface SemrushDomainOverview {
  organicTraffic: number | null;
  keywordsTop100: number | null;
  trafficValue: number | null;
}

interface SemrushHistoricalData {
  previousTraffic: number | null;
}

export class SemrushService {
  private apiKey: string;
  private baseUrl = "https://api.semrush.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch domain overview metrics from SEMrush
   */
  async getDomainOverview(domain: string): Promise<SemrushDomainOverview> {
    try {
      // Clean domain (remove http/https, www, trailing slashes)
      const cleanDomain = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");

      const response = await axios.get(`${this.baseUrl}/`, {
        params: {
          type: "domain_ranks",
          key: this.apiKey,
          domain: cleanDomain,
          database: "us",
          export_columns: "Ot,Or,Oc,Rk", // Traffic, Keywords, Cost, Rank
        },
        timeout: 30000, // 30 second timeout
      });

      // Parse SEMrush CSV response
      const lines = response.data.split("\n").filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        throw new Error("No data returned from SEMrush");
      }

      const header = lines[0];
      const data = lines[1].split(";");
      
      console.log(`[DEBUG] SEMrush response for ${cleanDomain}:`);
      console.log(`[DEBUG] Header: ${header}`);
      console.log(`[DEBUG] Data: ${lines[1]}`);
      console.log(`[DEBUG] Parsed values: Traffic=${data[0]}, Keywords=${data[1]}, Cost=${data[2]}, Rank=${data[3]}`);
      
      // Correct mapping based on export_columns order: Ot,Or,Oc,Rk
      const result = {
        organicTraffic: data[0] ? parseInt(data[0]) : null,      // Ot - Organic Traffic
        keywordsTop100: data[1] ? parseInt(data[1]) : null,      // Or - Organic Keywords
        trafficValue: data[2] ? parseFloat(data[2]) : null,      // Oc - Organic Cost
      };
      
      console.log(`[DEBUG] Returning:`, result);
      return result;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("SEMrush rate limit exceeded");
      }
      if (error.response?.status === 401) {
        throw new Error("Invalid SEMrush API key");
      }
      throw new Error(`SEMrush API error: ${error.message}`);
    }
  }

  /**
   * Fetch historical data to calculate 3-month trend
   */
  async getHistoricalData(domain: string): Promise<SemrushHistoricalData> {
    try {
      const cleanDomain = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");

      // Get data from 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const dateStr = threeMonthsAgo.toISOString().split("T")[0].replace(/-/g, "");

      const response = await axios.get(`${this.baseUrl}/`, {
        params: {
          type: "domain_ranks",
          key: this.apiKey,
          domain: cleanDomain,
          database: "us",
          display_date: dateStr,
          export_columns: "Ot",
        },
        timeout: 30000,
      });

      const lines = response.data.split("\n").filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        return { previousTraffic: null };
      }

      const data = lines[1].split(";");
      
      return {
        previousTraffic: data[0] ? parseInt(data[0]) : null,
      };
    } catch (error: any) {
      // If historical data fails, return null (we'll skip trend calculation)
      console.error("Historical data fetch failed:", error.message);
      return { previousTraffic: null };
    }
  }

  /**
   * Calculate 3-month trend percentage
   */
  calculateTrend(current: number | null, previous: number | null): number | null {
    if (current === null || previous === null || previous === 0) {
      return null;
    }

    const percentageChange = ((current - previous) / previous) * 100;
    return Math.round(percentageChange * 10) / 10; // Round to 1 decimal
  }

  /**
   * Determine urgency flag based on trend
   */
  getUrgencyFlag(trend: number | null): "urgent" | "review" | "healthy" | null {
    if (trend === null) return null;
    if (trend < -15) return "urgent";
    if (trend <= 5) return "review";
    return "healthy";
  }

  /**
   * Calculate prospect priority score (0-100) based on multiple factors
   * Higher score = better sales prospect
   */
  calculatePriorityScore(params: {
    trafficTrend3mo: number | null;
    organicTraffic: number | null;
    keywordsTop100: number | null;
    performanceScore: number | null;
    aiOverviewVisibilityScore: number | null;
  }): number {
    let score = 0;

    // 1. Traffic Decline (40 points max) - Most important factor
    if (params.trafficTrend3mo !== null) {
      if (params.trafficTrend3mo <= -30) score += 40;
      else if (params.trafficTrend3mo <= -20) score += 30;
      else if (params.trafficTrend3mo <= -10) score += 20;
      else if (params.trafficTrend3mo <= -5) score += 10;
    }

    // 2. Firm Size (30 points max) - Bigger firms = better prospects
    if (params.organicTraffic !== null) {
      if (params.organicTraffic > 10000) score += 30;
      else if (params.organicTraffic > 5000) score += 20;
      else if (params.organicTraffic > 1000) score += 10;
      else score += 5;
    }

    // 3. Keywords at Risk (15 points max) - More keywords = more to lose
    if (params.keywordsTop100 !== null) {
      if (params.keywordsTop100 > 1000) score += 15;
      else if (params.keywordsTop100 > 500) score += 10;
      else if (params.keywordsTop100 > 100) score += 5;
      else score += 2;
    }

    // 4. Performance Issues (10 points max) - Poor performance = need help
    if (params.performanceScore !== null) {
      if (params.performanceScore < 50) score += 10;
      else if (params.performanceScore < 70) score += 5;
    }

    // 5. AI Visibility Gap (5 points max) - Low visibility = opportunity
    if (params.aiOverviewVisibilityScore !== null) {
      if (params.aiOverviewVisibilityScore === 0) score += 5;
      else if (params.aiOverviewVisibilityScore === 50) score += 3;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get priority level label based on score
   */
  getPriorityLevel(score: number | null): "high" | "medium" | "low" | null {
    if (score === null) return null;
    if (score >= 70) return "high";
    if (score >= 40) return "medium";
    return "low";
  }
}

export const semrushService = new SemrushService(process.env.SEMRUSH_API_KEY || "");
