import { Monitor, Smartphone, Globe } from "lucide-react";
import { UrlAnalysis } from "@shared/schema";

interface SerpPreviewProps {
  analysis: UrlAnalysis;
}

export function SerpPreview({ analysis }: SerpPreviewProps) {
  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname !== '/' ? ' › ' + urlObj.pathname.split('/').filter(Boolean).join(' › ') : ''}`;
    } catch {
      return url;
    }
  };

  const getMobileDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const truncateDescription = (description: string, maxLength: number) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Desktop Preview */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="desktop-preview">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-muted-foreground" />
            Desktop Preview
          </h2>
          <span className="text-sm text-muted-foreground">1,920×1,080</span>
        </div>
        
        {/* Google Search Interface Mockup */}
        <div className="bg-background border border-border rounded-lg p-4 font-sans">
          {/* Search Header */}
          <div className="flex items-center mb-6 pb-4 border-b border-border">
            <div className="google-favicon mr-3"></div>
            <div className="text-sm text-muted-foreground">
              <span>seo analysis tools</span>
            </div>
          </div>
          
          {/* Search Result */}
          <div className="space-y-4">
            <div className="group cursor-pointer">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Globe className="w-4 h-4 mr-2" />
                <span data-testid="text-desktop-url">{getDisplayUrl(analysis.url)}</span>
              </div>
              <h3 className="text-xl text-blue-600 hover:underline font-normal leading-tight mb-1">
                <span data-testid="text-desktop-title">
                  {analysis.title || 'No title found'}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span data-testid="text-desktop-description">
                  {analysis.metaDescription || 'No meta description found'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="mobile-preview">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-muted-foreground" />
            Mobile Preview
          </h2>
          <span className="text-sm text-muted-foreground">375×812</span>
        </div>
        
        {/* Mobile Google Search Interface */}
        <div className="bg-background border border-border rounded-lg max-w-sm mx-auto">
          {/* Mobile Search Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="google-favicon mr-2"></div>
              <span>seo analysis tools</span>
            </div>
          </div>
          
          {/* Mobile Search Result */}
          <div className="p-4">
            <div className="group cursor-pointer">
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <Globe className="w-3 h-3 mr-1" />
                <span data-testid="text-mobile-url">{getMobileDisplayUrl(analysis.url)}</span>
              </div>
              <h3 className="text-lg text-blue-600 font-normal leading-tight mb-2 line-clamp-2">
                <span data-testid="text-mobile-title">
                  {truncateTitle(analysis.title || 'No title found', 65)}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span data-testid="text-mobile-description">
                  {truncateDescription(analysis.metaDescription || 'No meta description found', 120)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
