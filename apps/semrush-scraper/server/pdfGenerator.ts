import PDFDocument from "pdfkit";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import { GoogleGenAI } from "@google/genai";
import type { Metrics, Insight } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
      console.warn(`[PDF] Gemini model ${model} failed:`, error?.message || error);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "All Gemini model attempts failed"));
}

interface PDFData {
  domain: string;
  prospectScore: number;
  metrics: Metrics | undefined;
  insights: Insight[];
  screenshots: Map<string, Buffer>;
  executiveSummary: string;
  outreachPoints: string[];
}

export async function generateDomainPDF(snapshotId: string): Promise<Buffer> {
  console.log(`[PDF] Generating PDF for snapshot ${snapshotId}`);

  const snapshot = await storage.getSnapshot(snapshotId);
  if (!snapshot) {
    throw new Error("Snapshot not found");
  }

  const domain = snapshot.domain;
  if (!domain) {
    throw new Error("Domain not found for snapshot");
  }

  const metrics = snapshot.metrics;
  const insights = snapshot.insights || [];
  const sections = snapshot.sections || [];

  const objectStorage = new ObjectStorageService();
  const screenshots = new Map<string, Buffer>();

  const priorityScreenshots = [
    "header_kpis",
    "organic_trend",
    "top_keywords",
    "intent_distribution",
  ];

  for (const sectionType of priorityScreenshots) {
    const section = sections.find((s) => s.sectionType === sectionType);
    if (section?.screenshotPath) {
      try {
        const buffer = await objectStorage.getScreenshotBuffer(section.screenshotPath);
        if (buffer) {
          screenshots.set(sectionType, buffer);
          console.log(`[PDF] Loaded screenshot: ${sectionType}`);
        }
      } catch (error) {
        console.warn(`[PDF] Failed to load screenshot ${sectionType}:`, error);
      }
    }
  }

  const executiveSummary = await generateExecutiveSummary(
    domain.domain,
    metrics,
    insights
  );

  const outreachPoints = await generateOutreachPoints(
    domain.domain,
    metrics,
    insights
  );

  const pdfData: PDFData = {
    domain: domain.domain,
    prospectScore: metrics?.prospectScore || 0,
    metrics,
    insights,
    screenshots,
    executiveSummary,
    outreachPoints,
  };

  return createPDF(pdfData);
}

async function generateExecutiveSummary(
  domain: string,
  metrics: Metrics | undefined,
  insights: Insight[]
): Promise<string> {
  try {
    const prompt = `Generate a 2-3 sentence executive summary for this domain's SEO situation and why it's a good prospect for outreach.

Domain: ${domain}

Metrics:
- Organic Traffic: ${metrics?.organicTraffic?.toLocaleString() || "N/A"}/mo
- Total Keywords: ${metrics?.totalKeywords?.toLocaleString() || "N/A"}
- Traffic Cost: $${metrics?.trafficCost?.toLocaleString() || "N/A"}
- Prospect Score: ${metrics?.prospectScore || 0}/100
- Top 3 Keywords: ${metrics?.top3Keywords || 0}
- Top 10 Keywords: ${metrics?.top10Keywords || 0}
- Positions Improved: ${metrics?.positionsImproved || 0}
- Positions Declined: ${metrics?.positionsDeclined || 0}

Key Insights:
${insights.slice(0, 3).map((i) => `- ${i.summary}`).join("\n")}

Write a professional, compelling summary that highlights the opportunity.`;

    const response = await generateContentWithFallback((model) => ({
      model,
      contents: prompt,
    }));

    const summary = response.text?.trim() || "";
    if (summary) {
      console.log("[PDF] Generated executive summary");
      return summary;
    }

    return generateFallbackSummary(domain, metrics, insights);
  } catch (error) {
    console.warn("[PDF] Failed to generate AI summary, using fallback:", error);
    return generateFallbackSummary(domain, metrics, insights);
  }
}

