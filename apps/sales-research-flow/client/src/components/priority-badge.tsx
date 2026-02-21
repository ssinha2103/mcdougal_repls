import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  score: number | null;
  className?: string;
}

export function PriorityBadge({ score, className }: PriorityBadgeProps) {
  if (score === null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn("font-mono text-xs cursor-help", className)}
              data-testid="priority-na"
            >
              N/A
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Priority score not available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const levelLabel = level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  
  const badgeColor = 
    level === "high" 
      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800" 
      : level === "medium"
      ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-orange-200 dark:border-orange-800"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";

  const tooltipText = 
    level === "high"
      ? "High priority prospect - strong sales opportunity"
      : level === "medium"
      ? "Medium priority - good potential"
      : "Low priority - limited opportunity";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs cursor-help border",
              badgeColor,
              className
            )}
            data-testid={`priority-${level}`}
          >
            {score} - {levelLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Score based on: traffic trend, firm size, keywords, performance, AI visibility
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
