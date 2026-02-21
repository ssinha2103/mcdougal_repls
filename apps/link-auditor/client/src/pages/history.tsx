import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar, Link2 } from "lucide-react";
import { format } from "date-fns";
import type { Scan } from "@shared/schema";

export default function History() {
  const { data: scans, isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analyzer
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Scan History</h1>
          </div>
          <p className="text-muted-foreground">
            View your previous broken link analysis scans
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !scans || scans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Scan History</h3>
              <p className="text-muted-foreground mb-4">
                You haven't run any link analysis scans yet.
              </p>
              <Link href="/">
                <Button data-testid="button-start-scan">
                  Start Your First Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <Card key={scan.id} className="hover-elevate" data-testid={`card-scan-${scan.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 flex items-center gap-2">
                        <span className="truncate">{scan.sourceUrl}</span>
                        <a
                          href={scan.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                          data-testid={`link-source-${scan.id}`}
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(scan.createdAt), "PPpp")}
                      </CardDescription>
                    </div>
                    <Link href={`/scan/${scan.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-scan-${scan.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" data-testid={`badge-success-${scan.id}`}>
                      {scan.summary.success} Success
                    </Badge>
                    {scan.summary.redirects > 0 && (
                      <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800" data-testid={`badge-redirects-${scan.id}`}>
                        {scan.summary.redirects} Redirects
                      </Badge>
                    )}
                    {scan.summary.clientErrors > 0 && (
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" data-testid={`badge-client-errors-${scan.id}`}>
                        {scan.summary.clientErrors} 4xx Errors
                      </Badge>
                    )}
                    {scan.summary.serverErrors > 0 && (
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" data-testid={`badge-server-errors-${scan.id}`}>
                        {scan.summary.serverErrors} 5xx Errors
                      </Badge>
                    )}
                    {scan.summary.errors > 0 && (
                      <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800" data-testid={`badge-errors-${scan.id}`}>
                        {scan.summary.errors} Request Errors
                      </Badge>
                    )}
                    <Badge variant="secondary" data-testid={`badge-total-${scan.id}`}>
                      {scan.totalLinks} Total Links
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
