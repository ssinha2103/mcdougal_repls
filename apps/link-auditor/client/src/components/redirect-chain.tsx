import type { RedirectStep } from "@shared/schema";
import { ArrowRight, ExternalLink } from "lucide-react";
import { StatusBadge } from "./status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RedirectChainProps {
  redirectChain: RedirectStep[];
  finalUrl: string;
  finalStatusCode: number;
  finalStatusText: string;
}

export function RedirectChain({ redirectChain, finalUrl, finalStatusCode, finalStatusText }: RedirectChainProps) {
  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col gap-2 py-2" data-testid="redirect-chain">
      {redirectChain.map((step, index) => (
        <div key={`${step.url}-${index}`} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <StatusBadge statusCode={step.statusCode} statusText={step.statusText} />
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline inline-flex items-center gap-1 font-mono text-sm"
                  data-testid={`redirect-step-${index}`}
                >
                  {truncateUrl(step.url)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-all">{step.url}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      ))}
      
      <div className="flex items-center gap-2">
        <StatusBadge statusCode={finalStatusCode} statusText={finalStatusText} />
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline inline-flex items-center gap-1 font-mono text-sm"
              data-testid="redirect-final-destination"
            >
              {truncateUrl(finalUrl)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-all">{finalUrl}</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-xs text-muted-foreground ml-2">(Final)</span>
      </div>
    </div>
  );
}
