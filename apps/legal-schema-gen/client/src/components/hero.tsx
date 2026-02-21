import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="border-b bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Free SEO Tool
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Generate Perfect Schema Markup for Your Law Firm
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create properly formatted JSON-LD structured data in seconds. Boost your local SEO and stand out in search results with Schema.org compliant markup.
          </p>
        </div>
      </div>
    </div>
  );
}
