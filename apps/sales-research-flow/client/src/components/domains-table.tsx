import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown, ArrowUp, ArrowDown, Mail } from "lucide-react";
import { UrgencyBadge } from "./urgency-badge";
import { TrendIndicator } from "./trend-indicator";
import { PerformanceBadge } from "./performance-badge";
import { DataSourceBadge } from "./data-source-badge";
import { PriorityBadge } from "./priority-badge";
import { EmailPreviewModal } from "./email-preview-modal";
import { DomainDetailComprehensive } from "./domain-detail-comprehensive";
import { cn } from "@/lib/utils";
import type { Domain } from "@shared/schema";

interface DomainsTableProps {
  domains: Domain[];
  selectedDomains?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortField = "companyName" | "organicTraffic" | "keywordsTop100" | "trafficValue" | "trafficTrend3mo" | "performanceScore" | "aiOverviewVisibilityScore" | "priorityScore";
type SortDirection = "asc" | "desc" | null;

export function DomainsTable({ domains, selectedDomains = [], onSelectionChange }: DomainsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedDomainForEmail, setSelectedDomainForEmail] = useState<Domain | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDomainForDetail, setSelectedDomainForDetail] = useState<Domain | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(sortedDomains.map(d => d.id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedDomains, domainId]);
      } else {
        onSelectionChange(selectedDomains.filter(id => id !== domainId));
      }
    }
  };

  const allSelected = domains.length > 0 && selectedDomains.length === domains.length;
  const someSelected = selectedDomains.length > 0 && selectedDomains.length < domains.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedDomains = useMemo(() => {
    if (!sortField || !sortDirection) return domains;

    return [...domains].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [domains, sortField, sortDirection]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3 font-medium hover-elevate"
      data-testid={`button-sort-${field}`}
    >
      {children}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "—";
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | null) => {
    if (num === null || num === undefined) return "—";
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getUrgencyFlag = (trend: number | null): "urgent" | "review" | "healthy" | null => {
    if (trend === null || trend === undefined) return null;
    if (trend < -15) return "urgent";
    if (trend >= -15 && trend <= 5) return "review";
    return "healthy";
  };

  const handleGenerateEmail = (domain: Domain, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedDomainForEmail(domain);
    setEmailModalOpen(true);
  };

  const handleViewDetails = (domain: Domain) => {
    setSelectedDomainForDetail(domain);
    setDetailModalOpen(true);
  };

  const AIVisibilityBadge = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                N/A
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Overview data not available</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (score === 100) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                Visible
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Domain is mentioned in Google AI Overview (Score: 100)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (score === 50) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                Partial
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Overview present but domain not mentioned (Score: 50)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              Not Visible
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>No AI Overview found for brand search (Score: 0)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden" data-testid="domains-table">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {onSelectionChange && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all domains"
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
              )}
              <TableHead className="w-[250px]">
                <SortButton field="companyName">Company</SortButton>
              </TableHead>
              <TableHead className="w-[140px]">Data Source</TableHead>
              <TableHead className="w-[200px]">Domain</TableHead>
              <TableHead className="w-[140px] text-right">
                <SortButton field="organicTraffic">Traffic</SortButton>
              </TableHead>
              <TableHead className="w-[140px] text-right">
                <SortButton field="keywordsTop100">Keywords</SortButton>
              </TableHead>
              <TableHead className="w-[140px] text-right">
                <SortButton field="trafficValue">Value</SortButton>
              </TableHead>
              <TableHead className="w-[140px]">
                <SortButton field="trafficTrend3mo">Trend (3mo)</SortButton>
              </TableHead>
              <TableHead className="w-[140px]">
                <SortButton field="performanceScore">Performance</SortButton>
              </TableHead>
              <TableHead className="w-[140px]">
                <SortButton field="aiOverviewVisibilityScore">AI Visibility</SortButton>
              </TableHead>
              <TableHead className="w-[180px]">
                <SortButton field="priorityScore">Priority</SortButton>
              </TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDomains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onSelectionChange ? 13 : 12} className="h-24 text-center text-muted-foreground">
                  No domains found
                </TableCell>
              </TableRow>
            ) : (
              sortedDomains.map((domain) => {
                const urgencyFlag = getUrgencyFlag(domain.trafficTrend3mo);
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <TableRow
                    key={domain.id}
                    className={cn(
                      "hover-elevate cursor-pointer",
                      urgencyFlag === "urgent" && "bg-chart-4/5",
                      urgencyFlag === "review" && "bg-chart-3/5",
                      urgencyFlag === "healthy" && "bg-chart-2/5"
                    )}
                    onClick={() => handleViewDetails(domain)}
                    data-testid={`row-domain-${domain.id}`}
                  >
                    {onSelectionChange && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectDomain(domain.id, checked as boolean)}
                          aria-label={`Select ${domain.companyName}`}
                          data-testid={`checkbox-domain-${domain.id}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{domain.companyName}</TableCell>
                    <TableCell>
                      <DataSourceBadge source={domain.dataSource as "semrush" | "dataforseo" | null} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {domain.webAddress}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(domain.organicTraffic)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(domain.keywordsTop100)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(domain.trafficValue)}
                    </TableCell>
                    <TableCell>
                      <TrendIndicator value={domain.trafficTrend3mo} />
                    </TableCell>
                    <TableCell>
                      <PerformanceBadge
                        score={domain.performanceScore}
                        mobileScore={domain.mobileScore}
                        desktopScore={domain.desktopScore}
                        fcp={domain.fcp}
                        lcp={domain.lcp}
                        fid={domain.fid}
                        cls={domain.cls}
                      />
                    </TableCell>
                    <TableCell>
                      <AIVisibilityBadge score={domain.aiOverviewVisibilityScore} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge score={domain.priorityScore} />
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge flag={urgencyFlag} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{domain.category}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleGenerateEmail(domain, e)}
                        className="gap-2"
                        data-testid={`button-generate-email-${domain.id}`}
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        domain={selectedDomainForEmail}
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />

      {/* Domain Detail Modal */}
      {selectedDomainForDetail && detailModalOpen && (
        <DomainDetailComprehensive
          domain={selectedDomainForDetail}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedDomainForDetail(null);
          }}
        />
      )}
    </div>
  );
}
