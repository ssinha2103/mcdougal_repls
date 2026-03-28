import * as fs from "fs";
import { GoogleGenAI, FileState } from "@google/genai";
import type { SectionType, InsertMetrics, InsertInsight } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExtractedData {
  success: boolean;
  data: any;
  confidence: number;
  method: "ai_vision";
}

export interface ProspectInsight {
  insightType: string;
  title: string;
  summary: string;
  details: string;
  severity: "low" | "medium" | "high";
  confidence: number;
}

interface SectionData {
  sectionType: SectionType;
  screenshotPath: string | null;
  extractedData: any;
  extractionMethod: "dom" | "ai_vision" | "hybrid" | "pending";
  notes?: string;
}

interface RateLimiter {
  lastCallTime: number;
  callCount: number;
}

const rateLimiter: RateLimiter = {
  lastCallTime: 0,
  callCount: 0,
};

const MIN_DELAY_MS = 500;
const MAX_RETRIES = 2;

function getGeminiModelCandidates(): string[] {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const candidates = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ].filter((model): model is string => Boolean(model));

  return Array.from(new Set(candidates));
}

async function generateContentWithFallback(
  buildRequest: (model: string) => any
) {
  let lastError: unknown = null;

  for (const model of getGeminiModelCandidates()) {
    try {
      return await ai.models.generateContent(buildRequest(model));
    } catch (error: any) {
      lastError = error;
      console.error(`[GEMINI] Model ${model} failed:`, error?.message || error);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "All Gemini model attempts failed"));
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleRequest(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - rateLimiter.lastCallTime;

  if (timeSinceLastCall < MIN_DELAY_MS) {
    const waitTime = MIN_DELAY_MS - timeSinceLastCall;
    await delay(waitTime);
  }

  rateLimiter.lastCallTime = Date.now();
  rateLimiter.callCount++;
}

function getSectionPrompt(sectionType: SectionType): string {
  const prompts: Record<SectionType, string> = {
    header_kpis: `Analyze this SEMrush header KPI section and extract the following data in JSON format:
{
  "keywords": number (total keywords count),
  "organicTraffic": number (monthly organic traffic),
  "trafficCost": number (estimated traffic cost in dollars),
  "brandedTraffic": number (branded traffic percentage or count),
  "nonBrandedTraffic": number (non-branded traffic percentage or count),
  "monthlyChange": number (month-over-month change percentage, can be negative)
}

Look for metrics labeled as "Keywords", "Organic Traffic", "Traffic Cost", "Branded Traffic", etc.
Extract numeric values only, removing any formatting like commas or currency symbols.`,

    organic_trend: `Analyze this SEMrush organic keywords trend chart and extract the following data in JSON format:
{
  "dataPoints": [
    {"month": "Jan 2024", "traffic": number},
    {"month": "Feb 2024", "traffic": number}
  ],
  "trend": "up" | "down" | "stable",
  "top3": number (most recent Top 3 count),
  "top10": number (most recent Top 4-10 count),
  "top20": number (most recent Top 11-20 count),
  "top50": number (most recent Top 21-50 count),
  "top100": number (most recent Top 51-100 count)
}

Extract the trend line data and keyword distribution by position ranges.`,

    top_keywords: `Analyze this SEMrush top keywords table and extract up to 20 top keywords in JSON format:
{
  "keywords": [
    {
      "keyword": string,
      "position": number,
      "volume": number (search volume),
      "traffic": number (traffic percentage),
      "kd": number (keyword difficulty, 0-100)
    }
  ]
}

Look for columns like Keyword, Position, Volume, Traffic %, KD%.`,

    intent_distribution: `Analyze this SEMrush search intent distribution chart and extract the following data in JSON format:
{
  "informational": number (percentage 0-100),
  "navigational": number (percentage 0-100),
  "commercial": number (percentage 0-100),
  "transactional": number (percentage 0-100)
}

The percentages should add up to approximately 100.`,

    search_positions: `Analyze this SEMrush search positions distribution and extract the following data in JSON format:
{
  "top3": number (keywords in positions 1-3),
  "top10": number (keywords in positions 4-10),
  "top20": number (keywords in positions 11-20),
  "top100": number (keywords in positions 21-100)
}

Extract the distribution of keywords across different position ranges.`,

    position_changes: `Analyze this SEMrush position changes section and extract the following data in JSON format:
{
  "improved": number (keywords that improved position),
  "declined": number (keywords that declined position),
  "lost": number (keywords lost from rankings),
  "new": number (new keywords appeared in rankings)
}

Look for metrics showing position movement trends.`,

    page_changes: `Analyze this SEMrush page changes table and extract top 10 pages in JSON format:
{
  "pages": [
    {
      "url": string,
      "traffic": number,
      "trafficDiff": number (can be negative)
    }
  ]
}

Extract URL, traffic values, and traffic change metrics.`,

    competitive_map: `Analyze this SEMrush competitive positioning map and competitors table, extract in JSON format:
{
  "competitors": [
    {
      "domain": string,
      "commonKeywords": number,
      "traffic": number
    }
  ]
}

Extract up to 10 top competitors with their metrics.`,

    organic_pages: `Analyze this SEMrush organic pages table and extract top 10 pages in JSON format:
{
  "pages": [
    {
      "url": string,
      "traffic": number,
      "keywords": number (keyword count for this page)
    }
  ]
}

Look for columns showing URL, Traffic, and Keywords count.`,
  };

  return prompts[sectionType] || "Extract all visible data from this screenshot in JSON format.";
}

export async function analyzeScreenshot(
  screenshotPath: string,
  sectionType: SectionType,
  customPrompt?: string
): Promise<ExtractedData> {
  const prompt = customPrompt || getSectionPrompt(sectionType);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.log(`[GEMINI] Retry ${attempt}/${MAX_RETRIES} after ${backoffDelay}ms`);
        await delay(backoffDelay);
      }

      await throttleRequest();

      const imageBytes = fs.readFileSync(screenshotPath);

      const response = await generateContentWithFallback((model) => ({
        model,
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            inlineData: {
              data: imageBytes.toString("base64"),
              mimeType: "image/png",
            },
          },
          prompt,
        ],
      }));

      const rawJson = response.text;

      if (rawJson) {
        const data = JSON.parse(rawJson);
        console.log(`[GEMINI] Successfully analyzed ${sectionType}`);
        return {
          success: true,
          data,
          confidence: 0.85,
          method: "ai_vision",
        };
      } else {
        throw new Error("Empty response from Gemini");
      }
    } catch (error: any) {
      console.error(`[GEMINI] Attempt ${attempt + 1} failed for ${sectionType}:`, error?.message || error);

      if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
        if (attempt < MAX_RETRIES) {
          await delay(5000);
          continue;
        }
      }

      if (attempt === MAX_RETRIES) {
        return {
          success: false,
          data: null,
          confidence: 0,
          method: "ai_vision",
        };
      }
    }
  }

  return {
    success: false,
    data: null,
    confidence: 0,
    method: "ai_vision",
  };
}

