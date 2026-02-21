import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trash2, Plus, Play, Globe, Key, Info, ChevronDown, Youtube, Star } from "lucide-react";

interface UrlInputFormProps {
  onSubmit: (urls: string[], socialLinks?: { [domain: string]: { googleProfile?: string; reviewsCount?: string; rating?: string; youtube?: string; facebook?: string; instagram?: string; twitter?: string; linkedin?: string } }) => void;
  isLoading?: boolean;
}

export function UrlInputForm({ onSubmit, isLoading = false }: UrlInputFormProps) {
  const [myWebsite, setMyWebsite] = useState<string>('');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [includePageSpeed, setIncludePageSpeed] = useState(true);
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  const [includeTraffic, setIncludeTraffic] = useState(true);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{ [domain: string]: { googleProfile?: string; reviewsCount?: string; rating?: string; youtube?: string; facebook?: string; instagram?: string; twitter?: string; linkedin?: string } }>({});

  const addCompetitorField = () => {
    if (competitorUrls.length < 11) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeCompetitorField = (index: number) => {
    if (competitorUrls.length > 1) {
      setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
    }
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const updateSocialLink = (domain: string, platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [platform]: value.trim() || undefined
      }
    }));
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      return new URL(cleanUrl).hostname.replace('www.', '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate my website field
    const trimmedMyWebsite = myWebsite.trim();
    if (!trimmedMyWebsite) {
      alert('Please enter your website URL.');
      return;
    }
    
    // Process my website URL
    const myWebsiteUrl = trimmedMyWebsite.startsWith('http://') || trimmedMyWebsite.startsWith('https://') 
      ? trimmedMyWebsite 
      : 'https://' + trimmedMyWebsite;
    
    // Process competitor URLs
    const validCompetitorUrls = competitorUrls
      .map(url => url.trim())
      .filter(url => url !== '')
      .map(url => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return 'https://' + url;
        }
        return url;
      });
    
    // Combine all URLs with my website first
    const allUrls = [myWebsiteUrl, ...validCompetitorUrls];
    
    if (allUrls.length > 12) {
      alert('Maximum 12 URLs total allowed. Please remove some competitor URLs.');
      return;
    }

    onSubmit(allUrls, socialLinks);
  };

  return (
    <Card className="glass-card w-full rounded-3xl border-0 floating" style={{ background: 'var(--liquid-gradient-2)' }}>
      <CardHeader className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
          <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
            <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Competitor Analysis Setup</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your website first, then add up to 11 competitor domains for comparison. Just type domain names like "example.com" - no need for https://.
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* My Website Section */}
          <div className="space-y-4">
            <Label htmlFor="my-website" className="text-sm font-medium">
              My Website
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="my-website"
                type="text"
                placeholder="yoursite.com"
                value={myWebsite}
                onChange={(e) => setMyWebsite(e.target.value)}
                className="pl-10 min-h-[44px] h-11 border-blue-500 bg-blue-50 dark:bg-blue-950"
                autoComplete="url"
                data-testid="input-my-website"
              />
            </div>
          </div>

          {/* Competitor URLs Section */}
          <div className="space-y-4">
            <Label htmlFor="competitor-urls" className="text-sm font-medium">
              Competitor URLs
              <span className="text-muted-foreground font-normal ml-1">
                ({competitorUrls.filter(url => url.trim() !== '').length}/11)
              </span>
            </Label>
            
            <div className="space-y-3">
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`competitor-${index}`}
                      type="text"
                      placeholder={`competitor${index + 1}.com`}
                      value={url}
                      onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                      className="pl-10 min-h-[44px] h-11"
                      autoComplete="url"
                    />
                  </div>
                  {competitorUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetitorField(index)}
                      className="p-2 h-auto text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {competitorUrls.length < 11 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCompetitorField}
                className="w-full min-h-[44px] touch-manipulation"
                data-testid="button-add-competitor"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Competitor
              </Button>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <Label className="text-sm font-medium mb-3 block">Comprehensive Analysis Features</Label>
            <p className="text-xs text-muted-foreground mb-4">Multi-platform intelligence across all digital touchpoints</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors min-h-[44px]" data-testid="checkbox-page-speed">
                <Checkbox
                  id="pageSpeed"
                  checked={includePageSpeed}
                  onCheckedChange={(checked) => setIncludePageSpeed(checked === true)}
                  className="h-5 w-5"
                />
                <Label htmlFor="pageSpeed" className="text-sm text-muted-foreground cursor-pointer flex-1">Page Speed</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors min-h-[44px]" data-testid="checkbox-backlinks">
                <Checkbox
                  id="backlinks"
                  checked={includeBacklinks}
                  onCheckedChange={(checked) => setIncludeBacklinks(checked === true)}
                  className="h-5 w-5"
                />
                <Label htmlFor="backlinks" className="text-sm text-muted-foreground cursor-pointer flex-1">Backlink Analysis</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors min-h-[44px]" data-testid="checkbox-traffic">
                <Checkbox
                  id="traffic"
                  checked={includeTraffic}
                  onCheckedChange={(checked) => setIncludeTraffic(checked === true)}
                  className="h-5 w-5"
                />
                <Label htmlFor="traffic" className="text-sm text-muted-foreground cursor-pointer flex-1">Traffic Estimates</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg min-h-[44px]" data-testid="checkbox-google-reviews">
                <Checkbox
                  id="googleReviews"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                />
                <Label htmlFor="googleReviews" className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1">Google Reviews & Ratings (Auto)</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg min-h-[44px]" data-testid="checkbox-youtube">
                <Checkbox
                  id="youtube"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                />
                <Label htmlFor="youtube" className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1">YouTube Subscribers & Posting (Auto)</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg min-h-[44px]" data-testid="checkbox-linkedin">
                <Checkbox
                  id="linkedin"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                />
                <Label htmlFor="linkedin" className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1">LinkedIn Followers & Activity (Auto)</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg min-h-[44px]" data-testid="checkbox-eeeat">
                <Checkbox
                  id="eeeat"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                />
                <Label htmlFor="eeeat" className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1">AI Trust Signals (E-E-A-T)</Label>
              </div>
              <div className="flex items-center space-x-3 py-2 px-1 rounded-lg min-h-[44px]" data-testid="checkbox-seo-metrics">
                <Checkbox
                  id="seoMetrics"
                  checked={true}
                  disabled
                  className="h-5 w-5"
                />
                <Label htmlFor="seoMetrics" className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1">SEO Keywords & Rankings</Label>
              </div>
            </div>
          </div>

          <Collapsible open={showSocialLinks} onOpenChange={setShowSocialLinks}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between min-h-[44px] touch-manipulation" type="button" data-testid="button-social-links-toggle">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Google Business Profile & Optional Overrides
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showSocialLinks ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Google Business Profile Required:</strong> Manual input needed for accurate Google Reviews data. YouTube and LinkedIn are automatically detected but can be overridden below.
                </AlertDescription>
              </Alert>
              
              {[myWebsite, ...competitorUrls].filter(url => url.trim()).map((url, index) => {
                const domain = getDomainFromUrl(url);
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <Label className="font-medium">{domain}</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <Label htmlFor={`google-${index}`} className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-600" />
                          Google Business Profile (Required for Reviews)
                        </Label>
                        <Input
                          id={`google-${index}`}
                          placeholder="https://g.page/your-business or Google Maps URL"
                          value={socialLinks[domain]?.googleProfile || ''}
                          onChange={(e) => updateSocialLink(domain, 'googleProfile', e.target.value)}
                          className="mt-2 border-amber-200 focus:border-amber-400 min-h-[44px] h-11"
                          autoComplete="url"
                        />
                        <div className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                          <p><strong>Manual input required:</strong> Google Business data cannot be auto-detected due to anti-scraping protection</p>
                          <details className="cursor-pointer">
                            <summary className="font-medium hover:text-amber-600">How to find your Google Business Profile URL</summary>
                            <div className="mt-2 space-y-2 text-xs bg-white dark:bg-gray-900 p-2 rounded border">
                              <p><strong>Desktop:</strong> Go to Google Maps → Search for your business → Click on your business listing → Copy URL from address bar</p>
                              <p><strong>Mobile:</strong> Open Google Maps app → Search for your business → Tap your business → Tap "Share" → Copy link</p>
                              <p><strong>Alternative:</strong> Search "your business name Google Business Profile" and look for the official listing</p>
                            </div>
                          </details>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`youtube-${index}`} className="text-xs text-muted-foreground">YouTube Channel Override</Label>
                          <Input
                            id={`youtube-${index}`}
                            placeholder="https://youtube.com/@channel"
                            value={socialLinks[domain]?.youtube || ''}
                            onChange={(e) => updateSocialLink(domain, 'youtube', e.target.value)}
                            className="mt-1 min-h-[44px] h-11"
                            autoComplete="url"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`linkedin-${index}`} className="text-xs text-muted-foreground">LinkedIn Page Override</Label>
                          <Input
                            id={`linkedin-${index}`}
                            placeholder="https://linkedin.com/company/name"
                            value={socialLinks[domain]?.linkedin || ''}
                            onChange={(e) => updateSocialLink(domain, 'linkedin', e.target.value)}
                            className="mt-1 min-h-[44px] h-11"
                            autoComplete="url"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <Button
            type="submit"
            disabled={isLoading}
            className="liquid-button w-full border-0 text-white py-4 sm:py-6 text-base sm:text-lg font-semibold min-h-[48px] sm:min-h-[56px] touch-manipulation"
            size="lg"
            data-testid="button-start-analysis"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Starting Analysis...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-3" />
                Start Competitive Analysis
              </>
            )}
          </Button>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Professional Analysis:</strong> This tool provides authentic SEO competitive intelligence including keyword rankings, traffic estimates, and performance metrics. 
              Results are comparable to premium SEO platforms at a fraction of the cost.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
}
