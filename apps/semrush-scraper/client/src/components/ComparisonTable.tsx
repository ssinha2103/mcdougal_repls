import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye, Download, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DomainWithMetrics } from "@shared/schema";
import type { ScoreWeights } from "./ScoreWeightSliders";

interface ComparisonTableProps {
  domains: DomainWithMetrics[];
  selectedDomains: string[];
  onSelectionChange: (domainIds: string[]) => void;
  weights: ScoreWeights;
  onExportSelected: () => void;
}

type SortColumn = "domain" | "score" | "traffic" | "keywords" | "trafficCost" | "monthlyChange";
type SortDirection = "asc" | "desc" | null;

export function ComparisonTable({
  domains,
  selectedDomains,
  onSelectionChange,
  weights,
  onExportSelected,
}: ComparisonTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleRow = (domainId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSelection = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      onSelectionChange(selectedDomains.filter((id) => id !== domainId));
    } else {
      onSelectionChange([...selectedDomains, domainId]);
    }
  };

  const toggleAll = () => {
    if (selectedDomains.length === domains.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(domains.map((d) => d.id));
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Calculate weighted score
  const calculateWeightedScore = (domain: DomainWithMetrics): number => {
    const metrics = domain.latestSnapshot?.metrics;
    if (!metrics) return 0;

    const declineScore = metrics.declineScore || 0;
    const lossScore = (metrics.positionsLost || 0) / Math.max(metrics.totalKeywords || 1, 1) * 100;
    const gapScore = metrics.opportunityScore || 0;
    const intentScore = metrics.prospectScore || 0;

    return Math.round(
      (declineScore * weights.trafficDecline / 100) +
      (lossScore * weights.keywordLoss / 100) +
      (gapScore * weights.competitionGap / 100) +
      (intentScore * weights.intentMix / 100)
    );
  };

  // Sort domains
  let sortedDomains = [...domains];
  if (sortColumn && sortDirection) {
    sortedDomains.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortColumn) {
        case "domain":
          aVal = a.domain;
          bVal = b.domain;
          break;
        case "score":
          aVal = calculateWeightedScore(a);
          bVal = calculateWeightedScore(b);
          break;
        case "traffic":
          aVal = a.latestSnapshot?.metrics?.organicTraffic || 0;
          bVal = b.latestSnapshot?.metrics?.organicTraffic || 0;
          break;
        case "keywords":
          aVal = a.latestSnapshot?.metrics?.totalKeywords || 0;
          bVal = b.latestSnapshot?.metrics?.totalKeywords || 0;
          break;
        case "trafficCost":
          aVal = a.latestSnapshot?.metrics?.trafficCost || 0;
          bVal = b.latestSnapshot?.metrics?.trafficCost || 0;
          break;
        case "monthlyChange":
          aVal = (a.latestSnapshot?.metrics?.positionsImproved || 0) - (a.latestSnapshot?.metrics?.positionsDeclined || 0);
          bVal = (b.latestSnapshot?.metrics?.positionsImproved || 0) - (b.latestSnapshot?.metrics?.positionsDeclined || 0);
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-chart-2";
    if (score >= 40) return "text-chart-3";
    return "text-chart-5";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-chart-2/10 border-chart-2/20";
    if (score >= 40) return "bg-chart-3/10 border-chart-3/20";
    return "bg-chart-5/10 border-chart-5/20";
  };

  if (domains.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No domains match the current filters
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions */}
      {selectedDomains.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedDomains.length} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onExportSelected}
            data-testid="button-export-selected"
          >
            <Download className="h-3 w-3 mr-1" />
            Export Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDomains.length === domains.length}
                    onCheckedChange={toggleAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("domain")}
                    data-testid="button-sort-domain"
                  >
                    Domain
                    {getSortIcon("domain")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("score")}
                    data-testid="button-sort-score"
                  >
                    Score
                    {getSortIcon("score")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("traffic")}
                    data-testid="button-sort-traffic"
                  >
                    Traffic
                    {getSortIcon("traffic")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("keywords")}
                    data-testid="button-sort-keywords"
                  >
                    Keywords
                    {getSortIcon("keywords")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("trafficCost")}
                    data-testid="button-sort-traffic-cost"
                  >
                    Traffic Cost
                    {getSortIcon("trafficCost")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium hover-elevate"
                    onClick={() => handleSort("monthlyChange")}
                    data-testid="button-sort-monthly-change"
                  >
                    Monthly Change
                    {getSortIcon("monthlyChange")}
                  </button>
                </TableHead>
                <TableHead>Top Insight</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDomains.map((domain) => {
                const metrics = domain.latestSnapshot?.metrics;
                const insights = domain.latestSnapshot?.insights || [];
                const topInsight = insights[0];
                const weightedScore = calculateWeightedScore(domain);
                const monthlyChange = (metrics?.positionsImproved || 0) - (metrics?.positionsDeclined || 0);
                const isExpanded = expandedRows.has(domain.id);

                return (
                  <>
                    <TableRow
                      key={domain.id}
                      className="hover-elevate"
                      data-testid={`row-domain-${domain.id}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedDomains.includes(domain.id)}
                          onCheckedChange={() => toggleSelection(domain.id)}
                          data-testid={`checkbox-${domain.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRow(domain.id)}
                          data-testid={`button-expand-${domain.id}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {domain.domain}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={cn("inline-flex px-2 py-1 rounded-md border text-sm font-semibold", getScoreBg(weightedScore))}>
                          <span className={getScoreColor(weightedScore)}>
                            {weightedScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {metrics?.organicTraffic?.toLocaleString() || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {metrics?.totalKeywords?.toLocaleString() || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        ${metrics?.trafficCost?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {monthlyChange > 0 ? (
                            <span className="text-chart-2 text-sm">+{monthlyChange}</span>
                          ) : monthlyChange < 0 ? (
                            <span className="text-chart-5 text-sm">{monthlyChange}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {topInsight ? (
                          <div className="max-w-xs">
                            <p className="text-xs truncate">{topInsight.title}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No insights</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            data-testid={`button-view-${domain.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            data-testid={`button-download-${domain.id}`}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-muted/20 p-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Insights</h4>
                            {insights.length > 0 ? (
                              <div className="space-y-2">
                                {insights.map((insight) => (
                                  <div
                                    key={insight.id}
                                    className="flex items-start gap-3 p-3 bg-card rounded-md border border-border"
                                  >
                                    <Badge
                                      variant={
                                        insight.severity === "high"
                                          ? "destructive"
                                          : insight.severity === "medium"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs mt-0.5"
                                    >
                                      {insight.severity}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{insight.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {insight.summary}
                                      </p>
                                      {insight.details && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          {insight.details}
                                        </p>
                                      )}
                                    </div>
                                    {insight.confidence && (
                                      <span className="text-xs text-muted-foreground">
                                        {insight.confidence}% confident
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No insights available</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
