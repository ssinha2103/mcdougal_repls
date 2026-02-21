import { useState, useMemo, Fragment } from "react";
import type { LinkAnalysisResult, LinkResult } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { ArrowUpDown, ExternalLink, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RedirectChain } from "./redirect-chain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ResultsTableProps {
  result: LinkAnalysisResult;
}

type SortField = "url" | "status" | "finalUrl";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "2xx" | "3xx" | "4xx" | "5xx" | "error";

export function ResultsTable({ result }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (url: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(url)) {
      newExpanded.delete(url);
    } else {
      newExpanded.add(url);
    }
    setExpandedRows(newExpanded);
  };

  const resultsWithIds = useMemo(() => {
    return result.results.map((link, index) => ({
      ...link,
      uniqueId: `${link.url}-${index}`,
    }));
  }, [result.results]);

  const filteredAndSortedResults = useMemo(() => {
    // Apply filters
    let filtered = [...resultsWithIds];
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((link) => {
        if (statusFilter === "error") {
          return link.error !== undefined;
        }
        const statusCode = link.statusCode;
        if (!Number.isFinite(statusCode)) {
          return false;
        }
        const category = Math.floor(statusCode / 100);
        return statusFilter === `${category}xx`;
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((link) => 
        link.url.toLowerCase().includes(query) || 
        (link.finalUrl && link.finalUrl.toLowerCase().includes(query))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "status":
          aValue = a.statusCode;
          bValue = b.statusCode;
          break;
        case "url":
          aValue = a.url.toLowerCase();
          bValue = b.url.toLowerCase();
          break;
        case "finalUrl":
          aValue = (a.finalUrl || a.url).toLowerCase();
          bValue = (b.finalUrl || b.url).toLowerCase();
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [resultsWithIds, sortField, sortDirection, statusFilter, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const truncateUrl = (url: string, maxLength = 60) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            data-testid="input-search-url"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger data-testid="select-status-filter">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="2xx">Success (2xx)</SelectItem>
              <SelectItem value="3xx">Redirects (3xx)</SelectItem>
              <SelectItem value="4xx">Client Errors (4xx)</SelectItem>
              <SelectItem value="5xx">Server Errors (5xx)</SelectItem>
              <SelectItem value="error">Connection Errors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedResults.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground" data-testid="text-no-filtered-results">
            No links match your filter criteria
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort("status")}
                  data-testid="button-sort-status"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort("url")}
                  data-testid="button-sort-url"
                >
                  Original URL
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort("finalUrl")}
                  data-testid="button-sort-final-url"
                >
                  Final URL
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedResults.map((link, index) => {
              const isExpanded = expandedRows.has(link.uniqueId);
              const hasRedirectChain = link.redirectChain && link.redirectChain.length > 0;

              return (
                <Fragment key={link.uniqueId}>
                  <TableRow 
                    className="hover-elevate"
                    data-testid={`row-link-${index}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {hasRedirectChain && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleRow(link.uniqueId)}
                            data-testid={`button-expand-${index}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {link.error ? (
                          <StatusBadge statusCode={0} statusText="Error" />
                        ) : (
                          <StatusBadge
                            statusCode={link.statusCode}
                            statusText={link.statusText}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:underline inline-flex items-center gap-1"
                            data-testid={`link-original-${index}`}
                          >
                            {truncateUrl(link.url)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{link.url}</p>
                        </TooltipContent>
                      </Tooltip>
                      {link.error && (
                        <p className="text-xs text-destructive mt-1" data-testid={`text-error-${index}`}>
                          {link.error}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {link.finalUrl && link.finalUrl !== link.url ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={link.finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground hover:underline inline-flex items-center gap-1"
                              data-testid={`link-final-${index}`}
                            >
                              {truncateUrl(link.finalUrl)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-all">{link.finalUrl}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && hasRedirectChain && link.redirectChain && (
                    <TableRow key={`${link.uniqueId}-expanded`}>
                      <TableCell colSpan={3} className="bg-muted/30 p-4">
                        <div className="ml-8">
                          <h4 className="text-sm font-semibold mb-3">Redirect Chain</h4>
                          <RedirectChain
                            redirectChain={link.redirectChain}
                            finalUrl={link.finalUrl!}
                            finalStatusCode={link.statusCode}
                            finalStatusText={link.statusText}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
        </div>
      )}
    </div>
  );
}
