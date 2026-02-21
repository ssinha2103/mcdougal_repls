import { Badge } from "@/components/ui/badge";
import type { DomainStatus, RunStatus } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: DomainStatus | RunStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending":
      case "queued":
        return "bg-muted text-muted-foreground border-muted-border";
      case "running":
      case "crawling":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "paused":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "completed":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "failed":
      case "cancelled":
        return "bg-chart-5/10 text-chart-5 border-chart-5/20";
      default:
        return "bg-muted text-muted-foreground border-muted-border";
    }
  };

  const getDot = (s: string) => {
    const isActive = s === "running" || s === "crawling";
    return (
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
          isActive && "animate-pulse",
          getStatusColor(s).split(" ")[0]
        )}
      />
    );
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border flex items-center gap-0",
        getStatusColor(status),
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {getDot(status)}
      {status}
    </Badge>
  );
}
