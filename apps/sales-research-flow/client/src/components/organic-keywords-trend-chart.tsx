import { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KeywordTrendDataPoint {
  month: string;
  top3: number;
  range4_10: number;
  range11_20: number;
  range21_50: number;
  range51_100: number;
  total: number;
}

interface OrganicKeywordsTrendChartProps {
  data: KeywordTrendDataPoint[];
}

const CHART_COLORS = {
  top3: "#FDB022",
  range4_10: "#4A90E2",
  range11_20: "#50C878",
  range21_50: "#87CEEB",
  range51_100: "#B0E0E6",
  trendLine: "#333333",
};

type TimeRange = "1M" | "6M" | "1Y" | "2Y" | "All";

export function OrganicKeywordsTrendChart({ data }: OrganicKeywordsTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("All");

  const filteredData = useMemo(() => {
    const monthsMap: Record<TimeRange, number> = {
      "1M": 1,
      "6M": 6,
      "1Y": 12,
      "2Y": 24,
      "All": data.length,
    };

    const months = monthsMap[timeRange];
    return data.slice(-months);
  }, [data, timeRange]);

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.find((p: any) => p.dataKey === "total")?.value || 0;
      
      return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-md">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm font-medium mb-1">Total: {total.toLocaleString()}</p>
          <div className="space-y-1">
            {payload
              .filter((p: any) => p.dataKey !== "total")
              .reverse()
              .map((entry: any, index: number) => (
                <p key={index} className="text-sm flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}: {entry.value.toLocaleString()}</span>
                </p>
              ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid="organic-keywords-trend-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Organic Keywords Trend</CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="1M" data-testid="time-range-1M">1M</TabsTrigger>
              <TabsTrigger value="6M" data-testid="time-range-6M">6M</TabsTrigger>
              <TabsTrigger value="1Y" data-testid="time-range-1Y">1Y</TabsTrigger>
              <TabsTrigger value="2Y" data-testid="time-range-2Y">2Y</TabsTrigger>
              <TabsTrigger value="All" data-testid="time-range-All">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
              formatter={(value) => {
                const labels: Record<string, string> = {
                  top3: "Top 3",
                  range4_10: "4-10",
                  range11_20: "11-20",
                  range21_50: "21-50",
                  range51_100: "51-100",
                  total: "Total Keywords",
                };
                return labels[value] || value;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="top3"
              stackId="keywords"
              fill={CHART_COLORS.top3}
              radius={[0, 0, 0, 0]}
              name="top3"
            />
            <Bar
              yAxisId="left"
              dataKey="range4_10"
              stackId="keywords"
              fill={CHART_COLORS.range4_10}
              name="range4_10"
            />
            <Bar
              yAxisId="left"
              dataKey="range11_20"
              stackId="keywords"
              fill={CHART_COLORS.range11_20}
              name="range11_20"
            />
            <Bar
              yAxisId="left"
              dataKey="range21_50"
              stackId="keywords"
              fill={CHART_COLORS.range21_50}
              name="range21_50"
            />
            <Bar
              yAxisId="left"
              dataKey="range51_100"
              stackId="keywords"
              fill={CHART_COLORS.range51_100}
              radius={[4, 4, 0, 0]}
              name="range51_100"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total"
              stroke={CHART_COLORS.trendLine}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="total"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
