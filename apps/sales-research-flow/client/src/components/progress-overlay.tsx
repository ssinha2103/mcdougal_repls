import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressOverlayProps {
  total: number;
  processed: number;
  failed: number;
  status: "processing" | "completed" | "failed";
}

export function ProgressOverlay({ total, processed, failed, status }: ProgressOverlayProps) {
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isComplete = status === "completed";
  const isFailed = status === "failed";

  return (
    <Card className="p-6 shadow-lg" data-testid="progress-overlay">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle2 className="h-6 w-6 text-chart-2" />
          ) : isFailed ? (
            <XCircle className="h-6 w-6 text-chart-4" />
          ) : (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {isComplete
                ? "Processing Complete"
                : isFailed
                ? "Processing Failed"
                : "Enriching Domains..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {processed} of {total} domains processed
            </p>
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className={cn(
                "h-2 w-2 rounded-full",
                isComplete ? "bg-chart-2" : "bg-primary"
              )} />
              <span className="text-muted-foreground">
                {processed} processed
              </span>
            </div>
            {failed > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-chart-4" />
                <span className="text-muted-foreground">{failed} failed</span>
              </div>
            )}
          </div>
          <span className="font-medium tabular-nums">{percentage}%</span>
        </div>
      </div>
    </Card>
  );
}
