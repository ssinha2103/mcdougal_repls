import { type OrganicResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganicResultsTableProps {
  results: OrganicResult[];
}

export function OrganicResultsTable({ results }: OrganicResultsTableProps) {
  const getRankBadgeColor = (position: number) => {
    if (position <= 3) return "bg-chart-2 text-white";
    if (position <= 7) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No organic results found for this search.</p>
          </CardContent>
        </Card>
      ) : (
        results.map((result) => (
          <Card key={result.position} data-testid={`card-organic-${result.position}`}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md font-bold text-sm ${getRankBadgeColor(result.position)}`}>
                  #{result.position}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight" data-testid={`text-organic-title-${result.position}`}>
                    {result.title}
                  </CardTitle>
                  {result.domain && (
                    <p className="text-sm text-muted-foreground mt-1">{result.domain}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.claimed !== undefined && (
                  <Badge variant={result.claimed ? "default" : "secondary"} className="gap-1">
                    {result.claimed ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Claimed
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Unclaimed
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.description && (
                <p className="text-sm text-foreground leading-relaxed">{result.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                {result.rating !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-chart-3 text-chart-3" />
                    <span className="font-semibold" data-testid={`text-organic-rating-${result.position}`}>
                      {result.rating.toFixed(1)}
                    </span>
                    {result.reviewCount !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        ({result.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid={`button-organic-url-${result.position}`}
                >
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
