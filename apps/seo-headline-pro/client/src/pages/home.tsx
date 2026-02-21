import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeadlineCard } from "@/components/headline-card";
import { Sparkles, Lightbulb, AlertTriangle, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { HeadlineResponse, Tone } from "@shared/schema";
import { toneOptions } from "@shared/schema";
import { Link } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [generateKey, setGenerateKey] = useState(0);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState("");
  const [generatedTone, setGeneratedTone] = useState<Tone>("professional");

  const { data, isLoading, error, refetch } = useQuery<HeadlineResponse>({
    queryKey: ["/api/headlines", generatedTopic, generatedTone, generateKey],
    queryFn: async () => {
      const url = `/api/headlines?topic=${encodeURIComponent(generatedTopic)}&tone=${generatedTone}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to generate headlines" }));
        throw new Error(errorData.error || errorData.message || "Failed to generate headlines");
      }
      return res.json();
    },
    enabled: shouldFetch && generatedTopic.length >= 3,
  });

  const handleGenerate = () => {
    if (topic.trim().length >= 3) {
      setGeneratedTopic(topic);
      setGeneratedTone(tone);
      setGenerateKey(prev => prev + 1);
      setShouldFetch(true);
    }
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
    setShouldFetch(false);
  };

  const characterCount = topic.length;
  const isValid = topic.trim().length >= 3;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-end mb-4">
            <Link href="/favorites">
              <Button variant="outline" size="sm" data-testid="button-view-favorites">
                <Star className="h-4 w-4 mr-2" />
                View Saved
              </Button>
            </Link>
          </div>
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            SEO Headline Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate compelling, SEO-optimized headlines powered by AI. Enter your topic or keyword to get diverse, click-worthy titles instantly.
          </p>
        </div>

        <Card className="p-6 md:p-8 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-foreground mb-2">
                Topic or Primary Keyword
              </label>
              <Textarea
                id="topic"
                placeholder="e.g., social media marketing tips, best productivity apps, healthy breakfast recipes..."
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="min-h-24 resize-none text-base"
                data-testid="input-topic"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground" data-testid="text-character-count">
                  {characterCount} / 500 characters
                </span>
                {!isValid && characterCount > 0 && (
                  <span className="text-xs text-destructive">
                    At least 3 characters required
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-foreground mb-2">
                Tone
              </label>
              <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                <SelectTrigger className="w-full md:w-64" data-testid="select-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option} value={option} data-testid={`option-tone-${option}`}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!isValid || isLoading}
              className="w-full md:w-auto"
              size="lg"
              data-testid="button-generate"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Headlines...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Headlines
                </>
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="p-6 bg-destructive/10 border-destructive/20 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Error Generating Headlines</h3>
                <p className="text-sm text-destructive/90">
                  {error instanceof Error ? error.message : "Something went wrong. Please try again."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Crafting Your Headlines...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-16 bg-muted rounded-md mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-muted rounded-md"></div>
                    <div className="h-5 w-24 bg-muted rounded-md"></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {data && data.headlines && data.headlines.length > 0 && !isLoading && (
          <div className="space-y-4" data-testid="container-results">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Your SEO Headlines
              </h2>
              <span className="text-sm text-muted-foreground">
                {data.headlines.length} headlines generated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.headlines.map((headline, index) => (
                <HeadlineCard 
                  key={index} 
                  headline={headline} 
                  index={index}
                  topic={generatedTopic}
                  tone={generatedTone}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !data && !error && (
          <Card className="p-12 text-center border-dashed">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-4">
                <Lightbulb className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Create Amazing Headlines?
              </h3>
              <p className="text-muted-foreground">
                Enter your topic or keyword above and click "Generate Headlines" to get started with AI-powered SEO headline suggestions.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
