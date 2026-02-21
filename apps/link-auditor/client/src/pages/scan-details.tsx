import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, ExternalLink, Link2 } from "lucide-react";
import { format } from "date-fns";
import type { Scan, LinkAnalysisResult } from "@shared/schema";
import { ResultsTable } from "@/components/results-table";
import { SummaryCards } from "@/components/summary-cards";
import { ExportButtons } from "@/components/export-buttons";

export default function ScanDetails() {
  const [, params] = useRoute("/scan/:id");
  const scanId = params?.id ? parseInt(params.id) : null;

  const { data: scan, isLoading, error } = useQuery<Scan>({
    queryKey: ["/api/scans", scanId],
    enabled: scanId !== null,
  });

  if (!scanId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Invalid Scan ID</h3>
            <Link href="/history">
              <Button>Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Scan Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This scan could not be loaded or does not exist.
            </p>
            <Link href="/history">
              <Button data-testid="button-back-history">Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert scan to LinkAnalysisResult format for components
  const result: LinkAnalysisResult = {
    sourceUrl: scan.sourceUrl,
    totalLinks: scan.totalLinks,
    results: scan.results,
    summary: scan.summary,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-history">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Link2 className="w-8 h-8 text-primary flex-shrink-0" />
                <h1 className="text-3xl font-bold truncate">{scan.sourceUrl}</h1>
                <a
                  href={scan.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                  data-testid="link-source-url"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </a>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scanned on {format(new Date(scan.createdAt), "PPpp")}
              </p>
            </div>
            <ExportButtons result={result} />
          </div>
        </div>

        <div className="mb-8">
          <SummaryCards result={result} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Link Analysis Results</CardTitle>
            <CardDescription>
              Detailed status information for all {scan.totalLinks} links found on the page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsTable result={result} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
