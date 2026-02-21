import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DomainWithMetrics } from "@shared/schema";

interface TrendChartProps {
  domains: DomainWithMetrics[];
}

export function TrendChart({ domains }: TrendChartProps) {
  // Prepare data for traffic trend chart
  const trafficData = domains.map((domain) => ({
    domain: domain.domain,
    traffic: domain.latestSnapshot?.metrics?.organicTraffic || 0,
    keywords: domain.latestSnapshot?.metrics?.totalKeywords || 0,
  }));

  // Prepare data for scatter plot
  const scatterData = domains.map((domain) => ({
    domain: domain.domain,
    traffic: domain.latestSnapshot?.metrics?.organicTraffic || 0,
    score: domain.latestSnapshot?.metrics?.prospectScore || 0,
  }));

  // Prepare data for keyword comparison
  const keywordData = domains.map((domain) => ({
    domain: domain.domain.length > 15 ? domain.domain.substring(0, 15) + "..." : domain.domain,
    top3: domain.latestSnapshot?.metrics?.top3Keywords || 0,
    top10: domain.latestSnapshot?.metrics?.top10Keywords || 0,
    top100: domain.latestSnapshot?.metrics?.top100Keywords || 0,
  }));

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  if (domains.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No data available for visualization
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traffic" data-testid="tab-traffic-chart">
            Traffic Trends
          </TabsTrigger>
          <TabsTrigger value="keywords" data-testid="tab-keywords-chart">
            Keyword Distribution
          </TabsTrigger>
          <TabsTrigger value="scatter" data-testid="tab-scatter-chart">
            Traffic vs Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Organic Traffic Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="domain"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="traffic"
                  fill={colors[0]}
                  name="Organic Traffic"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Keyword Rankings Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywordData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="domain"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar dataKey="top3" fill={colors[1]} name="Top 3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="top10" fill={colors[2]} name="Top 10" radius={[4, 4, 0, 0]} />
                <Bar dataKey="top100" fill={colors[3]} name="Top 100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="scatter" className="mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Traffic vs Prospect Score</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="traffic"
                  name="Traffic"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{
                    value: "Organic Traffic",
                    position: "insideBottom",
                    offset: -5,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  dataKey="score"
                  name="Score"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{
                    value: "Prospect Score",
                    angle: -90,
                    position: "insideLeft",
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "traffic" ? value.toLocaleString() : value,
                    name === "traffic" ? "Traffic" : "Score",
                  ]}
                />
                <Scatter
                  data={scatterData}
                  fill={colors[4]}
                  name="Domains"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
