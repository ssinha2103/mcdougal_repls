import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, PlayCircle } from "lucide-react";

interface HeroSectionProps {
  totalDomains: number;
  currentlyViewing: string;
  filterStatus: string;
  onExport?: () => void;
  onViewExports?: () => void;
  onResearchJobs?: () => void;
}

export function HeroSection({
  totalDomains,
  currentlyViewing,
  filterStatus,
  onExport,
  onViewExports,
  onResearchJobs,
}: HeroSectionProps) {
  return (
    <Card className="p-8 lg:p-12" data-testid="card-hero-section">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase text-xs tracking-wider font-medium"
            data-testid="badge-section-label"
          >
            SEO Intelligence Studio
          </Badge>

          {/* Title & Description */}
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold" data-testid="text-hero-title">
              Lead Explorer
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl" data-testid="text-hero-description">
              Discover and curate high-intent prospects with comprehensive SEO data, refined filters, and 
              AI-powered research insights. Craft your next outreach pipeline with confidence.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            {/* Total Leads */}
            <div className="space-y-1" data-testid="stat-total-domains">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Total Leads
              </p>
              <p className="text-3xl font-bold tabular-nums" data-testid="value-total-domains">
                ~{totalDomains.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated across your workspace
              </p>
            </div>

            {/* Currently Viewing */}
            <div className="space-y-1" data-testid="stat-currently-viewing">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Currently Viewing
              </p>
              <p className="text-3xl font-bold tabular-nums" data-testid="value-currently-viewing">
                {currentlyViewing}
              </p>
              <p className="text-xs text-muted-foreground">
                of ~{totalDomains.toLocaleString()}
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-1" data-testid="stat-filters">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Filters
              </p>
              <p className="text-3xl font-bold" data-testid="value-filters">
                {filterStatus}
              </p>
              <p className="text-xs text-muted-foreground">
                Tailor your view in the sidebar
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:w-80">
          <Card className="bg-card p-6 space-y-3" data-testid="card-quick-actions">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">
                Export polished lead lists or dive into past research snapshots with a single click.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                className="w-full justify-start gap-3"
                size="default"
                onClick={onExport}
                data-testid="button-export-data"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>

              <Button 
                variant="secondary" 
                className="w-full justify-start gap-3"
                size="default"
                onClick={onViewExports}
                data-testid="button-view-exports"
              >
                <FileText className="h-4 w-4" />
                View Exports
              </Button>

              <Button 
                variant="secondary" 
                className="w-full justify-start gap-3"
                size="default"
                onClick={onResearchJobs}
                data-testid="button-research-jobs"
              >
                <PlayCircle className="h-4 w-4" />
                Research Jobs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
