import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Search, 
  BarChart3, 
  Users, 
  Globe, 
  TrendingUp, 
  Eye, 
  Link as LinkIcon,
  Star,
  Youtube,
  HelpCircle,
  BookOpen,
  Zap,
  Shield,
  Gauge
} from "lucide-react";
// McDougall Interactive official logo from their website
const mcdougallLogo = "https://mcdia.wpenginepowered.com/wp-content/uploads/2019/10/McDougall-Interactive-LOGO-transparent-300x103.png";

export default function Help() {
  return (
    <div className="min-h-screen liquid-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 liquid-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SEO Analysis Tool Help Center
          </h1>
        </div>

        {/* Professional Badge */}
        <Card className="glass-card rounded-3xl border-0 shadow-2xl mb-8" style={{ background: 'var(--liquid-gradient-1)' }}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Professional SEO Intelligence Platform
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Powered by McDougall Interactive's 27+ years of digital marketing expertise
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-blue-600 text-white px-4 py-2 text-lg">
                Since 1995
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Help Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start Guide */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-2)' }}>
              <CardHeader className="pb-6 rounded-t-3xl px-8 py-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Quick Start Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enter Your Website URLs</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Add your website and up to 11 competitor URLs. Our system analyzes each domain for comprehensive SEO metrics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Start Competitive Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Click "Start Competitive Analysis" to begin collecting authentic SEO data from multiple professional sources.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Review Results</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Explore sectioned results for detailed insights or table view for comprehensive data comparison across all metrics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export Professional Report</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Generate a comprehensive PDF report with competitive analysis, strategic recommendations, and ROI projections.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed FAQ */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-3)' }}>
              <CardHeader className="pb-6 rounded-t-3xl px-8 py-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))' }}>
                    <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="data-sources" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      What data sources do you use for SEO metrics?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      We use premium APIs including DataForSEO, Google Places API, and YouTube API to collect authentic, real-time SEO data. 
                      Our system prioritizes accuracy over speed, ensuring you get professional-grade metrics used by digital marketing agencies.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="eeeat-scoring" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How is the E-E-A-T (Experience, Expertise, Authority, Trust) score calculated?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      Our proprietary algorithm analyzes multiple trust signals on a 10-point scale: Author credibility (3 points), 
                      Technical authority (3 points), Experience signals (3 points), and Content depth (1 point). This aligns with 
                      Google's quality guidelines for AI Overview inclusion.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="competitor-analysis" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How many competitors can I analyze at once?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      You can analyze up to 12 domains simultaneously (your website plus 11 competitors). This provides comprehensive 
                      competitive intelligence while maintaining data quality and processing speed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="social-media" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      Does the tool analyze social media presence?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      Yes, we automatically detect and analyze social media presence across Facebook, Instagram, Twitter, LinkedIn, 
                      TikTok, and YouTube. We provide follower counts, engagement rates, and posting frequency where available through official APIs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pdf-reports" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      What's included in the PDF export?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      Professional reports include: Executive Summary, Competitive Analysis Matrix, Performance Rankings with visual charts, 
                      Strategic Recommendations, ROI Projections, and Technology Stack Detection. Perfect for client presentations and internal strategy meetings.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-accuracy" className="border border-white/20 rounded-xl px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How accurate is the traffic and keyword data?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      We use the same professional data sources as major SEO agencies, including DataForSEO's comprehensive database. 
                      Traffic estimates are based on keyword rankings and search volumes, providing industry-standard accuracy for competitive analysis.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metrics Overview */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-4)' }}>
              <CardHeader className="pb-4 rounded-t-3xl px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Metrics Explained
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Search className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">SEO Metrics</div>
                      <div className="text-gray-600 dark:text-gray-300">Indexed pages, backlinks, referring domains</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Traffic Analytics</div>
                      <div className="text-gray-600 dark:text-gray-300">Organic traffic, traffic value, keywords</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gauge className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Performance</div>
                      <div className="text-gray-600 dark:text-gray-300">Page speed, AI trust score, mobile ready</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Social & Trust</div>
                      <div className="text-gray-600 dark:text-gray-300">Google Reviews, YouTube, social presence</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-1)' }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Need Additional Support?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Get expert help from our digital marketing professionals
                  </p>
                  <Link href="/contact">
                    <Button className="w-full liquid-button">
                      Contact McDougall Interactive
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Professional Services */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-2)' }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 rounded-2xl glass-card mx-auto w-fit mb-3" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Professional SEO Services</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Ready to implement the insights? Our team provides full-service SEO and digital marketing.
                  </p>
                  <a href="https://www.mcdougallinteractive.com/services/seo/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full liquid-button-secondary">
                      Learn About Our SEO Services
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
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
              <Link href="/contact">
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">Contact</span>
              </Link>
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