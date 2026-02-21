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
import { TrendingUp, TrendingDown, Minus, DollarSign, Target, Users, ArrowUp, ArrowDown } from "lucide-react";
import { SparklineChart } from "./sparkline-chart";
import { OrganicKeywordsTrendChart } from "./organic-keywords-trend-chart";
import type { Domain } from "@shared/schema";

interface DomainDetailModalProps {
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

export function DomainDetailModal({ domain, open, onOpenChange }: DomainDetailModalProps) {
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
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const TrendText = ({ change }: { change: number }) => {
    const textColor = change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground";
    return (
      <span className={`text-sm font-medium ${textColor}`}>
        {change > 0 ? "+" : ""}{change.toFixed(1)}%
      </span>
    );
  };

  const MetricCard = ({
    title,
    icon: Icon,
    value,
    change,
    sparkline,
    format = "number",
  }: {
    title: string;
    icon: any;
    value: number;
    change: number;
    sparkline: number[];
    format?: "number" | "currency";
  }) => {
    return (
      <Card data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
            <TrendIcon change={change} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold" data-testid={`value-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              {format === "currency" ? formatCurrency(value) : formatNumber(value)}
            </span>
            <TrendText change={change} />
          </div>
          <div className="flex justify-end">
            <SparklineChart 
              data={sparkline} 
              color={change > 0 ? "#22c55e" : change < 0 ? "#ef4444" : "hsl(var(--muted-foreground))"}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const ChangeTypeBadge = ({ type }: { type: string }) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: 'New', className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
      lost: { label: 'Lost', className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' },
      improved: { label: 'Improved', className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
      declined: { label: 'Declined', className: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
    };
    const variant = variants[type] || variants.new;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (!domain) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] w-[1400px] h-[90vh] p-0"
        data-testid="domain-detail-modal"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl" data-testid="modal-domain-name">
            {domain.companyName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground" data-testid="modal-domain-url">
            {domain.webAddress}
          </p>
        </DialogHeader>

        <ScrollArea className="h-full px-6 pb-6">
          {isLoading ? (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-[400px]" />
            </div>
          ) : trendData ? (
            <div className="space-y-6 pt-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  title="Keywords"
                  icon={Target}
                  value={trendData.metricCards.keywords.value}
                  change={trendData.metricCards.keywords.change}
                  sparkline={trendData.metricCards.keywords.sparkline}
                />
                <MetricCard
                  title="Traffic"
                  icon={Users}
                  value={trendData.metricCards.traffic.value}
                  change={trendData.metricCards.traffic.change}
                  sparkline={trendData.metricCards.traffic.sparkline}
                />
                <MetricCard
                  title="Traffic Cost"
                  icon={DollarSign}
                  value={trendData.metricCards.trafficCost.value}
                  change={trendData.metricCards.trafficCost.change}
                  sparkline={trendData.metricCards.trafficCost.sparkline}
                  format="currency"
                />
                <MetricCard
                  title="Branded Traffic"
                  icon={Users}
                  value={trendData.metricCards.brandedTraffic.value}
                  change={trendData.metricCards.brandedTraffic.change}
                  sparkline={trendData.metricCards.brandedTraffic.sparkline}
                />
                <MetricCard
                  title="Non-Branded Traffic"
                  icon={Users}
                  value={trendData.metricCards.nonBrandedTraffic.value}
                  change={trendData.metricCards.nonBrandedTraffic.change}
                  sparkline={trendData.metricCards.nonBrandedTraffic.sparkline}
                />
              </div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="keywords" data-testid="tab-keywords">Top Keywords</TabsTrigger>
                  <TabsTrigger value="intent" data-testid="tab-intent">Intent</TabsTrigger>
                  <TabsTrigger value="pages" data-testid="tab-pages">Top Pages</TabsTrigger>
                  <TabsTrigger value="competitors" data-testid="tab-competitors">Competitors</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organic Keywords Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrganicKeywordsTrendChart data={trendData.keywordTrend} />
                    </CardContent>
                  </Card>

                  {/* Position Changes Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Position Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{trendData.positionChanges.new}</div>
                          <div className="text-sm text-muted-foreground">New</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{trendData.positionChanges.improved}</div>
                          <div className="text-sm text-muted-foreground">Improved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">{trendData.positionChanges.declined}</div>
                          <div className="text-sm text-muted-foreground">Declined</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">{trendData.positionChanges.lost}</div>
                          <div className="text-sm text-muted-foreground">Lost</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Top Keywords Tab */}
                <TabsContent value="keywords">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="text-center">Position</TableHead>
                            <TableHead className="text-right">Volume</TableHead>
                            <TableHead className="text-right">Traffic %</TableHead>
                            <TableHead>SERP Features</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trendData.topKeywords.map((kw, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{kw.keyword}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{kw.position}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(kw.volume)}</TableCell>
                              <TableCell className="text-right font-mono">{kw.trafficPercent}%</TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {kw.serpFeatures.map((feature, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {feature}
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

                {/* Keywords by Intent Tab */}
                <TabsContent value="intent">
                  <Card>
                    <CardHeader>
                      <CardTitle>Keywords by Intent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Intent</TableHead>
                            <TableHead className="text-right">Keywords</TableHead>
                            <TableHead className="text-right">Traffic</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trendData.keywordsByIntent.map((intent, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{intent.intent}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(intent.keywords)}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(intent.traffic)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Top Pages Tab */}
                <TabsContent value="pages">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead className="text-right">Traffic %</TableHead>
                            <TableHead className="text-right">Keywords</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trendData.topPages.map((page, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium max-w-md truncate">{page.url}</TableCell>
                              <TableCell className="text-right font-mono">{page.trafficPercent}%</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(page.keywords)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Competitors Tab */}
                <TabsContent value="competitors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Main Organic Competitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Domain</TableHead>
                            <TableHead className="text-right">Common Keywords</TableHead>
                            <TableHead className="text-right">Competition Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trendData.competitors.map((comp, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{comp.domain}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(comp.commonKeywords)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 bg-secondary rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${comp.competitionLevel}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-mono">{comp.competitionLevel}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
