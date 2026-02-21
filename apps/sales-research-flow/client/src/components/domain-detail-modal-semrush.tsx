import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Info, Download, Calendar } from "lucide-react";
import { SparklineChart } from "./sparkline-chart";
import { OrganicKeywordsTrendChart } from "./organic-keywords-trend-chart";
import type { Domain } from "@shared/schema";

interface DomainDetailModalSemrushProps {
  domain: Domain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TrendData {
  metricCards: {
    keywords: { value: number; change: number; sparkline: number[] };
    traffic: { value: number; change: number; sparkline: number[] };
    trafficCost: { value: number; change: number; sparkline: number[] };
    brandedTraffic: { value: number; change: number; sparkline: number[] };
    nonBrandedTraffic: { value: number; change: number; sparkline: number[] };
  };
  keywordTrend: Array<{
    month: string;
    top3: number;
    range4_10: number;
    range11_20: number;
    range21_50: number;
    range51_100: number;
    total: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    trafficPercent: number;
    serpFeatures: string[];
  }>;
  keywordsByIntent: Array<{
    intent: string;
    keywords: number;
    traffic: number;
  }>;
  positionChanges: {
    new: number;
    lost: number;
    improved: number;
    declined: number;
    keywords: Array<{
      keyword: string;
      previous: number | null;
      current: number;
      volume: number;
      trafficPercent: number;
      type: string;
    }>;
  };
  topPages: Array<{
    url: string;
    trafficPercent: number;
    keywords: number;
  }>;
  competitors: Array<{
    domain: string;
    commonKeywords: number;
    competitionLevel: number;
  }>;
}

export function DomainDetailModalSemrush({ domain, open, onOpenChange }: DomainDetailModalSemrushProps) {
  const { data: trendData, isLoading } = useQuery<TrendData>({
    queryKey: ["/api/domains", domain?.id, "trends"],
    enabled: open && !!domain,
  });

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "—";
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | null) => {
    if (num === null || num === undefined) return "—";
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatPercentage = (num: number) => {
    if (num === 0) return "0%";
    const formatted = num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
    return formatted;
  };

  if (!domain) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] w-[1400px] h-[90vh] p-0 bg-[#fafbfc]"
        data-testid="domain-detail-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900" data-testid="modal-domain-name">
                Organic Research: {domain.webAddress}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export to PDF
              </Button>
            </div>
          </div>
          
          {/* Country/Database selector */}
          <div className="flex items-center gap-4 mt-3">
            <Select defaultValue="us">
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">🇺🇸 US</SelectItem>
                <SelectItem value="uk">🇬🇧 UK</SelectItem>
                <SelectItem value="ca">🇨🇦 CA</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Device: Desktop | Date: Oct 16, 2025 | Currency: USD
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 bg-white border-b">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-10 p-0 bg-transparent border-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
                data-testid="tab-overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="positions" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
                data-testid="tab-positions"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger 
                value="changes" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
                data-testid="tab-changes"
              >
                Position Changes
              </TabsTrigger>
              <TabsTrigger 
                value="competitors" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
                data-testid="tab-competitors"
              >
                Competitors
              </TabsTrigger>
              <TabsTrigger 
                value="pages" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
                data-testid="tab-pages"
              >
                Pages
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-full bg-[#fafbfc]">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-[400px]" />
            </div>
          ) : trendData ? (
            <div className="p-6 space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-5 gap-4">
                {/* Keywords Card */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Keywords</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(trendData.metricCards.keywords.value)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${trendData.metricCards.keywords.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trendData.metricCards.keywords.change)}
                    </span>
                  </div>
                  <div className="mt-2 h-8">
                    <SparklineChart 
                      data={trendData.metricCards.keywords.sparkline} 
                      color="#3b82f6"
                    />
                  </div>
                </div>

                {/* Traffic Card */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Traffic</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(trendData.metricCards.traffic.value)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${trendData.metricCards.traffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trendData.metricCards.traffic.change)}
                    </span>
                  </div>
                  <div className="mt-2 h-8">
                    <SparklineChart 
                      data={trendData.metricCards.traffic.sparkline} 
                      color="#3b82f6"
                    />
                  </div>
                </div>

                {/* Traffic Cost Card */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Traffic Cost</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(trendData.metricCards.trafficCost.value)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${trendData.metricCards.trafficCost.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trendData.metricCards.trafficCost.change)}
                    </span>
                  </div>
                  <div className="mt-2 h-8">
                    <SparklineChart 
                      data={trendData.metricCards.trafficCost.sparkline} 
                      color="#3b82f6"
                    />
                  </div>
                </div>

                {/* Branded Traffic Card */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Branded Traffic</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(trendData.metricCards.brandedTraffic.value)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${trendData.metricCards.brandedTraffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trendData.metricCards.brandedTraffic.change)}
                    </span>
                  </div>
                  <div className="mt-2 h-8">
                    <SparklineChart 
                      data={trendData.metricCards.brandedTraffic.sparkline} 
                      color="#3b82f6"
                    />
                  </div>
                </div>

                {/* Non-Branded Traffic Card */}
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Non-Branded Traffic</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(trendData.metricCards.nonBrandedTraffic.value)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${trendData.metricCards.nonBrandedTraffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trendData.metricCards.nonBrandedTraffic.change)}
                    </span>
                  </div>
                  <div className="mt-2 h-8">
                    <SparklineChart 
                      data={trendData.metricCards.nonBrandedTraffic.sparkline} 
                      color="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              {/* Organic Keywords Trend Chart */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Organic Keywords Trend</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">1M</Button>
                    <Button variant="outline" size="sm">6M</Button>
                    <Button variant="outline" size="sm">1Y</Button>
                    <Button variant="outline" size="sm">2Y</Button>
                    <Button variant="outline" size="sm">All time</Button>
                  </div>
                </div>
                <div className="h-[300px]">
                  <OrganicKeywordsTrendChart data={trendData.keywordTrend} />
                </div>
              </div>

              {/* Two column section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Keywords */}
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Top Keywords</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Keyword</th>
                          <th className="text-center py-2 px-4 text-sm font-medium text-gray-700">Position</th>
                          <th className="text-center py-2 px-4 text-sm font-medium text-gray-700">Volume</th>
                          <th className="text-center py-2 px-4 text-sm font-medium text-gray-700">Traffic %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendData.topKeywords.slice(0, 5).map((kw, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">
                              <span className="text-sm text-blue-600">{kw.keyword}</span>
                            </td>
                            <td className="text-center py-2 px-4">
                              <span className="text-sm">{kw.position}</span>
                            </td>
                            <td className="text-center py-2 px-4">
                              <span className="text-sm">{formatNumber(kw.volume)}</span>
                            </td>
                            <td className="text-center py-2 px-4">
                              <span className="text-sm">{kw.trafficPercent.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Keywords by Intent */}
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Keywords by Intent</h3>
                  </div>
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left py-2 text-sm font-medium text-gray-700">Intent</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Keywords</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Traffic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendData.keywordsByIntent.map((intent, index) => (
                          <tr key={index}>
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className={`w-3 h-3 rounded-full ${
                                    intent.intent === 'Informational' ? 'bg-blue-500' :
                                    intent.intent === 'Navigational' ? 'bg-purple-500' :
                                    intent.intent === 'Commercial' ? 'bg-orange-500' :
                                    'bg-yellow-500'
                                  }`}
                                />
                                <span className="text-sm">{intent.intent}</span>
                              </div>
                            </td>
                            <td className="text-right py-2">
                              <span className="text-sm font-medium">{formatNumber(intent.keywords)}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({((intent.keywords / trendData.metricCards.keywords.value) * 100).toFixed(1)}%)
                              </span>
                            </td>
                            <td className="text-right py-2 text-sm">{formatNumber(intent.traffic)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Intent bar chart */}
                    <div className="mt-4 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                      {trendData.keywordsByIntent.map((intent, index) => {
                        const percentage = (intent.keywords / trendData.metricCards.keywords.value) * 100;
                        return (
                          <div
                            key={index}
                            className={`h-full ${
                              intent.intent === 'Informational' ? 'bg-blue-500' :
                              intent.intent === 'Navigational' ? 'bg-purple-500' :
                              intent.intent === 'Commercial' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}