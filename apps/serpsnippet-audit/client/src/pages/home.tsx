import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { UrlInputForm } from "@/components/url-input-form";
import { SerpPreview } from "@/components/serp-preview";
import { SeoAuditPanel } from "@/components/seo-audit-panel";
import { FeaturesSection } from "@/components/features-section";
import { UrlAnalysis } from "@shared/schema";

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<UrlAnalysis | null>(null);

  useEffect(() => {
    document.title = "SERP Preview & SEO Auditor - Optimize Your Google Search Results";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Analyze any webpage\'s title tags and meta descriptions. See exactly how your content appears in Google search results and get actionable SEO recommendations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Analyze any webpage\'s title tags and meta descriptions. See exactly how your content appears in Google search results and get actionable SEO recommendations.';
      document.head.appendChild(meta);
    }
  }, []);

  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Simple Navigation */}
        <div className="flex justify-center gap-3 mb-12">
          <Link href="/">
            <button 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                location === '/' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              data-testid="nav-single-analysis"
            >
              Single Analysis
            </button>
          </Link>
          <Link href="/bulk">
            <button 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                location === '/bulk' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              data-testid="nav-bulk-analysis"
            >
              Bulk Analysis
            </button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            SERP Preview &<br />SEO Auditor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze any webpage's title tags and meta descriptions. See exactly how your content appears in Google search results and get actionable SEO recommendations.
          </p>
        </div>

        {/* URL Input Form */}
        <UrlInputForm onAnalysisComplete={setCurrentAnalysis} />

        {/* Results Container */}
        {currentAnalysis && (
          <div className="mt-12 space-y-8">
            <SerpPreview analysis={currentAnalysis} />
            <SeoAuditPanel analysis={currentAnalysis} />
          </div>
        )}

        {/* Features Section - Only show on landing page (no results) */}
        {!currentAnalysis && <FeaturesSection />}
      </main>
    </div>
  );
}
