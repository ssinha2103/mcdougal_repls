import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, BarChart3, Type, AlertCircle, Lightbulb, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TextAnalysis } from "@shared/schema";

const SAMPLE_TEXT = `Content marketing is a strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience. The goal of content marketing is to drive profitable customer action through educational and engaging content rather than direct promotional messaging. Successful content marketing requires understanding your target audience, creating high-quality content that addresses their needs, and distributing that content through the right channels. When done effectively, content marketing builds trust, establishes authority, and creates lasting relationships with customers.`;

const SAMPLE_KEYWORD = "content marketing";

export default function Analyzer() {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analyze", {
        text,
        keyword,
      });
      const result = await response.json() as TextAnalysis;
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
  });

  const handleAnalyze = () => {
    if (text.trim() && keyword.trim()) {
      analyzeMutation.mutate();
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setKeyword(SAMPLE_KEYWORD);
    setAnalysis(null);
  };

  const getDensityColor = (status: string) => {
    if (status === "low") return "text-primary";
    if (status === "optimal") return "text-chart-2";
    if (status === "warning") return "text-chart-3";
    return "text-chart-4";
  };

  const getReadabilityColor = (level: string) => {
    if (level === "very_easy" || level === "easy") return "text-chart-2";
    if (level === "fairly_easy" || level === "standard") return "text-primary";
    if (level === "fairly_difficult") return "text-chart-3";
    return "text-chart-4";
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-title">
            Analyze Your Content for SEO
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant insights on keyword density and readability. Optimize your content for search engines with AI-powered analysis of word frequencies, readability scores, and keyword suggestions.
          </p>
        </div>

        {/* Input Form Section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="text-input" className="text-base">
              Content Text
            </Label>
            <Textarea
              id="text-input"
              placeholder="Paste your article or content here for analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-64 resize-none text-base"
              data-testid="input-text"
            />
            <p className="text-sm text-muted-foreground">
              {text.length} characters
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="keyword-input" className="text-base">
              Target Keyword
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="keyword-input"
                placeholder="Enter your target keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
                data-testid="input-keyword"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              onClick={handleAnalyze}
              disabled={!text.trim() || !keyword.trim() || analyzeMutation.isPending}
              size="lg"
              className="sm:min-w-48"
              data-testid="button-analyze"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Content"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadSample}
              data-testid="button-sample"
            >
              Load Sample
            </Button>
          </div>

          {analyzeMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to analyze text. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Loading State */}
        {analyzeMutation.isPending && (
          <div className="space-y-6 pt-8">
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && !analyzeMutation.isPending && (
          <div className="space-y-8 pt-8">
            {/* Key Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Keyword Density Card with Benchmarking */}
              <Card data-testid="card-density">
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    Keyword Density
                  </CardDescription>
                  <CardTitle className={`text-4xl font-bold font-mono ${getDensityColor(analysis.keywordDensity.status)}`}>
                    {analysis.keywordDensity.density.toFixed(2)}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    "{analysis.keywordDensity.keyword}" appears{" "}
                    <span className="font-semibold text-foreground">
                      {analysis.keywordDensity.count} times
                    </span>
                  </p>
                  <Badge
                    variant={
                      analysis.keywordDensity.status === "low"
                        ? "outline"
                        : analysis.keywordDensity.status === "optimal"
                        ? "default"
                        : analysis.keywordDensity.status === "warning"
                        ? "secondary"
                        : "destructive"
                    }
                    data-testid="badge-density-status"
                  >
                    {analysis.keywordDensity.status === "low" && "Too Low - Add More"}
                    {analysis.keywordDensity.status === "optimal" && "Optimal Range"}
                    {analysis.keywordDensity.status === "warning" && "Slightly High"}
                    {analysis.keywordDensity.status === "danger" && "Keyword Stuffing"}
                  </Badge>
                  
                  {/* Benchmarking Visualization */}
                  <div className="mt-4 space-y-2" data-testid="density-benchmark">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Industry Benchmark</p>
                    <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                      {/* Benchmark zones */}
                      <div className="absolute inset-0 flex">
                        <div className="bg-primary/20" style={{ width: '10%' }}></div>
                        <div className="bg-chart-2/30" style={{ width: '40%' }}></div>
                        <div className="bg-chart-3/30" style={{ width: '30%' }}></div>
                        <div className="bg-chart-4/30" style={{ width: '20%' }}></div>
                      </div>
                      {/* Current position indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-foreground"
                        style={{
                          left: `clamp(8px, ${analysis.keywordDensity.density * 20}%, calc(100% - 8px))`,
                          transform: 'translateX(-50%)',
                        }}
                        data-testid="density-indicator"
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-chart-2">0.5-2.5%</span>
                      <span>5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Words Card */}
              <Card data-testid="card-stats">
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    Total Words
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-mono text-foreground">
                    {analysis.totalWords}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {analysis.totalSentences} sentences
                  </p>
                </CardContent>
              </Card>

              {/* Readability Score Card */}
              <Card data-testid="card-readability" className="md:col-span-2">
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    Readability Scores
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold">Multiple Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Flesch Reading Ease</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex" data-testid="info-flesch-ease">
                              <span className="sr-only">Information about Flesch Reading Ease score</span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Measures readability on a 0-100 scale. Higher scores mean easier to read. 90-100 is very easy (5th grade), 0-30 is very difficult (college graduate).</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className={`text-3xl font-bold font-mono ${getReadabilityColor(analysis.readability.fleschReadingEase.level)}`}>
                        {analysis.readability.fleschReadingEase.score.toFixed(1)}
                      </p>
                      <Badge variant="outline" className="mt-1" data-testid="badge-readability-level">
                        {analysis.readability.fleschReadingEase.interpretation}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Flesch-Kincaid Grade</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex" data-testid="info-flesch-kincaid">
                              <span className="sr-only">Information about Flesch-Kincaid Grade Level</span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Indicates the U.S. school grade level needed to understand the text. Grade 8 = 8th grade level.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-3xl font-bold font-mono text-foreground">
                        Grade {analysis.readability.fleschKincaid.gradeLevel}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.readability.fleschKincaid.interpretation}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">SMOG Index</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex" data-testid="info-smog">
                              <span className="sr-only">Information about SMOG Index</span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Simple Measure of Gobbledygook. Estimates years of education needed to understand the text based on complex words.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-3xl font-bold font-mono text-foreground">
                        Grade {analysis.readability.smogIndex.gradeLevel}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.readability.smogIndex.interpretation}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Coleman-Liau Index</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex" data-testid="info-coleman-liau">
                              <span className="sr-only">Information about Coleman-Liau Index</span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Grade level based on character count rather than syllables. More accurate for texts with technical terms.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-3xl font-bold font-mono text-foreground">
                        Grade {analysis.readability.colemanLiau.gradeLevel}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.readability.colemanLiau.interpretation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Word Frequencies and N-grams Tabs */}
            <Tabs defaultValue="words" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="words" data-testid="tab-words">
                  <Type className="mr-2 h-4 w-4" />
                  Top Words
                </TabsTrigger>
                <TabsTrigger value="bigrams" data-testid="tab-bigrams">
                  Bigrams
                </TabsTrigger>
                <TabsTrigger value="trigrams" data-testid="tab-trigrams">
                  Trigrams
                </TabsTrigger>
              </TabsList>

              <TabsContent value="words" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Most Frequent Words</CardTitle>
                    <CardDescription>
                      Top words after removing common stop words
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analysis.wordFrequencies.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-md hover-elevate"
                          style={{
                            backgroundColor: index % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)",
                          }}
                          data-testid={`word-${index}`}
                        >
                          <span className="font-medium">{item.word}</span>
                          <Badge variant="secondary" data-testid={`word-count-${index}`}>
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bigrams" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Top Bigrams (2-word phrases)</CardTitle>
                    <CardDescription>
                      Most common two-word combinations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analysis.bigrams.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-md hover-elevate"
                          style={{
                            backgroundColor: index % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)",
                          }}
                          data-testid={`bigram-${index}`}
                        >
                          <span className="font-medium">{item.phrase}</span>
                          <Badge variant="secondary" data-testid={`bigram-count-${index}`}>
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trigrams" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Top Trigrams (3-word phrases)</CardTitle>
                    <CardDescription>
                      Most common three-word combinations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analysis.trigrams.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-md hover-elevate"
                          style={{
                            backgroundColor: index % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)",
                          }}
                          data-testid={`trigram-${index}`}
                        >
                          <span className="font-medium">{item.phrase}</span>
                          <Badge variant="secondary" data-testid={`trigram-count-${index}`}>
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Keyword Suggestions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Keyword Suggestions</CardTitle>
                </div>
                <CardDescription>
                  Recommended keywords based on content analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.keywordSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md hover-elevate"
                      style={{
                        backgroundColor: index % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)",
                      }}
                      data-testid={`suggestion-${index}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium">{suggestion.keyword}</span>
                        <Badge
                          variant={
                            suggestion.relevance === "high"
                              ? "default"
                              : suggestion.relevance === "medium"
                              ? "secondary"
                              : "outline"
                          }
                          data-testid={`suggestion-relevance-${index}`}
                        >
                          {suggestion.relevance}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {suggestion.frequency}x
                        </span>
                        <Badge variant="secondary" data-testid={`suggestion-score-${index}`}>
                          {suggestion.score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
