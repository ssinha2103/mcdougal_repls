import axios from "axios";

interface SerpApiAIOverviewSource {
  title: string;
  link: string;
  displayed_link?: string;
}

interface SerpApiAIOverview {
  text: string;
  sources?: SerpApiAIOverviewSource[];
}

interface SerpApiResponse {
  ai_overview?: SerpApiAIOverview;
  error?: string;
}

interface AIOverviewResult {
  present: boolean;
  mentioned: boolean;
  score: number;
  text?: string;
  sources?: SerpApiAIOverviewSource[];
}

class SerpApiService {
  private apiKey: string | undefined;
  private baseUrl = "https://serpapi.com/search";

  constructor() {
    this.apiKey = process.env.SERPAPI_KEY;
  }

  /**
   * Check if SerpApi is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Check AI Overview presence for a domain
   * @param companyName - Company name to search for
   * @param domain - Domain to check for mentions
   * @returns AI Overview result with presence, mention, and score
   */
  async checkAIOverview(companyName: string, domain: string): Promise<AIOverviewResult | null> {
    if (!this.isConfigured()) {
      console.log("SerpApi not configured - skipping AI Overview check");
      return null;
    }

    try {
      // Search query: "{companyName} law firm"
      const query = `${companyName} law firm`;
      
      const params = {
        engine: "google",
        q: query,
        location: "United States",
        api_key: this.apiKey,
      };

      console.log(`Checking AI Overview for "${query}"...`);

      const response = await axios.get<SerpApiResponse>(this.baseUrl, { params });

      // Check if AI Overview is present
      if (!response.data.ai_overview) {
        console.log(`No AI Overview found for ${domain}`);
        return {
          present: false,
          mentioned: false,
          score: 0,
        };
      }

      const aiOverview = response.data.ai_overview;
      console.log(`AI Overview found for ${domain}`);

      // Extract domain name from full URL (e.g., "example.com" from "https://www.example.com")
      const extractDomain = (url: string): string => {
        try {
          const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
          return urlObj.hostname.replace(/^www\./, "");
        } catch {
          return url.replace(/^www\./, "");
        }
      };

      const targetDomain = extractDomain(domain);

      // Check if domain is mentioned in AI Overview sources
      let mentioned = false;
      if (aiOverview.sources && aiOverview.sources.length > 0) {
        mentioned = aiOverview.sources.some((source) => {
          const sourceDomain = extractDomain(source.link || source.displayed_link || "");
          return sourceDomain === targetDomain;
        });
      }

      // Calculate visibility score
      // 0: No AI Overview present
      // 50: AI Overview present but domain not mentioned
      // 100: AI Overview present AND domain mentioned
      const score = mentioned ? 100 : 50;

      console.log(`AI Overview result for ${domain}: present=true, mentioned=${mentioned}, score=${score}`);

      return {
        present: true,
        mentioned,
        score,
        text: aiOverview.text,
        sources: aiOverview.sources,
      };
    } catch (error: any) {
      if (error.response) {
        console.error(`SerpApi error for ${domain}:`, error.response.data);
        throw new Error(`SerpApi API error: ${error.response.data.error || error.message}`);
      } else {
        console.error(`SerpApi request failed for ${domain}:`, error.message);
        throw new Error(`SerpApi request failed: ${error.message}`);
      }
    }
  }

  /**
   * Convert boolean to integer for database storage (PostgreSQL doesn't have boolean type in this schema)
   */
  static boolToInt(value: boolean | null): number | null {
    if (value === null) return null;
    return value ? 1 : 0;
  }

  /**
   * Convert integer to boolean from database
   */
  static intToBool(value: number | null): boolean | null {
    if (value === null) return null;
    return value === 1;
  }
}

export const serpApiService = new SerpApiService();
