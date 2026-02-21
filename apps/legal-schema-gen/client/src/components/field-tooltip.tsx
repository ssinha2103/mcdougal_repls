import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldTooltip } from "@/lib/tooltips";

interface FieldTooltipProps {
  tooltip: FieldTooltip;
}

export function FieldTooltipIcon({ tooltip }: FieldTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center ml-1 text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`tooltip-trigger-${tooltip.field.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        className="max-w-sm p-4 space-y-3"
        data-testid={`tooltip-content-${tooltip.field.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div>
          <h4 className="font-semibold text-sm mb-1">{tooltip.title}</h4>
          <p className="text-xs text-muted-foreground">{tooltip.description}</p>
        </div>
        
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-primary mb-1">SEO Benefit:</p>
          <p className="text-xs text-muted-foreground">{tooltip.seoBenefit}</p>
        </div>
        
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-green-600 dark:text-green-500 mb-1">Best Practice:</p>
          <p className="text-xs text-muted-foreground">{tooltip.bestPractice}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
