import { useState, useEffect } from "react";
import { X, ExternalLink, Download, Calendar, Globe, Monitor, ChevronDown, Filter, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Domain } from "@shared/schema";
import { format } from "date-fns";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DomainDetailComprehensiveProps {
  domain: Domain;
  onClose: () => void;
}

// Comprehensive data structure matching SEMrush API response
interface ComprehensiveData {
  organicTraffic: number | null;
  organicKeywords: number | null;
  trafficCost: number | null;
  domainRank: number | null;
  brandedTraffic: number | null;
  nonBrandedTraffic: number | null;
  
  keywordPositions: Array<{
    keyword: string;
    position: number;
    previousPosition: number | null;
    volume: number;
    cpc: number;
    url: string;
    trafficPercent: number;
    serpFeatures: string[];
    difficulty: number;
    intent: string;
    lastUpdate: string;
  }>;
  
  positionChanges: {
    new: Array<any>;
    lost: Array<any>;
    improved: Array<any>;
    declined: Array<any>;
  };
  
  competitors: Array<{
    domain: string;
    commonKeywords: number;
    competitionLevel: number;
    organicTraffic: number;
    organicKeywords: number;
    missingKeywords: number;
  }>;
  
  topPages: Array<{
    url: string;
    traffic: number;
    trafficPercent: number;
    keywords: number;
    topKeyword: string;
    topKeywordPosition: number;
  }>;
  
  subdomains: Array<{
    subdomain: string;
    traffic: number;
    trafficPercent: number;
    keywords: number;
  }>;
  
  serpFeatures: {
    featuredSnippets: number;
    localPack: number;
    knowledgePanel: number;
    peopleAlsoAsk: number;
    reviews: number;
    siteLinks: number;
    videoCarousel: number;
    imageCarousel: number;
  };
  
  historicalData: Array<{
    date: string;
    traffic: number;
    keywords: number;
    trafficCost: number;
    positionGroups: {
      top3: number;
      top10: number;
      top20: number;
      top50: number;
      top100: number;
    };
  }>;
  
  keywordsByIntent: {
    informational: { count: number; traffic: number };
    navigational: { count: number; traffic: number };
    commercial: { count: number; traffic: number };
    transactional: { count: number; traffic: number };
  };
  
  topics: Array<{
    topic: string;
    keywords: number;
    traffic: number;
    trafficPercent: number;
    topKeywords: string[];
  }>;
}

