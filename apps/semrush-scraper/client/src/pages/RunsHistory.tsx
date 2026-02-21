import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Eye, Download, Play, Pause, X } from "lucide-react";
import { History } from "lucide-react";
import type { RunWithProgress } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function RunsHistory() {
  const { data: runs = [], isLoading } = useQuery<RunWithProgress[]>({
    queryKey: ["/api/runs"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading runs...</p>
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No crawl runs yet"
        description="Your crawl history will appear here once you start uploading and analyzing domains."
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
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Runs History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all crawl sessions
        </p>
      </div>

      {/* Runs List */}
      <div className="space-y-3">
        {runs.map((run) => {
          const progress = run.totalDomains > 0
            ? Math.round((run.completedDomains / run.totalDomains) * 100)
            : 0;

          return (
            <Card key={run.id} className="p-4 hover-elevate" data-testid={`card-run-${run.id}`}>
              <div className="flex items-start justify-between gap-4">
                {/* Run Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {run.name || `Run ${run.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={run.status as any} />
                        <span className="text-xs text-muted-foreground">
                          {run.createdAt && formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {run.status === "running" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{run.completedDomains} / {run.totalDomains} domains</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Total</div>
                      <div className="font-medium">{run.totalDomains}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Completed</div>
                      <div className="font-medium text-chart-2">{run.completedDomains}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Failed</div>
                      <div className="font-medium text-chart-5">{run.failedDomains}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Database</div>
                      <div className="font-medium font-mono uppercase">{run.database}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {run.status === "running" && (
                    <>
                      <Button size="sm" variant="outline" data-testid="button-pause-run">
                        <Pause className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-cancel-run">
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {run.status === "paused" && (
                    <Button size="sm" variant="outline" data-testid="button-resume-run">
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {(run.status === "completed" || run.status === "failed") && (
                    <>
                      <Button size="sm" variant="outline" data-testid="button-view-run">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-export-run">
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
