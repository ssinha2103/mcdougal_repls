import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3 } from "lucide-react";
import type { Domain } from "@shared/schema";

interface ComparisonChartsProps {
  selectedDomains: Domain[];
}

interface ChartDataPoint {
  month: string;
  [key: string]: string | number;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ComparisonCharts({ selectedDomains }: ComparisonChartsProps) {
  if (selectedDomains.length === 0) {
    return (
      <Card data-testid="comparison-charts-empty">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No domains selected</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Select one or more law firms from the table above to visualize traffic trends and keyword rankings
          </p>
        </CardContent>
      </Card>
    );
  }

  // Generate mock historical data for demonstration
  // In production, this would come from the backend API
  const generateTrafficData = (): ChartDataPoint[] => {
    const months = ["3 months ago", "2 months ago", "1 month ago", "Current"];
    
    return months.map((month, index) => {
      const dataPoint: ChartDataPoint = { month };
      
      selectedDomains.forEach((domain, domainIndex) => {
        const currentTraffic = domain.organicTraffic || 0;
        const trend = domain.trafficTrend3mo || 0;
        
        // Calculate approximate historical values based on trend
        let historicalValue: number;
        if (index === 3) {
          historicalValue = currentTraffic;
        } else {
          const monthsBack = 3 - index;
          const trendFactor = 1 + (trend / 100) * (monthsBack / 3);
          historicalValue = Math.round(currentTraffic / trendFactor);
        }
        
        dataPoint[domain.companyName] = historicalValue;
      });
      
      return dataPoint;
    });
  };

  const generateKeywordData = (): ChartDataPoint[] => {
    return [
      {
        month: "Keywords",
        ...selectedDomains.reduce((acc, domain) => {
          acc[domain.companyName] = domain.keywordsTop100 || 0;
          return acc;
        }, {} as Record<string, number>),
      },
    ];
  };

  const trafficData = generateTrafficData();
  const keywordData = generateKeywordData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-md p-3 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" data-testid="comparison-charts">
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="traffic" data-testid="tab-traffic-trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Traffic Trends
          </TabsTrigger>
          <TabsTrigger value="keywords" data-testid="tab-keyword-comparison">
            <BarChart3 className="h-4 w-4 mr-2" />
            Keyword Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organic Traffic Over Time</CardTitle>
              <CardDescription>
                3-month traffic trend comparison for {selectedDomains.length} selected {selectedDomains.length === 1 ? 'firm' : 'firms'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={trafficData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="line"
                  />
                  {selectedDomains.map((domain, index) => (
                    <Line
                      key={domain.id}
                      type="monotone"
                      dataKey={domain.companyName}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      data-testid={`line-${domain.id}`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Keywords in Top 100</CardTitle>
              <CardDescription>
                Current keyword ranking comparison for selected firms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={keywordData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                  />
                  {selectedDomains.map((domain, index) => (
                    <Bar
                      key={domain.id}
                      dataKey={domain.companyName}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      data-testid={`bar-${domain.id}`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Value Comparison</CardTitle>
          <CardDescription>
            Estimated monthly organic search traffic value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={selectedDomains.map((domain) => ({
                name: domain.companyName,
                value: domain.trafficValue || 0,
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={150}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--popover-border))",
                  borderRadius: "0.375rem",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                data-testid="bar-traffic-value"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
