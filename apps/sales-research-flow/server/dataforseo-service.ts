import axios from "axios";

interface DataForSeoDomainOverview {
  organicTraffic: number | null;
  keywordsTop100: number | null;
  trafficValue: number | null;
}

interface DataForSeoResponse {
  metrics?: {
    organic?: {
      count?: number; // Total organic keywords
      etv?: number; // Estimated Traffic Value in USD
      pos_1?: number;
      pos_2_3?: number;
      pos_4_10?: number;
      pos_11_20?: number;
    };
  };
}

export class DataForSeoService {
  private login: string;
  private password: string;
  private baseUrl = "https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live";

  constructor(login: string, password: string) {
    this.login = login;
    this.password = password;
  }

  /**
   * Check if DataForSEO credentials are configured
   */
  isConfigured(): boolean {
    return !!this.login && !!this.password;
  }

  /**
   * Fetch domain overview metrics from DataForSEO
   */
  async getDomainOverview(domain: string): Promise<DataForSeoDomainOverview | null> {
    if (!this.isConfigured()) {
      console.log("DataForSEO credentials not configured, skipping");
      return null;
    }

    try {
      // Clean domain (remove http/https, www, trailing slashes)
      const cleanDomain = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");

      // Basic Auth credentials
      const auth = Buffer.from(`${this.login}:${this.password}`).toString('base64');

      const response = await axios.post(
        this.baseUrl,
        [
          {
            target: cleanDomain,
            location_code: 2840, // United States
            language_code: "en", // English
          }
        ],
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Check if we have valid data
      if (!response.data?.tasks?.[0]?.result?.[0]) {
        console.error("No data returned from DataForSEO");
        return null;
      }

      const result = response.data.tasks[0].result[0];
      
      // DataForSEO returns metrics in items[0].metrics.organic
      const metrics = result.items?.[0]?.metrics?.organic;

      if (!metrics) {
        console.error("No organic metrics in DataForSEO response - check structure:", 
          JSON.stringify(result, null, 2).substring(0, 500));
        return null;
      }

      // DataForSEO doesn't provide actual traffic, only keyword counts
      // Estimate traffic based on positions and average CTR
      const topKeywords = (metrics.pos_1 || 0) * 30 +  // Position 1 ~30% CTR
                         (metrics.pos_2_3 || 0) * 15 + // Position 2-3 ~15% CTR
                         (metrics.pos_4_10 || 0) * 5;  // Position 4-10 ~5% CTR
      
      const organicTraffic = Math.round(topKeywords * 10); // Rough estimate
      
      // Sum all position buckets for total keywords
      const keywordsTop100 = 
        (metrics.pos_1 || 0) + 
        (metrics.pos_2_3 || 0) + 
        (metrics.pos_4_10 || 0) + 
        (metrics.pos_11_20 || 0) +
        (metrics.pos_21_30 || 0) +
        (metrics.pos_31_40 || 0) +
        (metrics.pos_41_50 || 0) +
        (metrics.pos_51_60 || 0) +
        (metrics.pos_61_70 || 0) +
        (metrics.pos_71_80 || 0) +
        (metrics.pos_81_90 || 0) +
        (metrics.pos_91_100 || 0);
      
      const trafficValue = Math.round(metrics.etv || 0); // Estimated Traffic Value

      return {
        organicTraffic,
        keywordsTop100: keywordsTop100 > 0 ? keywordsTop100 : null,
        trafficValue,
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error("DataForSEO rate limit exceeded");
        return null;
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error("Invalid DataForSEO credentials");
        return null;
      }
      console.error(`DataForSEO API error: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate urgency flag (reuse SEMrush logic)
   */
  getUrgencyFlag(trend: number | null): "urgent" | "review" | "healthy" | null {
    if (trend === null) return null;
    if (trend < -15) return "urgent";
    if (trend <= 5) return "review";
    return "healthy";
  }
}

export const dataForSeoService = new DataForSeoService(
  process.env.DATAFORSEO_LOGIN || "",
  process.env.DATAFORSEO_PASSWORD || ""
);
