import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Sliders, RotateCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ScoreWeights {
  trafficDecline: number;
  keywordLoss: number;
  competitionGap: number;
  intentMix: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  trafficDecline: 30,
  keywordLoss: 25,
  competitionGap: 25,
  intentMix: 20,
};

interface ScoreWeightSlidersProps {
  weights: ScoreWeights;
  onWeightsChange: (weights: ScoreWeights) => void;
}

export function ScoreWeightSliders({ weights, onWeightsChange }: ScoreWeightSlidersProps) {
  const handleReset = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isDefault = JSON.stringify(weights) === JSON.stringify(DEFAULT_WEIGHTS);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Custom Score Weights</h3>
          </div>
          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-weights"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Formula Explanation */}
        <div className="bg-muted/50 rounded-md p-3 text-xs space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Info className="h-3 w-3" />
            <span className="font-medium">Weighted Average Formula</span>
          </div>
          <div className="font-mono text-[11px]">
            Score = (Decline × {weights.trafficDecline}% + Loss × {weights.keywordLoss}% + Gap × {weights.competitionGap}% + Intent × {weights.intentMix}%)
          </div>
          <div className="text-muted-foreground mt-1">
            Total: {total}% {total !== 100 && <span className="text-chart-5">(Should sum to 100%)</span>}
          </div>
        </div>

        {/* Traffic Decline Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-xs font-medium">Traffic Decline Weight</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">How much declining organic traffic impacts the score</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {weights.trafficDecline}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[weights.trafficDecline]}
            onValueChange={([value]) =>
              onWeightsChange({ ...weights, trafficDecline: value })
            }
            data-testid="slider-traffic-decline"
          />
        </div>

        {/* Keyword Loss Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-xs font-medium">Keyword Loss Weight</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">How much lost keyword rankings impact the score</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {weights.keywordLoss}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[weights.keywordLoss]}
            onValueChange={([value]) =>
              onWeightsChange({ ...weights, keywordLoss: value })
            }
            data-testid="slider-keyword-loss"
          />
        </div>

        {/* Competition Gap Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-xs font-medium">Competition Gap Weight</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">How much competitive positioning affects the score</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {weights.competitionGap}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[weights.competitionGap]}
            onValueChange={([value]) =>
              onWeightsChange({ ...weights, competitionGap: value })
            }
            data-testid="slider-competition-gap"
          />
        </div>

        {/* Intent Mix Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-xs font-medium">Intent Mix Weight</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">How much search intent distribution impacts the score</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {weights.intentMix}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[weights.intentMix]}
            onValueChange={([value]) =>
              onWeightsChange({ ...weights, intentMix: value })
            }
            data-testid="slider-intent-mix"
          />
        </div>
      </div>
    </Card>
  );
}
