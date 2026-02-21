import type { Domain } from "@shared/schema";
import { ChartRenderer } from "./chart-renderer";

export interface EmailTemplateData {
  companyName: string;
  trafficDecline: number;
  keywordLoss: number;
  currentTraffic: number;
  currentKeywords: number;
  trafficValue: number;
  urgencyLevel: "urgent" | "review" | "healthy";
  performanceScore: number | null;
  webAddress: string;
  ctaLink?: string;
  senderName?: string;
  senderCompany?: string;
}

export class EmailTemplateService {
  /**
   * Generate a complete HTML email with embedded charts
   */
  static async generateEmail(
    domain: Domain,
    options: {
      ctaLink?: string;
      senderName?: string;
      senderCompany?: string;
      competitorAvgKeywords?: number;
    } = {}
  ): Promise<string> {
    const {
      ctaLink = "https://your-company.com/schedule",
      senderName = "Your SEO Team",
      senderCompany = "SEO Analytics Pro",
      competitorAvgKeywords = 150,
    } = options;

    // Calculate metrics
    const trafficDecline = domain.trafficTrend3mo || 0;
    const urgencyLevel = this.getUrgencyLevel(trafficDecline);
    
    // Generate chart images
    const historicalData = ChartRenderer.generateHistoricalData(
      domain.organicTraffic || 0,
      trafficDecline
    );
    const trafficChartBase64 = ChartRenderer.generateTrafficTrendChart(
      historicalData,
      domain.companyName
    );

    const keywordChartBase64 = ChartRenderer.generateKeywordComparisonChart(
      domain.keywordsTop100 || 0,
      competitorAvgKeywords,
      domain.companyName
    );

    // Build template data
    const templateData: EmailTemplateData = {
      companyName: domain.companyName,
      trafficDecline,
      keywordLoss: competitorAvgKeywords - (domain.keywordsTop100 || 0),
      currentTraffic: domain.organicTraffic || 0,
      currentKeywords: domain.keywordsTop100 || 0,
      trafficValue: domain.trafficValue || 0,
      urgencyLevel,
      performanceScore: domain.performanceScore,
      webAddress: domain.webAddress,
      ctaLink,
      senderName,
      senderCompany,
    };

    // Generate HTML
    const html = this.buildHtmlTemplate(
      templateData,
      trafficChartBase64,
      keywordChartBase64
    );

    return html;
  }

