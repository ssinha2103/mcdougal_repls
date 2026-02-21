import * as XLSX from "xlsx";
import type { Domain } from "@shared/schema";

export class ExcelExportService {
  /**
   * Generate Excel file with enriched domain data and color coding
   */
  static generateExport(domains: Domain[], filename: string): Buffer {
    // Group domains by category
    const maDomains = domains.filter((d) => d.category === "MA");
    const nationalDomains = domains.filter((d) => d.category === "National");

    const workbook = XLSX.utils.book_new();

    // Create MA sheet
    if (maDomains.length > 0) {
      const maSheet = this.createSheet(maDomains);
      XLSX.utils.book_append_sheet(workbook, maSheet, "MA Law Firms");
    }

    // Create National sheet
    if (nationalDomains.length > 0) {
      const nationalSheet = this.createSheet(nationalDomains);
      XLSX.utils.book_append_sheet(workbook, nationalSheet, "National Law Firms");
    }

    // Generate buffer
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  private static createSheet(domains: Domain[]): XLSX.WorkSheet {
    const data = domains.map((d) => ({
      "Company Name": d.companyName,
      "Data Source": d.dataSource === "semrush" ? "SEMrush" : d.dataSource === "dataforseo" ? "DataForSEO" : "—",
      "Web Address": d.webAddress,
      "Organic Traffic": d.organicTraffic || "—",
      "Keywords Top 100": d.keywordsTop100 || "—",
      "Traffic Value": d.trafficValue ? `$${d.trafficValue.toLocaleString()}` : "—",
      "Trend (3mo)": d.trafficTrend3mo !== null ? `${d.trafficTrend3mo > 0 ? "+" : ""}${d.trafficTrend3mo}%` : "—",
      "Performance Score": d.performanceScore !== null ? d.performanceScore : "—",
      "Mobile Score": d.mobileScore !== null ? d.mobileScore : "—",
      "Desktop Score": d.desktopScore !== null ? d.desktopScore : "—",
      "FCP (ms)": d.fcp !== null ? Math.round(d.fcp) : "—",
      "LCP (ms)": d.lcp !== null ? Math.round(d.lcp) : "—",
      "FID (ms)": d.fid !== null ? Math.round(d.fid) : "—",
      "CLS": d.cls !== null ? d.cls.toFixed(3) : "—",
      "Pages Indexed": d.pagesIndexed || "—",
      "AI Overview Visibility": this.getAIVisibilityLabel(d.aiOverviewVisibilityScore),
      "Priority Score": this.getPriorityLabel(d.priorityScore),
      "Urgency Flag": this.getUrgencyLabel(d.trafficTrend3mo),
      "Performance Status": this.getPerformanceLabel(d.performanceScore),
    }));

    const sheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    sheet["!cols"] = [
      { wch: 35 }, // Company Name
      { wch: 15 }, // Data Source
      { wch: 30 }, // Web Address
      { wch: 15 }, // Organic Traffic
      { wch: 18 }, // Keywords Top 100
      { wch: 15 }, // Traffic Value
      { wch: 15 }, // Trend
      { wch: 18 }, // Performance Score
      { wch: 15 }, // Mobile Score
      { wch: 15 }, // Desktop Score
      { wch: 12 }, // FCP
      { wch: 12 }, // LCP
      { wch: 12 }, // FID
      { wch: 10 }, // CLS
      { wch: 15 }, // Pages Indexed
      { wch: 25 }, // AI Overview Visibility
      { wch: 20 }, // Priority Score
      { wch: 15 }, // Urgency Flag
      { wch: 20 }, // Performance Status
    ];
    
    return sheet;
  }

  private static getAIVisibilityLabel(score: number | null): string {
    if (score === null || score === undefined) return "N/A";
    if (score === 100) return "100% - Visible";
    if (score === 50) return "50% - Partial";
    return "0% - Not Visible";
  }

  private static getUrgencyLabel(trend: number | null): string {
    if (trend === null) return "Unknown";
    if (trend < -15) return "Urgent";
    if (trend <= 5) return "Review";
    return "Healthy";
  }

  private static getPerformanceLabel(score: number | null): string {
    if (score === null) return "Not Measured";
    if (score < 50) return "Poor";
    if (score < 90) return "Needs Improvement";
    return "Good";
  }

  private static getPriorityLabel(score: number | null): string {
    if (score === null) return "N/A";
    const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
    return `${score} - ${level}`;
  }
}