function generateFallbackSummary(
  domain: string,
  metrics: Metrics | undefined,
  insights: Insight[]
): string {
  const traffic = metrics?.organicTraffic || 0;
  const score = metrics?.prospectScore || 0;
  const declined = metrics?.positionsDeclined || 0;

  let summary = `${domain} is `;

  if (score >= 70) {
    summary += "a high-priority prospect with significant SEO opportunity. ";
  } else if (score >= 40) {
    summary += "a promising prospect with notable SEO potential. ";
  } else {
    summary += "showing potential for SEO improvement. ";
  }

  if (declined > 0 || insights.some((i) => i.insightType === "decline_pattern")) {
    summary += `Recent ranking declines indicate a need for expert SEO intervention. `;
  } else {
    summary += `There are opportunities to improve organic visibility and traffic. `;
  }

  summary += `With ${traffic.toLocaleString()} monthly organic visitors, strategic optimization could drive substantial growth.`;

  return summary;
}

async function generateOutreachPoints(
  domain: string,
  metrics: Metrics | undefined,
  insights: Insight[]
): Promise<string[]> {
  try {
    const prompt = `Generate 3-4 specific outreach talking points for a sales prospect based on their SEO data.

Domain: ${domain}

Metrics:
- Organic Traffic: ${metrics?.organicTraffic?.toLocaleString() || "N/A"}/mo
- Total Keywords: ${metrics?.totalKeywords?.toLocaleString() || "N/A"}
- Positions Improved: ${metrics?.positionsImproved || 0}
- Positions Declined: ${metrics?.positionsDeclined || 0}
- Positions Lost: ${metrics?.positionsLost || 0}

Key Insights:
${insights.map((i) => `- ${i.summary}`).join("\n")}

Convert technical SEO insights into compelling sales talking points. Focus on:
1. Pain points and problems identified
2. Specific opportunities for improvement
3. Potential business impact
4. Clear value proposition

Return only the talking points as a JSON array of strings.`;

    const response = await generateContentWithFallback((model) => ({
      model,
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    }));

    const rawJson = response.text;
    if (rawJson) {
      const points = JSON.parse(rawJson);
      if (Array.isArray(points) && points.length > 0) {
        console.log("[PDF] Generated outreach points");
        return points.slice(0, 4);
      }
    }

    return generateFallbackOutreachPoints(metrics, insights);
  } catch (error) {
    console.warn("[PDF] Failed to generate AI outreach points, using fallback:", error);
    return generateFallbackOutreachPoints(metrics, insights);
  }
}

function generateFallbackOutreachPoints(
  metrics: Metrics | undefined,
  insights: Insight[]
): string[] {
  const points: string[] = [];

  if (metrics?.positionsDeclined && metrics.positionsDeclined > 0) {
    points.push(
      `Recent organic ranking declines indicate potential algorithm updates or competitive pressure that require immediate attention to prevent further traffic loss.`
    );
  }

  if (metrics?.positionsLost && metrics.positionsLost > 0) {
    points.push(
      `Lost rankings for ${metrics.positionsLost} keywords represent missed revenue opportunities that can be recovered with strategic SEO optimization.`
    );
  }

  const opportunityInsights = insights.filter((i) => i.insightType === "opportunity");
  if (opportunityInsights.length > 0) {
    points.push(
      `Analysis reveals untapped opportunities in keyword targeting and content optimization that competitors are already exploiting.`
    );
  }

  const competitiveInsights = insights.filter((i) => i.insightType === "competitive_gap");
  if (competitiveInsights.length > 0) {
    points.push(
      `Competitive analysis shows gaps where targeted improvements could significantly increase market share and organic visibility.`
    );
  }

  if (points.length === 0) {
    points.push(
      `Comprehensive SEO audit reveals multiple opportunities for traffic growth and improved search visibility.`,
      `Strategic optimization of existing content and keyword targeting can drive measurable business results.`,
      `Our proven methodology has helped similar domains achieve 30-50% traffic growth within 6 months.`
    );
  }

  return points.slice(0, 4);
}

