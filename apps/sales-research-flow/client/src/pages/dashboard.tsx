import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { TableSection } from "@/components/table-section";
import { DomainsTable } from "@/components/domains-table";
import { ComparisonCharts } from "@/components/comparison-charts";
import { EmptyState } from "@/components/empty-state";
import { UploadZone } from "@/components/upload-zone";
import { ProgressOverlay } from "@/components/progress-overlay";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Job, Domain } from "@shared/schema";

export default function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [chartsExpanded, setChartsExpanded] = useState(false);
  const [userCollapsedCharts, setUserCollapsedCharts] = useState(false);
  const { toast } = useToast();

  // Fetch all jobs with polling when processing
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: (query) => {
      const data = query.state.data as Job[] | undefined;
      const hasProcessing = data?.some(job => job.status === "processing");
      return hasProcessing ? 2000 : false; // Poll every 2s when processing, otherwise don't poll
    },
  });

  // Get the latest job or selected job
  const currentJob = selectedJobId
    ? jobs.find((j) => j.id === selectedJobId)
    : jobs[0];

  // Fetch domains for selected job (enable during processing to show partial results)
  const { data: domains = [], isLoading: domainsLoading } = useQuery<Domain[]>({
    queryKey: [`/api/jobs/${currentJob?.id}/domains`],
    enabled: !!currentJob?.id,
    refetchInterval: (query) => {
      return currentJob?.status === "processing" ? 2000 : false;
    },
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      setSelectedJobId(result.jobId);

      // Invalidate jobs query to get the new job
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });

      toast({
        title: "File uploaded successfully",
        description: `Processing ${result.totalDomains} domains...`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again with a valid CSV or Excel file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!currentJob) return;

    try {
      const response = await fetch(`/api/jobs/${currentJob.id}/export`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Use .xlsx extension for Excel export
      const baseFilename = currentJob.filename.replace(/\.[^/.]+$/, "");
      a.download = `${baseFilename}_enriched.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your enriched data has been downloaded",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Calculate metrics
  const totalDomains = currentJob?.totalDomains || 0;
  const processedDomains = currentJob?.processedDomains || 0;
  const failedDomains = currentJob?.failedDomains || 0;
  
  const urgentCount = domains.filter(
    (d) => d.trafficTrend3mo !== null && d.trafficTrend3mo < -15
  ).length;

  const avgTraffic = domains.length > 0
    ? Math.round(
        domains.reduce((sum, d) => sum + (d.organicTraffic || 0), 0) / domains.length
      )
    : 0;

  const totalTrafficValue = domains.reduce(
    (sum, d) => sum + (d.trafficValue || 0),
    0
  );

  const hasJobs = jobs.length > 0;
  const isProcessing = currentJob?.status === "processing";

  // Check if any domains are using mock data
  const mockDataDomains = domains.filter(d => d.dataSource === "mock");
  const hasMockData = mockDataDomains.length > 0;
  const allMockData = domains.length > 0 && mockDataDomains.length === domains.length;

  // Get selected domains for comparison
  const selectedDomains = useMemo(() => {
    return domains.filter(d => selectedDomainIds.includes(d.id));
  }, [domains, selectedDomainIds]);

  // Refetch domains when job completes to ensure we have final data
  useEffect(() => {
    if (currentJob?.status === "completed" && currentJob?.id) {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${currentJob.id}/domains`] });
    }
  }, [currentJob?.status, currentJob?.id]);

  // Auto-expand charts when domains are selected (unless user manually collapsed)
  useEffect(() => {
    if (selectedDomainIds.length > 0 && !chartsExpanded && !userCollapsedCharts) {
      setChartsExpanded(true);
    }
    // Reset user collapse flag when all selections are cleared
    if (selectedDomainIds.length === 0) {
      setUserCollapsedCharts(false);
      setChartsExpanded(false);
    }
  }, [selectedDomainIds.length, chartsExpanded, userCollapsedCharts]);

  return (
    <div className="space-y-8">
      {!hasJobs ? (
        <div className="max-w-3xl mx-auto space-y-8">
          <UploadZone onFileSelect={handleFileUpload} isProcessing={isUploading} />
          <EmptyState
            title="No data yet"
            description="Upload a CSV or Excel file containing law firm domains to begin the automated SEO analysis"
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upload new file - only show when not processing */}
          {!isProcessing && currentJob?.status === "completed" && (
            <div className="max-w-3xl mx-auto">
              <UploadZone
                onFileSelect={handleFileUpload}
                isProcessing={isUploading}
              />
            </div>
          )}

          {/* Progress tracking */}
          {isProcessing && (
            <div className="max-w-2xl mx-auto">
              <ProgressOverlay
                total={totalDomains}
                processed={processedDomains}
                failed={failedDomains}
                status="processing"
              />
            </div>
          )}

          {/* Hero Section - only show when completed */}
          {currentJob?.status === "completed" && (
            <>
              <HeroSection
                totalDomains={totalDomains}
                currentlyViewing={`1-${Math.min(domains.length, 10)}`}
                filterStatus="Default"
                onExport={handleExport}
                onViewExports={() => {
                  toast({
                    title: "View Exports",
                    description: "This feature is coming soon",
                  });
                }}
                onResearchJobs={() => {
                  toast({
                    title: "Research Jobs",
                    description: "This feature is coming soon",
                  });
                }}
              />

              {/* Mock Data Warning Alert */}
              {hasMockData && (
                <Alert className="border-amber-500/50 bg-amber-500/10" data-testid="alert-mock-data">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    {allMockData ? (
                      <>
                        <strong>API Connection Issue:</strong> External SEO APIs are currently unavailable. Showing sample data for demonstration purposes. 
                        {currentJob?.failedDomains ? ` Configure valid API keys in Secrets to access real SEO metrics.` : ''}
                      </>
                    ) : (
                      <>
                        <strong>Partial Data:</strong> {mockDataDomains.length} of {domains.length} domains are using sample data due to API limitations. 
                        Real data shown where available.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

                {/* Data Table */}
                {domainsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading domains...</p>
                    </div>
                  </div>
                ) : domains.length > 0 ? (
                  <div className="space-y-8">
                    <TableSection
                      title="Lead Database"
                      description="Browse and manage your prospective leads with refined visuals."
                      selectedCount={selectedDomainIds.length}
                      onAction={() => {
                        toast({
                          title: "Launch Research",
                          description: "This feature is coming soon",
                        });
                      }}
                    >
                      <DomainsTable 
                        domains={domains} 
                        selectedDomains={selectedDomainIds}
                        onSelectionChange={setSelectedDomainIds}
                      />
                    </TableSection>

                    {/* Comparison Charts - Collapsible */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Visual Comparison
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDomainIds.length === 0 
                              ? "Select firms from the table to compare trends" 
                              : `Comparing ${selectedDomainIds.length} ${selectedDomainIds.length === 1 ? 'firm' : 'firms'}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          data-testid="button-toggle-charts"
                          onClick={() => {
                            const newState = !chartsExpanded;
                            setChartsExpanded(newState);
                            // Track if user manually collapsed
                            if (!newState) {
                              setUserCollapsedCharts(true);
                            } else {
                              setUserCollapsedCharts(false);
                            }
                          }}
                        >
                          {chartsExpanded ? (
                            <>
                              Hide Charts
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Show Charts
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {chartsExpanded && (
                        <div className="mt-6" data-testid="comparison-charts">
                          <ComparisonCharts selectedDomains={selectedDomains} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No domains enriched"
                    description="The enrichment process completed but no domains were successfully processed"
                  />
                )}
              </>
            )}

            {/* Failed state */}
            {currentJob?.status === "failed" && (
              <div className="max-w-2xl mx-auto">
                <EmptyState
                  title="Processing failed"
                  description="An error occurred while processing your domains. Please try again or contact support."
                />
              </div>
            )}
          </div>
        )}
      </div>
  );
}
