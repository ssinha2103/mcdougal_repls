import { useState } from "react";
import { Search, TrendingUp, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@assets/generated_images/YouTube_analytics_dashboard_visualization_d295ca1f.png";
import { useLocation } from "wouter";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setLocation(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-12 md:py-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="YouTube Analytics Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Discover What's Ranking on
            <span className="text-primary block mt-2">YouTube</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Analyze top-performing videos, discover winning tags, and get data-driven insights to optimize your content strategy.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter keyword (e.g., react tutorial, cooking recipes)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-12 h-14 text-base"
                  data-testid="input-keyword-search"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 text-base font-semibold"
                data-testid="button-search"
              >
                Search Videos
              </Button>
            </div>
          </form>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span>Free forever</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span>No signup required</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-elevate transition-transform">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Enter Keyword</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Type in your target keyword or topic to research
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-transform">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Analyze Results</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  View top-ranking videos with detailed metrics and tags
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-transform">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Optimize Content</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Use insights to improve your video SEO strategy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-accent/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Ready to Boost Your YouTube SEO?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Start researching top-ranking videos today and discover what makes them successful
            </p>
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-semibold"
              onClick={() => document.querySelector<HTMLInputElement>('[data-testid="input-keyword-search"]')?.focus()}
              data-testid="button-start-research"
            >
              Start Your Research
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
