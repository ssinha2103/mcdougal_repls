import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash } from "lucide-react";

interface StatisticsPanelProps {
  statistics: {
    total: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
  };
}

const statConfig = [
  { key: "total", label: "Total Headings", color: "text-foreground" },
  { key: "h1Count", label: "H1 Tags", color: "text-blue-600 dark:text-blue-400" },
  { key: "h2Count", label: "H2 Tags", color: "text-purple-600 dark:text-purple-400" },
  { key: "h3Count", label: "H3 Tags", color: "text-green-600 dark:text-green-400" },
  { key: "h4Count", label: "H4 Tags", color: "text-yellow-600 dark:text-yellow-400" },
  { key: "h5Count", label: "H5 Tags", color: "text-orange-600 dark:text-orange-400" },
  { key: "h6Count", label: "H6 Tags", color: "text-gray-600 dark:text-gray-400" },
];

export function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4" data-testid="heading-statistics">Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
        {statConfig.map((stat) => (
          <Card key={stat.key} className="hover-elevate">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{stat.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div
                className={`text-2xl lg:text-3xl font-bold ${stat.color}`}
                data-testid={`stat-${stat.key}`}
              >
                {statistics[stat.key as keyof typeof statistics]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
