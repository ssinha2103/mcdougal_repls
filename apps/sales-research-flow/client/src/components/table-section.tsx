import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableSectionProps {
  title: string;
  description: string;
  selectedCount?: number;
  onAction?: () => void;
  actionLabel?: string;
  children: ReactNode;
}

export function TableSection({
  title,
  description,
  selectedCount = 0,
  onAction,
  actionLabel = "Launch Research",
  children,
}: TableSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold" data-testid="text-table-title">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="text-table-description">
          {description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20" data-testid="select-page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">per page</span>
          </div>

          {selectedCount > 0 && (
            <div className="text-sm text-muted-foreground" data-testid="text-selection-count">
              Selected: <span className="font-medium text-foreground">{selectedCount}</span>
            </div>
          )}
        </div>

        {onAction && (
          <Button
            onClick={onAction}
            data-testid="button-table-action"
          >
            {actionLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {children}
      </div>
    </div>
  );
}