export async function processCrawlResults(
  sections: SectionData[],
  enableAI: boolean,
  domain: string
): Promise<{ metrics: Partial<InsertMetrics>; insights: Partial<InsertInsight>[] }> {
  const processedSections = [...sections];

  if (enableAI) {
    console.log(`[GEMINI] Processing ${sections.length} sections with AI vision`);

    for (let i = 0; i < processedSections.length; i++) {
      const section = processedSections[i];

      if (section.screenshotPath && section.extractionMethod === "pending") {
        try {
          const result = await analyzeScreenshot(section.screenshotPath, section.sectionType);

          if (result.success) {
            section.extractedData = result.data;
            section.extractionMethod = "ai_vision";
            section.notes = "AI vision extraction successful";
          } else {
            section.extractionMethod = "pending";
            section.notes = "AI vision extraction failed";
          }
        } catch (error: any) {
          console.error(`[GEMINI] Failed to process section ${section.sectionType}:`, error?.message);
          section.extractionMethod = "pending";
          section.notes = `Extraction failed: ${error?.message || "Unknown error"}`;
        }
      }
    }
  }

  const metrics = aggregateMetrics(processedSections);

  const insights = enableAI
    ? await generateProspectInsights(domain, metrics, processedSections)
    : [];

  const scores = enableAI
    ? await calculateProspectScore(metrics)
    : calculateScoreFallback(metrics);

  metrics.prospectScore = scores.prospectScore;
  metrics.declineScore = scores.declineScore;
  metrics.opportunityScore = scores.opportunityScore;

  console.log(`[GEMINI] Processing complete: ${insights.length} insights generated`);

  return {
    metrics,
    insights: insights.map((insight) => ({
      insightType: insight.insightType,
      title: insight.title,
      summary: insight.summary,
      details: insight.details,
      severity: insight.severity,
      confidence: insight.confidence,
    })),
  };
}

