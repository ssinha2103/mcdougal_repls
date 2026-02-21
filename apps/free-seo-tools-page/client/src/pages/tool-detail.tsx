import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Tool } from "@shared/schema";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function ToolDetail() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: tool, isLoading } = useQuery<Tool>({
    queryKey: ["/api/tools", id],
    enabled: !!id,
  });

  const { data: allTools = [] } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const trackClickMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return apiRequest("POST", "/api/analytics/click", { toolId });
    },
  });

  useEffect(() => {
    if (!tool) return;
    const stored = localStorage.getItem("seo-tools-favorites");
    if (stored) {
      try {
        const favArray = JSON.parse(stored) as string[];
        setIsFavorite(favArray.includes(tool.id));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
  }, [tool]);

  const toggleFavorite = () => {
    if (!tool) return;
    const stored = localStorage.getItem("seo-tools-favorites");
    let favArray: string[] = [];
    if (stored) {
      try {
        favArray = JSON.parse(stored) as string[];
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
    
    if (favArray.includes(tool.id)) {
      favArray = favArray.filter((id) => id !== tool.id);
      setIsFavorite(false);
    } else {
      favArray.push(tool.id);
      setIsFavorite(true);
    }
    localStorage.setItem("seo-tools-favorites", JSON.stringify(favArray));
  };

  const relatedTools = tool
    ? allTools
        .filter(
          (t) =>
            t.id !== tool.id &&
            t.categories.some((cat) => tool.categories.includes(cat))
        )
        .slice(0, 3)
    : [];

  if (isLoading || !tool) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-primary/20 rounded w-1/3"></div>
            <div className="h-96 bg-card rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" data-testid="link-back-home">
          <Button variant="ghost" className="mb-6 -ml-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2" data-testid="text-tool-name">
                {tool.name}
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-tool-description">
                {tool.description}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className="shrink-0"
              data-testid="button-favorite-detail"
            >
              <Heart className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tool.categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="text-sm border-card-border text-primary bg-background font-medium px-3 py-1"
                data-testid={`badge-category-${category}`}
              >
                {category}
              </Badge>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto font-extrabold rounded-lg shadow-md"
            style={{
              background: "linear-gradient(135deg, #46b9fd, #0e73b8)",
            }}
            onClick={() => {
              trackClickMutation.mutate(tool.id);
            }}
            data-testid="button-open-tool-detail"
          >
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2"
            >
              Open {tool.name}
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>

          {tool.screenshot && (
            <Card className="rounded-2xl overflow-hidden border-card-border">
              <CardHeader>
                <CardTitle className="text-xl">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={tool.screenshot}
                  alt={`Screenshot of ${tool.name}`}
                  className="w-full h-auto rounded-lg"
                  data-testid="img-screenshot"
                />
              </CardContent>
            </Card>
          )}

          {tool.usageGuide && (
            <Card className="rounded-2xl border-card-border">
              <CardHeader>
                <CardTitle className="text-xl">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-usage-guide">
                    {tool.usageGuide}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {relatedTools.length > 0 && (
            <Card className="rounded-2xl border-card-border">
              <CardHeader>
                <CardTitle className="text-xl">Related Tools</CardTitle>
                <CardDescription>
                  Other tools in similar categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {relatedTools.map((relatedTool) => (
                    <Link key={relatedTool.id} href={`/tool/${relatedTool.id}`}>
                      <div 
                        className="p-4 rounded-lg border border-card-border hover-elevate transition-all cursor-pointer"
                        data-testid={`card-related-${relatedTool.id}`}
                      >
                        <h3 className="font-semibold text-primary mb-1">
                          {relatedTool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedTool.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {relatedTool.categories.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="text-xs border-card-border"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
