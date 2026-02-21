import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, MapPin, Calendar, CheckCircle2, XCircle, AlertCircle, Eye, TrendingUp, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { NAPCheck } from "@shared/schema";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";

export default function History() {
  const [firmFilter, setFirmFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedChecks, setSelectedChecks] = useState<number[]>([]);

  const { data: checks, isLoading, error } = useQuery<NAPCheck[]>({
    queryKey: ["/api/checks"],
  });

  const filteredChecks = useMemo(() => {
    if (!checks) return [];
    
    return checks.filter(check => {
      const matchesFirm = !firmFilter || 
        check.firmName.toLowerCase().includes(firmFilter.toLowerCase());
      
      const checkDate = new Date(check.checkedAt);
      const matchesDateRange = 
        (!startDate || checkDate >= startOfDay(parseISO(startDate))) &&
        (!endDate || checkDate <= endOfDay(parseISO(endDate)));
      
      return matchesFirm && matchesDateRange;
    });
  }, [checks, firmFilter, startDate, endDate]);

  const chartData = useMemo(() => {
    if (!filteredChecks || filteredChecks.length === 0) return [];
    
    const dataByDate = filteredChecks.reduce((acc, check) => {
      const dateKey = format(new Date(check.checkedAt), "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, checks: [], timestamp: new Date(check.checkedAt).getTime() };
      }
      acc[dateKey].checks.push(check);
      return acc;
    }, {} as Record<string, { date: string; checks: NAPCheck[]; timestamp: number }>);
    
    return Object.values(dataByDate)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => {
        const avgConsistency = item.checks.reduce((sum, check) => {
          return sum + (check.totalDirectories > 0 ? (check.consistentCount / check.totalDirectories) * 100 : 0);
        }, 0) / item.checks.length;
        
        return {
          date: item.date,
          consistency: Math.round(avgConsistency),
          checks: item.checks.length,
        };
      });
  }, [filteredChecks]);

  const handleCheckSelection = (checkId: number) => {
    if (selectedChecks.includes(checkId)) {
      setSelectedChecks(selectedChecks.filter(id => id !== checkId));
    } else if (selectedChecks.length < 2) {
      setSelectedChecks([...selectedChecks, checkId]);
    }
  };

  const comparedChecks = useMemo(() => {
    if (selectedChecks.length !== 2 || !filteredChecks) return null;
    const check1 = filteredChecks.find(c => c.id === selectedChecks[0]);
    const check2 = filteredChecks.find(c => c.id === selectedChecks[1]);
    if (!check1 || !check2) return null;
    
    // Sort by date so older is first
    return new Date(check1.checkedAt) < new Date(check2.checkedAt) 
      ? [check1, check2] 
      : [check2, check1];
  }, [selectedChecks, filteredChecks]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-history-title">
                Check History
              </h1>
              <p className="text-muted-foreground">
                Track your NAP consistency over time
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedChecks([]);
                }}
                data-testid="button-toggle-compare"
              >
                Compare ({selectedChecks.length}/2)
              </Button>
              <Button asChild data-testid="button-new-check">
                <Link href="/">New Check</Link>
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card className="mb-6" data-testid="card-filters">
              <CardHeader>
                <CardTitle className="text-lg">Filter Checks</CardTitle>
                <CardDescription>
                  Narrow down your results by firm name or date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firm-filter">Firm Name</Label>
                    <Input
                      id="firm-filter"
                      placeholder="Search by firm name..."
                      value={firmFilter}
                      onChange={(e) => setFirmFilter(e.target.value)}
                      data-testid="input-firm-filter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                {(firmFilter || startDate || endDate) && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFirmFilter("");
                        setStartDate("");
                        setEndDate("");
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredChecks && filteredChecks.length > 1 && chartData.length > 0 && (
            <Card className="mb-6" data-testid="card-trend-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Consistency Trends
                </CardTitle>
                <CardDescription>
                  Track how your NAP consistency changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      className="text-xs fill-muted-foreground"
                      label={{ value: 'Consistency %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="consistency" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Consistency %"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Failed to Load History
                </CardTitle>
                <CardDescription>
                  {error instanceof Error ? error.message : "An error occurred"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {!isLoading && !error && checks && checks.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Checks Yet</CardTitle>
                <CardDescription>
                  You haven't performed any NAP consistency checks yet. Start by creating a new check.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/">Run Your First Check</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredChecks && filteredChecks.length === 0 && checks && checks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Matching Checks</CardTitle>
                <CardDescription>
                  No checks match your current filters. Try adjusting your search criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFirmFilter("");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredChecks && filteredChecks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredChecks.length} {filteredChecks.length === 1 ? 'check' : 'checks'}
                </p>
              </div>
              {filteredChecks.map((check) => {
                const consistencyPercentage = check.totalDirectories > 0
                  ? Math.round((check.consistentCount / check.totalDirectories) * 100)
                  : 0;

                const statusColor = 
                  consistencyPercentage === 100 ? "text-green-600" :
                  consistencyPercentage >= 75 ? "text-yellow-600" :
                  "text-red-600";

                const statusIcon =
                  consistencyPercentage === 100 ? <CheckCircle2 className="w-5 h-5" /> :
                  consistencyPercentage >= 75 ? <AlertCircle className="w-5 h-5" /> :
                  <XCircle className="w-5 h-5" />;

                return (
                  <Card 
                    key={check.id} 
                    className="hover-elevate"
                    data-testid={`card-check-${check.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        {compareMode && (
                          <div className="pt-1">
                            <Checkbox
                              checked={selectedChecks.includes(check.id)}
                              onCheckedChange={() => handleCheckSelection(check.id)}
                              disabled={selectedChecks.length >= 2 && !selectedChecks.includes(check.id)}
                              data-testid={`checkbox-check-${check.id}`}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                            {check.firmName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {check.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(check.checkedAt), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-2 font-semibold ${statusColor}`}>
                            {statusIcon}
                            <span data-testid={`text-consistency-${check.id}`}>
                              {consistencyPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {check.consistentCount} Consistent
                          </Badge>
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            {check.inconsistentCount} Inconsistent
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {check.missingCount} Missing
                          </Badge>
                        </div>
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-${check.id}`}
                        >
                          <Link href={`/check/${check.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {comparedChecks && (
        <Dialog open={!!comparedChecks} onOpenChange={() => setSelectedChecks([])}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-comparison">
            <DialogHeader>
              <DialogTitle>Before & After Comparison</DialogTitle>
              <DialogDescription>
                Compare NAP consistency between two checks
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {comparedChecks.map((check, index) => {
                const consistencyPercentage = check.totalDirectories > 0
                  ? Math.round((check.consistentCount / check.totalDirectories) * 100)
                  : 0;

                return (
                  <div key={check.id} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          {index === 0 ? "Before" : "After"}
                        </h3>
                        <Badge variant={index === 0 ? "secondary" : "default"}>
                          {format(new Date(check.checkedAt), "MMM dd, yyyy")}
                        </Badge>
                      </div>
                      
                      <Card>
                        <CardHeader className="space-y-0 pb-4">
                          <CardTitle className="text-lg">
                            {check.firmName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {check.location}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold" data-testid={`text-comparison-consistency-${index}`}>
                                {consistencyPercentage}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Consistency
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Consistent</span>
                              <Badge variant="default">
                                {check.consistentCount}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Inconsistent</span>
                              <Badge variant="destructive">
                                {check.inconsistentCount}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Missing</span>
                              <Badge variant="secondary">
                                {check.missingCount}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>

            {comparedChecks.length === 2 && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  {(() => {
                    const before = comparedChecks[0];
                    const after = comparedChecks[1];
                    const beforePct = before.totalDirectories > 0 
                      ? Math.round((before.consistentCount / before.totalDirectories) * 100) 
                      : 0;
                    const afterPct = after.totalDirectories > 0 
                      ? Math.round((after.consistentCount / after.totalDirectories) * 100) 
                      : 0;
                    const change = afterPct - beforePct;
                    
                    return (
                      <>
                        <p>
                          Consistency changed by{" "}
                          <span className={change > 0 ? "text-green-600 font-semibold" : change < 0 ? "text-red-600 font-semibold" : "font-semibold"}>
                            {change > 0 ? "+" : ""}{change}%
                          </span>
                        </p>
                        <p>
                          Consistent directories: {before.consistentCount} → {after.consistentCount} 
                          ({after.consistentCount - before.consistentCount > 0 ? "+" : ""}
                          {after.consistentCount - before.consistentCount})
                        </p>
                        <p>
                          Inconsistent directories: {before.inconsistentCount} → {after.inconsistentCount}
                          ({after.inconsistentCount - before.inconsistentCount > 0 ? "+" : ""}
                          {after.inconsistentCount - before.inconsistentCount})
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
