/**
 * Mock Data Service
 * Generates realistic SEO metrics when external APIs fail
 * Uses domain name as seed for deterministic but varied data
 */

interface MockDomainData {
  organicTraffic: number;
  keywordsTop100: number;
  trafficValue: number;
  previousTraffic: number;
}

interface MockComprehensiveData {
  organicTraffic: number | null;
  organicKeywords: number | null;
  trafficCost: number | null;
  domainRank: number | null;
  brandedTraffic: number | null;
  nonBrandedTraffic: number | null;
  keywordPositions: Array<any>;
  positionChanges: any;
  competitors: Array<any>;
  topPages: Array<any>;
  subdomains: Array<any>;
  serpFeatures: any;
  historicalData: Array<any>;
  keywordsByIntent: any;
  topics: Array<any>;
}

export class MockDataService {
  /**
   * Generate mock SEO metrics for a domain
   * Uses domain name as seed for consistent but varied data
   */
  static generateMockData(domain: string): MockDomainData {
    // Create a simple hash from domain name for deterministic randomness
    const seed = this.hashCode(domain);
    
    // Generate realistic law firm metrics
    const baseTraffic = this.seededRandom(seed, 500, 15000);
    const baseKeywords = this.seededRandom(seed + 1, 50, 1200);
    const avgCPC = this.seededRandom(seed + 2, 5, 25); // $5-$25 per click for legal
    
    const organicTraffic = Math.round(baseTraffic);
    const keywordsTop100 = Math.round(baseKeywords);
    const trafficValue = Math.round(organicTraffic * avgCPC);
    
    // Generate historical traffic with realistic trend (-30% to +30%)
    const trendPercent = this.seededRandom(seed + 3, -30, 30);
    const previousTraffic = Math.round(organicTraffic / (1 + trendPercent / 100));
    
    return {
      organicTraffic,
      keywordsTop100,
      trafficValue,
      previousTraffic,
    };
  }

  /**
   * Simple hash function for string to number conversion
   */
  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Seeded random number generator
   * Returns a number between min and max based on seed
   */
  private static seededRandom(seed: number, min: number, max: number): number {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return min + random * (max - min);
  }

  /**
   * Get a friendly error message for UI display
   */
  static getFailureMessage(semrushError?: string, dataForSeoError?: string): string {
    if (semrushError?.includes("403") || semrushError?.includes("401")) {
      return "API authentication failed - showing sample data for demonstration";
    }
    if (semrushError?.includes("429")) {
      return "API rate limit exceeded - showing sample data";
    }
    return "External APIs unavailable - showing sample data for demonstration";
  }