function aggregateMetrics(sections: SectionData[]): Partial<InsertMetrics> {
  const metrics: Partial<InsertMetrics> = {
    totalKeywords: 0,
    organicTraffic: 0,
    trafficCost: 0,
    brandedTraffic: 0,
    nonBrandedTraffic: 0,
    top3Keywords: 0,
    top10Keywords: 0,
    top20Keywords: 0,
    top50Keywords: 0,
    top100Keywords: 0,
    intentInformational: 0,
    intentNavigational: 0,
    intentCommercial: 0,
    intentTransactional: 0,
    positionsImproved: 0,
    positionsDeclined: 0,
    positionsNew: 0,
    positionsLost: 0,
    competitorsCount: 0,
  };

  for (const section of sections) {
    const data = section.extractedData;
    if (!data) continue;

    switch (section.sectionType) {
      case "header_kpis":
        metrics.totalKeywords = data.keywords || 0;
        metrics.organicTraffic = data.organicTraffic || 0;
        metrics.trafficCost = data.trafficCost || 0;
        metrics.brandedTraffic = data.brandedTraffic || 0;
        metrics.nonBrandedTraffic = data.nonBrandedTraffic || 0;
        break;

      case "organic_trend":
        metrics.top3Keywords = data.top3 || 0;
        metrics.top10Keywords = data.top10 || 0;
        metrics.top20Keywords = data.top20 || 0;
        metrics.top50Keywords = data.top50 || 0;
        metrics.top100Keywords = data.top100 || 0;
        break;

      case "search_positions":
        if (!metrics.top3Keywords) metrics.top3Keywords = data.top3 || 0;
        if (!metrics.top10Keywords) metrics.top10Keywords = data.top10 || 0;
        if (!metrics.top20Keywords) metrics.top20Keywords = data.top20 || 0;
        if (!metrics.top100Keywords) metrics.top100Keywords = data.top100 || 0;
        break;

      case "intent_distribution":
        metrics.intentInformational = data.informational || 0;
        metrics.intentNavigational = data.navigational || 0;
        metrics.intentCommercial = data.commercial || 0;
        metrics.intentTransactional = data.transactional || 0;
        break;

      case "position_changes":
        metrics.positionsImproved = data.improved || 0;
        metrics.positionsDeclined = data.declined || 0;
        metrics.positionsNew = data.new || 0;
        metrics.positionsLost = data.lost || 0;
        break;

      case "competitive_map":
        metrics.competitorsCount = data.competitors?.length || 0;
        break;
    }
  }

  return metrics;
}

