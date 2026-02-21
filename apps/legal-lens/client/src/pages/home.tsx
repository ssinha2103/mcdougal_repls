import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { type SearchRequest, type AnalysisResponse } from "@shared/schema";
import { SearchForm } from "@/components/search-form";
import { ResultsDashboard } from "@/components/results-dashboard";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, TrendingUp, Users, FileBarChart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  const analysisMutation = useMutation({
    mutationFn: async (data: SearchRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      const json = await response.json();
      return json as AnalysisResponse;
    },
    onSuccess: (data) => {
      setAnalysisData(data);
    },
  });

  const handleSearch = (data: SearchRequest) => {
    setAnalysisData(null);
    analysisMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Legal SERP Analyzer</h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Competitive Intelligence</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        {!analysisData && !analysisMutation.isPending && (
          <div className="space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Analyze Your Legal Competition
              </h2>
              <p className="text-lg text-muted-foreground">
                Get comprehensive competitive intelligence with local search rankings, Google Business Profile data, and actionable insights for any legal practice area.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle>Start Your Analysis</CardTitle>
                <CardDescription>
                  Enter a legal practice keyword and location to discover your competitive landscape
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SearchForm onSubmit={handleSearch} isLoading={analysisMutation.isPending} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">SERP Rankings</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover top 3 Local Pack and top 10 organic search results for any legal keyword and location
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-md bg-chart-2/10">
                    <Users className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-lg">GBP Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Enriched with Google Business Profile data including ratings, reviews, and optimization status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-md bg-chart-5/10">
                    <FileBarChart className="h-6 w-6 text-chart-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Competitive Intel</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive reports showing who ranks, their performance metrics, and market opportunities
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {analysisMutation.isPending && <LoadingSkeleton />}

        {analysisMutation.isError && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription>
              {analysisMutation.error instanceof Error
                ? analysisMutation.error.message
                : "Failed to analyze competition. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {analysisData && !analysisMutation.isPending && (
          <div className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <SearchForm onSubmit={handleSearch} isLoading={analysisMutation.isPending} />
              </CardContent>
            </Card>
            <ResultsDashboard data={analysisData} />
          </div>
        )}
      </main>

      <footer className="border-t mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Local Legal SERP Analyzer. Competitive intelligence for legal professionals.</p>
        </div>
      </footer>
    </div>
  );
}
