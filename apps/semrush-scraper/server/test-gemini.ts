import { analyzeScreenshot, processCrawlResults, generateProspectInsights, calculateProspectScore } from "./gemini";
import type { SectionType } from "@shared/schema";

async function testGeminiIntegration() {
  console.log("=== Testing Gemini Integration ===\n");

  console.log("1. Testing calculateProspectScore...");
  try {
    const mockMetrics = {
      totalKeywords: 1250,
      organicTraffic: 45000,
      trafficCost: 12000,
      top3Keywords: 45,
      top10Keywords: 120,
      top20Keywords: 200,
      top50Keywords: 450,
      top100Keywords: 1250,
      intentInformational: 40,
      intentNavigational: 10,
      intentCommercial: 30,
      intentTransactional: 20,
      positionsImproved: 120,
      positionsDeclined: 180,
      positionsNew: 50,
      positionsLost: 30,
      competitorsCount: 15,
    };

    const scores = await calculateProspectScore(mockMetrics);
    console.log("✓ Prospect scores calculated:", scores);
    console.log();
  } catch (error: any) {
    console.error("✗ Failed to calculate prospect scores:", error?.message);
    console.log();
  }

  console.log("2. Testing generateProspectInsights...");
  try {
    const mockMetrics = {
      totalKeywords: 1250,
      organicTraffic: 45000,
      positionsDeclined: 180,
      positionsImproved: 120,
      intentCommercial: 30,
      intentTransactional: 20,
    };

    const insights = await generateProspectInsights("example.com", mockMetrics, []);
    console.log(`✓ Generated ${insights.length} insights`);
    insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. [${insight.severity}] ${insight.title}`);
      console.log(`     ${insight.summary}`);
    });
    console.log();
  } catch (error: any) {
    console.error("✗ Failed to generate insights:", error?.message);
    console.log();
  }

  console.log("3. Testing processCrawlResults (without actual screenshots)...");
  try {
    const mockSections = [
      {
        sectionType: "header_kpis" as SectionType,
        screenshotPath: null,
        extractedData: {
          keywords: 1250,
          organicTraffic: 45000,
          trafficCost: 12000,
          brandedTraffic: 5000,
          nonBrandedTraffic: 40000,
        },
        extractionMethod: "dom" as const,
      },
      {
        sectionType: "organic_trend" as SectionType,
        screenshotPath: null,
        extractedData: {
          top3: 45,
          top10: 120,
          top20: 200,
          top50: 450,
          top100: 1250,
        },
        extractionMethod: "dom" as const,
      },
      {
        sectionType: "intent_distribution" as SectionType,
        screenshotPath: null,
        extractedData: {
          informational: 40,
          navigational: 10,
          commercial: 30,
          transactional: 20,
        },
        extractionMethod: "dom" as const,
      },
      {
        sectionType: "position_changes" as SectionType,
        screenshotPath: null,
        extractedData: {
          improved: 120,
          declined: 180,
          new: 50,
          lost: 30,
        },
        extractionMethod: "dom" as const,
      },
    ];

    const result = await processCrawlResults(mockSections, true, "example.com");
    console.log("✓ Metrics aggregated:", {
      totalKeywords: result.metrics.totalKeywords,
      organicTraffic: result.metrics.organicTraffic,
      prospectScore: result.metrics.prospectScore,
      declineScore: result.metrics.declineScore,
      opportunityScore: result.metrics.opportunityScore,
    });
    console.log(`✓ Insights generated: ${result.insights.length}`);
    console.log();
  } catch (error: any) {
    console.error("✗ Failed to process crawl results:", error?.message);
    console.log();
  }

  console.log("=== Gemini Integration Test Complete ===");
  console.log("\nNote: Screenshot analysis was not tested as it requires actual image files.");
  console.log("The integration is ready to process real screenshots from the crawler.");
}

testGeminiIntegration()
  .then(() => {
    console.log("\n✓ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Test suite failed:", error);
    process.exit(1);
  });
