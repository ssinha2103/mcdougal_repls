import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Sparkles } from "lucide-react";

export interface FilterState {
  prospectScoreMin: number;
  prospectScoreMax: number;
  trafficMin: number;
  trafficMax: number;
  keywordsMin: number;
  keywordsMax: number;
  status: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterState>;
}

const AI_PRESETS: FilterPreset[] = [
  {
    id: "high-priority",
    name: "High Priority Prospects",
    description: "Score ≥ 75, declining traffic",
    filters: {
      prospectScoreMin: 75,
      prospectScoreMax: 100,
    },
  },
  {
    id: "quick-wins",
    name: "Quick Wins",
    description: "Score ≥ 60, low competition",
    filters: {
      prospectScoreMin: 60,
      prospectScoreMax: 100,
    },
  },
  {
    id: "content-opportunities",
    name: "Content Opportunities",
    description: "High traffic, growth potential",
    filters: {
      trafficMin: 10000,
    },
  },
  {
    id: "competitive-threats",
    name: "Competitive Threats",
    description: "Competitors gaining rankings",
    filters: {
      prospectScoreMin: 50,
    },
  },
];

interface ComparisonFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function ComparisonFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: ComparisonFiltersProps) {
  const handleClear = () => {
    onFiltersChange({
      prospectScoreMin: 0,
      prospectScoreMax: 100,
      trafficMin: 0,
      trafficMax: 1000000,
      keywordsMin: 0,
      keywordsMax: 100000,
      status: "all",
    });
  };

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({
      ...filters,
      ...preset.filters,
    });
  };

  const isFiltered = 
    filters.prospectScoreMin !== 0 ||
    filters.prospectScoreMax !== 100 ||
    filters.trafficMin !== 0 ||
    filters.trafficMax !== 1000000 ||
    filters.keywordsMin !== 0 ||
    filters.keywordsMax !== 100000 ||
    filters.status !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {isFiltered && (
            <Badge variant="secondary" className="text-xs" data-testid="badge-filter-count">
              {filteredCount} / {totalCount}
            </Badge>
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* AI Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <Label className="text-xs font-medium">AI-Suggested Presets</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AI_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className="justify-start h-auto py-2 px-3 hover-elevate"
              onClick={() => applyPreset(preset)}
              data-testid={`button-preset-${preset.id}`}
            >
              <div className="text-left">
                <div className="text-xs font-medium">{preset.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {preset.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Prospect Score Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Prospect Score</Label>
          <span className="text-xs text-muted-foreground">
            {filters.prospectScoreMin} - {filters.prospectScoreMax}
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[filters.prospectScoreMin, filters.prospectScoreMax]}
          onValueChange={([min, max]) =>
            onFiltersChange({
              ...filters,
              prospectScoreMin: min,
              prospectScoreMax: max,
            })
          }
          data-testid="slider-prospect-score"
        />
      </div>

      {/* Traffic Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Organic Traffic</Label>
          <span className="text-xs text-muted-foreground">
            {filters.trafficMin.toLocaleString()} - {filters.trafficMax.toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={1000000}
          step={10000}
          value={[filters.trafficMin, filters.trafficMax]}
          onValueChange={([min, max]) =>
            onFiltersChange({
              ...filters,
              trafficMin: min,
              trafficMax: max,
            })
          }
          data-testid="slider-traffic"
        />
      </div>

      {/* Keywords Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Total Keywords</Label>
          <span className="text-xs text-muted-foreground">
            {filters.keywordsMin.toLocaleString()} - {filters.keywordsMax.toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={[filters.keywordsMin, filters.keywordsMax]}
          onValueChange={([min, max]) =>
            onFiltersChange({
              ...filters,
              keywordsMin: min,
              keywordsMax: max,
            })
          }
          data-testid="slider-keywords"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
