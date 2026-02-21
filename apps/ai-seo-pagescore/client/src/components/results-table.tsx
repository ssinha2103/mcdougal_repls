import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, ChevronUp, ChevronDown, BarChart3, Globe, FileText, Layout, Table as TableIcon, Clock, CheckCircle, FileDown } from "lucide-react";
import { SeoMetrics } from "@/lib/api";
import { TooltipExplainer } from "@/components/ui/tooltip-explainer";
import { SectionedResults } from "./sectioned-results";
import { useToast } from "@/hooks/use-toast";

interface ResultsTableProps {
  metrics: SeoMetrics[];
  onExport: () => void;
  onRefresh?: () => void;
  lastUpdated?: string;
  jobId?: number;
}

type SortField = keyof SeoMetrics | 'trustSignalsScore' | 'googleReviewsCount' | 'none';
type SortDirection = 'asc' | 'desc';

interface ResultsTablePropsWithJob extends ResultsTableProps {
  analysisJob?: { urls: string[] };
}

export function ResultsTable({ metrics, onExport, onRefresh, lastUpdated, jobId, analysisJob }: ResultsTablePropsWithJob) {
  const [sortField, setSortField] = useState<SortField>('organicTraffic');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStage, setPdfStage] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's domain from the first URL in the analysis job
  const userDomain = analysisJob?.urls?.[0] ? new URL(analysisJob.urls[0]).hostname.replace('www.', '') : null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => {
    if (sortField === 'none') return 0;
    
    let aValue: any, bValue: any;
    
    if (sortField === 'trustSignalsScore') {
      aValue = a.trustSignalsScore || 0;
      bValue = b.trustSignalsScore || 0;
    } else if (sortField === 'googleReviewsCount') {
      aValue = a.googleReviewsCount || 0;
      bValue = b.googleReviewsCount || 0;
    } else {
      aValue = a[sortField as keyof SeoMetrics];
      bValue = b[sortField as keyof SeoMetrics];
    }
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3 ml-1" /> : 
      <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPageSpeedBadge = (speed: string | null | undefined) => {
    if (!speed) return <Badge variant="secondary">N/A</Badge>;
    
    const speedNum = parseFloat(speed);
    if (speedNum < 0.5) return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    if (speedNum < 1.5) return <Badge variant="default" className="bg-yellow-500">Good</Badge>;
    if (speedNum < 3) return <Badge variant="default" className="bg-orange-500">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getTrustScoreBadge = (score: number) => {
    if (score >= 8) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Excellent</Badge>;
    } else if (score >= 5) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Good</Badge>;
    } else if (score >= 2) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Basic</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Needs Work</Badge>;
    }
  };

  /*
   * AI Trust Score & Performance Algorithm
   * © 2025 McDougall Interactive. All rights reserved.
   * Proprietary composite scoring methodology for SEO competitive analysis
   * Unauthorized copying, distribution, or reverse engineering prohibited
   */

  const getPerformanceScore = (metric: SeoMetrics) => {
    let score = 0;
    let maxScore = 0;

    // Organic traffic (40% weight)
    if (metric.organicTraffic !== null && metric.organicTraffic !== undefined) {
      const trafficScore = Math.min(metric.organicTraffic / 10000, 1); // Normalize to 1 for 10k+ traffic
      score += trafficScore * 40;
    }
    maxScore += 40;

    // Trust signals (25% weight)
    if (metric.trustSignalsScore !== null && metric.trustSignalsScore !== undefined) {
      const trustScore = Math.min(metric.trustSignalsScore, 10) / 10; // Cap at 10 then normalize to 1
      score += trustScore * 25;
    }
    maxScore += 25;

    // Backlinks (20% weight)
    if (metric.backlinks !== null && metric.backlinks !== undefined) {
      const backlinkScore = Math.min(metric.backlinks / 1000, 1); // Normalize to 1 for 1000+ backlinks
      score += backlinkScore * 20;
    }
    maxScore += 20;

    // Page speed (15% weight) - inverted since lower is better
    if (metric.pageSpeed && metric.pageSpeed !== 'N/A') {
      const speedNum = parseFloat(metric.pageSpeed);
      const speedScore = Math.max(0, 1 - (speedNum / 5)); // 0s = 1, 5s+ = 0
      score += speedScore * 15;
    }
    maxScore += 15;

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  };

  const getPerformanceBackgroundClass = (metric: SeoMetrics) => {
    const score = getPerformanceScore(metric);
    
    if (score >= 80) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-l-4 border-l-green-500";
    } else if (score >= 60) {
      return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-l-4 border-l-yellow-500";
    } else if (score >= 40) {
      return "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-l-4 border-l-orange-500";
    } else if (score >= 20) {
      return "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-l-4 border-l-red-500";
    } else {
      return "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-l-4 border-l-red-500";
    }
  };

  const totalTraffic = metrics.reduce((sum, m) => sum + (m.organicTraffic || 0), 0);
  const avgPageSpeed = metrics.filter(m => m.pageSpeed).length > 0 
    ? metrics.filter(m => m.pageSpeed).reduce((sum, m) => sum + parseFloat(m.pageSpeed!), 0) / metrics.filter(m => m.pageSpeed).length
    : 0;

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

    if (!jobId) {
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
      
      const response = await fetch(`/api/analysis/${jobId}/export-pdf`, {
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

  return (
    <Card className="glass-card rounded-3xl border-0 shadow-2xl floating w-full" style={{ background: 'var(--liquid-gradient-1)' }} id="results-section">
      <CardHeader className="rounded-t-3xl px-4 sm:px-10 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
              <div className="p-2 sm:p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Analysis Results</span>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 sm:mt-3 text-sm sm:text-lg">
              Competitive analysis completed for {metrics.length} domains
              {lastUpdated && (
                <span className="ml-2 hidden sm:inline">• Last updated: {lastUpdated}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="liquid-button-secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="liquid-button">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-10 pb-6 sm:pb-8">
        <Tabs defaultValue="sectioned" className="w-full">
          <TabsList className="glass-card border-0 backdrop-blur-lg grid w-full grid-cols-2 mb-8 p-1 rounded-2xl h-14" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <TabsTrigger value="sectioned" className="flex items-center justify-center gap-2 rounded-xl h-12 px-4 transition-colors duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Layout className="h-4 w-4" />
              Sectioned View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center justify-center gap-2 rounded-xl h-12 px-4 transition-colors duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <TableIcon className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sectioned" className="mt-0">
            <SectionedResults 
              metrics={sortedMetrics} 
              onExport={onExport} 
              analysisJob={analysisJob ? { ...analysisJob, id: jobId || 0 } : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            {/* Enhanced scroll hint with liquid glass design */}
            <div className="mb-6 p-4 glass-card rounded-2xl border-0" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))' }}>
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Table Navigation:</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span>• Scroll horizontally to view all 14 SEO metrics</span>
                  <span>• Domain column stays pinned for easy reference</span>
                  <span className="hidden sm:inline">• Enhanced scrollbar at bottom for easier navigation</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Enhanced horizontal scroll container with improved scrollbar */}
              <div 
                className="overflow-x-auto overflow-y-visible glass-table rounded-2xl border-0 shadow-2xl seo-table-scroll"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#3b82f6 #e2e8f0',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Left and right scroll indicators */}
                <div className="absolute top-0 left-[180px] z-40 pointer-events-none">
                  <div className="bg-gradient-to-r from-background/80 to-transparent w-6 h-full" />
                </div>
                <div className="absolute top-0 right-0 z-40 pointer-events-none">
                  <div className="bg-gradient-to-l from-background/80 to-transparent w-6 h-full" />
                </div>
                
                {/* Scroll instruction overlay - shows on first load */}
                <div className="absolute bottom-2 right-4 z-40 pointer-events-none">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md opacity-75 animate-pulse">
                    ← Scroll horizontally →
                  </div>
                </div>
                
                <Table className="relative min-w-full" style={{ minWidth: '1800px' }}>
                  <TableHeader className="sticky top-0 z-20 glass-card rounded-t-2xl" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <TableRow className="border-b border-white/20">
                      <TableHead className="sticky left-0 z-30 glass-card border-r border-white/20 w-[180px] min-w-[180px] shadow-lg rounded-tl-2xl" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}>
                        <button
                          className="flex items-center hover:text-foreground font-semibold"
                          onClick={() => handleSort('domain')}
                        >
                          Domain
                          {getSortIcon('domain')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="flex items-center hover:text-foreground"
                            onClick={() => handleSort('indexedPages')}
                          >
                            Indexed Pages
                      {getSortIcon('indexedPages')}
                    </button>
                    <TooltipExplainer
                      title="Indexed Pages"
                      description="Number of pages from this domain that Google has crawled and included in its search index. Higher numbers indicate better site coverage."
                      goodRange="100+ for business sites"
                      tips={[
                        "Submit XML sitemaps to improve indexing",
                        "Fix crawl errors in Google Search Console",
                        "Ensure pages are linked internally"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('referringDomains')}
                    >
                      Referring Domains
                      {getSortIcon('referringDomains')}
                    </button>
                    <TooltipExplainer
                      title="Referring Domains"
                      description="Number of unique websites that link to this domain. A key ranking factor that signals authority and trustworthiness to search engines."
                      goodRange="50+ for established sites"
                      tips={[
                        "Create valuable content that others want to link to",
                        "Build relationships with industry publications",
                        "Guest posting on relevant sites"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('backlinks')}
                    >
                      Backlinks
                      {getSortIcon('backlinks')}
                    </button>
                    <TooltipExplainer
                      title="Backlinks"
                      description="Total number of links pointing to this domain from other websites. Quality matters more than quantity - links from authoritative sites carry more weight."
                      goodRange="200+ for competitive niches"
                      tips={[
                        "Focus on earning links from relevant, high-authority sites",
                        "Avoid paid link schemes that violate Google guidelines",
                        "Monitor your backlink profile regularly"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('top100Keywords')}
                    >
                      Top 100 Keywords
                      {getSortIcon('top100Keywords')}
                    </button>
                    <TooltipExplainer
                      title="Top 100 Keywords"
                      description="Number of keywords ranking in the top 100 search results. This indicates the domain's visibility for relevant search terms and potential for organic traffic."
                      goodRange="500+ for competitive industries"
                      tips={[
                        "Target long-tail keywords with lower competition",
                        "Optimize content for search intent",
                        "Monitor keyword rankings regularly"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('organicTraffic')}
                    >
                      Organic Traffic
                      {getSortIcon('organicTraffic')}
                    </button>
                    <TooltipExplainer
                      title="Organic Traffic"
                      description="Estimated monthly visitors from Google search results. This represents the actual business value generated by SEO efforts and keyword rankings."
                      goodRange="1,000+ monthly visits"
                      tips={[
                        "Create content targeting high-volume keywords",
                        "Optimize for featured snippets and rich results",
                        "Improve click-through rates with compelling titles"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('trafficCost')}
                    >
                      Advertisement Value
                      {getSortIcon('trafficCost')}
                    </button>
                    <TooltipExplainer
                      title="Advertisement Value"
                      description="Estimated monetary value of organic traffic if you had to pay for these clicks through Google Ads. This shows the true ROI potential of SEO efforts."
                      goodRange="$10,000+ for business sites"
                      tips={[
                        "Focus on commercial intent keywords",
                        "Target high-value, low-competition terms",
                        "Create conversion-optimized landing pages"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('pageSpeed')}
                    >
                      Page Speed
                      {getSortIcon('pageSpeed')}
                    </button>
                    <TooltipExplainer
                      title="Page Speed"
                      description="Time it takes for the homepage to fully load. This is a crucial ranking factor and affects user experience, especially for mobile users and AI search results."
                      goodRange="Under 3 seconds"
                      tips={[
                        "Optimize images and use modern formats (WebP)",
                        "Minimize JavaScript and CSS",
                        "Use a Content Delivery Network (CDN)"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('trustSignalsScore')}
                    >
                      AI Trust Score
                      {getSortIcon('trustSignalsScore')}
                    </button>
                    <TooltipExplainer
                      title="AI Trust Score"
                      description="Advanced 10-point algorithm measuring E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness) that AI systems use to assess content credibility and ranking potential."
                      goodRange="8+ points for strong AI trust signals"
                      tips={[
                        "Author credibility: Add author boxes with LinkedIn profiles (3 pts)",
                        "Technical authority: Include structured data and organized content (3 pts)", 
                        "Experience signals: Use first-person language and original media (3 pts)",
                        "Content depth: Write comprehensive articles 1500+ words (1 pt)"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('googleReviewsCount')}
                    >
                      Google Reviews
                      {getSortIcon('googleReviewsCount')}
                    </button>
                    <TooltipExplainer
                      title="Google Reviews"
                      description="Number of Google reviews and average rating for this business. Strong review signals boost local SEO and build trust with both users and search engines."
                      goodRange="50+ reviews with 4.0+ rating"
                      tips={[
                        "Encourage satisfied customers to leave reviews",
                        "Respond professionally to all reviews",
                        "Address negative feedback promptly and constructively"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('youtubeSubscribers')}
                    >
                      YouTube
                      {getSortIcon('youtubeSubscribers')}
                    </button>
                    <TooltipExplainer
                      title="YouTube Analytics"
                      description="YouTube channel metrics including subscriber count, video count, and posting frequency. Indicates content marketing strength and audience engagement."
                      goodRange="1K+ subscribers for business channels"
                      tips={[
                        "Consistent posting schedule builds audience",
                        "Optimize video titles and descriptions for SEO",
                        "Create valuable, shareable content"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('none')}
                    >
                      LinkedIn
                    </button>
                    <TooltipExplainer
                      title="LinkedIn Business Presence"
                      description="LinkedIn company page metrics including follower count and posting activity frequency. Indicates B2B marketing strength and professional networking reach."
                      goodRange="1K+ followers with regular posting"
                      tips={[
                        "Post industry insights and thought leadership content",
                        "Engage with followers' comments and shares",
                        "Maintain consistent weekly posting schedule"
                      ]}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => handleSort('none')}
                    >
                      Performance
                    </button>
                    <TooltipExplainer
                      title="Performance Score"
                      description="Composite performance score based on organic traffic (40%), AI trust signals (25%), backlinks (20%), and page speed (15%). Colors indicate performance level."
                      goodRange="80%+ for top performers"
                      tips={[
                        "Green: Excellent performance (80%+)",
                        "Blue: Good performance (60-79%)",
                        "Yellow: Average performance (40-59%)"
                      ]}
                    />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMetrics.map((metric, index) => {
                const isUserSite = userDomain ? metric.domain === userDomain : index === 0; // Match by domain or fallback to first
                const performanceClass = getPerformanceBackgroundClass(metric);
                const rowClass = isUserSite 
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-l-4 border-l-blue-500" 
                  : performanceClass;
                
                return (
                  <TableRow 
                    key={metric.id} 
                    className={`transition-colors duration-300 hover:bg-white/20 dark:hover:bg-white/10 ${isUserSite ? 'bg-blue-500/10 dark:bg-blue-400/10' : 'bg-white/5 dark:bg-white/5'} ${index === sortedMetrics.length - 1 ? '' : 'border-b border-white/10'} backdrop-blur-sm`}
                  >
                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 sticky left-0 z-20 border-r border-white/20 shadow-lg glass-card w-[180px] min-w-[180px] bg-[#ffffff4f]" style={{ background: isUserSite ? 'rgba(59, 130, 246, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUserSite ? 'bg-blue-500' : 'bg-muted'}`}>
                          {isUserSite ? (
                            <div className="h-4 w-4 bg-white rounded-full"></div>
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium dark:text-blue-300 text-[#000000]">
                            {metric.domain}
                            {isUserSite && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(Your Site)</span>}
                          </div>
                          <div className="text-sm text-[#161a29]">{metric.url}</div>
                          {metric.indexedPages === null && (
                            <Badge variant="destructive" className="text-xs mt-1">Domain unreachable</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(metric.indexedPages)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(metric.referringDomains)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(metric.backlinks)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-blue-600">
                          {formatNumber(metric.top100Keywords)}
                        </span>
                        <span className="text-xs text-muted-foreground">top 100</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(metric.organicTraffic)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {metric.trafficCost || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono">
                          {metric.pageSpeed ? `${metric.pageSpeed}s` : 'N/A'}
                        </span>
                        {getPageSpeedBadge(metric.pageSpeed)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono">{metric.trustSignalsScore || 0}</span>
                        {getTrustScoreBadge(metric.trustSignalsScore || 0)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {(() => {
                          const reviewCount = metric.googleReviewsCount;
                          const rating = metric.googleRating;
                          
                          // Handle various data types and ensure proper display
                          const hasReviews = reviewCount !== null && reviewCount !== undefined && 
                                           (typeof reviewCount === 'number' ? reviewCount > 0 : !isNaN(Number(reviewCount)) && Number(reviewCount) > 0);
                          
                          if (hasReviews) {
                            const displayCount = typeof reviewCount === 'number' ? reviewCount : Number(reviewCount);
                            return (
                              <>
                                <span className="font-mono text-sm">{formatNumber(displayCount)} reviews</span>
                                {rating && (
                                  <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                                    <span>★</span>
                                    <span>{String(rating)}</span>
                                  </div>
                                )}
                              </>
                            );
                          } else {
                            return <span className="text-muted-foreground text-sm">No reviews</span>;
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {metric.youtubeChannelUrl ? (
                          <>
                            {metric.youtubeSubscribers ? (
                              <>
                                <span className="font-mono text-sm">{formatNumber(metric.youtubeSubscribers)} subs</span>
                                <span className="text-xs text-muted-foreground">
                                  {metric.youtubeVideoCount ? `${formatNumber(metric.youtubeVideoCount)} videos` : ''}
                                </span>
                                {metric.youtubePostingFrequency && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {metric.youtubePostingFrequency}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <a 
                                  href={metric.youtubeChannelUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  YouTube Channel
                                </a>
                                <span className="text-xs text-muted-foreground">Analytics pending</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">No channel</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        {(() => {
                          try {
                            const analytics = typeof metric.socialMediaAnalytics === 'string' 
                              ? JSON.parse(metric.socialMediaAnalytics || '{}')
                              : metric.socialMediaAnalytics || {};
                            
                            const linkedinData = analytics?.linkedin;
                            
                            if (linkedinData && linkedinData.followers) {
                              const followerCount = linkedinData.followers.toLocaleString();
                              const isActive = linkedinData.recentActivity || linkedinData.postingFrequency === 'Active';
                              const activityStatus = isActive ? 'Regular Posting' : 'Irregular Posting';
                              const activityColor = isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
                              
                              return (
                                <>
                                  <div className="text-sm font-medium">
                                    {followerCount} followers
                                  </div>
                                  <Badge variant="secondary" className={`text-xs ${activityColor}`}>
                                    {activityStatus}
                                  </Badge>
                                </>
                              );
                            } else if (metric.socialMediaPresence && metric.socialMediaPresence.includes('linkedin')) {
                              return (
                                <>
                                  <Badge variant="secondary" className="text-xs">
                                    LinkedIn Page
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    Private data
                                  </div>
                                </>
                              );
                            } else {
                              return (
                                <span className="text-muted-foreground text-sm">No LinkedIn</span>
                              );
                            }
                          } catch (e) {
                            return <span className="text-muted-foreground text-sm">No data</span>;
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(getPerformanceScore(metric))}%
                        </span>
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-current to-current transition-[width,background-color] duration-300 ease-out"
                            style={{ 
                              width: `${getPerformanceScore(metric)}%`,
                              backgroundColor: getPerformanceScore(metric) >= 80 ? '#10b981' : 
                                             getPerformanceScore(metric) >= 60 ? '#3b82f6' :
                                             getPerformanceScore(metric) >= 40 ? '#f59e0b' :
                                             getPerformanceScore(metric) >= 20 ? '#f97316' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Performance Legend */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Performance Color Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-2 border-l-green-500 rounded"></div>
              <span>Excellent (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-2 border-l-blue-500 rounded"></div>
              <span>Good (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-2 border-l-yellow-500 rounded"></div>
              <span>Average (40-59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-50 to-red-50 border-l-2 border-l-orange-500 rounded"></div>
              <span>Below Average (20-39%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-2 border-l-red-500 rounded"></div>
              <span>Poor (&lt;20%)</span>
            </div>
          </div>
        </div>

        {/* Enhanced AI Search Optimization Insights */}
        <div className="mt-8 glass-card rounded-3xl border-0 shadow-2xl p-8 floating" style={{ 
          background: 'var(--liquid-gradient-3)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.25)'
        }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-4 rounded-3xl glass-card animate-pulse" style={{ 
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.4))',
                animation: 'pulse 2s infinite'
              }}>
                <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <Badge className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-lg font-bold">
                🤖 Advanced AI Analysis
              </Badge>
            </div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              AI Search Optimization Intelligence
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive analysis of how your websites perform in the age of AI search, featuring E-E-A-T evaluation, 
              AI Overview optimization strategies, and trust signal assessment.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Traditional Authority Analysis */}
            <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-blue-700 dark:text-blue-300">Traditional Authority</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Domain Authority Signals</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">▶</span>
                      <span>Strong backlink profiles indicate domain authority</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">▶</span>
                      <span>Higher referring domains suggest trustworthiness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">▶</span>
                      <span>Organic traffic reflects real user engagement</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Performance Metrics</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">▶</span>
                      <span>Page speed impacts user experience and rankings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">▶</span>
                      <span>Technical optimization builds foundation trust</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Trust Signals Analysis */}
            <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1))',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))' }}>
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-purple-700 dark:text-purple-300">AI Trust Signals</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">E-E-A-T Evaluation</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">🔍</span>
                      <span>Author boxes with real names and credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">🔗</span>
                      <span>Linked social profiles verify expertise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">🏗️</span>
                      <span>Structured data helps AI understand content</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Trust Score Analysis</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">⭐</span>
                      <span>AI Trust Score measures credibility signals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">📊</span>
                      <span>10-point scale evaluates AI ranking factors</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Overview Strategy Analysis */}
            <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))' }}>
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-emerald-700 dark:text-emerald-300">AI Overview Strategy</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Content Optimization</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">💬</span>
                      <span>Use first-person experience language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">📋</span>
                      <span>Structure content with lists and tables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">📸</span>
                      <span>Include original photos and videos</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">AI Readiness</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">🎯</span>
                      <span>Content depth and comprehensive coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">🤖</span>
                      <span>AI-friendly formatting and structure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced AI Insights Summary */}
          <div className="mt-10 glass-card rounded-3xl p-8" style={{ 
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(147, 51, 234, 0.1))',
            border: '1px solid rgba(79, 70, 229, 0.2)'
          }}>
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🎯 Key AI Optimization Takeaways
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl">
                  <h5 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3">✨ What Makes Websites AI-Ready</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    High AI Trust Scores combined with strong traditional metrics indicate websites that perform well in both 
                    classic search results and emerging AI-powered search experiences.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                  <h5 className="font-bold text-purple-700 dark:text-purple-300 mb-3">🚀 Future-Proof Your Content</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Focus on author credibility, first-person experience, and structured content to rank well in 
                    AI Overviews while maintaining traditional SEO strength.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* PDF Generation Progress Dialog */}
      <Dialog open={isPdfGenerating} onOpenChange={closePdfDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {pdfProgress === 100 ? 'PDF Ready!' : 'Generating PDF Report'}
            </DialogTitle>
            <DialogDescription>
              {pdfProgress === 100 
                ? 'Your SEO competitive analysis report is ready for download.'
                : 'Please wait while we generate your professional SEO analysis report. This typically takes 30-60 seconds.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pdfProgress < 100 ? (
              <>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{pdfStage}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{pdfProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pdfProgress}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{pdfStage}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownloadPdf}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={closePdfDialog}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
