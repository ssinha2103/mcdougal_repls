import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  flag: "urgent" | "review" | "healthy" | null;
  className?: string;
}

export function UrgencyBadge({ flag, className }: UrgencyBadgeProps) {
  if (!flag) return null;

  const variants = {
    urgent: {
      label: "Urgent",
      className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      dotColor: "bg-chart-4",
    },
    review: {
      label: "Review",
      className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      dotColor: "bg-chart-3",
    },
    healthy: {
      label: "Healthy",
      className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      dotColor: "bg-chart-2",
    },
  };

  const variant = variants[flag];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", variant.className, className)}
      data-testid={`badge-urgency-${flag}`}
    >
      <span className={cn("h-2 w-2 rounded-full", variant.dotColor)} />
      {variant.label}
    </Badge>
  );
}
