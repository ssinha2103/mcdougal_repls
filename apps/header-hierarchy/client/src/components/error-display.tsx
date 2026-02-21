import { type SEOError, type Heading } from "@shared/schema";
import { AlertTriangle, XCircle, Info } from "lucide-react";

interface ErrorDisplayProps {
  errors: SEOError[];
  headings: Heading[];
}

const errorConfig = {
  missing_h1: {
    icon: XCircle,
    color: "destructive",
    title: "Missing H1 Tag",
  },
  multiple_h1: {
    icon: AlertTriangle,
    color: "chart-3",
    title: "Multiple H1 Tags",
  },
  hierarchy_gap: {
    icon: AlertTriangle,
    color: "chart-3",
    title: "Hierarchy Gap Detected",
  },
  empty_heading: {
    icon: Info,
    color: "chart-3",
    title: "Empty Heading Found",
  },
};

export function ErrorDisplay({ errors, headings }: ErrorDisplayProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">SEO Issues</h2>
      
      {errors.map((error, index) => {
        const config = errorConfig[error.type];
        const Icon = config.icon;
        const isDestructive = config.color === "destructive";
        
        return (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              isDestructive
                ? "bg-destructive/10 border-destructive/20"
                : "bg-chart-3/10 border-chart-3/20"
            }`}
            data-testid={`error-${error.type}`}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  isDestructive ? "text-destructive" : "text-chart-3"
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    isDestructive ? "text-destructive" : "text-chart-3"
                  }`}
                >
                  {config.title}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isDestructive ? "text-destructive/90" : "text-chart-3/90"
                  }`}
                >
                  {error.message}
                </p>
                
                {error.details && (
                  <p
                    className={`text-sm mt-2 ${
                      isDestructive ? "text-destructive/80" : "text-chart-3/80"
                    }`}
                  >
                    {error.details}
                  </p>
                )}

                {error.affectedHeadings && error.affectedHeadings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p
                      className={`text-xs font-medium ${
                        isDestructive ? "text-destructive" : "text-chart-3"
                      }`}
                    >
                      Affected headings:
                    </p>
                    {error.affectedHeadings.map((pos) => {
                      const heading = headings[pos];
                      return (
                        <div
                          key={pos}
                          className={`text-sm pl-4 border-l-2 ${
                            isDestructive
                              ? "border-destructive/30"
                              : "border-chart-3/30"
                          }`}
                        >
                          <span className="font-mono text-xs">H{heading.level}</span>:{" "}
                          {heading.text || "(empty)"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
