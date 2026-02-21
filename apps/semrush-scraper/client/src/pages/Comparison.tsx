import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ComparisonFilters, type FilterState } from "@/components/ComparisonFilters";
import { ScoreWeightSliders, type ScoreWeights, DEFAULT_WEIGHTS } from "@/components/ScoreWeightSliders";
import { ComparisonTable } from "@/components/ComparisonTable";
import { TrendChart } from "@/components/TrendChart";
import { Download, GitCompare, Loader2 } from "lucide-react";
import type { DomainWithMetrics } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_FILTERS: FilterState = {
  prospectScoreMin: 0,
  prospectScoreMax: 100,
  trafficMin: 0,
  trafficMax: 1000000,
  keywordsMin: 0,
  keywordsMax: 100000,
  status: "all",
};

export default function Comparison() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const { data: domains = [], isLoading } = useQuery<DomainWithMetrics[]>({
    queryKey: ["/api/domains"],
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/compare/export",
        {
          domainIds: selectedDomains.length > 0 ? selectedDomains : filteredDomains.map(d => d.id),
          weights,
          filters,
        }
      );

      // Get the blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comparison-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: "Your comparison report has been downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export comparison data",
        variant: "destructive",
      });
    },
  });

  // Filter domains
  const filteredDomains = useMemo(() => {
    return domains.filter((domain) => {
      const metrics = domain.latestSnapshot?.metrics;
      const prospectScore = metrics?.prospectScore || 0;
      const traffic = metrics?.organicTraffic || 0;
      const keywords = metrics?.totalKeywords || 0;
      const status = domain.latestSnapshot?.status || "pending";

      // Apply filters
      if (prospectScore < filters.prospectScoreMin || prospectScore > filters.prospectScoreMax) {
        return false;
      }
      if (traffic < filters.trafficMin || traffic > filters.trafficMax) {
        return false;
      }
      if (keywords < filters.keywordsMin || keywords > filters.keywordsMax) {
        return false;
      }
      if (filters.status !== "all" && status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [domains, filters]);

  const handleExportSelected = () => {
    if (selectedDomains.length === 0 && filteredDomains.length === 0) {
      toast({
        title: "No domains to export",
        description: "Please select domains or adjust filters",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate();
  };

  const handleExportAll = () => {
    if (filteredDomains.length === 0) {
      toast({
        title: "No domains to export",
        description: "Please adjust your filters to show domains",
        variant: "destructive",
      });
      return;
    }
    // Temporarily clear selection to export all filtered
    const originalSelection = [...selectedDomains];
    setSelectedDomains([]);
    exportMutation.mutate();
    // Restore selection after export
    setTimeout(() => setSelectedDomains(originalSelection), 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <EmptyState
        icon={GitCompare}
        title="No domains to compare"
        description="Start by crawling some domains to see comparison analytics here."
        action={{
          label: "Go to Dashboard",
          onClick: () => (window.location.href = "/"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Domain Comparison
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare and analyze multiple domains side-by-side with custom scoring weights
          </p>
        </div>
        <Button
          onClick={handleExportAll}
          disabled={filteredDomains.length === 0 || exportMutation.isPending}
          data-testid="button-export-comparison"
        >
          {exportMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Comparison (CSV)
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            <ComparisonFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={domains.length}
              filteredCount={filteredDomains.length}
            />
            <ScoreWeightSliders weights={weights} onWeightsChange={setWeights} />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {filteredDomains.length === 0 ? (
            <EmptyState
              icon={GitCompare}
              title="No matching domains"
              description="Try adjusting your filters to see more results."
              action={{
                label: "Clear Filters",
                onClick: () => setFilters(DEFAULT_FILTERS),
              }}
            />
          ) : (
            <>
              {/* Charts */}
              <TrendChart domains={filteredDomains} />

              {/* Comparison Table */}
              <ComparisonTable
                domains={filteredDomains}
                selectedDomains={selectedDomains}
                onSelectionChange={setSelectedDomains}
                weights={weights}
                onExportSelected={handleExportSelected}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
