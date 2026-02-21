import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  Globe, 
  Link, 
  Users, 
  Gauge, 
  Zap, 
  Award, 
  Youtube, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  Download,
  Info,
  Trophy
} from "lucide-react";
import { SeoMetrics } from "@/lib/api";

interface SectionedResultsProps {
  metrics: SeoMetrics[];
  onExport: () => void;
  analysisJob?: { urls: string[]; id: number };
}

export function SectionedResults({ metrics, onExport, analysisJob }: SectionedResultsProps) {
  const [faviconCache, setFaviconCache] = useState<Record<string, string>>({});
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStage, setPdfStage] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's domain from the first URL in the analysis job
  const userDomain = analysisJob?.urls?.[0] ? new URL(analysisJob.urls[0]).hostname.replace('www.', '') : null;

  // Simple Favicon component using Google's favicon service
  const FaviconImage = ({ domain }: { domain: string }) => {
    return (
      <img 
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt={`${domain} favicon`}
        className="w-6 h-6 rounded-sm"
        onError={(e) => {
          // Fallback to a generic globe icon if favicon fails
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (!isFinite(num)) return '0';
    return Math.round(num).toLocaleString();
  };

  const MetricInfo = ({ metric, children }: { metric: string; children: React.ReactNode }) => (
    <Popover open={openPopover === metric} onOpenChange={(open) => setOpenPopover(open ? metric : null)}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          {children}
          <Info className="h-3 w-3 opacity-50 hover:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{getMetricTitle(metric)}</h4>
          <p className="text-sm text-muted-foreground">{getMetricDescription(metric)}</p>
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Real-world Example:</p>
            <p className="text-xs text-muted-foreground">{getMetricExample(metric)}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const getMetricTitle = (metric: string): string => {
    const titles: Record<string, string> = {
      // Traffic Analytics
      'organic-traffic': 'Organic Traffic',
      'advertisement-value': 'Advertisement Value',
      'avg-cpc': 'Average CPC (Cost Per Click)',
      'top10-coverage': 'Top-10 Coverage',
      'visibility-score': 'Visibility Score',
      // SEO Metrics
      'indexed-pages': 'Indexed Pages',
      'referring-domains': 'Referring Domains',
      'backlinks': 'Backlinks',
      'top100-keywords': 'Top 100 Keywords',
      // Performance Metrics
      'page-speed': 'Page Speed',
      'ai-trust-score': 'AI Trust Score',
      'performance-score': 'Performance Score',
      // E-E-A-T Signals
      'experience': 'Experience Signals',
      'expertise': 'Expertise Signals',
      'authority': 'Authority Signals',
      'trust': 'Trust Signals',
      // Advanced AI Search
      'eeat-score': 'E-E-A-T Score',
      'trust-signals': 'Trust Signals Count',
      'ai-readiness': 'AI Readiness',
      'content-authority': 'Content Authority',
      // Social Media Metrics
      'youtube-metrics': 'YouTube Channel Analytics',
      'linkedin-metrics': 'LinkedIn Company Page',
      'facebook-metrics': 'Facebook Page Metrics',
      'google-reviews': 'Google Business Reviews',
      'social-reach': 'Total Social Media Reach',
      'platform-presence': 'Active Social Platforms',
      'authority-score': 'Authority Score',
      // Traffic Opportunities Metrics
      'traffic-from-top10': 'Traffic from Page 1 Rankings',
      'lost-traffic': 'Potential Traffic Lost',
      'opportunity-value': 'Revenue Opportunity',
      'ranking-strength': 'Overall Ranking Performance',
      'focus-priority': 'SEO Focus Priority'
    };
    return titles[metric] || metric;
  };

  const getMetricDescription = (metric: string): string => {
    const descriptions: Record<string, string> = {
      // Traffic Analytics
      'organic-traffic': 'Estimated monthly visitors from organic search results. This shows how many people find the website through Google, Bing, and other search engines without paid ads.',
      'advertisement-value': 'The estimated cost to acquire the same traffic through paid advertising. This represents the monetary value of organic traffic if you had to pay for it via Google Ads.',
      'avg-cpc': 'The average amount advertisers pay for a single click in paid search. Higher CPC indicates more valuable, competitive keywords that businesses are willing to pay more for.',
      'top10-coverage': 'Percentage of keywords ranking in the top 10 search results (first page). Higher coverage means better visibility and more potential traffic.',
      'visibility-score': 'A weighted index (0-100) showing overall search visibility based on keyword rankings and search volumes. Higher scores indicate stronger SEO performance.',
      // SEO Metrics
      'indexed-pages': 'Total number of pages from your website that appear in search engine results. More indexed pages mean search engines recognize more of your content.',
      'referring-domains': 'Number of unique websites linking to your site. More referring domains typically indicate higher authority and trust in search engines.',
      'backlinks': 'Total number of links from other websites pointing to your site. Quality backlinks improve your search rankings and domain authority.',
      'top100-keywords': 'Number of keywords for which your website ranks in the top 100 search results. More keywords mean broader visibility across search queries.',
      // Performance Metrics
      'page-speed': 'How quickly your webpage loads in seconds. Faster load times improve user experience and search rankings. Google recommends under 2.5 seconds.',
      'ai-trust-score': 'A composite score (0-10) measuring how trustworthy your content appears to AI systems based on E-E-A-T signals, structured data, and content quality.',
      'performance-score': 'Overall performance rating (0-100) combining traffic, speed, backlinks, and trust factors. Higher scores indicate better overall SEO health.',
      // E-E-A-T Signals
      'experience': 'Signals showing first-hand experience with the topic, such as original research, case studies, personal testimonials, and real-world examples.',
      'expertise': 'Indicators of subject matter expertise including author credentials, technical depth, accurate information, and specialized knowledge.',
      'authority': 'Measures of recognized authority in your field through citations, industry recognition, quality backlinks, and brand reputation.',
      'trust': 'Trust indicators including security certificates, privacy policies, contact information, reviews, and transparency about authors and sources.',
      // Advanced AI Search
      'eeat-score': 'Combined E-E-A-T (Experience, Expertise, Authority, Trust) score showing how well your content meets Google\'s quality guidelines.',
      'trust-signals': 'Count of specific trust indicators present on your site such as author bios, citations, security badges, and verified information.',
      'ai-readiness': 'Percentage score showing how well-optimized your content is for AI-powered search features like featured snippets and AI overviews.',
      'content-authority': 'Classification of your content\'s authority level (Basic, Intermediate, Expert) based on depth, accuracy, and credibility signals.',
      // Social Media Metrics
      'youtube-metrics': 'YouTube channel subscribers and video count. Higher subscriber counts indicate stronger video marketing presence and audience engagement through video content.',
      'linkedin-metrics': 'LinkedIn company page followers and posting activity. Shows B2B marketing strength, professional networking reach, and thought leadership in your industry.',
      'facebook-metrics': 'Facebook page likes and followers. Indicates consumer brand awareness, community engagement, and social proof through the world\'s largest social network.',
      'google-reviews': 'Google Business Profile reviews and average rating. Critical for local SEO, trust signals, and conversion rates. Reviews directly impact search rankings.',
      'social-reach': 'Combined follower count across all social platforms. Total audience size indicates brand influence, content distribution potential, and market penetration.',
      'platform-presence': 'Number and types of active social media platforms. Multi-platform presence shows marketing sophistication and ability to reach diverse audiences.',
      'authority-score': 'E-E-A-T based authority score combining trust signals, content quality, and expertise indicators. Higher scores correlate with better search rankings.',
      // Traffic Opportunities Metrics
      'traffic-from-top10': 'Monthly visits from keywords ranking on page 1. This is your active traffic that\'s already working for you. Higher is better.',
      'lost-traffic': 'Potential monthly visits lost from keywords not on page 1. This represents traffic your competitors are getting that you could capture.',
      'opportunity-value': 'Estimated monthly revenue value of lost traffic based on average CPC. This shows the dollar value of improving your rankings.',
      'ranking-strength': 'Overall performance score based on percentage of keywords in top 10. Higher percentages mean stronger SEO performance.',
      'focus-priority': 'Recommended priority level based on opportunity value. Critical = >$10K/mo opportunity, High = $5-10K, Medium = $1-5K, Low = <$1K.'
    };
    return descriptions[metric] || '';
  };

  const getMetricExample = (metric: string): string => {
    const examples: Record<string, string> = {
      // Traffic Analytics
      'organic-traffic': 'A site with 50,000 monthly organic traffic receives that many visitors without paying for ads, saving potentially thousands in advertising costs.',
      'advertisement-value': 'If Advertisement Value is $25,000, it means you\'d need to spend that much monthly on Google Ads to get the same traffic you\'re getting for free from SEO.',
      'avg-cpc': 'A law firm with $50 avg CPC targets expensive keywords like "personal injury lawyer". Each organic click saves them $50 in ad spend.',
      'top10-coverage': 'A site with 15% top-10 coverage has 15% of their keywords on Google\'s first page, where 90% of clicks happen. Below 5% indicates poor visibility.',
      'visibility-score': 'Amazon might have a visibility score of 85+ due to ranking #1 for millions of keywords, while a local business might have 10-20 in their market.',
      // SEO Metrics
      'indexed-pages': 'An e-commerce site with 10,000 indexed pages has all product pages searchable. If only 100 are indexed, customers can\'t find most products via search.',
      'referring-domains': 'A site with 500 referring domains has links from 500 different websites. Quality matters: 10 links from Forbes, CNN, etc. beat 100 from low-quality sites.',
      'backlinks': 'A popular blog post might have 1,000 backlinks. Each quality link acts as a "vote" telling Google your content is valuable and worth ranking higher.',
      'top100-keywords': 'A local dentist ranking for 300 keywords like "dentist near me", "teeth whitening", etc. has multiple ways for patients to find them online.',
      // Performance Metrics
      'page-speed': 'Amazon loads in 0.8 seconds, keeping users engaged. A 5-second load time can lose 50% of visitors and hurt your Google rankings significantly.',
      'ai-trust-score': 'Mayo Clinic scores 9/10 with medical experts, citations, and peer reviews. A blog with no author info might score 2/10, limiting AI visibility.',
      'performance-score': 'A score of 75+ indicates strong SEO health. Below 40 suggests significant issues with speed, content, or technical SEO needing immediate attention.',
      // E-E-A-T Signals
      'experience': 'A travel blog with photos, personal itineraries, and trip reports shows experience. Generic destination info without personal insights scores lower.',
      'expertise': 'A financial advisor with CPA credentials writing about taxes shows expertise. Anonymous content about "get rich quick" schemes lacks expertise signals.',
      'authority': 'Harvard.edu has maximum authority in education topics. A new blog needs to build authority through quality content and earning reputable backlinks.',
      'trust': 'An e-commerce site with SSL, clear return policy, customer reviews, and BBB accreditation shows high trust. Sites hiding ownership information score low.',
      // Advanced AI Search
      'eeat-score': 'WebMD scores 9/10 with medical professionals, citations, and editorial review. A personal health blog without credentials might score 3/10.',
      'trust-signals': 'A site with 8 trust signals (SSL, author bios, citations, reviews, etc.) appears more credible to AI than one with only 2 signals.',
      'ai-readiness': '85% AI readiness means your content is structured for featured snippets, voice search, and AI summaries. Below 40% misses these opportunities.',
      'content-authority': 'Expert level: Scientific journals with peer review. Intermediate: Industry blogs with experience. Basic: General information without unique insights.',
      // Social Media Metrics
      'youtube-metrics': 'HubSpot has 215K YouTube subscribers with 2,000+ educational videos, driving millions of views and establishing them as marketing thought leaders.',
      'linkedin-metrics': 'McKinsey has 14M LinkedIn followers with daily insights, positioning them as the go-to consulting firm for C-suite executives globally.',
      'facebook-metrics': 'Nike has 35M Facebook followers, using the platform for product launches, athlete stories, and community engagement driving billions in sales.',
      'google-reviews': 'A restaurant with 4.8 stars from 500+ reviews ranks higher in local search and sees 35% more reservations than competitors with 4.2 stars.',
      'social-reach': 'Red Bull\'s 100M+ combined social reach allows them to dominate energy drink mindshare, turning followers into a global marketing army.',
      'platform-presence': 'Brands active on 5+ platforms see 23% more website traffic. Each platform reaches different demographics: TikTok for Gen Z, LinkedIn for B2B.',
      'authority-score': 'Forbes.com scores 9/10 authority with verified authors, citations, and decades of trust. New blogs typically score 2-3/10 until building credibility.',
      // Traffic Opportunities Examples
      'traffic-from-top10': 'If you have 5,000 monthly visits with 40% from top 10, that\'s 2,000 visits working well. Focus on maintaining these rankings.',
      'lost-traffic': 'With 3,000 potential visits lost, you\'re missing 60% of possible traffic. Each keyword moved to page 1 directly increases traffic.',
      'opportunity-value': 'A site losing 3,000 visits at $5 CPC has a $4,500/month opportunity. That\'s $54,000/year in potential revenue gains.',
      'ranking-strength': '75% strength means you\'re performing well. Below 25% indicates major SEO improvements needed. 50% is average performance.',
      'focus-priority': 'Critical priority sites should immediately invest in SEO. High priority needs attention within 30 days. Medium can plan for next quarter.'
    };
    return examples[metric] || '';
  };

  const formatTrustScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return 'N/A';
    return `${score}/10`;
  };

  const exportToPDF = async () => {
    console.log('Starting PDF export...');
    console.log('Metrics available:', metrics.length);
    
    if (!metrics || metrics.length === 0) {
      toast({
        title: "Export Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    if (!analysisJob?.id) {
      toast({
        title: "Export Error",
        description: "No analysis job ID available",
        variant: "destructive",
      });
      return;
    }

    // Start PDF generation process
    setIsPdfGenerating(true);
    setPdfProgress(0);
    setPdfStage('Initializing PDF generation...');
    setPdfDownloadUrl(null);

    try {
      console.log("Requesting PDF generation from server...");
      
      // Simulate progress stages
      setPdfProgress(10);
      setPdfStage('Collecting SEO data...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setPdfProgress(30);
      setPdfStage('Analyzing competitive metrics...');
      
      const response = await fetch(`/api/analysis/${analysisJob.id}/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setPdfProgress(60);
      setPdfStage('Generating report layout...');

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      setPdfProgress(80);
      setPdfStage('Finalizing PDF document...');

      // Get the PDF blob
      const blob = await response.blob();
      
      setPdfProgress(100);
      setPdfStage('PDF ready for download!');
      
      // Create a download URL for the dialog
      const url = window.URL.createObjectURL(blob);
      setPdfDownloadUrl(url);
      
      console.log("PDF generated successfully");
      
    } catch (error) {
      console.error("PDF export error:", error);
      setIsPdfGenerating(false);
      toast({
        title: "Export Error",
        description: error instanceof Error ? error.message : "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDownloadUrl) {
      const a = document.createElement('a');
      a.href = pdfDownloadUrl;
      a.download = `seo_analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      window.URL.revokeObjectURL(pdfDownloadUrl);
      setPdfDownloadUrl(null);
      setIsPdfGenerating(false);
      
      toast({
        title: "Export Successful",
        description: "Your SEO analysis report has been downloaded",
      });
    }
  };

  const closePdfDialog = () => {
    if (pdfDownloadUrl) {
      window.URL.revokeObjectURL(pdfDownloadUrl);
    }
    setIsPdfGenerating(false);
    setPdfDownloadUrl(null);
    setPdfProgress(0);
    setPdfStage('');
  };

  const getPerformanceScore = (metric: SeoMetrics): number => {
    const traffic = metric.organicTraffic || 0;
    const backlinks = metric.backlinks || 0;
    const trustScore = metric.trustSignalsScore || 0;
    const speed = parseFloat(metric.pageSpeed || '1');
    
    // Normalize each metric (0-100 scale)
    const trafficScore = Math.min((traffic / 50000) * 40, 40); // 40% weight, max at 50k traffic
    const backlinkScore = Math.min((backlinks / 10000) * 20, 20); // 20% weight, max at 10k backlinks
    const trustScoreNorm = Math.min((trustScore / 10) * 25, 25); // 25% weight, max at 10/10
    const speedScore = Math.max(0, Math.min((2 - speed) / 2 * 15, 15)); // 15% weight, faster is better
    
    return Math.round(trafficScore + backlinkScore + trustScoreNorm + speedScore);
  };

  return (
    <div className="space-y-8">
      {/* SEO Metrics Section */}
      <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-1)' }}>
        <CardHeader className="pb-6 rounded-t-3xl px-4 sm:px-10 py-6 sm:py-8">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
            <div className="p-2 sm:p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SEO Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-10 pb-6 sm:pb-8">
          <div className="overflow-x-auto rounded-2xl glass-table border-0 touch-pan-x seo-mobile-table" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm" style={{ minWidth: '800px' }}>
              <thead>
                <tr className="border-b border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm">
                  <th className="text-left py-4 pl-6 pr-4 font-semibold rounded-tl-2xl text-gray-700 dark:text-gray-200">Domain</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-200">
                    <div className="flex items-center justify-end gap-2">
                      <MetricInfo metric="indexed-pages">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>Indexed Pages</span>
                      </MetricInfo>
                    </div>
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-200">
                    <div className="flex items-center justify-end gap-2">
                      <MetricInfo metric="referring-domains">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span>Ref. Domains</span>
                      </MetricInfo>
                    </div>
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-200">
                    <div className="flex items-center justify-end gap-2">
                      <MetricInfo metric="backlinks">
                        <Link className="h-4 w-4 text-blue-500" />
                        <span>Backlinks</span>
                      </MetricInfo>
                    </div>
                  </th>
                  <th className="text-right py-4 pl-4 pr-6 font-semibold rounded-tr-2xl text-gray-700 dark:text-gray-200">
                    <MetricInfo metric="top100-keywords">
                      Top 100 Keywords
                    </MetricInfo>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => {
                  const isUserSite = userDomain ? metric.domain === userDomain : index === 0;
                  return (
                    <tr key={metric.id} className={`${isUserSite ? 'bg-blue-100/95 dark:bg-blue-900/50 border-blue-200/50 dark:border-blue-700/50' : ''} ${index === metrics.length - 1 ? '' : 'border-b border-muted/30'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className={`py-3 pl-4 pr-4 ${index === metrics.length - 1 ? 'rounded-bl-xl' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FaviconImage domain={metric.domain} />
                            {isUserSite && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isUserSite ? 'text-blue-900 dark:text-white font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>
                              {metric.domain}
                              {isUserSite && <span className="text-xs text-blue-800 dark:text-blue-200 ml-2 font-medium">(Your Site)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(metric.indexedPages)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(metric.referringDomains)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(metric.backlinks)}</td>
                      <td className={`py-3 pl-4 pr-4 text-right ${index === metrics.length - 1 ? 'rounded-br-xl' : ''}`}>
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold text-blue-600">
                            {formatNumber(metric.top100Keywords)}
                          </span>
                          <span className="text-xs text-muted-foreground">top 100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Section */}
      <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-2)' }}>
        <CardHeader className="pb-6 rounded-t-3xl px-10 py-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Traffic Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8">
          <div className="overflow-x-auto rounded-2xl glass-table border-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left py-3 pl-4 pr-4 font-medium rounded-tl-xl">Domain</th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <MetricInfo metric="organic-traffic">
                        <Users className="h-3 w-3" />
                        <span>Organic Traffic</span>
                      </MetricInfo>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <MetricInfo metric="advertisement-value">
                      Advertisement Value
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <MetricInfo metric="avg-cpc">
                      Avg CPC
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <MetricInfo metric="top10-coverage">
                      Top-10 Coverage
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 pl-4 pr-4 font-medium rounded-tr-xl">
                    <MetricInfo metric="visibility-score">
                      Visibility Score
                    </MetricInfo>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => {
                  const isUserSite = userDomain ? metric.domain === userDomain : index === 0;
                  return (
                    <tr key={metric.id} className={`${isUserSite ? 'bg-blue-100/95 dark:bg-blue-900/50 border-blue-200/50 dark:border-blue-700/50' : ''} ${index === metrics.length - 1 ? '' : 'border-b border-muted/30'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className={`py-3 pl-4 pr-4 ${index === metrics.length - 1 ? 'rounded-bl-xl' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FaviconImage domain={metric.domain} />
                            {isUserSite && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isUserSite ? 'text-blue-900 dark:text-white font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>
                              {metric.domain}
                              {isUserSite && <span className="text-xs text-blue-800 dark:text-blue-200 ml-2 font-medium">(Your Site)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-lg font-bold text-green-600">
                          {formatNumber(metric.organicTraffic)}
                        </span>
                        <div className="text-xs text-muted-foreground">monthly visits</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-lg font-bold text-green-600">
                          {metric.trafficCost || 'N/A'}
                        </span>
                        <div className="text-xs text-muted-foreground">equivalent value</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-lg font-bold text-indigo-600">
                          {metric.avgCPC || 'N/A'}
                        </span>
                        <div className="text-xs text-muted-foreground">per click</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-lg font-bold text-purple-600">
                          {metric.top10Coverage || 'N/A'}
                        </span>
                        <div className="text-xs text-muted-foreground">in top 10</div>
                      </td>
                      <td className={`py-3 pl-4 pr-4 text-right ${index === metrics.length - 1 ? 'rounded-br-xl' : ''}`}>
                        <span className="font-mono text-lg font-bold text-blue-600">
                          {metric.visibilityScore || 'N/A'}
                        </span>
                        <div className="text-xs text-muted-foreground">visibility</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* Performance Section */}
      <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-3)' }}>
        <CardHeader className="pb-6 rounded-t-3xl px-10 py-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))' }}>
              <Gauge className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8">
          <div className="overflow-x-auto rounded-2xl glass-table border-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left py-3 pl-4 pr-4 font-medium rounded-tl-xl">Domain</th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <MetricInfo metric="page-speed">
                        <Zap className="h-3 w-3" />
                        <span>Page Speed</span>
                      </MetricInfo>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <MetricInfo metric="ai-trust-score">
                      AI Trust Score
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 pl-4 pr-4 font-medium rounded-tr-xl">
                    <MetricInfo metric="performance-score">
                      Performance %
                    </MetricInfo>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => {
                  const isUserSite = userDomain ? metric.domain === userDomain : index === 0;
                  return (
                    <tr key={metric.id} className={`${isUserSite ? 'bg-blue-100/95 dark:bg-blue-900/50 border-blue-200/50 dark:border-blue-700/50' : ''} ${index === metrics.length - 1 ? '' : 'border-b border-muted/30'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className={`py-3 pl-4 pr-4 ${index === metrics.length - 1 ? 'rounded-bl-xl' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FaviconImage domain={metric.domain} />
                            {isUserSite && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isUserSite ? 'text-blue-900 dark:text-white font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>
                              {metric.domain}
                              {isUserSite && <span className="text-xs text-blue-800 dark:text-blue-200 ml-2 font-medium">(Your Site)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-lg font-bold text-orange-600">
                            {metric.pageSpeed || 'N/A'}s
                          </span>
                          <div className="text-xs text-muted-foreground">load time</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-lg font-bold text-blue-600">
                          {formatTrustScore(metric.trustSignalsScore)}
                        </span>
                        <div className="text-xs text-muted-foreground">AI trust</div>
                      </td>
                      <td className={`py-3 pl-4 pr-4 text-right ${index === metrics.length - 1 ? 'rounded-br-xl' : ''}`}>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-lg font-bold text-purple-600">
                            {getPerformanceScore(metric)}%
                          </span>
                          <div className="text-xs text-muted-foreground">overall</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Social & Trust Section */}
      <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-4)' }}>
        <CardHeader className="pb-6 rounded-t-3xl px-10 py-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))' }}>
              <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Social Media & Authority</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8">
          <div className="overflow-x-auto rounded-2xl glass-table border-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left py-3 pl-4 pr-4 font-medium rounded-tl-xl">Domain</th>
                  <th className="text-right py-3 px-3 font-medium">
                    <MetricInfo metric="youtube-metrics">
                      <Youtube className="h-3 w-3" />
                      <span>YouTube</span>
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <MetricInfo metric="linkedin-metrics">
                      <Linkedin className="h-3 w-3" />
                      <span>LinkedIn</span>
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <MetricInfo metric="facebook-metrics">
                      <Facebook className="h-3 w-3" />
                      <span>Facebook</span>
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <MetricInfo metric="google-reviews">
                      <span>Google Reviews</span>
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <MetricInfo metric="social-reach">
                      Total Reach
                    </MetricInfo>
                  </th>
                  <th className="text-center py-3 px-3 font-medium">
                    <MetricInfo metric="platform-presence">
                      Platforms
                    </MetricInfo>
                  </th>
                  <th className="text-right py-3 pl-3 pr-4 font-medium rounded-tr-xl">
                    <MetricInfo metric="authority-score">
                      Authority
                    </MetricInfo>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => {
                  const isUserSite = userDomain ? metric.domain === userDomain : index === 0;
                  const socialCount = metric.socialMediaPresence?.length || 0;
                  return (
                    <tr key={metric.id} className={`${isUserSite ? 'bg-blue-100/95 dark:bg-blue-900/50 border-blue-200/50 dark:border-blue-700/50' : ''} ${index === metrics.length - 1 ? '' : 'border-b border-muted/30'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className={`py-3 pl-4 pr-4 ${index === metrics.length - 1 ? 'rounded-bl-xl' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FaviconImage domain={metric.domain} />
                            {isUserSite && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isUserSite ? 'text-blue-900 dark:text-white font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>
                              {metric.domain}
                              {isUserSite && <span className="text-xs text-blue-800 dark:text-blue-200 ml-2 font-medium">(Your Site)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {metric.youtubeSubscribers ? (
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-red-600">
                              {formatNumber(metric.youtubeSubscribers)}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(metric.youtubeVideoCount)} videos
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {metric.socialMediaAnalytics?.linkedin?.followers ? (
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-blue-600">
                              {formatNumber(metric.socialMediaAnalytics.linkedin.followers)}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {metric.socialMediaAnalytics.linkedin.activity || 'Active'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {metric.socialMediaAnalytics?.facebook?.followers ? (
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-blue-700">
                              {formatNumber(metric.socialMediaAnalytics.facebook.followers)}
                            </span>
                            <div className="text-xs text-muted-foreground">likes</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {metric.googleRating ? (
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-green-600">
                              {metric.googleRating} ★
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(metric.googleReviewsCount)} reviews
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold text-purple-600">
                            {formatNumber(
                              (metric.youtubeSubscribers || 0) +
                              (metric.socialMediaAnalytics?.linkedin?.followers || 0) +
                              (metric.socialMediaAnalytics?.facebook?.followers || 0) +
                              (metric.socialMediaAnalytics?.twitter?.followers || 0) +
                              (metric.socialMediaAnalytics?.instagram?.followers || 0)
                            )}
                          </span>
                          <div className="text-xs text-muted-foreground">combined</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex justify-center gap-1">
                          {metric.socialMediaPresence?.map((platform) => {
                            const Icon = {
                              'youtube': Youtube,
                              'linkedin': Linkedin,
                              'facebook': Facebook,
                              'twitter': Twitter,
                              'instagram': Instagram
                            }[platform.toLowerCase()];
                            return Icon ? <Icon key={platform} className="h-4 w-4 text-muted-foreground" /> : null;
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {socialCount} active
                        </div>
                      </td>
                      <td className={`py-3 pl-3 pr-4 text-right ${index === metrics.length - 1 ? 'rounded-br-xl' : ''}`}>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-lg font-bold text-yellow-600">
                            {formatTrustScore(metric.trustSignalsScore)}
                          </span>
                          <div className="text-xs text-muted-foreground">E-E-A-T</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      

      
    </div>
  );
}