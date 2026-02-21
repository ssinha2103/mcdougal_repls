import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Database } from "lucide-react";

interface DataSourceBadgeProps {
  source: "semrush" | "dataforseo" | null;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  if (!source) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const sourceLabel = source === "semrush" ? "SEMrush" : "DataForSEO";
  const tooltipText = source === "semrush" 
    ? "Data provided by SEMrush API" 
    : "Data provided by DataForSEO API (fallback)";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="secondary" 
          className="gap-1 cursor-help"
          data-testid={`badge-data-source-${source}`}
        >
          <Database className="h-3 w-3" />
          {sourceLabel}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