  /**
   * Build the HTML email template with all styling and content
   */
  private static buildHtmlTemplate(
    data: EmailTemplateData,
    trafficChartBase64: string,
    keywordChartBase64: string
  ): string {
    const urgencyColor = this.getUrgencyColor(data.urgencyLevel);
    const urgencyText = this.getUrgencyText(data.urgencyLevel);
    const declineText = data.trafficDecline < 0 
      ? `${Math.abs(data.trafficDecline).toFixed(1)}%` 
      : `+${data.trafficDecline.toFixed(1)}%`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>SEO Performance Alert - ${data.companyName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .urgency-banner {
      background-color: ${urgencyColor};
      color: #ffffff;
      padding: 20px 30px;
      text-align: center;
      font-weight: 600;
      font-size: 18px;
    }
    .content {
      padding: 40px 30px;
    }
    .intro {
      font-size: 16px;
      color: #374151;
      margin-bottom: 30px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .metric-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .metric-card .value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .metric-card .subtext {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 5px;
    }
    .decline {
      color: #ef4444;
    }
    .chart-section {
      margin: 40px 0;
    }
    .chart-section h2 {
      font-size: 20px;
      color: #111827;
      margin: 0 0 20px 0;
      font-weight: 600;
    }
    .chart-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .insights {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .insights h3 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 16px;
      font-weight: 600;
    }
    .insights ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #374151;
    }
    .insights li {
      margin: 8px 0;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .cta-section p {
      font-size: 16px;
      color: #374151;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #111827;
      color: #9ca3af;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #60a5fa;
      text-decoration: none;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 30px 20px;
      }
      .metric-card .value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>${data.companyName}</h1>
      <p>SEO Performance Analysis Report</p>
    </div>

    <!-- Urgency Banner -->
    <div class="urgency-banner">
      ${urgencyText}
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="intro">
        <p>Dear ${data.companyName} Team,</p>
        <p>Our automated SEO monitoring system has detected significant changes in your website's organic search performance that require immediate attention.</p>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Traffic Change</h3>
          <p class="value decline">${declineText}</p>
          <p class="subtext">Last 3 months</p>
        </div>
        <div class="metric-card">
          <h3>Current Traffic</h3>
          <p class="value">${data.currentTraffic.toLocaleString()}</p>
          <p class="subtext">Monthly visitors</p>
        </div>
        <div class="metric-card">
          <h3>Keywords Ranking</h3>
          <p class="value">${data.currentKeywords.toLocaleString()}</p>
          <p class="subtext">In top 100</p>
        </div>
        <div class="metric-card">
          <h3>Traffic Value</h3>
          <p class="value">$${data.trafficValue.toLocaleString()}</p>
          <p class="subtext">Estimated monthly</p>
        </div>
      </div>

      <!-- Traffic Trend Chart -->
      <div class="chart-section">
        <h2>Traffic Trend Analysis</h2>
        <img src="data:image/png;base64,${trafficChartBase64}" alt="Traffic Trend Chart" class="chart-image">
      </div>

      <!-- Keyword Comparison Chart -->
      <div class="chart-section">
        <h2>Keyword Performance vs Competitors</h2>
        <img src="data:image/png;base64,${keywordChartBase64}" alt="Keyword Comparison Chart" class="chart-image">
      </div>

      <!-- Insights -->
      <div class="insights">
        <h3>🔍 Key Findings</h3>
        <ul>
          <li><strong>Traffic Decline:</strong> Your website has experienced a ${Math.abs(data.trafficDecline).toFixed(1)}% decrease in organic traffic over the past 3 months.</li>
          ${data.keywordLoss > 0 ? `<li><strong>Keyword Gap:</strong> You're ranking for ${data.keywordLoss} fewer keywords compared to competitor averages.</li>` : ''}
          <li><strong>Estimated Loss:</strong> This decline represents approximately $${Math.round(data.trafficValue * (Math.abs(data.trafficDecline) / 100)).toLocaleString()} in monthly traffic value.</li>
          ${data.performanceScore !== null && data.performanceScore < 70 ? `<li><strong>Performance Issue:</strong> Your website's performance score (${data.performanceScore}/100) may be impacting rankings.</li>` : ''}
        </ul>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <p><strong>Let's reverse this trend together.</strong></p>
        <p>Schedule a free 30-minute consultation to discuss a customized SEO recovery plan for ${data.companyName}.</p>
        <a href="${data.ctaLink}" class="cta-button">Schedule Free Consultation</a>
      </div>

      <div class="intro">
        <p>We've helped dozens of law firms recover from similar situations and would love to share our proven strategies with you.</p>
        <p>Best regards,<br>
        <strong>${data.senderName}</strong><br>
        ${data.senderCompany}</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${data.senderCompany}</strong></p>
      <p>This analysis was generated automatically based on public SEO data for ${data.webAddress}</p>
      <p>© ${new Date().getFullYear()} ${data.senderCompany}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate plain text version of the email
   */
  static generatePlainText(domain: Domain, options: any = {}): string {
    const trafficDecline = domain.trafficTrend3mo || 0;
    const declineText = trafficDecline < 0 
      ? `${Math.abs(trafficDecline).toFixed(1)}%` 
      : `+${trafficDecline.toFixed(1)}%`;

    return `
${domain.companyName} - SEO Performance Alert

Dear ${domain.companyName} Team,

Our automated SEO monitoring system has detected significant changes in your website's organic search performance.

KEY METRICS:
- Traffic Change: ${declineText} (last 3 months)
- Current Monthly Traffic: ${(domain.organicTraffic || 0).toLocaleString()}
- Keywords Ranking: ${(domain.keywordsTop100 || 0).toLocaleString()}
- Traffic Value: $${(domain.trafficValue || 0).toLocaleString()}

Your website has experienced a ${Math.abs(trafficDecline).toFixed(1)}% decrease in organic traffic over the past 3 months.

Let's schedule a free consultation to discuss how we can help reverse this trend.

Schedule here: ${options.ctaLink || 'https://your-company.com/schedule'}

Best regards,
${options.senderName || 'Your SEO Team'}
${options.senderCompany || 'SEO Analytics Pro'}

---
This analysis was generated automatically based on public SEO data for ${domain.webAddress}
    `.trim();
  }

  /**
   * Helper methods
   */
  private static getUrgencyLevel(trend: number): "urgent" | "review" | "healthy" {
    if (trend < -15) return "urgent";
    if (trend <= 5) return "review";
    return "healthy";
  }

  private static getUrgencyColor(level: "urgent" | "review" | "healthy"): string {
    switch (level) {
      case "urgent":
        return "#ef4444";
      case "review":
        return "#f59e0b";
      case "healthy":
        return "#10b981";
    }
  }

  private static getUrgencyText(level: "urgent" | "review" | "healthy"): string {
    switch (level) {
      case "urgent":
        return "🚨 URGENT: Significant Traffic Decline Detected";
      case "review":
        return "⚠️ ATTENTION: Traffic Performance Needs Review";
      case "healthy":
        return "✅ POSITIVE: Traffic Performance Trending Upward";
    }
  }
}
