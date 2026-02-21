import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Eye, Download, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import type { DomainWithMetrics } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DomainCardProps {
  domain: DomainWithMetrics;
  onView: (domain: DomainWithMetrics) => void;
  onExport?: (domain: DomainWithMetrics) => void;
  onReCrawl?: (domain: DomainWithMetrics) => void;
}

export function DomainCard({ domain, onView, onExport, onReCrawl }: DomainCardProps) {
  const metrics = domain.latestSnapshot?.metrics;
  const prospectScore = metrics?.prospectScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-chart-2";
    if (score >= 40) return "text-chart-3";
    return "text-chart-5";
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-domain-${domain.domain}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-medium truncate" data-testid={`text-domain-${domain.domain}`}>
              {domain.domain}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={domain.status as any} />
              {domain.lastCrawledAt && (
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(domain.lastCrawledAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          {metrics && (
            <div className="text-right flex-shrink-0">
              <div className={`text-2xl font-semibold ${getScoreColor(prospectScore)}`}>
                {prospectScore}
              </div>
              <div className="text-[11px] text-muted-foreground">Score</div>
            </div>
          )}
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Keywords</div>
              <div className="text-sm font-medium" data-testid="text-keywords-count">
                {metrics.totalKeywords?.toLocaleString() || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Traffic</div>
              <div className="text-sm font-medium" data-testid="text-traffic">
                {metrics.organicTraffic?.toLocaleString() || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Top 3</div>
              <div className="text-sm font-medium flex items-center gap-1" data-testid="text-top3-keywords">
                {metrics.top3Keywords || 0}
                {metrics.totalKeywords && metrics.top3Keywords && (
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((metrics.top3Keywords / metrics.totalKeywords) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onView(domain)}
            className="flex-1"
            data-testid="button-view-domain"
          >
            <Eye className="h-3 w-3 mr-1.5" />
            View
          </Button>
          {onExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport(domain)}
              data-testid="button-export-domain"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          {onReCrawl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReCrawl(domain)}
              data-testid="button-recrawl-domain"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
