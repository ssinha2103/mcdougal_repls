import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type AnalysisResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Layers, Upload, FileText, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const batchFormSchema = z.object({
  urls: z.string()
    .min(1, "Please enter at least one URL")
    .refine((val) => {
      const lines = val.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('#');
      });
      return lines.length > 0;
    }, "Please enter at least one valid URL (lines starting with # are treated as comments)")
    .refine((val) => {
      const lines = val.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('#');
      });
      return lines.length <= 50;
    }, "Maximum 50 URLs allowed per batch. Please reduce the number of URLs."),
  concurrency: z.number().min(1).max(10).default(5),
});

type BatchFormData = z.infer<typeof batchFormSchema>;

interface BatchResult {
  url: string;
  status: "pending" | "analyzing" | "success" | "error";
  result?: AnalysisResult;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export default function BatchAnalysis() {
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [concurrency, setConcurrency] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      urls: "",
      concurrency: 5,
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url });
      return await response.json() as AnalysisResult;
    },
  });

  const processUrls = (text: string): string[] => {
    const lines = text.split('\n');
    const urlSet = new Set<string>();
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Basic URL cleaning
      let url = trimmed;
      if (!url.match(/^https?:\/\//i)) {
        url = `https://${url}`;
      }
      
      urlSet.add(url);
    }
    
    return Array.from(urlSet);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 1MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const urls = processUrls(text);
      
      if (urls.length === 0) {
        toast({
          title: "No valid URLs found",
          description: "The file doesn't contain any valid URLs",
          variant: "destructive",
        });
        return;
      }
      
      if (urls.length > 50) {
        toast({
          title: "Too many URLs",
          description: `File contains ${urls.length} URLs. Maximum 50 allowed.`,
          variant: "destructive",
        });
        return;
      }
      
      form.setValue('urls', urls.join('\n'));
      toast({
        title: "File imported",
        description: `Loaded ${urls.length} unique URL(s) from file`,
      });
    } catch (error) {
      toast({
        title: "Failed to read file",
        description: "Please make sure the file is a valid text file",
        variant: "destructive",
      });
    }
  };

  const handleBatchAnalysis = async (data: BatchFormData) => {
    const urls = processUrls(data.urls);
    
    if (urls.length === 0) {
      toast({
        title: "No valid URLs",
        description: "Please enter at least one valid URL",
        variant: "destructive",
      });
      return;
    }

    const initialResults: BatchResult[] = urls.map(url => ({
      url,
      status: "pending",
      startTime: Date.now(),
    }));

    setBatchResults(initialResults);
    setProgress(0);
    setIsProcessing(true);

    let completedCount = 0;
    const workerLimit = data.concurrency || 5;
    
    // Process URLs with concurrency control
    const processQueue = async () => {
      const queue = [...urls];
      const activeWorkers: Promise<void>[] = [];
      
      const analyzeUrl = async (url: string) => {
        setBatchResults(prev => 
          prev.map(r => r.url === url ? { ...r, status: "analyzing" } : r)
        );
        
        try {
          const result = await analyzeMutation.mutateAsync(url);
          setBatchResults(prev => 
            prev.map(r => r.url === url ? { 
              ...r, 
              status: "success", 
              result,
              endTime: Date.now() 
            } : r)
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Analysis failed";
          setBatchResults(prev =>
            prev.map(r => r.url === url ? { 
              ...r, 
              status: "error", 
              error: errorMessage,
              endTime: Date.now()
            } : r)
          );
        } finally {
          completedCount++;
          setProgress((completedCount / urls.length) * 100);
        }
      };
      
      while (queue.length > 0 || activeWorkers.length > 0) {
        while (activeWorkers.length < workerLimit && queue.length > 0) {
          const url = queue.shift()!;
          const worker = analyzeUrl(url);
          activeWorkers.push(worker);
        }
        
        if (activeWorkers.length > 0) {
          await Promise.race(activeWorkers).then(() => {
            const completedIndex = activeWorkers.findIndex(w => 
              Promise.race([w, Promise.resolve()]) === Promise.resolve()
            );
            if (completedIndex !== -1) {
              activeWorkers.splice(completedIndex, 1);
            }
          });
        }
      }
    };
    
    await processQueue();
    setIsProcessing(false);
  };

  const getAccessibilityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-chart-2 text-white">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-chart-3 text-white">Good</Badge>;
    if (score >= 50) return <Badge className="bg-chart-1 text-white">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const exportToCSV = () => {
    const headers = ["URL", "Status", "Total Headings", "H1", "H2", "H3", "H4", "H5", "H6", "Errors", "Accessibility Score", "Processing Time (ms)"];
    
    // Proper CSV escaping function
    const escapeCSV = (value: any): string => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const rows = batchResults.map(r => {
      const processingTime = r.endTime && r.startTime ? r.endTime - r.startTime : '';
      
      if (r.status === "success" && r.result) {
        const result = r.result;
        return [
          escapeCSV(r.url),
          escapeCSV(r.status),
          escapeCSV(result.statistics.total),
          escapeCSV(result.statistics.h1Count),
          escapeCSV(result.statistics.h2Count),
          escapeCSV(result.statistics.h3Count),
          escapeCSV(result.statistics.h4Count),
          escapeCSV(result.statistics.h5Count),
          escapeCSV(result.statistics.h6Count),
          escapeCSV(result.errors.length),
          escapeCSV(result.accessibility.score),
          escapeCSV(processingTime),
        ].join(",");
      } else {
        return [
          escapeCSV(r.url),
          escapeCSV(r.status),
          '', '', '', '', '', '', '',
          '',
          '',
          escapeCSV(processingTime),
        ].join(",");
      }
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `Exported ${batchResults.length} results to CSV`,
    });
  };

  const exportToJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalUrls: batchResults.length,
      successCount: batchResults.filter(r => r.status === "success").length,
      errorCount: batchResults.filter(r => r.status === "error").length,
      results: batchResults,
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-analysis-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `Exported ${batchResults.length} results to JSON`,
    });
  };

  const successCount = batchResults.filter(r => r.status === "success").length;
  const errorCount = batchResults.filter(r => r.status === "error").length;
  const analyzingCount = batchResults.filter(r => r.status === "analyzing").length;

  return (
    <div className="min-h-screen bg-background pb-12 px-4">
      <div className="max-w-4xl mx-auto pt-8 md:pt-20">
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground px-2">
            Batch URL Analysis
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Analyze multiple URLs at once. Process up to 50 URLs concurrently with configurable worker pool.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Layers className="h-5 w-5 text-foreground" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">Batch URL Analysis</h2>
          </div>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Tips</AlertTitle>
            <AlertDescription>
              • One URL per line • Lines starting with # are comments • Duplicate URLs are automatically removed • Maximum 50 URLs per batch
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBatchAnalysis)} className="space-y-4">
              <FormField
                control={form.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-sm font-medium">URLs</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Import from file
                        </Button>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("")}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="# Example URLs (this line is a comment)&#10;https://example.com&#10;https://another-site.com&#10;localhost:3000&#10;192.168.1.1"
                        rows={10}
                        className="font-mono text-sm"
                        data-testid="textarea-urls"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value && `${processUrls(field.value).length} unique URL(s) detected`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="concurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Concurrent Workers: {concurrency}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[concurrency]}
                        onValueChange={(value) => {
                          setConcurrency(value[0]);
                          field.onChange(value[0]);
                        }}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Number of URLs to analyze simultaneously (higher = faster but more resource intensive)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                size="lg"
                disabled={isProcessing}
                className="px-8 font-semibold"
                data-testid="button-analyze-batch"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing ({analyzingCount} active)...
                  </>
                ) : (
                  "Analyze URLs"
                )}
              </Button>
            </form>
          </Form>

          {batchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} data-testid="progress-batch" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-2">{successCount}</div>
                  <div className="text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-3">{analyzingCount}</div>
                  <div className="text-muted-foreground">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{errorCount}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {batchResults.length > 0 && progress === 100 && (
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Analysis Results</h2>
              <div className="flex gap-2">
                <Button
                  onClick={exportToJSON}
                  variant="outline"
                  size="sm"
                  data-testid="button-export-json"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  data-testid="button-export-csv"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Total Headings</TableHead>
                    <TableHead className="text-center">Errors</TableHead>
                    <TableHead className="text-center">Accessibility</TableHead>
                    <TableHead className="text-center">Time</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchResults.map((result, index) => (
                    <TableRow key={index} data-testid={`row-result-${index}`}>
                      <TableCell className="max-w-md truncate font-mono text-sm" title={result.url}>
                        {result.url}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.status === "success" && (
                          <CheckCircle2 className="h-5 w-5 text-chart-2 mx-auto" data-testid={`status-success-${index}`} />
                        )}
                        {result.status === "error" && (
                          <div className="flex flex-col items-center">
                            <XCircle className="h-5 w-5 text-destructive" data-testid={`status-error-${index}`} />
                            {result.error && (
                              <span className="text-xs text-destructive mt-1" title={result.error}>
                                {result.error.length > 20 ? `${result.error.substring(0, 20)}...` : result.error}
                              </span>
                            )}
                          </div>
                        )}
                        {result.status === "analyzing" && (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-chart-3" />
                        )}
                        {result.status === "pending" && (
                          <div className="h-5 w-5 rounded-full border-2 border-muted mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {result.result?.statistics.total ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.result ? (
                          <Badge variant={result.result.errors.length > 0 ? "destructive" : "secondary"}>
                            {result.result.errors.length}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.result ? getAccessibilityBadge(result.result.accessibility.score) : "-"}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {result.endTime && result.startTime
                          ? `${((result.endTime - result.startTime) / 1000).toFixed(1)}s`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.result && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, "_blank")}
                            data-testid={`button-view-${index}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}