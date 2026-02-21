import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchHistoryItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectKeyword: (keyword: string) => void;
}

export function SearchHistory({ history, onSelectKeyword }: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card data-testid="card-history">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Recent Searches</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {history.slice(0, 10).map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => onSelectKeyword(item.keyword)}
              className="gap-2"
              data-testid={`button-history-${item.id}`}
            >
              {item.keyword}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
