import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check, Sparkles, Info, Star, Target, CheckCircle } from "lucide-react";
import { generateMetaDescriptionSchema, type GenerateMetaDescriptionRequest, type MetaDescriptionResponse, type MetaDescription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type QualityLevel = "optimal" | "good" | "short";

interface QualityInfo {
  level: QualityLevel;
  label: string;
  icon: typeof Star;
  variant: "default" | "secondary" | "outline";
}

interface DescriptionScore {
  index: number;
  score: number;
  characterCount: number;
  keywordPosition: number;
}

export default function Generator() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<GenerateMetaDescriptionRequest>({
    resolver: zodResolver(generateMetaDescriptionSchema),
    defaultValues: {
      topic: "",
      primaryKeyword: "",
      secondaryKeyword: "",
    },
  });

  const generateMutation = useMutation<MetaDescriptionResponse, Error, GenerateMetaDescriptionRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-meta-description", data);
      const jsonData = await response.json();
      return jsonData;
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate meta descriptions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateMetaDescriptionRequest) => {
    generateMutation.mutate(data);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Meta description copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getQualityInfo = (count: number): QualityInfo => {
    if (count >= 155 && count <= 160) {
      return {
        level: "optimal",
        label: "Optimal",
        icon: Star,
        variant: "default",
      };
    }
    if (count >= 150 && count < 155) {
      return {
        level: "good",
        label: "Good",
        icon: CheckCircle,
        variant: "secondary",
      };
    }
    return {
      level: "short",
      label: "Short",
      icon: Info,
      variant: "outline",
    };
  };

  const highlightKeywords = (text: string, primaryKeyword: string, secondaryKeyword?: string): JSX.Element => {
    if (!primaryKeyword && !secondaryKeyword) {
      return <>{text}</>;
    }

    const keywords: string[] = [];
    if (primaryKeyword) keywords.push(primaryKeyword);
    if (secondaryKeyword) keywords.push(secondaryKeyword);

    const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, i) => {
          const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
          if (isKeyword) {
            return (
              <span
                key={i}
                className="bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded"
                data-testid={`highlight-keyword-${i}`}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const getKeywordPosition = (text: string, primaryKeyword: string, secondaryKeyword?: string): number => {
    const lowerText = text.toLowerCase();
    const primaryPos = primaryKeyword ? lowerText.indexOf(primaryKeyword.toLowerCase()) : -1;
    const secondaryPos = secondaryKeyword ? lowerText.indexOf(secondaryKeyword.toLowerCase()) : -1;

    if (primaryPos === -1 && secondaryPos === -1) return Infinity;
    if (primaryPos === -1) return secondaryPos;
    if (secondaryPos === -1) return primaryPos;
    return Math.min(primaryPos, secondaryPos);
  };

  const getKeywordCoverage = (text: string, primaryKeyword: string, secondaryKeyword?: string): { hasPrimary: boolean; hasSecondary: boolean; text: string } => {
    const lowerText = text.toLowerCase();
    const hasPrimary = primaryKeyword ? lowerText.includes(primaryKeyword.toLowerCase()) : false;
    const hasSecondary = secondaryKeyword ? lowerText.includes(secondaryKeyword.toLowerCase()) : false;

    let coverageText = "";
    if (hasPrimary && hasSecondary && secondaryKeyword) {
      coverageText = "Both keywords included";
    } else if (hasPrimary && !secondaryKeyword) {
      coverageText = "Primary keyword included";
    } else if (hasPrimary) {
      coverageText = "Primary keyword only";
    } else if (hasSecondary) {
      coverageText = "Secondary keyword only";
    } else {
      coverageText = "Keywords not found";
    }

    return { hasPrimary, hasSecondary, text: coverageText };
  };

  const getHelpfulTip = (desc: MetaDescription, primaryKeyword: string, secondaryKeyword?: string): string => {
    const quality = getQualityInfo(desc.characterCount);
    const keywordPos = getKeywordPosition(desc.description, primaryKeyword, secondaryKeyword);
    const coverage = getKeywordCoverage(desc.description, primaryKeyword, secondaryKeyword);

    const tips: string[] = [];

    if (quality.level === "optimal") {
      tips.push("Great length for SEO");
    } else if (quality.level === "short") {
      tips.push("Consider adding more detail");
    }

    if (keywordPos !== Infinity && keywordPos <= 50) {
      tips.push("Keywords appear early");
    }

    if (coverage.hasPrimary && coverage.hasSecondary) {
      tips.push("Excellent keyword coverage");
    }

    return tips.join(" • ") || "Ready to use";
  };

  const bestPickIndex = useMemo(() => {
    if (!generateMutation.data?.descriptions || generateMutation.data.descriptions.length === 0) {
      return -1;
    }

    const primaryKeyword = form.getValues("primaryKeyword");
    const secondaryKeyword = form.getValues("secondaryKeyword");

    const scores: DescriptionScore[] = generateMutation.data.descriptions.map((desc, index) => {
      let score = 0;

      if (desc.characterCount >= 155 && desc.characterCount <= 160) {
        score += 100;
      } else if (desc.characterCount >= 150 && desc.characterCount < 155) {
        score += 80;
      } else if (desc.characterCount < 150) {
        score += Math.max(0, 60 - (150 - desc.characterCount));
      } else {
        score += Math.max(0, 40 - (desc.characterCount - 160));
      }

      const keywordPos = getKeywordPosition(desc.description, primaryKeyword, secondaryKeyword);
      if (keywordPos !== Infinity) {
        score += Math.max(0, 50 - keywordPos / 2);
      }

      const coverage = getKeywordCoverage(desc.description, primaryKeyword, secondaryKeyword);
      if (coverage.hasPrimary && coverage.hasSecondary) {
        score += 30;
      } else if (coverage.hasPrimary) {
        score += 20;
      }

      return { index, score, characterCount: desc.characterCount, keywordPosition: keywordPos };
    });

    const bestScore = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    , scores[0]);

    return bestScore.index;
  }, [generateMutation.data, form]);

  const sortedDescriptions = useMemo(() => {
    if (!generateMutation.data?.descriptions || generateMutation.data.descriptions.length === 0 || bestPickIndex === -1) {
      return generateMutation.data?.descriptions || [];
    }

    const descriptions = [...generateMutation.data.descriptions];
    const bestPick = descriptions[bestPickIndex];
    const others = descriptions.filter((_, index) => index !== bestPickIndex);
    
    return [bestPick, ...others];
  }, [generateMutation.data?.descriptions, bestPickIndex]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Generate Perfect Meta Descriptions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create SEO-optimized meta descriptions with AI. Integrate keywords naturally, stay under 160 characters, and include compelling CTAs.
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webpage Topic</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your webpage content (e.g., 'A comprehensive guide to organic gardening for beginners, covering soil preparation, plant selection, and sustainable practices')"
                          className="min-h-24 resize-none"
                          data-testid="input-topic"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what your webpage is about. Be specific for better results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryKeyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Keyword</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., organic gardening"
                            data-testid="input-primary-keyword"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your main target keyword
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryKeyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Keyword (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., beginner guide"
                            data-testid="input-secondary-keyword"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional keyword to include
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  size="lg"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Meta Descriptions
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {generateMutation.data && generateMutation.data.descriptions && generateMutation.data.descriptions.length > 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Your Generated Meta Descriptions</h3>
              <p className="text-muted-foreground">
                Choose the one that best fits your page, or use as inspiration
              </p>
            </div>

            <div className="space-y-4">
              {sortedDescriptions.map((desc, index) => {
                const quality = getQualityInfo(desc.characterCount);
                const QualityIcon = quality.icon;
                const isBestPick = index === 0 && bestPickIndex !== -1;
                const primaryKeyword = form.getValues("primaryKeyword");
                const secondaryKeyword = form.getValues("secondaryKeyword");
                const coverage = getKeywordCoverage(desc.description, primaryKeyword, secondaryKeyword);
                const tip = getHelpfulTip(desc, primaryKeyword, secondaryKeyword);

                return (
                  <Card
                    key={index}
                    className={`hover-elevate transition-all duration-200 ${isBestPick ? "border-primary shadow-md" : ""}`}
                    data-testid={`card-description-${index}`}
                  >
                    <CardContent className="p-6">
                      {/* Best Pick Badge */}
                      {isBestPick && (
                        <div className="flex items-center gap-2 mb-4" data-testid={`badge-best-pick-${index}`}>
                          <Badge variant="default" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Best Pick
                          </Badge>
                          <span className="text-xs text-muted-foreground">Recommended</span>
                        </div>
                      )}

                      {/* Header with Badges */}
                      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Character Count Badge */}
                          <Badge
                            variant="secondary"
                            className="shrink-0 gap-1"
                            data-testid={`badge-char-count-${index}`}
                          >
                            <Target className="h-3 w-3" />
                            {desc.characterCount}/160
                          </Badge>

                          {/* Quality Badge */}
                          <Badge
                            variant={quality.variant}
                            className="shrink-0 gap-1"
                            data-testid={`badge-quality-${index}`}
                          >
                            <QualityIcon className="h-3 w-3" />
                            {quality.label}
                          </Badge>

                          {/* Keyword Coverage Badge */}
                          <Badge
                            variant="outline"
                            className="shrink-0 gap-1"
                            data-testid={`badge-coverage-${index}`}
                          >
                            <Check className="h-3 w-3" />
                            {coverage.text}
                          </Badge>
                        </div>

                        {/* Copy Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(desc.description, index)}
                          data-testid={`button-copy-${index}`}
                          className="shrink-0"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Description with Keyword Highlighting */}
                      <p className="text-sm leading-relaxed mb-3" data-testid={`text-description-${index}`}>
                        {highlightKeywords(desc.description, primaryKeyword, secondaryKeyword)}
                      </p>

                      {/* Helpful Tip */}
                      <p className="text-xs text-muted-foreground" data-testid={`text-tip-${index}`}>
                        💡 {tip}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Pro Tips Section */}
        <Alert className="mt-12">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong className="font-semibold">Pro Tips:</strong> Keep meta descriptions between 150-160 characters for optimal display in search results. Include your primary keyword near the beginning and end with a clear call-to-action to improve click-through rates.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
