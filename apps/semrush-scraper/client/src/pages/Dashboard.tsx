import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KPITile } from "@/components/KPITile";
import { DomainCard } from "@/components/DomainCard";
import { EmptyState } from "@/components/EmptyState";
import { DomainUploadDialog, type UploadConfig } from "@/components/DomainUploadDialog";
import { CrawlStatus } from "@/components/CrawlStatus";
import { Plus, Search, Database, Activity, CheckCircle2, TrendingUp } from "lucide-react";
import type { DomainWithMetrics } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch domains
  const { data: domains = [], isLoading } = useQuery<DomainWithMetrics[]>({
    queryKey: ["/api/domains"],
  });

  // Fetch stats
  const { data: stats } = useQuery<{
    totalDomains: number;
    activeCrawls: number;
    successRate: number;
    avgScore: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Start crawl mutation
  const startCrawlMutation = useMutation({
    mutationFn: async ({ domains: domainsList, config }: { domains: string[]; config: UploadConfig }) => {
      return await apiRequest("POST", "/api/domains/crawl", { domains: domainsList, config });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
      toast({
        title: "Crawl started",
        description: "Your domains are being crawled in the background.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start crawl",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (domainsList: string[], config: UploadConfig) => {
    startCrawlMutation.mutate({ domains: domainsList, config });
  };

  const handleViewDomain = (domain: DomainWithMetrics) => {
    // Navigate to rankings page where user can see this domain
    navigate("/rankings");
  };

  const filteredDomains = domains.filter((d) =>
    d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and analyze domain SEO performance
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-domains">
          <Plus className="h-4 w-4 mr-2" />
          Upload Domains
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          icon={Database}
          label="Total Domains"
          value={stats?.totalDomains || domains.length}
        />
        <KPITile
          icon={Activity}
          label="Active Crawls"
          value={stats?.activeCrawls || 0}
        />
        <KPITile
          icon={CheckCircle2}
          label="Success Rate"
          value={`${stats?.successRate || 0}%`}
          trend={{ value: 5, direction: "up" }}
        />
        <KPITile
          icon={TrendingUp}
          label="Avg Score"
          value={stats?.avgScore || "—"}
        />
      </div>

      {/* Search & Filters */}
      {domains.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-domains"
            />
          </div>
        </div>
      )}

      {/* Domain Cards */}
      {filteredDomains.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No domains match your search.</p>
        </div>
      )}

      {filteredDomains.length === 0 && !searchQuery && domains.length === 0 && (
        <EmptyState
          icon={Database}
          title="No domains yet"
          description="Get started by uploading domains to analyze their SEO performance and find outreach opportunities."
          action={{
            label: "Upload Domains",
            onClick: () => setUploadDialogOpen(true),
          }}
        />
      )}

      {filteredDomains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onView={handleViewDomain}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <DomainUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUpload}
      />

      {/* Crawl Status - Real-time crawl progress */}
      <CrawlStatus />
    </div>
  );
}
