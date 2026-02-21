import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Activity } from "lucide-react";

interface PerformanceBadgeProps {
  score: number | null;
  mobileScore?: number | null;
  desktopScore?: number | null;
  fcp?: number | null; // milliseconds
  lcp?: number | null; // milliseconds
  fid?: number | null; // milliseconds
  cls?: number | null; // score
}

export function PerformanceBadge({
  score,
  mobileScore,
  desktopScore,
  fcp,
  lcp,
  fid,
  cls,
}: PerformanceBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className="gap-1" data-testid="badge-performance-unknown">
        <Activity className="h-3 w-3" />
        N/A
      </Badge>
    );
  }

  const getVariant = (score: number): "destructive" | "default" | "secondary" => {
    if (score < 50) return "destructive";
    if (score < 90) return "default";
    return "secondary";
  };

  const getLabel = (score: number): string => {
    if (score < 50) return "Poor";
    if (score < 90) return "Needs Work";
    return "Good";
  };

  const formatVital = (value: number | null | undefined, unit: string): string => {
    if (value === null || value === undefined) return "—";
    return `${value}${unit}`;
  };

  const getFCPStatus = (fcp: number | null | undefined): string => {
    if (fcp === null || fcp === undefined) return "";
    if (fcp < 1800) return "✓ Good";
    if (fcp < 3000) return "⚠ Needs improvement";
    return "✗ Poor";
  };

  const getLCPStatus = (lcp: number | null | undefined): string => {
    if (lcp === null || lcp === undefined) return "";
    if (lcp <= 2500) return "✓ Good";
    if (lcp <= 4000) return "⚠ Needs improvement";
    return "✗ Poor";
  };

  const getFIDStatus = (fid: number | null | undefined): string => {
    if (fid === null || fid === undefined) return "";
    if (fid <= 100) return "✓ Good";
    if (fid <= 300) return "⚠ Needs improvement";
    return "✗ Poor";
  };

  const getCLSStatus = (cls: number | null | undefined): string => {
    if (cls === null || cls === undefined) return "";
    if (cls <= 0.1) return "✓ Good";
    if (cls <= 0.25) return "⚠ Needs improvement";
    return "✗ Poor";
  };

  const hasVitals = fcp !== null || lcp !== null || fid !== null || cls !== null;

  const content = (
    <Badge
      variant={getVariant(score)}
      className="gap-1"
      data-testid={`badge-performance-${score}`}
    >
      <Activity className="h-3 w-3" />
      {score}
    </Badge>
  );

  if (!hasVitals && !mobileScore && !desktopScore) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-xs" data-testid="tooltip-performance-details">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b border-border pb-1">
              Performance Score: {score}
            </div>
            
            {(mobileScore !== null || desktopScore !== null) && (
              <div className="text-xs space-y-1">
                {mobileScore !== null && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-medium">{mobileScore}</span>
                  </div>
                )}
                {desktopScore !== null && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Desktop:</span>
                    <span className="font-medium">{desktopScore}</span>
                  </div>
                )}
              </div>
            )}

            {hasVitals && (
              <>
                <div className="font-semibold text-sm border-b border-border pb-1 pt-1">
                  Core Web Vitals
                </div>
                <div className="text-xs space-y-1">
                  {fcp !== null && fcp !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">FCP:</span>
                      <span className="font-medium">
                        {formatVital(fcp, "ms")} {getFCPStatus(fcp)}
                      </span>
                    </div>
                  )}
                  {lcp !== null && lcp !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">LCP:</span>
                      <span className="font-medium">
                        {formatVital(lcp, "ms")} {getLCPStatus(lcp)}
                      </span>
                    </div>
                  )}
                  {fid !== null && fid !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">FID:</span>
                      <span className="font-medium">
                        {formatVital(fid, "ms")} {getFIDStatus(fid)}
                      </span>
                    </div>
                  )}
                  {cls !== null && cls !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">CLS:</span>
                      <span className="font-medium">
                        {formatVital(cls, "")} {getCLSStatus(cls)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground pt-1 border-t border-border">
              Measured by PageSpeed Insights
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
