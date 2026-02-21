import { createCanvas } from "canvas";

export interface ChartDataPoint {
  month: string;
  traffic: number;
}

export class ChartRenderer {
  /**
   * Generate a line chart image showing traffic trend over 3 months
   * Returns base64-encoded PNG image
   */
  static generateTrafficTrendChart(
    data: ChartDataPoint[],
    companyName: string
  ): string {
    const width = 800;
    const height = 400;
    const padding = 60;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Find min and max values for scaling
    const values = data.map((d) => d.traffic);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // Chart area dimensions
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = maxValue - (valueRange / 4) * i;
      const y = padding + (chartHeight / 4) * i;
      ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y + 4);
    }

    // Calculate points
    const points: { x: number; y: number }[] = data.map((d, i) => {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      const normalizedValue = (d.traffic - minValue) / valueRange;
      const y = padding + chartHeight - normalizedValue * chartHeight;
      return { x, y };
    });

    // Draw line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#3b82f6";
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw X-axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    data.forEach((d, i) => {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      ctx.fillText(d.month, x, height - padding + 20);
    });

    // Draw title
    ctx.fillStyle = "#111827";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${companyName} - Traffic Trend`, width / 2, 30);

    // Convert to base64
    const buffer = canvas.toBuffer("image/png");
    return buffer.toString("base64");
  }

  /**
   * Generate a bar chart comparing keyword rankings
   */
  static generateKeywordComparisonChart(
    currentKeywords: number,
    competitorAvg: number,
    companyName: string
  ): string {
    const width = 600;
    const height = 400;
    const padding = 60;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Chart area dimensions
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / 4;
    const maxValue = Math.max(currentKeywords, competitorAvg) * 1.2;

    // Draw Y-axis grid and labels
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = (maxValue / 4) * (4 - i);
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y + 4);
    }

    // Draw bars
    const bars = [
      { label: companyName, value: currentKeywords, color: "#ef4444" },
      { label: "Competitor Avg", value: competitorAvg, color: "#10b981" },
    ];

    bars.forEach((bar, i) => {
      const x = padding + barWidth * (i + 0.5);
      const barHeight = (bar.value / maxValue) * chartHeight;
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = bar.color;
      ctx.fillRect(x - barWidth / 4, y, barWidth / 2, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(bar.value.toLocaleString(), x, y - 10);

      // Draw label below bar
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px Arial";
      ctx.fillText(bar.label, x, height - padding + 20);
    });

    // Draw title
    ctx.fillStyle = "#111827";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Keywords in Top 100", width / 2, 30);

    // Convert to base64
    const buffer = canvas.toBuffer("image/png");
    return buffer.toString("base64");
  }

  /**
   * Generate historical data points based on current traffic and trend
   */
  static generateHistoricalData(
    currentTraffic: number,
    trend: number
  ): ChartDataPoint[] {
    const months = ["3 months ago", "2 months ago", "1 month ago", "Current"];
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < months.length; i++) {
      if (i === 3) {
        data.push({ month: months[i], traffic: currentTraffic });
      } else {
        const monthsBack = 3 - i;
        const trendFactor = 1 + (trend / 100) * (monthsBack / 3);
        const historicalValue = Math.round(currentTraffic / trendFactor);
        data.push({ month: months[i], traffic: historicalValue });
      }
    }

    return data;
  }
}
