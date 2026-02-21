import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import type { LinkAnalysisResult } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  result: LinkAnalysisResult;
}

export function ExportButtons({ result }: ExportButtonsProps) {
  const escapeCSV = (value: string): string => {
    // Escape double quotes by doubling them and wrap in quotes if contains comma, quote, or newline
    if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return `"${value}"`;
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `link-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["Status Code", "Status Text", "Original URL", "Final URL", "Error", "Redirect Chain"];
    const rows = result.results.map((link) => {
      const redirectChain = link.redirectChain
        ? link.redirectChain.map((step) => `${step.statusCode} ${step.url}`).join(" -> ")
        : "";
      
      return [
        escapeCSV(link.statusCode?.toString() ?? "0"),
        escapeCSV(link.statusText ?? ""),
        escapeCSV(link.url ?? ""),
        escapeCSV(link.finalUrl ?? ""),
        escapeCSV(link.error ?? ""),
        escapeCSV(redirectChain),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = `link-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" data-testid="button-export">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON} data-testid="menu-item-export-json">
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} data-testid="menu-item-export-csv">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