export function DomainDetailComprehensive({ domain, onClose }: DomainDetailComprehensiveProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Initializing...");
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "MMM dd, yyyy"));
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [timeRange, setTimeRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string[]>(["top3", "4-10", "11-20", "21-50", "51-100"]);
  const [visibleSeries, setVisibleSeries] = useState({
    top3: true,
    top10: true,
    top20: true,
    top50: true,
    top100: true,
    serpFeatures: true,
  });
  const [serpFilter, setSerpFilter] = useState<string[]>([]);
  
  // Fetch comprehensive data with progress tracking
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Connect to SSE endpoint for progress updates
        eventSource = new EventSource(`/api/domains/${domain.id}/comprehensive`);
        
        eventSource.onmessage = (event) => {
          const message = JSON.parse(event.data);
          
          if (message.progress !== undefined) {
            setProgress(message.progress);
            setProgressMessage(message.message);
          }
          
          if (message.complete) {
            setData(message.data);
            setLoading(false);
            eventSource?.close();
          }
          
          if (message.error) {
            setError(message.error);
            setLoading(false);
            eventSource?.close();
          }
        };
        
        eventSource.onerror = () => {
          setError("Failed to connect to data stream");
          setLoading(false);
          eventSource?.close();
        };
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function to close EventSource on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [domain.id]);
  
  // Format number with commas
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat().format(num);
  };
  
  // Format traffic value
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get position badge color
  const getPositionColor = (position: number) => {
    if (position <= 3) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    if (position <= 10) return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    if (position <= 20) return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
    if (position <= 50) return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };
  
  // Get intent badge color
  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "transactional": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "commercial": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "navigational": return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };
  
  // Filter data based on time range
  const handleLegendClick = (dataKey: string) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev],
    }));
  };

  const renderCustomLegend = (props: any) => {
    const legendItems = [
      { key: "top3", label: "Top 3", color: "#FBBF24" },
      { key: "top10", label: "4-10", color: "#3B82F6" },
      { key: "top20", label: "11-20", color: "#06B6D4" },
      { key: "top50", label: "21-50", color: "#A855F7" },
      { key: "top100", label: "51-100", color: "#94A3B8" },
      { key: "serpFeatures", label: "SERP Features", color: "#10B981" },
    ];

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {legendItems.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          >
            <input
              type="checkbox"
              checked={visibleSeries[item.key as keyof typeof visibleSeries]}
              onChange={() => handleLegendClick(item.key)}
              className="cursor-pointer"
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const getFilteredHistoricalData = () => {
    if (!data?.historicalData) return [];
    
    const now = new Date();
    let monthsBack = 24; // Default to all
    
    switch (timeRange) {
      case "1M": monthsBack = 1; break;
      case "6M": monthsBack = 6; break;
      case "1Y": monthsBack = 12; break;
      case "2Y": monthsBack = 24; break;
    }
    
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    return data.historicalData.filter(d => new Date(d.date) >= cutoffDate);
  };
  
  // Filter keywords based on search
  const getFilteredKeywords = () => {
    if (!data?.keywordPositions) return [];
    
    return data.keywordPositions.filter(kw => 
      kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kw.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-4 bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header with controls */}
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Organic Research: {domain.webAddress}
                <ExternalLink className="inline ml-2 h-4 w-4" />
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export to PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-modal">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Country, Device, Date, Currency selectors */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-32" data-testid="select-country">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🇺🇸</span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">US</SelectItem>
                <SelectItem value="uk">UK</SelectItem>
                <SelectItem value="ca">CA</SelectItem>
                <SelectItem value="au">AU</SelectItem>
                <SelectItem value="in">IN</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-32" data-testid="select-device">
                <div className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1 px-3 py-1.5 border rounded-md">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{selectedDate}</span>
            </div>
            
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-24" data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Loading state with progress */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
            <div className="w-96 space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                {progressMessage}
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-center text-xs text-muted-foreground">
                {progress}% complete
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Fetching comprehensive SEMrush data...
            </p>
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Main content with tabs */}
        {data && !loading && (
          <Tabs defaultValue="overview" className="h-[calc(100vh-140px)]">
            <TabsList className="px-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="positions" data-testid="tab-positions">Positions</TabsTrigger>
              <TabsTrigger value="position-changes" data-testid="tab-position-changes">Position Changes</TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-competitors">Competitors</TabsTrigger>
              <TabsTrigger value="topics" data-testid="tab-topics">Topics</TabsTrigger>
              <TabsTrigger value="pages" data-testid="tab-pages">Pages</TabsTrigger>
              <TabsTrigger value="subdomains" data-testid="tab-subdomains">Subdomains</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <div className="space-y-6 pb-4">
                {/* Metric Cards */}
                <div className="grid grid-cols-5 gap-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.organicKeywords)}</div>
                      <div className="text-xs text-muted-foreground">
                        {domain.trafficTrend3mo && domain.trafficTrend3mo > 0 ? "+" : ""}
                        {domain.trafficTrend3mo?.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.organicTraffic)}</div>
                      <div className="text-xs text-muted-foreground">
                        {domain.trafficTrend3mo && domain.trafficTrend3mo > 0 ? "+" : ""}
                        {domain.trafficTrend3mo?.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Traffic Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(data.trafficCost)}</div>
                      <div className="text-xs text-muted-foreground">
                        {domain.trafficTrend3mo && domain.trafficTrend3mo > 0 ? "+" : ""}
                        {domain.trafficTrend3mo?.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Branded Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.brandedTraffic)}</div>
                      <div className="text-xs text-muted-foreground">0%</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Non-Branded Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.nonBrandedTraffic)}</div>
                      <div className="text-xs text-muted-foreground">
                        {domain.trafficTrend3mo && domain.trafficTrend3mo > 0 ? "+" : ""}
                        {domain.trafficTrend3mo?.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Organic Keywords Trend Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Organic Keywords Trend</CardTitle>
                      <div className="flex items-center gap-2">
                        {/* Position filters */}
                        <div className="flex gap-2">
                          <div className="cursor-pointer">
                            <Badge 
                              variant="secondary" 
                              className="bg-amber-400 hover:bg-amber-500 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
                              data-testid="filter-top3"
                            >
                              Top 3
                            </Badge>
                          </div>
                          <div className="cursor-pointer">
                            <Badge 
                              variant="secondary" 
                              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                              data-testid="filter-4-10"
                            >
                              4-10
                            </Badge>
                          </div>
                          <div className="cursor-pointer">
                            <Badge 
                              variant="secondary" 
                              className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                              data-testid="filter-11-20"
                            >
                              11-20
                            </Badge>
                          </div>
                          <div className="cursor-pointer">
                            <Badge 
                              variant="secondary" 
                              className="bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
                              data-testid="filter-21-50"
                            >
                              21-50
                            </Badge>
                          </div>
                          <div className="cursor-pointer">
                            <Badge 
                              variant="secondary" 
                              className="bg-slate-400 hover:bg-slate-500 text-white dark:bg-slate-500 dark:hover:bg-slate-600"
                              data-testid="filter-51-100"
                            >
                              51-100
                            </Badge>
                          </div>
                        </div>
                        
                        {/* SERP Features dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              SERP Features
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Featured Snippets</DropdownMenuItem>
                            <DropdownMenuItem>People Also Ask</DropdownMenuItem>
                            <DropdownMenuItem>Knowledge Panel</DropdownMenuItem>
                            <DropdownMenuItem>Local Pack</DropdownMenuItem>
                            <DropdownMenuItem>Site Links</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Time range selector */}
                        <div className="flex gap-1 border rounded-md p-1">
                          {["1M", "6M", "1Y", "2Y", "All time"].map((range) => (
                            <Button
                              key={range}
                              variant={timeRange === range.toLowerCase().replace(" ", "") ? "secondary" : "ghost"}
                              size="sm"
                              className="px-2 h-7"
                              onClick={() => setTimeRange(range.toLowerCase().replace(" ", ""))}
                              data-testid={`timerange-${range.toLowerCase().replace(" ", "-")}`}
                            >
                              {range}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={getFilteredHistoricalData()}
                        barCategoryGap="10%"
                        barGap={2}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM yy")} />
                        <YAxis />
                        <Tooltip />
                        <Legend content={renderCustomLegend} />
                        {visibleSeries.top3 && <Bar dataKey="positionGroups.top3" fill="#FBBF24" name="Top 3" />}
                        {visibleSeries.top10 && <Bar dataKey="positionGroups.top10" fill="#3B82F6" name="4-10" />}
                        {visibleSeries.top20 && <Bar dataKey="positionGroups.top20" fill="#06B6D4" name="11-20" />}
                        {visibleSeries.top50 && <Bar dataKey="positionGroups.top50" fill="#A855F7" name="21-50" />}
                        {visibleSeries.top100 && <Bar dataKey="positionGroups.top100" fill="#94A3B8" name="51-100" />}
                        {visibleSeries.serpFeatures && <Bar dataKey="serpFeaturesCount" fill="#10B981" name="SERP Features" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Top Position Changes */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">New Keywords</CardTitle>
                      <CardDescription>{data.positionChanges.new.length} keywords</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.positionChanges.new.slice(0, 5).map((kw, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm truncate">{kw.keyword}</span>
                            <Badge className={getPositionColor(kw.position)}>
                              #{kw.position}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lost Keywords</CardTitle>
                      <CardDescription>{data.positionChanges.lost.length} keywords</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.positionChanges.lost.slice(0, 5).map((kw, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm truncate">{kw.keyword}</span>
                            <Badge variant="destructive">Lost</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* SERP Features Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>SERP Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(data.serpFeatures).map(([feature, count]) => (
                        <div key={feature} className="text-center">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Positions Tab */}
            <TabsContent value="positions" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <div className="space-y-4 pt-4 pb-4">
                {/* Search and filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                      data-testid="input-search-keywords"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                  </Button>
                </div>
                
                {/* Keywords Table */}
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Keyword</TableHead>
                        <TableHead className="text-center">Position</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">Traffic %</TableHead>
                        <TableHead className="text-right">CPC</TableHead>
                        <TableHead className="text-center">Difficulty</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>SERP Features</TableHead>
                        <TableHead className="w-[200px]">URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredKeywords().map((kw, i) => (
                        <TableRow key={i} data-testid={`keyword-row-${i}`}>
                          <TableCell className="font-medium">{kw.keyword}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={getPositionColor(kw.position)}>
                              {kw.position}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(kw.volume)}</TableCell>
                          <TableCell className="text-right">{kw.trafficPercent.toFixed(2)}%</TableCell>
                          <TableCell className="text-right">${kw.cpc.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{kw.difficulty}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getIntentColor(kw.intent)}>
                              {kw.intent}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {kw.serpFeatures.slice(0, 2).map(feature => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature.slice(0, 2)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {kw.url}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>
            
            {/* Position Changes Tab */}
            <TabsContent value="position-changes" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <div className="grid grid-cols-2 gap-4 pt-4 pb-4">
                {/* New Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>New Keywords ({data.positionChanges.new.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.positionChanges.new.map((kw, i) => (
                          <TableRow key={i}>
                            <TableCell>{kw.keyword}</TableCell>
                            <TableCell>
                              <Badge className={getPositionColor(kw.position)}>
                                {kw.position}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatNumber(kw.volume)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Lost Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lost Keywords ({data.positionChanges.lost.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Previous Position</TableHead>
                          <TableHead>Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.positionChanges.lost.map((kw, i) => (
                          <TableRow key={i}>
                            <TableCell>{kw.keyword}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">
                                Was #{kw.previousPosition}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatNumber(kw.volume)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Improved Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Improved Keywords ({data.positionChanges.improved.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.positionChanges.improved.map((kw, i) => (
                          <TableRow key={i}>
                            <TableCell>{kw.keyword}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline">{kw.previousPosition}</Badge>
                                <span>→</span>
                                <Badge className={getPositionColor(kw.currentPosition)}>
                                  {kw.currentPosition}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{formatNumber(kw.volume)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Declined Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Declined Keywords ({data.positionChanges.declined.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.positionChanges.declined.map((kw, i) => (
                          <TableRow key={i}>
                            <TableCell>{kw.keyword}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge className={getPositionColor(kw.previousPosition)}>
                                  {kw.previousPosition}
                                </Badge>
                                <span>→</span>
                                <Badge variant="destructive">
                                  {kw.currentPosition}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{formatNumber(kw.volume)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Competitors Tab */}
            <TabsContent value="competitors" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Main Organic Competitors</CardTitle>
                  <CardDescription>Domains competing for the same keywords</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead className="text-right">Common Keywords</TableHead>
                        <TableHead className="text-right">Missing Keywords</TableHead>
                        <TableHead className="text-right">Organic Traffic</TableHead>
                        <TableHead className="text-right">Organic Keywords</TableHead>
                        <TableHead className="text-center">Competition Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.competitors.map((comp, i) => (
                        <TableRow key={i} data-testid={`competitor-row-${i}`}>
                          <TableCell className="font-medium">
                            <a href={`https://${comp.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {comp.domain}
                            </a>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(comp.commonKeywords)}</TableCell>
                          <TableCell className="text-right">{formatNumber(comp.missingKeywords)}</TableCell>
                          <TableCell className="text-right">{formatNumber(comp.organicTraffic)}</TableCell>
                          <TableCell className="text-right">{formatNumber(comp.organicKeywords)}</TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${comp.competitionLevel}%` }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Topics Tab */}
            <TabsContent value="topics" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Content Topics</CardTitle>
                  <CardDescription>Main topics and themes driving organic traffic</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-right">Keywords</TableHead>
                        <TableHead className="text-right">Traffic</TableHead>
                        <TableHead className="text-right">Traffic %</TableHead>
                        <TableHead>Top Keywords</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topics.map((topic, i) => (
                        <TableRow key={i} data-testid={`topic-row-${i}`}>
                          <TableCell className="font-medium">{topic.topic}</TableCell>
                          <TableCell className="text-right">{formatNumber(topic.keywords)}</TableCell>
                          <TableCell className="text-right">{formatNumber(topic.traffic)}</TableCell>
                          <TableCell className="text-right">{topic.trafficPercent.toFixed(1)}%</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {topic.topKeywords.slice(0, 3).map((kw, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pages Tab */}
            <TabsContent value="pages" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Pages driving the most organic traffic</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Traffic</TableHead>
                        <TableHead className="text-right">Traffic %</TableHead>
                        <TableHead className="text-right">Keywords</TableHead>
                        <TableHead>Top Keyword</TableHead>
                        <TableHead className="text-center">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topPages.map((page, i) => (
                        <TableRow key={i} data-testid={`page-row-${i}`}>
                          <TableCell className="font-medium text-xs max-w-[300px] truncate">
                            <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {page.url}
                            </a>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(page.traffic)}</TableCell>
                          <TableCell className="text-right">{page.trafficPercent.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{formatNumber(page.keywords)}</TableCell>
                          <TableCell className="text-sm">{page.topKeyword}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={getPositionColor(page.topKeywordPosition)}>
                              {page.topKeywordPosition}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subdomains Tab */}
            <TabsContent value="subdomains" className="h-[calc(100%-48px)] overflow-y-auto px-4">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Subdomains</CardTitle>
                  <CardDescription>Traffic distribution across subdomains</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subdomain</TableHead>
                        <TableHead className="text-right">Traffic</TableHead>
                        <TableHead className="text-right">Traffic %</TableHead>
                        <TableHead className="text-right">Keywords</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.subdomains.map((sub, i) => (
                        <TableRow key={i} data-testid={`subdomain-row-${i}`}>
                          <TableCell className="font-medium">
                            <a href={`https://${sub.subdomain}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {sub.subdomain}
                            </a>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(sub.traffic)}</TableCell>
                          <TableCell className="text-right">{sub.trafficPercent.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{formatNumber(sub.keywords)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}