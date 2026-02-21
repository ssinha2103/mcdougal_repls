import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  statusCode: number;
  statusText: string;
}

export function StatusBadge({ statusCode, statusText }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (statusCode >= 200 && statusCode < 300) {
      return {
        className: "bg-status-success text-white no-default-hover-elevate",
        icon: null,
      };
    }
    if (statusCode >= 300 && statusCode < 400) {
      return {
        className: "bg-status-redirect text-white no-default-hover-elevate",
        icon: <ArrowRight className="h-3 w-3 ml-1" />,
      };
    }
    if (statusCode >= 400 && statusCode < 500) {
      return {
        className: "bg-status-clientError text-white no-default-hover-elevate",
        icon: null,
      };
    }
    return {
      className: "bg-status-serverError text-white no-default-hover-elevate",
      icon: null,
    };
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.className} font-mono text-xs whitespace-nowrap`}>
      {statusCode} {statusText}
      {config.icon}
    </Badge>
  );
}
