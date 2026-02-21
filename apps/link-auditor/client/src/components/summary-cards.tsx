import { Card, CardContent } from "@/components/ui/card";
import type { LinkAnalysisResult } from "@shared/schema";
import { CheckCircle2, AlertCircle, XCircle, ServerCrash, Link as LinkIcon } from "lucide-react";

interface SummaryCardsProps {
  result: LinkAnalysisResult;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Links",
      value: result.totalLinks,
      icon: LinkIcon,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Success (2xx)",
      value: result.summary.success,
      icon: CheckCircle2,
      color: "text-status-success",
      bgColor: "bg-status-success/5",
    },
    {
      label: "Redirects (3xx)",
      value: result.summary.redirects,
      icon: AlertCircle,
      color: "text-status-redirect",
      bgColor: "bg-status-redirect/5",
    },
    {
      label: "Client Errors (4xx)",
      value: result.summary.clientErrors,
      icon: XCircle,
      color: "text-status-clientError",
      bgColor: "bg-status-clientError/5",
    },
    {
      label: "Server Errors (5xx)",
      value: result.summary.serverErrors,
      icon: ServerCrash,
      color: "text-status-serverError",
      bgColor: "bg-status-serverError/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`${card.bgColor} hover-elevate`}
            data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-3xl font-bold tracking-tight" data-testid={`text-${card.label.toLowerCase().replace(/\s+/g, '-')}-count`}>
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {card.label}
                  </p>
                </div>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
