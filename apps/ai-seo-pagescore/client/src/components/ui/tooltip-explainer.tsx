import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface TooltipExplainerProps {
  title: string;
  description: string;
  goodRange?: string;
  tips?: string[];
  className?: string;
}

export function TooltipExplainer({ 
  title, 
  description, 
  goodRange, 
  tips,
  className = "" 
}: TooltipExplainerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`h-4 w-4 text-muted-foreground hover:text-foreground cursor-help ${className}`} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4" side="top">
          <div className="space-y-2">
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </div>
            {goodRange && (
              <div className="text-xs">
                <span className="font-medium text-green-600">Good range: </span>
                <span className="text-muted-foreground">{goodRange}</span>
              </div>
            )}
            {tips && tips.length > 0 && (
              <div className="text-xs">
                <div className="font-medium text-blue-600 mb-1">Tips:</div>
                <ul className="space-y-0.5 text-muted-foreground">
                  {tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}