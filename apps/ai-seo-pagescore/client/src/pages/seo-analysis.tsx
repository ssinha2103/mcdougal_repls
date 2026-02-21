/*
 * AI SEO PageScore - Main Application
 * © 2025 McDougall Interactive. All rights reserved.
 * Proprietary competitive SEO analysis platform with 14-point AI Trust Score algorithm
 * Patent-pending E-E-A-T analysis methodology and multi-platform intelligence system
 * Unauthorized copying, distribution, or reverse engineering prohibited
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UrlInputForm } from "@/components/url-input-form";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ResultsTable } from "@/components/results-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { startAnalysis, getAnalysisJob, exportAnalysis, exportAnalysisPDF, type AnalysisJob } from "@/lib/api";
import { BarChart3, Search, Gauge, Link, TrendingUp, Trophy, Zap, Lightbulb, HelpCircle, Mail, Download, Info, Menu, X } from "lucide-react";
import { Logo, LogoText } from "@/components/logo";
// McDougall Interactive official logo from their website
const mcdougallLogo = "https://mcdia.wpenginepowered.com/wp-content/uploads/2019/10/McDougall-Interactive-LOGO-transparent-300x103.png";
import { Link as RouterLink } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function SeoAnalysis() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for analysis job status
  const { data: analysisJob, isLoading: isJobLoading } = useQuery({
    queryKey: ['/api/analysis', currentJobId],
    queryFn: () => getAnalysisJob(currentJobId!),
    enabled: !!currentJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      console.log('Refetch interval check:', { data, status: data?.status });
      if (!data) return 2000;
      return data.status === 'running' || data.status === 'pending' ? 2000 : false;
    },
  }) as { data: AnalysisJob | undefined, isLoading: boolean };

  // Start analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: ({ urls, socialLinks }: { urls: string[], socialLinks?: any }) => startAnalysis(urls, socialLinks),
    onSuccess: (job) => {
      console.log('Analysis started successfully:', job);
      setCurrentJobId(job.id);
      toast({
        title: "Analysis Started",
        description: `Started analyzing ${job.urls.length} domains. This may take several minutes.`,
      });
      // Force immediate refetch of the job status
      queryClient.invalidateQueries({ queryKey: ['/api/analysis', job.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
      console.error("Analysis error:", error);
    },
  });

  // Export mutation (CSV)
  const exportMutation = useMutation({
    mutationFn: () => exportAnalysis(currentJobId!),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'seo-analysis.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Complete",
        description: "Analysis results have been downloaded as CSV.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export analysis results.",
        variant: "destructive",
      });
    },
  });

  // Export PDF mutation
  const exportAnalysisMutation = useMutation({
    mutationFn: (jobId: number) => exportAnalysisPDF(jobId),
    onSuccess: (blob) => {
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Exported",
        description: "Your SEO analysis report has been downloaded.",
      });
    },
    onError: (error: any) => {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartAnalysis = (urls: string[], socialLinks?: { [domain: string]: { googleProfile?: string; reviewsCount?: string; rating?: string; youtube?: string; facebook?: string; instagram?: string; twitter?: string; linkedin?: string } }) => {
    console.log('Starting analysis with URLs:', urls);
    console.log('Social links provided:', socialLinks);
    
    startAnalysisMutation.mutate({ urls, socialLinks });
  };

  const handleExport = () => {
    if (currentJobId) {
      exportMutation.mutate();
    }
  };

  const handleNewAnalysis = () => {
    setCurrentJobId(null);
    queryClient.removeQueries({ queryKey: ['/api/analysis'] });
  };

  // Calculate progress for running jobs
  const getProgressData = () => {
    if (!analysisJob || !analysisJob.urls) return { items: [], progress: 0 };

    const items = analysisJob.urls.map((url: string) => {
      const metric = analysisJob.metrics?.find((m: any) => m.url === url);
      return {
        domain: url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
        status: metric ? 'completed' as const : (analysisJob.status === 'running' ? 'running' as const : 'pending' as const),
        step: metric ? undefined : 'Analyzing...',
      };
    });

    // Always use the database progress field for consistent tracking
    // Only fall back to completion percentage if progress is not available
    let progress = 0;
    if (analysisJob.progress !== undefined && analysisJob.progress !== null) {
      progress = analysisJob.progress;
    } else if (analysisJob.status === 'completed') {
      progress = 100;
    } else {
      // Fallback to completion-based calculation only if no database progress
      progress = (analysisJob.metrics?.length || 0) / analysisJob.urls.length * 100;
    }

    return { items, progress };
  };

  const progressData = getProgressData();
  const isAnalyzing = analysisJob?.status === 'running' || analysisJob?.status === 'pending';
  const hasResults = analysisJob?.status === 'completed' && analysisJob?.metrics && analysisJob.metrics.length > 0;

  // MetricInfo component for tooltips
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
      'eeat-score': 'E-E-A-T Score',
      'trust-signals': 'Trust Signals Count',
      'ai-readiness': 'AI Readiness',
      'content-authority': 'Content Authority'
    };
    return titles[metric] || metric;
  };

  const getMetricDescription = (metric: string): string => {
    const descriptions: Record<string, string> = {
      'eeat-score': 'Combined E-E-A-T (Experience, Expertise, Authority, Trust) score showing how well your content meets Google\'s quality guidelines.',
      'trust-signals': 'Count of specific trust indicators present on your site such as author bios, citations, security badges, and verified information.',
      'ai-readiness': 'Percentage score showing how well-optimized your content is for AI-powered search features like featured snippets and AI overviews.',
      'content-authority': 'Classification of your content\'s authority level (Basic, Intermediate, Expert) based on depth, accuracy, and credibility signals.'
    };
    return descriptions[metric] || '';
  };

  const getMetricExample = (metric: string): string => {
    const examples: Record<string, string> = {
      'eeat-score': 'WebMD scores 9/10 with medical professionals, citations, and editorial review. A personal health blog without credentials might score 3/10.',
      'trust-signals': 'A site with 8 trust signals (SSL, author bios, citations, reviews, etc.) appears more credible to AI than one with only 2 signals.',
      'ai-readiness': '85% AI readiness means your content is structured for featured snippets, voice search, and AI summaries. Below 40% misses these opportunities.',
      'content-authority': 'Expert level: Scientific journals with peer review. Intermediate: Industry blogs with experience. Basic: General information without unique insights.'
    };
    return examples[metric] || '';
  };
  
  // Scroll to top when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      // Use requestAnimationFrame to ensure scroll happens after layout updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100); // Small delay to ensure UI updates are complete
      });
    }
  }, [isAnalyzing]);
  
  console.log('Component state:', { 
    currentJobId, 
    analysisJob: analysisJob ? { id: analysisJob.id, status: analysisJob.status, metricsCount: analysisJob.metrics?.length } : null,
    isAnalyzing, 
    hasResults 
  });

  // Get insights from results
  const getInsights = () => {
    if (!hasResults || !analysisJob?.metrics) return null;

    const metrics = analysisJob.metrics;
    const topTraffic = metrics.reduce((max: any, m: any) => 
      (m.organicTraffic || 0) > (max.organicTraffic || 0) ? m : max
    );
    
    const sitesWithSpeed = metrics.filter((m: any) => m.pageSpeed);
    const fastestSite = sitesWithSpeed.length > 0 ? sitesWithSpeed.reduce((fastest: any, m: any) => 
      parseFloat(m.pageSpeed!) < parseFloat(fastest.pageSpeed!) ? m : fastest
    ) : null;

    const topBacklinks = metrics.reduce((max: any, m: any) => 
      (m.backlinks || 0) > (max.backlinks || 0) ? m : max
    );

    return { topTraffic, fastestSite, topBacklinks };
  };

  const insights = getInsights();

  return (
    <div className="min-h-screen liquid-bg">
      {/* Header */}
      <header className="glass-card border-b-0 backdrop-blur-xl bg-white/10 dark:bg-black/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <RouterLink href="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <Logo size={40} />
                <LogoText />
              </div>
            </RouterLink>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Badge className="glass-card border-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300">Free Tool</Badge>
              <nav className="flex items-center gap-6">
                <a 
                  href="https://www.mcdougallinteractive.com/about/about-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  data-testid="link-about-us"
                >
                  About Us
                </a>
                <RouterLink href="/contact">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer" data-testid="link-contact">
                    Contact
                  </span>
                </RouterLink>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('More Tools link clicked - redirecting...');
                    window.open('https://www.mcdougallinteractive.com/resources/', '_blank', 'noopener,noreferrer');
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium bg-transparent border-none cursor-pointer"
                  data-testid="button-more-tools"
                >
                  More Tools
                </button>
              </nav>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              <Badge className="glass-card border-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 text-xs px-2 py-1">Free</Badge>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg glass-card border-0 bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="button-mobile-menu"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden absolute top-full left-0 right-0 z-50 glass-card border-t border-white/20 bg-white/95 dark:bg-black/95 backdrop-blur-xl">
              <nav className="flex flex-col py-4 px-4 space-y-3">
                <a 
                  href="https://www.mcdougallinteractive.com/about/about-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
                  data-testid="mobile-link-about-us"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </a>
                <RouterLink href="/contact">
                  <span 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer py-2 px-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 block"
                    data-testid="mobile-link-contact"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </span>
                </RouterLink>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('More Tools link clicked - redirecting...');
                    window.open('https://www.mcdougallinteractive.com/resources/', '_blank', 'noopener,noreferrer');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium bg-transparent border-none cursor-pointer py-2 px-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
                  data-testid="mobile-button-more-tools"
                >
                  More Tools
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent pt-[10px] pb-[10px]">AI SEO PageScore Competitive Analysis</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-3 sm:mb-4 px-4">
            Advanced competitive SEO analysis with AI Trust Score evaluation. Analyze E-E-A-T signals, 
            AI Overview optimization, author credibility, and traditional SEO metrics to outrank competitors 
            in the age of AI search.
          </p>
          <div className="glass-card rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto mx-4" style={{ background: 'var(--liquid-gradient-1)' }}>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              <strong>Comprehensive Data Intelligence:</strong> Automatically analyzes SEO metrics, Google Business reviews, 
              YouTube channel analytics (subscribers, posting frequency), and LinkedIn business presence to provide 
              complete competitive intelligence across all digital touchpoints.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Input Form */}
          {!isAnalyzing && !hasResults && (
            <UrlInputForm 
              onSubmit={handleStartAnalysis}
              isLoading={startAnalysisMutation.isPending}
            />
          )}

          {/* Progress Indicator */}
          {isAnalyzing && (
            <ProgressIndicator
              items={progressData.items}
              overallProgress={progressData.progress}
              currentStep={analysisJob?.currentStep || 'Starting analysis...'}
              onCancel={handleNewAnalysis}
            />
          )}

          {/* Results */}
          {hasResults && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Analysis Complete</h3>
                <Button onClick={handleNewAnalysis} className="liquid-button border-0 text-white">
                  New Analysis
                </Button>
              </div>

              <ResultsTable
                metrics={analysisJob?.metrics || []}
                onExport={handleExport}
                lastUpdated={analysisJob.completedAt ? new Date(analysisJob.completedAt).toLocaleString() : undefined}
                jobId={currentJobId || undefined}
                analysisJob={analysisJob}
              />

              {/* Advanced AI Search Analysis Table */}
              <Card className="glass-card rounded-3xl border-0 shadow-2xl mt-8" style={{ 
                background: 'var(--liquid-gradient-4)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl glass-card" style={{ 
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))'
                    }}>
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Advanced AI Search Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive E-E-A-T scoring and AI readiness assessment for each domain
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl overflow-hidden border border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="font-bold text-foreground pl-6">Domain</TableHead>
                          <TableHead className="text-center font-bold text-foreground">
                            <MetricInfo metric="eeat-score">
                              <span className="text-orange-600">🎯</span>
                              E-E-A-T Score
                            </MetricInfo>
                          </TableHead>
                          <TableHead className="text-center font-bold text-foreground">
                            <MetricInfo metric="trust-signals">
                              <span className="text-purple-600">👤</span>
                              Trust Signals
                            </MetricInfo>
                          </TableHead>
                          <TableHead className="text-center font-bold text-foreground">
                            <MetricInfo metric="ai-readiness">
                              <span className="text-blue-600">🔮</span>
                              AI Readiness
                            </MetricInfo>
                          </TableHead>
                          <TableHead className="text-center font-bold text-foreground">
                            <MetricInfo metric="content-authority">
                              Content Authority
                            </MetricInfo>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(analysisJob?.metrics || []).map((metric, index) => {
                          const eatScore = metric.trustSignalsScore || 0;
                          const trustSignals = `${metric.trustSignalsScore || 0}/10`;
                          const aiReadiness = `${Math.min(eatScore * 10, 100)}%`;
                          const contentAuthority = eatScore >= 7 ? 'Expert' : eatScore >= 4 ? 'Intermediate' : 'Basic';
                          
                          // Check if this is the user's website (first URL in analysis job)
                          const isUserWebsite = analysisJob?.urls && analysisJob.urls.length > 0 && 
                            (metric.domain === analysisJob.urls[0].replace(/^https?:\/\/(www\.)?/, '') ||
                             metric.url === analysisJob.urls[0]);
                          
                          // Define logo colors based on domain
                          const getDomainColor = (domain: string) => {
                            if (domain.includes('mcdougall')) return 'from-blue-600 to-purple-600';
                            if (domain.includes('webris')) return 'from-red-500 to-pink-500';
                            if (domain.includes('rankings')) return 'from-purple-500 to-indigo-500';
                            return 'from-gray-500 to-gray-600';
                          };
                          
                          return (
                            <TableRow key={metric.id} className={`hover:bg-muted/20 transition-colors ${isUserWebsite ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500' : ''}`}>
                              <TableCell className="pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    {/* Website favicon/logo */}
                                    <img 
                                      src={`https://www.google.com/s2/favicons?domain=${metric.domain}&sz=32`} 
                                      alt={`${metric.domain} favicon`}
                                      className="w-8 h-8 rounded-lg border border-border/50"
                                      onError={(e) => {
                                        // Fallback to generated logo
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling!.classList.remove('hidden');
                                      }}
                                    />
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getDomainColor(metric.domain)} flex items-center justify-center text-white font-bold text-sm hidden`}>
                                      {metric.domain.charAt(0).toUpperCase()}
                                    </div>
                                    {/* "Your Website" indicator */}
                                    {isUserWebsite && (
                                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                                        You
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium text-foreground">{metric.domain}</div>
                                      {isUserWebsite && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(Your Site)</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{metric.url}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-bold text-lg">{eatScore}/10</span>
                                  <Badge 
                                    variant={eatScore >= 7 ? "default" : eatScore >= 4 ? "secondary" : "destructive"}
                                    className={
                                      eatScore >= 7 
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                        : eatScore >= 4 
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                    }
                                  >
                                    {eatScore >= 7 ? 'Excellent' : eatScore >= 4 ? 'Good' : 'Needs Work'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-mono text-sm">{trustSignals}</span>
                                  <div className="flex gap-1">
                                    {Array.from({ length: 10 }, (_, i) => (
                                      <div 
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${
                                          i < (metric.trustSignalsScore || 0) 
                                            ? 'bg-purple-500' 
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-bold text-lg">{aiReadiness}</span>
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: aiReadiness }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge 
                                  variant={contentAuthority === 'Expert' ? "default" : contentAuthority === 'Intermediate' ? "secondary" : "outline"}
                                  className={
                                    contentAuthority === 'Expert'
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                      : contentAuthority === 'Intermediate'
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                                  }
                                >
                                  {contentAuthority}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* AI Analysis Legend */}
                  <div className="mt-6 p-6 bg-muted/20 rounded-2xl">
                    <h4 className="font-bold text-sm mb-4 text-foreground">Analysis Methodology</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="font-semibold text-orange-600">E-E-A-T Score</div>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Experience signals</li>
                          <li>• Expertise indicators</li>
                          <li>• Authoritativeness markers</li>
                          <li>• Trust signals</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-purple-600">Trust Signals</div>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Author credibility</li>
                          <li>• Social verification</li>
                          <li>• Content depth</li>
                          <li>• Technical quality</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-600">AI Readiness</div>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Structured content</li>
                          <li>• Schema markup</li>
                          <li>• First-person language</li>
                          <li>• Original media</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-emerald-600">Content Authority</div>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Expert (7+ E-E-A-T)</li>
                          <li>• Intermediate (4-6)</li>
                          <li>• Basic (0-3)</li>
                          <li>• Overall content quality</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={() => exportAnalysisMutation.mutate(currentJobId!)}
                  disabled={exportAnalysisMutation.isPending}
                  className="liquid-button border-0 text-white px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {exportAnalysisMutation.isPending ? 'Generating PDF...' : 'Export Professional PDF Report'}
                </Button>
              </div>

              {/* Insights */}
              {insights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="glass-card rounded-3xl border-0 floating" style={{ background: 'var(--liquid-gradient-4)', animationDelay: '0.5s' }}>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))' }}>
                          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Top Traffic Performer</h4>
                      </div>
                      <p className="text-lg font-bold">{insights.topTraffic.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {insights.topTraffic.organicTraffic?.toLocaleString()} monthly visitors
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card rounded-3xl border-0 floating" style={{ background: 'var(--liquid-gradient-2)', animationDelay: '1s' }}>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
                          <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Fastest Site</h4>
                      </div>
                      <p className="text-lg font-bold">{insights.fastestSite?.domain || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {insights.fastestSite?.pageSpeed ? `${insights.fastestSite.pageSpeed}s load time` : 'No data'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card rounded-3xl border-0 floating" style={{ background: 'var(--liquid-gradient-1)', animationDelay: '1.5s' }}>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                          <Link className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Backlink Champion</h4>
                      </div>
                      <p className="text-lg font-bold">{insights.topBacklinks.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {insights.topBacklinks.backlinks?.toLocaleString()} backlinks
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* How It Works */}
          <Card className="glass-card rounded-3xl border-0 shadow-2xl floating" style={{ background: 'var(--liquid-gradient-2)' }}>
            <CardContent className="p-10">
              <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Advanced AI Search Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                    <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">AI Trust Signals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Analyzes author credibility, structured data, and experience indicators for AI Overview optimization
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))' }}>
                    <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">E-E-A-T Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Evaluates Experience, Expertise, Authoritativeness, and Trust signals that modern AI systems prioritize
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.3))' }}>
                    <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">Multi-Platform Intelligence</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Google Business reviews, YouTube analytics (subscribers, posting frequency), LinkedIn presence, and traditional SEO metrics
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))' }}>
                    <Gauge className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">Performance Metrics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Page speed analysis, content structure scoring, and first-person experience detection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-background border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <img 
                  src={mcdougallLogo} 
                  alt="McDougall Interactive" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © 2025 McDougall Interactive. AI SEO PageScore - Advanced competitive analysis tool.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="https://www.mcdougallinteractive.com/about/about-us/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                About Us
              </a>
              <RouterLink href="/contact">
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">Contact</span>
              </RouterLink>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.mcdougallinteractive.com/resources/', '_blank', 'noopener,noreferrer');
                }}
                className="text-sm text-muted-foreground hover:text-primary bg-transparent border-none cursor-pointer"
              >
                More Tools
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
