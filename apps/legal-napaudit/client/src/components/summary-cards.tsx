import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";

interface SummaryCardsProps {
  summary: {
    totalDirectories: number;
    consistent: number;
    inconsistent: number;
    missing: number;
  };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Directories</p>
            <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-total-directories">
              {summary.totalDirectories}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Consistent Listings</p>
            <p className="text-3xl font-bold text-chart-2 mt-2" data-testid="text-consistent-count">
              {summary.consistent}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-chart-2" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inconsistencies Found</p>
            <p className="text-3xl font-bold text-chart-4 mt-2" data-testid="text-inconsistent-count">
              {summary.inconsistent}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-chart-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