  /**
   * Generate comprehensive mock data for domain detail modal
   */
  static generateComprehensiveData(domain: string, basicData?: MockDomainData): MockComprehensiveData {
    const seed = this.hashCode(domain);
    const data = basicData || this.generateMockData(domain);
    
    // Law firm keywords
    const keywords = [
      "personal injury lawyer", "car accident attorney", "medical malpractice lawyer",
      "workers compensation attorney", "wrongful death lawyer", "slip and fall attorney",
      "motorcycle accident lawyer", "truck accident attorney", "premises liability lawyer",
      "product liability attorney", "nursing home abuse lawyer", "birth injury attorney"
    ];

    // Generate keyword positions
    const keywordPositions = keywords.slice(0, 10).map((kw, i) => ({
      keyword: kw,
      position: Math.floor(this.seededRandom(seed + i, 1, 50)),
      previousPosition: Math.floor(this.seededRandom(seed + i + 100, 1, 50)),
      volume: Math.floor(this.seededRandom(seed + i + 200, 100, 5000)),
      cpc: parseFloat(this.seededRandom(seed + i + 300, 5, 50).toFixed(2)),
      url: `https://${domain}/practice-areas/${kw.replace(/\s+/g, '-')}`,
      trafficPercent: parseFloat(this.seededRandom(seed + i + 400, 1, 15).toFixed(1)),
      serpFeatures: i % 3 === 0 ? ['Local Pack'] : i % 2 === 0 ? ['People Also Ask'] : [],
      difficulty: Math.floor(this.seededRandom(seed + i + 500, 30, 80)),
      intent: i % 4 === 0 ? 'Commercial' : 'Informational',
      lastUpdate: new Date().toISOString().split('T')[0]
    }));

    // Generate 24 months of historical data
    const historicalData = Array.from({ length: 24 }, (_, i) => {
      const monthsAgo = 23 - i;
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-15`;
      
      const variance = this.seededRandom(seed + i + 600, 0.8, 1.2);
      const traffic = Math.round(data.organicTraffic * variance);
      
      return {
        date: dateStr,
        traffic,
        keywords: Math.round(data.keywordsTop100 * variance),
        trafficCost: Math.round(data.trafficValue * variance),
        positionGroups: {
          top3: Math.round(this.seededRandom(seed + i + 700, 5, 20)),
          top10: Math.round(this.seededRandom(seed + i + 800, 15, 50)),
          top20: Math.round(this.seededRandom(seed + i + 900, 30, 80)),
          top50: Math.round(this.seededRandom(seed + i + 1000, 50, 150)),
          top100: Math.round(data.keywordsTop100 * variance),
          serpFeatures: Math.round(this.seededRandom(seed + i + 1100, 5, 25))
        }
      };
    });

    return {
      organicTraffic: data.organicTraffic,
      organicKeywords: data.keywordsTop100,
      trafficCost: data.trafficValue,
      domainRank: Math.floor(this.seededRandom(seed + 1200, 1000000, 10000000)),
      brandedTraffic: Math.round(data.organicTraffic * 0.3),
      nonBrandedTraffic: Math.round(data.organicTraffic * 0.7),
      keywordPositions,
      positionChanges: {
        new: keywordPositions.slice(0, 3).map(kw => ({
          keyword: kw.keyword,
          position: kw.position,
          volume: kw.volume,
          trafficPercent: kw.trafficPercent
        })),
        lost: [],
        improved: keywordPositions.slice(3, 5).map(kw => ({
          keyword: kw.keyword,
          previousPosition: kw.previousPosition || 25,
          currentPosition: kw.position,
          volume: kw.volume,
          trafficPercent: kw.trafficPercent
        })),
        declined: keywordPositions.slice(5, 7).map(kw => ({
          keyword: kw.keyword,
          previousPosition: kw.previousPosition || 15,
          currentPosition: kw.position,
          volume: kw.volume,
          trafficPercent: kw.trafficPercent
        }))
      },
      competitors: [
        { domain: 'competitor1.com', commonKeywords: 150, competitionLevel: 75, organicTraffic: 12000, organicKeywords: 800, missingKeywords: 50 },
        { domain: 'competitor2.com', commonKeywords: 120, competitionLevel: 60, organicTraffic: 9000, organicKeywords: 650, missingKeywords: 80 }
      ],
      topPages: [
        { url: `https://${domain}/practice-areas`, traffic: Math.round(data.organicTraffic * 0.3), trafficPercent: 30, keywords: 45, topKeyword: keywords[0], topKeywordPosition: 3 },
        { url: `https://${domain}/about`, traffic: Math.round(data.organicTraffic * 0.15), trafficPercent: 15, keywords: 22, topKeyword: keywords[1], topKeywordPosition: 5 }
      ],
      subdomains: [
        { subdomain: domain, traffic: data.organicTraffic, trafficPercent: 100, keywords: data.keywordsTop100 }
      ],
      serpFeatures: {
        featuredSnippets: 5,
        localPack: 15,
        knowledgePanel: 2,
        peopleAlsoAsk: 8,
        reviews: 3,
        siteLinks: 4,
        videoCarousel: 0,
        imageCarousel: 1
      },
      historicalData,
      keywordsByIntent: {
        informational: Math.round(data.keywordsTop100 * 0.4),
        commercial: Math.round(data.keywordsTop100 * 0.35),
        transactional: Math.round(data.keywordsTop100 * 0.15),
        navigational: Math.round(data.keywordsTop100 * 0.1)
      },
      topics: [
        { 
          topic: 'Personal Injury', 
          keywords: 250, 
          traffic: Math.round(data.organicTraffic * 0.4),
          trafficPercent: 40,
          topKeywords: ['personal injury lawyer', 'injury attorney', 'accident lawyer']
        },
        { 
          topic: 'Auto Accidents', 
          keywords: 180, 
          traffic: Math.round(data.organicTraffic * 0.3),
          trafficPercent: 30,
          topKeywords: ['car accident lawyer', 'auto accident attorney', 'crash lawyer']
        }
      ]
    };
  }
}
