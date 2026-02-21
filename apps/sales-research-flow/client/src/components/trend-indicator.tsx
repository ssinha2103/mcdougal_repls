import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number | null;
  className?: string;
}

export function TrendIndicator({ value, className }: TrendIndicatorProps) {
  if (value === null || value === undefined) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const isPositive = value > 5;
  const isNegative = value < -5;
  const isFlat = !isPositive && !isNegative;

  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="trend-indicator">
      {isPositive && <TrendingUp className="h-4 w-4 text-chart-2" />}
      {isNegative && <TrendingDown className="h-4 w-4 text-chart-4" />}
      {isFlat && <Minus className="h-4 w-4 text-chart-3" />}
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          isPositive && "text-chart-2",
          isNegative && "text-chart-4",
          isFlat && "text-chart-3"
        )}
      >
        {value > 0 ? "+" : ""}{value.toFixed(1)}%
      </span>
    </div>
  );
}
