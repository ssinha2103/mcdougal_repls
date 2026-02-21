import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, TrendingUp, MousePointerClick, Star, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { Headline } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { saveFavorite, removeFavorite, isFavorite, getFavorites } from "@/lib/favorites";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeadlineCardProps {
  headline: Headline;
  index: number;
  topic?: string;
  tone?: string;
  onFavoriteChange?: () => void;
}

export function HeadlineCard({ headline, index, topic, tone, onFavoriteChange }: HeadlineCardProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [seoTooltipOpen, setSeoTooltipOpen] = useState(false);
  const [clickTooltipOpen, setClickTooltipOpen] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(headline));
  }, [headline]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(headline.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (favorited) {
      const favorites = getFavorites();
      const toRemove = favorites.find(fav => fav.text === headline.text);
      if (toRemove) {
        removeFavorite(toRemove.id);
      }
    } else {
      if (topic && tone) {
        saveFavorite(headline, topic, tone);
      }
    }
    setFavorited(!favorited);
    onFavoriteChange?.();
  };

  const formatLabel: Record<Headline["format"], string> = {
    listicle: "Listicle",
    question: "Question",
    "how-to": "How-To",
    benefit: "Benefit-Driven",
    guide: "Guide",
    comparison: "Comparison",
    ultimate: "Ultimate",
    tips: "Tips",
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-4";
    if (score >= 60) return "text-chart-2";
    return "text-muted-foreground";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  return (
    <Card className="p-6 relative hover-elevate" data-testid={`card-headline-${index}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground mb-3" data-testid={`text-headline-${index}`}>
            {headline.text}
          </h3>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary" className="text-xs" data-testid={`badge-format-${index}`}>
              {formatLabel[headline.format]}
            </Badge>
            <span className="text-xs text-muted-foreground" data-testid={`text-character-count-${index}`}>
              {headline.characterCount} characters
            </span>
          </div>
          
          {(headline.seoScore !== undefined || headline.clickScore !== undefined) && (
            <div className="space-y-2">
              {headline.seoScore !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-24">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">SEO</span>
                    <Tooltip open={seoTooltipOpen} onOpenChange={setSeoTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSeoTooltipOpen(!seoTooltipOpen);
                          }}
                          className="inline-flex items-center justify-center hover-elevate active-elevate-2 rounded-sm"
                          data-testid={`button-info-seo-${index}`}
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="sr-only">SEO score information</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>SEO Strength: Measures keyword placement, optimal length, and power words</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Progress value={headline.seoScore} className="h-2 flex-1" />
                  <Badge 
                    variant={getScoreVariant(headline.seoScore)} 
                    className="text-xs min-w-10 justify-center"
                    data-testid={`badge-seo-score-${index}`}
                  >
                    {headline.seoScore}/100
                  </Badge>
                </div>
              )}
              {headline.clickScore !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-24">
                    <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Click</span>
                    <Tooltip open={clickTooltipOpen} onOpenChange={setClickTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setClickTooltipOpen(!clickTooltipOpen);
                          }}
                          className="inline-flex items-center justify-center hover-elevate active-elevate-2 rounded-sm"
                          data-testid={`button-info-click-${index}`}
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="sr-only">Click score information</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click-Worthiness: Measures emotional appeal, urgency, and engagement factors</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Progress value={headline.clickScore} className="h-2 flex-1" />
                  <Badge 
                    variant={getScoreVariant(headline.clickScore)} 
                    className="text-xs min-w-10 justify-center"
                    data-testid={`badge-click-score-${index}`}
                  >
                    {headline.clickScore}/100
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {topic && tone && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              data-testid={`button-favorite-${index}`}
            >
              <Star 
                className={`h-4 w-4 ${favorited ? 'fill-primary text-primary' : ''}`} 
              />
              <span className="sr-only">{favorited ? 'Remove from favorites' : 'Add to favorites'}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            data-testid={`button-copy-${index}`}
          >
            {copied ? (
              <Check className="h-4 w-4 text-chart-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy headline</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
