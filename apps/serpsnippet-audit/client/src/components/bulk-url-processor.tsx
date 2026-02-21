import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Globe, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SerpPreview } from "@/components/serp-preview";
import { SeoAuditPanel } from "@/components/seo-audit-panel";
import type { BulkUrlAnalysisResponse, UrlAnalysis } from "@shared/schema";

type SeoIssue = {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
};

const bulkUrlSchema = z.object({
  urls: z.string()
    .min(1, "Please enter at least one URL")
});

type BulkUrlForm = z.infer<typeof bulkUrlSchema>;

interface BulkAnalysisResult extends BulkUrlAnalysisResponse {
  status: 'completed' | 'processing' | 'pending' | 'failed';
  results: UrlAnalysis[];
}

export function BulkUrlProcessor() {
  const [results, setResults] = useState<BulkAnalysisResult | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BulkUrlForm>({
    resolver: zodResolver(bulkUrlSchema),
    defaultValues: {
      urls: ""
    }
  });

  const bulkAnalyzeMutation = useMutation({
    mutationFn: async (urlString: string) => {
      // Parse URLs from the string
      const urls = urlString.split('\n')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);
        
      // Validate URLs
      if (urls.length === 0) {
        throw new Error('Please enter at least one URL');
      }
      if (urls.length > 50) {
        throw new Error('Maximum 50 URLs allowed');
      }
      
      // Basic validation: check each URL contains a dot (domain)
      for (const url of urls) {
        if (!url.includes('.')) {
          throw new Error(`Invalid URL: ${url}`);
        }
      }
      
      const response = await apiRequest('POST', '/api/analyze/bulk', { urls });
      return await response.json() as BulkUrlAnalysisResponse;
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setResults({
        ...data,
        status: 'processing',
        results: []
      });
      
      toast({
        title: "Bulk Analysis Started",
        description: `Processing ${data.totalUrls} URLs...`
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to start bulk analysis";
      
      if (error?.message) {
        try {
          const match = error.message.match(/^\d+:\s*(.+)$/);
          if (match) {
            const jsonPart = match[1];
            try {
              const parsed = JSON.parse(jsonPart);
              if (parsed.message) {
                errorMessage = parsed.message;
              }
            } catch {
              errorMessage = jsonPart;
            }
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Job status polling
  const { data: jobStatus } = useQuery({
    queryKey: ['bulk-job', currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      const response = await apiRequest('GET', `/api/analyze/bulk/${currentJobId}`);
      return await response.json() as BulkUrlAnalysisResponse;
    },
    enabled: !!currentJobId && results?.status !== 'completed' && results?.status !== 'failed',
    refetchInterval: 2000 // Poll every 2 seconds
  });

  // Update results when job status changes
  useEffect(() => {
    if (jobStatus && jobStatus.jobId) {
      setResults(jobStatus);
      
      if (jobStatus.status === 'completed' && results?.status !== 'completed') {
        toast({
          title: "Bulk Analysis Complete",
          description: `Analyzed ${jobStatus.results.length} URLs successfully${jobStatus.errors.length > 0 ? `, ${jobStatus.errors.length} failed` : ''}`
        });
      } else if (jobStatus.status === 'failed' && results?.status !== 'failed') {
        toast({
          title: "Bulk Analysis Failed",
          description: "The analysis job failed. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [jobStatus]);

  const onSubmit = (data: BulkUrlForm) => {
    setResults(null);
    setCurrentJobId(null);
    bulkAnalyzeMutation.mutate(data.urls);
  };

  const getIssueTypeCount = (results: UrlAnalysis[], type: 'error' | 'warning' | 'info' | 'success') => {
    return results.reduce((count, result) => {
      const issues = (result.issues as SeoIssue[]) || [];
      return count + issues.filter(issue => issue.type === type).length;
    }, 0);
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ['URL', 'Title', 'Title Length', 'Meta Description', 'Description Length', 'Issues', 'Status'],
      ...results.results.map(result => [
        result.url,
        result.title || 'Missing',
        result.titleLength.toString(),
        result.metaDescription || 'Missing',
        result.descriptionLength.toString(),
        (result.issues || []).length.toString(),
        ((result.issues as SeoIssue[]) || []).some(i => i.type === 'error') ? 'Error' : 
        ((result.issues as SeoIssue[]) || []).some(i => i.type === 'warning') ? 'Warning' : 'Good'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${results.jobId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk URL Analysis
          </CardTitle>
          <CardDescription>
            Analyze multiple URLs at once. Enter one URL per line (maximum 50 URLs).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URLs to Analyze</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-bulk-urls"
                        placeholder={`https://example.com\nhttps://another-site.com\nhttps://third-site.com`}
                        className="h-32 font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                data-testid="button-start-bulk-analysis"
                disabled={bulkAnalyzeMutation.isPending}
                className="w-full"
              >
                {bulkAnalyzeMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Start Bulk Analysis
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Results
              </span>
              {results.status === 'completed' && (
                <Button
                  onClick={exportResults}
                  data-testid="button-export-results"
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Job ID: {results.jobId} | Status: <Badge variant="outline">{results.status}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.status === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing URLs...</span>
                  <span>{results.processedUrls || 0}/{results.totalUrls}</span>
                </div>
                <Progress 
                  value={results.totalUrls > 0 ? ((results.processedUrls || 0) / results.totalUrls) * 100 : 0} 
                  className="h-2" 
                  data-testid="progress-bulk-analysis" 
                />
              </div>
            )}

            {results.status === 'completed' && results.results && results.results.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {getIssueTypeCount(results.results, 'success')}
                    </div>
                    <div className="text-sm text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {getIssueTypeCount(results.results, 'info')}
                    </div>
                    <div className="text-sm text-muted-foreground">Info</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {getIssueTypeCount(results.results, 'warning')}
                    </div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {getIssueTypeCount(results.results, 'error')}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                <Separator />

                <Accordion type="single" collapsible className="space-y-4" data-testid="bulk-results-list">
                  {results.results.map((result, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg overflow-hidden"
                      data-testid={`bulk-result-accordion-${index}`}
                    >
                      <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="text-left">
                            <div className="text-sm font-medium break-all">{result.url}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {((result.issues as SeoIssue[]) || []).some(i => i.type === 'error') ? (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Issues
                              </Badge>
                            ) : ((result.issues as SeoIssue[]) || []).some(i => i.type === 'warning') ? (
                              <Badge variant="secondary" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Warnings
                              </Badge>
                            ) : (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Good
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-6 pt-4">
                          <SerpPreview analysis={result} />
                          <SeoAuditPanel analysis={result} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}

            {results.errors && results.errors.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Failed Analyses ({results.errors.length})
                  </h4>
                  {results.errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-destructive/10 rounded text-sm">
                      <span className="font-mono break-all">{error.url}</span>
                      <span className="text-muted-foreground ml-2">{error.error}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}