import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table as TableIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NAPCheckResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  results: NAPCheckResponse;
}

export function ExportButtons({ results }: ExportButtonsProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Directory", "Name Status", "Address Status", "Phone Status", "Name", "Address", "Phone"];
      const rows = results.directoryResults.map(result => [
        result.directoryName,
        result.nameMatch,
        result.addressMatch,
        result.phoneMatch,
        result.napData?.name || "N/A",
        result.napData?.address || "N/A",
        result.napData?.phone || "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nap-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      toast({
        title: "Export Started",
        description: "Generating PDF report...",
      });

      // Simple text-based export since jsPDF would need additional setup
      const content = `
NAP Consistency Report
Generated: ${new Date(results.checkedAt).toLocaleString()}

CANONICAL NAP DATA (Google Places):
Name: ${results.canonicalNAP.name}
Address: ${results.canonicalNAP.address}
Phone: ${results.canonicalNAP.phone}

SUMMARY:
Total Directories Checked: ${results.summary.totalDirectories}
Consistent Listings: ${results.summary.consistent}
Inconsistent Listings: ${results.summary.inconsistent}
Missing Listings: ${results.summary.missing}

DIRECTORY RESULTS:
${results.directoryResults.map(result => `
${result.directoryName}:
  Found: ${result.found ? "Yes" : "No"}
  Name Match: ${result.nameMatch}
  Address Match: ${result.addressMatch}
  Phone Match: ${result.phoneMatch}
  ${result.napData ? `Data:
    Name: ${result.napData.name}
    Address: ${result.napData.address}
    Phone: ${result.napData.phone}` : ""}
`).join("\n")}
`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nap-report-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Report file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} data-testid="button-export">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} data-testid="button-export-csv">
          <TableIcon className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} data-testid="button-export-pdf">
          <FileText className="mr-2 h-4 w-4" />
          Export as Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
