import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, XCircle, Loader2, X } from "lucide-react";

interface SectionStatus {
  status: "pending" | "capturing" | "captured" | "failed";
}

interface CrawlState {
  runId: string | null;
  isActive: boolean;
  totalDomains: number;
  completedDomains: number;
  failedDomains: number;
  currentDomain: string | null;
  sections: Record<string, SectionStatus>;
  showSummary: boolean;
}

const SECTION_NAMES = [
  "header_kpis",
  "organic_trend",
  "top_keywords",
  "intent_distribution",
  "search_positions",
  "position_changes",
  "page_changes",
  "competitive_map",
  "organic_pages",
];

const SECTION_LABELS: Record<string, string> = {
  header_kpis: "Header KPIs",
  organic_trend: "Organic Trend",
  top_keywords: "Top Keywords",
  intent_distribution: "Intent Distribution",
  search_positions: "Search Positions",
  position_changes: "Position Changes",
  page_changes: "Page Changes",
  competitive_map: "Competitive Map",
  organic_pages: "Organic Pages",
};

export function CrawlStatus() {
  // Track the active run ID separately to filter events
  const activeRunIdRef = useRef<string | null>(null);
  
  const [crawlState, setCrawlState] = useState<CrawlState>({
    runId: null,
    isActive: false,
    totalDomains: 0,
    completedDomains: 0,
    failedDomains: 0,
    currentDomain: null,
    sections: {},
    showSummary: false,
  });

  const resetSections = useCallback(() => {
    const sections: Record<string, SectionStatus> = {};
    SECTION_NAMES.forEach(name => {
      sections[name] = { status: "pending" };
    });
    return sections;
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("CrawlStatus WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle missing runId
        if (!data.runId) {
          console.warn("[CrawlStatus] Event missing runId, ignoring:", data.type);
          return;
        }

        switch (data.type) {
          case "run_status":
            if (data.status === "running") {
              // New run starting - reset all state and set as active run
              console.log(`[CrawlStatus] New run started: ${data.runId}`);
              activeRunIdRef.current = data.runId;
              setCrawlState({
                runId: data.runId,
                isActive: true,
                totalDomains: 0,
                completedDomains: 0,
                failedDomains: 0,
                currentDomain: null,
                sections: resetSections(),
                showSummary: false,
              });
            } else if (data.status === "completed" || data.status === "failed") {
              // Only process completion if it's for the active run
              if (data.runId !== activeRunIdRef.current) {
                console.log(`[CrawlStatus] Ignoring ${data.status} event from different run: ${data.runId} (active: ${activeRunIdRef.current})`);
                return;
              }
              console.log(`[CrawlStatus] Run ${data.status}: ${data.runId}`);
              setCrawlState(prev => ({
                ...prev,
                isActive: false,
                showSummary: true,
              }));
              // Reset activeRunId when run completes
              activeRunIdRef.current = null;
            }
            break;

          case "crawl_progress":
            // Only process if this is the active run
            if (data.runId !== activeRunIdRef.current) {
              console.log(`[CrawlStatus] Ignoring crawl_progress event from different run: ${data.runId} (active: ${activeRunIdRef.current})`);
              return;
            }
            setCrawlState(prev => ({
              ...prev,
              totalDomains: data.total,
              completedDomains: data.completed,
              failedDomains: data.failed,
              currentDomain: data.currentDomain || prev.currentDomain,
            }));
            break;

          case "snapshot_update":
            // Only process if this is the active run
            if (data.runId !== activeRunIdRef.current) {
              console.log(`[CrawlStatus] Ignoring snapshot_update event from different run: ${data.runId} (active: ${activeRunIdRef.current})`);
              return;
            }
            if (data.status === "crawling" && data.domain) {
              // Reset sections for new domain
              setCrawlState(prev => ({
                ...prev,
                currentDomain: data.domain,
                sections: resetSections(),
              }));
            }
            break;

          case "section_progress":
            // Only process if this is the active run
            if (data.runId !== activeRunIdRef.current) {
              console.log(`[CrawlStatus] Ignoring section_progress event from different run: ${data.runId} (active: ${activeRunIdRef.current})`);
              return;
            }
            if (data.domain && data.sectionType) {
              setCrawlState(prev => {
                // Only update if this is for the current domain
                if (prev.currentDomain === data.domain) {
                  return {
                    ...prev,
                    sections: {
                      ...prev.sections,
                      [data.sectionType]: { status: data.status },
                    },
                  };
                }
                return prev;
              });
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing CrawlStatus WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("CrawlStatus WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("CrawlStatus WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [resetSections]);

  const handleDismiss = () => {
    setCrawlState(prev => ({
      ...prev,
      showSummary: false,
      isActive: false,
    }));
  };

  // Don't show anything if not active and not showing summary
  if (!crawlState.isActive && !crawlState.showSummary) {
    return null;
  }

  const progressPercentage = crawlState.totalDomains > 0
    ? Math.round(((crawlState.completedDomains + crawlState.failedDomains) / crawlState.totalDomains) * 100)
    : 0;

  const getSectionIcon = (status: string) => {
    switch (status) {
      case "captured":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />;
      case "capturing":
        return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-500 animate-spin" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96" data-testid="crawl-status-container">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid="text-crawl-title">
              {crawlState.showSummary ? "Crawl Complete" : "Crawling in Progress"}
            </CardTitle>
            <CardDescription data-testid="text-crawl-description">
              {crawlState.showSummary
                ? `${crawlState.completedDomains} succeeded, ${crawlState.failedDomains} failed`
                : `${crawlState.completedDomains + crawlState.failedDomains} of ${crawlState.totalDomains} domains`}
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            data-testid="button-dismiss-crawl-status"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium" data-testid="text-progress-percentage">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} data-testid="progress-overall" />
          </div>

          {/* Success/Failure Counts */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950" data-testid="badge-success-count">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600 dark:text-green-500" />
                {crawlState.completedDomains} succeeded
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950" data-testid="badge-failed-count">
                <XCircle className="h-3 w-3 mr-1 text-red-600 dark:text-red-500" />
                {crawlState.failedDomains} failed
              </Badge>
            </div>
          </div>

          {/* Current Domain & Section Progress */}
          {crawlState.isActive && crawlState.currentDomain && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <div className="text-sm font-medium mb-1">Current Domain</div>
                <div className="text-sm text-muted-foreground truncate" data-testid="text-current-domain">
                  {crawlState.currentDomain}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Section Progress</div>
                <div className="grid grid-cols-1 gap-1">
                  {SECTION_NAMES.map((sectionName) => {
                    const section = crawlState.sections[sectionName] || { status: "pending" };
                    return (
                      <div
                        key={sectionName}
                        className="flex items-center gap-2 text-sm"
                        data-testid={`section-${sectionName}`}
                      >
                        {getSectionIcon(section.status)}
                        <span className="flex-1 truncate">
                          {SECTION_LABELS[sectionName] || sectionName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Summary Message */}
          {crawlState.showSummary && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground" data-testid="text-summary-message">
                {crawlState.failedDomains === 0
                  ? `Successfully crawled all ${crawlState.completedDomains} domains!`
                  : `Crawled ${crawlState.totalDomains} domains with ${crawlState.failedDomains} failures.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
