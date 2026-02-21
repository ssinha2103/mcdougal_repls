import { useState } from "react";
import { Copy, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type GenerateKeywordsResponse } from "@shared/schema";

interface ResultsSectionProps {
  results: GenerateKeywordsResponse;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  // Remove sort functionality - display in natural order A1B1, A1B2, A2B1, A2B2
  const [itemsPerPage] = useState(20);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("Campaign1");
  const [adGroupName, setAdGroupName] = useState("AdGroup1");
  
  const { toast } = useToast();

  // Use keywords in natural order (A1B1, A1B2, A2B1, A2B2, etc.)
  const sortedKeywords = results.keywords;

  // Paginate results
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentKeywords = sortedKeywords.slice(startIndex, startIndex + itemsPerPage);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Keywords copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyAllKeywords = () => {
    if (!results || !results.keywords || results.keywords.length === 0) {
      toast({
        title: "No keywords to copy",
        description: "Generate keywords first before copying",
        variant: "destructive",
      });
      return;
    }
    
    const allKeywords = results.keywords.map(k => k.keyword).join('\n');
    if (allKeywords.trim()) {
      copyToClipboard(allKeywords);
    } else {
      toast({
        title: "No keywords to copy",
        description: "Keywords list is empty",
        variant: "destructive",
      });
    }
  };

  const exportKeywords = async (format: "csv" | "txt" | "json" | "ads-csv") => {
    try {
      const keywords = results.keywords.map(k => k.keyword);
      
      // Make the request directly with fetch to handle blob response properly
      const response = await fetch("/api/export-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          format,
          campaignName: format === "ads-csv" ? campaignName : undefined,
          adGroupName: format === "ads-csv" ? adGroupName : undefined,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the response as blob directly
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filename = format === "ads-csv" ? "ads-keywords.csv" 
        : format === "json" ? "keywords.json"
        : format === "txt" ? "keywords.txt"
        : "keywords.csv";
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsExportDialogOpen(false);
      
      toast({
        title: "Export successful",
        description: `Keywords exported as ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export keywords",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Keywords</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, results.totalCombinations)} of {results.totalCombinations} combinations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyAllKeywords}>
                <Copy className="h-4 w-4 mr-1" />
                Copy All
              </Button>
              
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Keywords</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => exportKeywords("csv")} variant="outline">
                        CSV Format
                      </Button>
                      <Button onClick={() => exportKeywords("txt")} variant="outline">
                        TXT Format
                      </Button>
                      <Button onClick={() => exportKeywords("json")} variant="outline">
                        JSON Format
                      </Button>
                      <Button onClick={() => exportKeywords("ads-csv")} variant="outline">
                        Google Ads CSV
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Campaign Name (for Ads CSV)</Label>
                      <Input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Campaign Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ad Group Name (for Ads CSV)</Label>
                      <Input
                        value={adGroupName}
                        onChange={(e) => setAdGroupName(e.target.value)}
                        placeholder="Ad Group Name"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {currentKeywords.map((result, index) => (
            <div key={index} className="px-6 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-sm">
                    {result.keyword}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(result.keyword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, results.totalCombinations)}</span> of{" "}
                <span className="font-medium">{results.totalCombinations}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-muted-foreground">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
