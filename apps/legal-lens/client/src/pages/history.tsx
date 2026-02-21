import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Star, CheckCircle } from "lucide-react";
import type { SearchResult } from "@shared/schema";

export default function HistoryPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const keyword = params.get("keyword") || "";
  const location = params.get("location") || "";

  const { data: searchHistory, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search-history", keyword, location],
    queryFn: async () => {
      const res = await fetch(`/api/search-history?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!(keyword && location),
  });

  if (!keyword || !location) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Please specify keyword and location parameters</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading search history...</div>
      </div>
    );
  }

  if (!searchHistory || searchHistory.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Search History</h1>
          <p className="text-muted-foreground mt-2">
            {keyword} in {location}
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">No historical data available</p>
            <p className="text-sm text-muted-foreground">Run this search to start tracking rankings over time</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const chartData = searchHistory
    .slice()
    .reverse()
    .map((result) => ({
      date: format(new Date(result.timestamp), "MMM d"),
      avgRating: result.avgRating || 0,
      claimedPercentage: result.claimedPercentage || 0,
      totalResults: result.totalResults,
    }));

  // Get the most recent result
  const latestResult = searchHistory[0];
  const previousResult = searchHistory[1];

  // Calculate changes
  const getRatingTrend = () => {
    if (!previousResult || !latestResult.avgRating || !previousResult.avgRating) return null;
    const change = latestResult.avgRating - previousResult.avgRating;
    if (Math.abs(change) < 0.1) return { icon: Minus, text: "No change", color: "text-muted-foreground" };
    if (change > 0) return { icon: TrendingUp, text: `+${change.toFixed(1)}`, color: "text-green-600" };
    return { icon: TrendingDown, text: change.toFixed(1), color: "text-red-600" };
  };

  const getClaimedTrend = () => {
    if (!previousResult || latestResult.claimedPercentage === null || previousResult.claimedPercentage === null) return null;
    const change = (latestResult.claimedPercentage || 0) - (previousResult.claimedPercentage || 0);
    if (change === 0) return { icon: Minus, text: "No change", color: "text-muted-foreground" };
    if (change > 0) return { icon: TrendingUp, text: `+${change}%`, color: "text-green-600" };
    return { icon: TrendingDown, text: `${change}%`, color: "text-red-600" };
  };

  const ratingTrend = getRatingTrend();
  const claimedTrend = getClaimedTrend();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search History</h1>
        <p className="text-muted-foreground mt-2">
          {keyword} in {location}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {searchHistory.length} search{searchHistory.length !== 1 ? "es" : ""} recorded
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestResult.avgRating?.toFixed(1) || "N/A"}
            </div>
            {ratingTrend && (
              <div className={`flex items-center gap-1 text-xs ${ratingTrend.color}`}>
                <ratingTrend.icon className="w-3 h-3" />
                <span>{ratingTrend.text}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed Profiles</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestResult.claimedPercentage !== null && latestResult.claimedPercentage !== undefined
                ? `${latestResult.claimedPercentage}%`
                : "N/A"}
            </div>
            {claimedTrend && (
              <div className={`flex items-center gap-1 text-xs ${claimedTrend.color}`}>
                <claimedTrend.icon className="w-3 h-3" />
                <span>{claimedTrend.text}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Competitor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate" title={latestResult.topCompetitor || "N/A"}>
              {latestResult.topCompetitor || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {format(new Date(latestResult.timestamp), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ranking Trends</CardTitle>
          <CardDescription>Track how average ratings and claimed percentages change over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgRating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Avg Rating"
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="claimedPercentage"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Claimed %"
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historical Results</CardTitle>
          <CardDescription>All search results for this keyword and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchHistory.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-4 hover-elevate"
                data-testid={`history-item-${result.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {format(new Date(result.timestamp), "MMM d, yyyy h:mm a")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {result.totalResults} results
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {result.avgRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{result.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                    {result.claimedPercentage !== null && result.claimedPercentage !== undefined && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{result.claimedPercentage}% claimed</span>
                      </div>
                    )}
                  </div>
                </div>
                {result.topCompetitor && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Top competitor:</span>{" "}
                    <span className="font-medium">{result.topCompetitor}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