export async function generateProspectInsights(
  domain: string,
  metrics: any,
  sections: SectionData[]
): Promise<ProspectInsight[]> {
  try {
    await throttleRequest();

    const systemPrompt = `You are an SEO analysis expert specializing in identifying prospecting opportunities.
Analyze the provided domain metrics and SEMrush data to identify:
1. Decline patterns (traffic drops, ranking losses)
2. Opportunity signals (weak rankings with high potential, under-monetized intent mix)
3. Competitive gaps (competitors outranking with better traffic)
4. Technical issues that might indicate need for SEO help

Return insights as JSON array with this schema:
[{
  "insightType": "decline_pattern" | "opportunity" | "competitive_gap" | "technical_issue",
  "title": "Brief title",
  "summary": "One sentence summary",
  "details": "Detailed explanation with specific numbers",
  "severity": "low" | "medium" | "high",
  "confidence": 0-100
}]

Generate 3-5 most important insights. Be specific and actionable.`;

    const dataPayload = JSON.stringify(
      {
        domain,
        metrics,
        sectionCount: sections.length,
        sections: sections.map((s) => ({
          type: s.sectionType,
          hasData: !!s.extractedData,
          method: s.extractionMethod,
        })),
      },
      null,
      2
    );

    const response = await generateContentWithFallback((model) => ({
      model,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `Analyze this SEO data for prospecting opportunities:\n\n${dataPayload}`,
    }));

    const rawJson = response.text;

    if (rawJson) {
      const insights: ProspectInsight[] = JSON.parse(rawJson);
      console.log(`[GEMINI] Generated ${insights.length} insights for ${domain}`);
      return insights;
    }

    return [];
  } catch (error: any) {
    console.error(`[GEMINI] Failed to generate insights for ${domain}:`, error?.message);
    return [];
  }
}

export async function calculateProspectScore(
  metrics: any
): Promise<{ prospectScore: number; declineScore: number; opportunityScore: number }> {
  try {
    await throttleRequest();

    const systemPrompt = `You are an SEO scoring algorithm. Analyze these metrics and return scores:
- prospectScore (0-100): Overall target quality (higher = better prospect)
- declineScore (0-100): Severity of decline signals (higher = more decline)
- opportunityScore (0-100): Easy win potential (higher = more opportunity)

Consider factors:
- Keyword distribution (favor low Top 3%, high 21-100%)
- Intent mix (under-monetized = higher opportunity)
- Position changes (high declined vs improved = higher decline)
- Traffic/cost ratios (low authority = opportunity)

Return JSON: {"prospectScore": number, "declineScore": number, "opportunityScore": number}`;

    const response = await generateContentWithFallback((model) => ({
      model,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: JSON.stringify(metrics, null, 2),
    }));

    const rawJson = response.text;

    if (rawJson) {
      const scores = JSON.parse(rawJson);
      console.log(`[GEMINI] Calculated scores: ${JSON.stringify(scores)}`);
      return scores;
    }

    return calculateScoreFallback(metrics);
  } catch (error: any) {
    console.error(`[GEMINI] Failed to calculate prospect score with AI:`, error?.message);
    return calculateScoreFallback(metrics);
  }
}

function calculateScoreFallback(metrics: any): {
  prospectScore: number;
  declineScore: number;
  opportunityScore: number;
} {
  const total = metrics.totalKeywords || 1;
  const top3Pct = ((metrics.top3Keywords || 0) / total) * 100;
  const weakPct = (((metrics.top50Keywords || 0) - (metrics.top20Keywords || 0)) / total) * 100;

  const declineScore = Math.min(
    100,
    Math.round(((metrics.positionsDeclined || 0) / Math.max(metrics.positionsImproved || 1, 1)) * 50)
  );

  const opportunityScore = Math.min(100, Math.round(weakPct * 2 + (top3Pct < 10 ? 30 : 0)));

  const prospectScore = Math.min(
    100,
    Math.round(declineScore * 0.4 + opportunityScore * 0.6)
  );

  return { prospectScore, declineScore, opportunityScore };
}
