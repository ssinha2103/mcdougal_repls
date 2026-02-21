import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPITileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function KPITile({ icon: Icon, label, value, trend, className }: KPITileProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      case "neutral":
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend.direction) {
      case "up":
        return "text-chart-2";
      case "down":
        return "text-chart-5";
      case "neutral":
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
          </div>
          <p className="text-2xl font-semibold tracking-tight" data-testid={`kpi-value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            {value}
          </p>
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}
