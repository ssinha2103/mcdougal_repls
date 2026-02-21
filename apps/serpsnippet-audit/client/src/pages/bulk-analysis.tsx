import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BulkUrlProcessor } from "@/components/bulk-url-processor";

export function BulkAnalysis() {
  const [location] = useLocation();

  useEffect(() => {
    document.title = "Bulk SEO Analysis - Analyze Multiple Websites | SERP Preview & Auditor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Analyze multiple websites at once to get comprehensive SEO insights. Bulk URL analysis tool for efficient SEO auditing.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Analyze multiple websites at once to get comprehensive SEO insights. Bulk URL analysis tool for efficient SEO auditing.';
      document.head.appendChild(meta);
    }
  }, []);

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

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Bulk SEO Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze multiple websites at once to get comprehensive SEO insights for all your pages
          </p>
        </div>
        
        <BulkUrlProcessor />
      </main>
    </div>
  );
}