import { Card, CardContent } from "@/components/ui/card";
import { Building2, Star, CheckCircle2, Trophy } from "lucide-react";

interface StatsOverviewProps {
  totalResults: number;
  avgRating?: number;
  claimedPercentage?: number;
  topCompetitor?: string;
}

export function StatsOverview({
  totalResults,
  avgRating,
  claimedPercentage,
  topCompetitor,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Results
              </p>
              <p className="text-2xl font-bold font-mono mt-2" data-testid="text-total-results">
                {totalResults}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Avg Rating
              </p>
              <p className="text-2xl font-bold font-mono mt-2" data-testid="text-avg-rating">
                {avgRating ? avgRating.toFixed(1) : "N/A"}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-chart-3/10">
              <Star className="h-5 w-5 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Claimed Profiles
              </p>
              <p className="text-2xl font-bold font-mono mt-2" data-testid="text-claimed-percentage">
                {claimedPercentage !== undefined ? `${claimedPercentage}%` : "N/A"}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-chart-2/10">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Top Competitor
              </p>
              <p className="text-base font-semibold mt-2 truncate" data-testid="text-top-competitor">
                {topCompetitor || "N/A"}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-chart-5/10">
              <Trophy className="h-5 w-5 text-chart-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
