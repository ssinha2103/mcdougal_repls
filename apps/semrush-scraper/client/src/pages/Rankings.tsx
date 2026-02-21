import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart3, TrendingDown, TrendingUp, Eye, Download, FileText, Loader2 } from "lucide-react";
import type { DomainWithMetrics } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Rankings() {
  const [selectedDomain, setSelectedDomain] = useState<DomainWithMetrics | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: domains = [], isLoading } = useQuery<DomainWithMetrics[]>({
    queryKey: ["/api/domains/ranked"],
  });

  // Sort by prospect score
  const rankedDomains = [...domains].sort((a, b) => {
    const scoreA = a.latestSnapshot?.metrics?.prospectScore || 0;
    const scoreB = b.latestSnapshot?.metrics?.prospectScore || 0;
    return scoreB - scoreA;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-chart-2";
    if (score >= 40) return "text-chart-3";
    return "text-chart-5";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-chart-2/10 border-chart-2/20";
    if (score >= 40) return "bg-chart-3/10 border-chart-3/20";
    return "bg-chart-5/10 border-chart-5/20";
  };

  const handleViewDomain = (domain: DomainWithMetrics) => {
    setSelectedDomain(domain);
  };

  const handleDownloadPDF = async (domainId: string, domainName: string) => {
    try {
      setDownloadingPDF(domainId);
      const response = await fetch(`/api/domains/${domainId}/pdf`);
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domainName}-prospect-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF downloaded",
        description: `Downloaded prospect report for ${domainName}`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Could not generate PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(null);
    }
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Rank", "Domain", "Score", "Keywords", "Traffic", "Top 3", "Decline", "Opportunity"],
      ...rankedDomains.map((domain, index) => {
        const metrics = domain.latestSnapshot?.metrics;
        return [
          index + 1,
          domain.domain,
          metrics?.prospectScore || 0,
          metrics?.totalKeywords || 0,
          metrics?.organicTraffic || 0,
          metrics?.top3Keywords || 0,
          metrics?.declineScore || 0,
          metrics?.opportunityScore || 0,
        ];
      })
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospect-rankings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "CSV exported",
      description: `Exported ${rankedDomains.length} domains`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No rankings yet"
        description="Rankings will appear here once you've crawled domains and generated prospect scores."
        action={{
          label: "Go to Dashboard",
          onClick: () => window.location.href = "/",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Prospect Rankings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Domains ranked by AI-powered prospect score
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-rankings">
          <Download className="h-4 w-4 mr-2" />
          Export Rankings
        </Button>
      </div>

      {/* Rankings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr className="text-xs font-medium text-muted-foreground">
                <th className="text-left py-3 px-4 w-12">#</th>
                <th className="text-left py-3 px-4">Domain</th>
                <th className="text-right py-3 px-4">Score</th>
                <th className="text-right py-3 px-4">Keywords</th>
                <th className="text-right py-3 px-4">Traffic</th>
                <th className="text-right py-3 px-4">Top 3</th>
                <th className="text-right py-3 px-4">Decline</th>
                <th className="text-right py-3 px-4">Opportunity</th>
                <th className="text-right py-3 px-4 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedDomains.map((domain, index) => {
                const metrics = domain.latestSnapshot?.metrics;
                const prospectScore = metrics?.prospectScore || 0;
                const declineScore = metrics?.declineScore || 0;
                const opportunityScore = metrics?.opportunityScore || 0;

                return (
                  <tr
                    key={domain.id}
                    className="border-b border-border hover-elevate"
                    data-testid={`row-domain-${index + 1}`}
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-medium">{domain.domain}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className={cn("px-2 py-1 rounded-md border text-sm font-semibold", getScoreBg(prospectScore))}>
                          <span className={getScoreColor(prospectScore)}>{prospectScore}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      {metrics?.totalKeywords?.toLocaleString() || "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      {metrics?.organicTraffic?.toLocaleString() || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-sm">
                        {metrics?.top3Keywords || 0}
                        {metrics?.totalKeywords && metrics?.top3Keywords && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({Math.round((metrics.top3Keywords / metrics.totalKeywords) * 100)}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={cn("w-16 h-1.5 rounded-full bg-muted overflow-hidden")}>
                          <div
                            className="h-full bg-chart-5"
                            style={{ width: `${Math.min(declineScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {declineScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={cn("w-16 h-1.5 rounded-full bg-muted overflow-hidden")}>
                          <div
                            className="h-full bg-chart-2"
                            style={{ width: `${Math.min(opportunityScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {opportunityScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleViewDomain(domain)}
                          data-testid="button-view-domain"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleDownloadPDF(domain.id, domain.domain)}
                          disabled={downloadingPDF === domain.id}
                          data-testid="button-export-domain"
                        >
                          {downloadingPDF === domain.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-chart-2/10 border border-chart-2/20"></div>
          <span>High Score (70+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-chart-3/10 border border-chart-3/20"></div>
          <span>Medium Score (40-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-chart-5/10 border border-chart-5/20"></div>
          <span>Low Score (0-39)</span>
        </div>
      </div>

      {/* Domain Detail Dialog */}
      <Dialog open={selectedDomain !== null} onOpenChange={() => setSelectedDomain(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDomain && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-xl">{selectedDomain.domain}</DialogTitle>
                <DialogDescription>
                  Crawled {selectedDomain.lastCrawledAt ? new Date(selectedDomain.lastCrawledAt).toLocaleString() : 'Never'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Metrics */}
                {selectedDomain.latestSnapshot?.metrics && (
                  <div>
                    <h3 className="font-semibold mb-3">Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Prospect Score</p>
                        <p className="text-2xl font-bold">{selectedDomain.latestSnapshot.metrics.prospectScore || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Keywords</p>
                        <p className="text-2xl font-bold">{selectedDomain.latestSnapshot.metrics.totalKeywords?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Organic Traffic</p>
                        <p className="text-2xl font-bold">{selectedDomain.latestSnapshot.metrics.organicTraffic?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Top 3 Keywords</p>
                        <p className="text-2xl font-bold">{selectedDomain.latestSnapshot.metrics.top3Keywords || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights */}
                {selectedDomain.latestSnapshot?.insights && selectedDomain.latestSnapshot.insights.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">AI Insights</h3>
                    <div className="space-y-2">
                      {selectedDomain.latestSnapshot.insights.map((insight, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{insight.title}</p>
                              <p className="text-sm text-muted-foreground">{insight.summary}</p>
                              {insight.details && (
                                <p className="text-sm text-primary">💡 {insight.details}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium capitalize">{selectedDomain.status}</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
