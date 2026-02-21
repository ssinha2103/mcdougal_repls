import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { AnalyzeLinkRequest, LinkAnalysisResult } from "@shared/schema";
import { UrlInputForm } from "@/components/url-input-form";
import { SummaryCards } from "@/components/summary-cards";
import { ResultsTable } from "@/components/results-table";
import { EmptyState } from "@/components/empty-state";
import { ExportButtons } from "@/components/export-buttons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Search, Settings, Shield, Moon, Sun } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalyzeLinkRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      const result = await response.json();
      return result as LinkAnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the page. Please try again.",
      });
    },
  });

  const handleSubmit = (data: AnalyzeLinkRequest) => {
    analyzeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16 gap-2">
            <Link href="/history">
              <Button variant="ghost" size="sm" data-testid="button-view-history">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', newTheme);
              }}
              data-testid="button-theme-toggle"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-background py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Professional Broken Link & Redirect Finder
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Analyze webpages for broken links, redirects, and HTTP errors. Built for SEO specialists and webmasters who demand accuracy and speed.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Search className="w-3 h-3 mr-1" />
              SEO Optimized
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Settings className="w-3 h-3 mr-1" />
              Advanced Filtering
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Secure & Private
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="w-6 h-6" />
              Link Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Enter a webpage URL to discover broken links, redirects, and HTTP status codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UrlInputForm
              onSubmit={handleSubmit}
              isLoading={analyzeMutation.isPending}
            />
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Analysis Results</h3>
                <p className="text-sm text-muted-foreground font-mono mb-4" data-testid="text-source-url">
                  Source: {result.sourceUrl}
                </p>
              </div>
              <ExportButtons result={result} />
            </div>

            <SummaryCards result={result} />

            {result.results && result.results.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold mb-4">Link Details</h4>
                <ResultsTable result={result} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No links found on this page.</p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