function createPDF(data: PDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    let y = margin;

    y = drawHeader(doc, data, y, contentWidth);

    y = drawExecutiveSummary(doc, data.executiveSummary, y, contentWidth);

    y = drawMetrics(doc, data.metrics, y, contentWidth);

    y = drawScreenshots(doc, data.screenshots, y, contentWidth, pageHeight, margin);

    if (y < pageHeight - margin - 100) {
      y = drawInsights(doc, data.insights, y, contentWidth, pageHeight, margin);
    }

    if (y < pageHeight - margin - 100) {
      y = drawOutreachPoints(doc, data.outreachPoints, y, contentWidth, pageHeight, margin);
    }

    doc.end();
  });
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  data: PDFData,
  y: number,
  contentWidth: number
): number {
  const scoreColor = getScoreColor(data.prospectScore);

  doc.fontSize(24).font("Helvetica-Bold").fillColor("#1a1a1a").text(
    `SEO Prospect Report`,
    40,
    y,
    { width: contentWidth - 80 }
  );

  const circleX = 40 + contentWidth - 50;
  const circleY = y + 12;
  doc
    .circle(circleX, circleY, 30)
    .fillAndStroke(scoreColor, "#333333")
    .strokeColor("#333333")
    .lineWidth(2);

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text(String(data.prospectScore), circleX - 15, circleY - 8, {
      width: 30,
      align: "center",
    });

  y += 35;

  doc
    .fontSize(16)
    .font("Helvetica")
    .fillColor("#4a4a4a")
    .text(`Domain: ${data.domain}`, 40, y);

  y += 25;

  doc
    .moveTo(40, y)
    .lineTo(40 + contentWidth, y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();

  return y + 20;
}

function drawExecutiveSummary(
  doc: PDFKit.PDFDocument,
  summary: string,
  y: number,
  contentWidth: number
): number {
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("EXECUTIVE SUMMARY", 40, y);

  y += 20;

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#4a4a4a")
    .text(summary, 40, y, {
      width: contentWidth,
      align: "left",
      lineGap: 3,
    });

  y += doc.heightOfString(summary, { width: contentWidth, lineGap: 3 }) + 20;

  doc
    .moveTo(40, y)
    .lineTo(40 + contentWidth, y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();

  return y + 15;
}

function drawMetrics(
  doc: PDFKit.PDFDocument,
  metrics: Metrics | undefined,
  y: number,
  contentWidth: number
): number {
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("KEY METRICS", 40, y);

  y += 20;

  const columnWidth = contentWidth / 2 - 10;
  const leftX = 40;
  const rightX = 40 + columnWidth + 20;

  const metricsData = [
    {
      label: "Organic Traffic",
      value: `${(metrics?.organicTraffic || 0).toLocaleString()}/mo`,
    },
    {
      label: "Total Keywords",
      value: (metrics?.totalKeywords || 0).toLocaleString(),
    },
    {
      label: "Traffic Cost",
      value: `$${(metrics?.trafficCost || 0).toLocaleString()}`,
    },
    {
      label: "Top 3 Keywords",
      value: (metrics?.top3Keywords || 0).toLocaleString(),
    },
    {
      label: "Positions Improved",
      value: (metrics?.positionsImproved || 0).toLocaleString(),
    },
    {
      label: "Positions Declined",
      value: (metrics?.positionsDeclined || 0).toLocaleString(),
    },
  ];

  let currentY = y;
  doc.fontSize(9).font("Helvetica");

  metricsData.forEach((metric, index) => {
    const x = index % 2 === 0 ? leftX : rightX;
    const rowY = currentY + Math.floor(index / 2) * 18;

    doc.fillColor("#666666").text(`• ${metric.label}:`, x, rowY);
    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text(metric.value, x + 120, rowY);
    doc.font("Helvetica");
  });

  y = currentY + Math.ceil(metricsData.length / 2) * 18 + 15;

  doc
    .moveTo(40, y)
    .lineTo(40 + contentWidth, y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();

  return y + 15;
}

function drawScreenshots(
  doc: PDFKit.PDFDocument,
  screenshots: Map<string, Buffer>,
  y: number,
  contentWidth: number,
  pageHeight: number,
  margin: number
): number {
  if (screenshots.size === 0) {
    return y;
  }

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("SCREENSHOTS", 40, y);

  y += 20;

  const availableHeight = pageHeight - y - margin - 150;
  const gridSize = 2;
  const gap = 10;
  const imageWidth = (contentWidth - gap) / gridSize;
  const imageHeight = Math.min(availableHeight / gridSize - gap, imageWidth * 0.6);

  const screenshotTypes = [
    { type: "header_kpis", label: "Header KPIs" },
    { type: "organic_trend", label: "Organic Trend" },
    { type: "top_keywords", label: "Top Keywords" },
    { type: "intent_distribution", label: "Intent Distribution" },
  ];

  let drawn = 0;
  screenshotTypes.forEach((screenshot, index) => {
    const buffer = screenshots.get(screenshot.type);
    if (!buffer || drawn >= 4) return;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = 40 + col * (imageWidth + gap);
    const imageY = y + row * (imageHeight + gap + 15);

    try {
      doc.image(buffer, x, imageY, {
        fit: [imageWidth, imageHeight],
        align: "center",
        valign: "center",
      });

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#666666")
        .text(screenshot.label, x, imageY + imageHeight + 2, {
          width: imageWidth,
          align: "center",
        });

      drawn++;
    } catch (error) {
      console.warn(`[PDF] Failed to embed screenshot ${screenshot.type}:`, error);
    }
  });

  if (drawn > 0) {
    const rows = Math.ceil(drawn / gridSize);
    y += rows * (imageHeight + gap + 15) + 10;
  }

  doc
    .moveTo(40, y)
    .lineTo(40 + contentWidth, y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();

  return y + 15;
}

function drawInsights(
  doc: PDFKit.PDFDocument,
  insights: Insight[],
  y: number,
  contentWidth: number,
  pageHeight: number,
  margin: number
): number {
  if (insights.length === 0 || y > pageHeight - margin - 80) {
    return y;
  }

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("TOP INSIGHTS", 40, y);

  y += 20;

  const maxInsights = Math.min(insights.length, 4);
  const topInsights = insights
    .sort((a, b) => {
      const severityScore = { high: 3, medium: 2, low: 1 };
      const aScore =
        severityScore[a.severity as keyof typeof severityScore] || 0;
      const bScore =
        severityScore[b.severity as keyof typeof severityScore] || 0;
      return bScore - aScore;
    })
    .slice(0, maxInsights);

  doc.fontSize(9).font("Helvetica");

  topInsights.forEach((insight) => {
    const icon = getSeverityIcon(insight.severity || "low");
    const text = `${icon} ${insight.summary}`;

    const textHeight = doc.heightOfString(text, {
      width: contentWidth - 20,
      lineGap: 2,
    });

    if (y + textHeight > pageHeight - margin - 50) {
      return;
    }

    doc.fillColor("#4a4a4a").text(text, 50, y, {
      width: contentWidth - 20,
      lineGap: 2,
    });

    y += textHeight + 8;
  });

  y += 5;

  doc
    .moveTo(40, y)
    .lineTo(40 + contentWidth, y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();

  return y + 15;
}

function drawOutreachPoints(
  doc: PDFKit.PDFDocument,
  points: string[],
  y: number,
  contentWidth: number,
  pageHeight: number,
  margin: number
): number {
  if (points.length === 0 || y > pageHeight - margin - 60) {
    return y;
  }

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("OUTREACH TALKING POINTS", 40, y);

  y += 20;

  doc.fontSize(9).font("Helvetica");

  points.forEach((point, index) => {
    const text = `${index + 1}. ${point}`;

    const textHeight = doc.heightOfString(text, {
      width: contentWidth - 20,
      lineGap: 2,
    });

    if (y + textHeight > pageHeight - margin - 20) {
      return;
    }

    doc.fillColor("#4a4a4a").text(text, 50, y, {
      width: contentWidth - 20,
      lineGap: 2,
    });

    y += textHeight + 8;
  });

  return y;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case "high":
      return "●";
    case "medium":
      return "▲";
    case "low":
      return "○";
    default:
      return "•";
  }
}
