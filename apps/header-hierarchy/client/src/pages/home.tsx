import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { analyzeUrlSchema, type AnalyzeUrlRequest, type AnalysisResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2, XCircle, Info, Globe, Activity } from "lucide-react";
import { HeadingHierarchy } from "@/components/heading-hierarchy";
import { ErrorDisplay } from "@/components/error-display";
import { StatisticsPanel } from "@/components/statistics-panel";
import { ExportActions } from "@/components/export-actions";
import { AccessibilityPanel } from "@/components/accessibility-panel";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const form = useForm<AnalyzeUrlRequest>({
    resolver: zodResolver(analyzeUrlSchema),
    defaultValues: {
      url: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalyzeUrlRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return await response.json() as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: AnalyzeUrlRequest) => {
    analyzeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background pb-12 px-4">
      <div className="max-w-4xl mx-auto pt-8 md:pt-20">
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground px-2">
            Professional Header Tag Checker
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Generate comprehensive SEO analysis for your heading structure. Analyze H1-H6 hierarchy, detect accessibility issues, and optimize your content.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Globe className="h-5 w-5 text-foreground" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">URL Analysis</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 md:mb-6">
            Enter a website URL to analyze its heading structure with search volume data
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          placeholder="Enter website URL (e.g., example.com)"
                          className="h-12 text-base flex-1"
                          disabled={analyzeMutation.isPending}
                          data-testid="input-url"
                        />
                        <Button
                          type="submit"
                          disabled={analyzeMutation.isPending}
                          className="h-12 w-12 flex-shrink-0 p-0"
                          data-testid="button-analyze"
                        >
                          {analyzeMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Activity className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {analyzeMutation.isError && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive">Analysis Failed</p>
                <p className="text-sm text-destructive/90 mt-1">
                  {analyzeMutation.error instanceof Error
                    ? analyzeMutation.error.message
                    : "Unable to analyze the URL. Please check the URL and try again."}
                </p>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-2xl font-bold text-accent" data-testid="heading-results">Analysis Results</h2>
                <ExportActions result={result} />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <StatisticsPanel statistics={result.statistics} />
                </div>
                <div>
                  <AccessibilityPanel accessibility={result.accessibility} />
                </div>
              </div>
              
              {result.errors.length > 0 && (
                <div className="mb-6">
                  <ErrorDisplay errors={result.errors} headings={result.headings} />
                </div>
              )}

              {result.errors.length === 0 && (
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3 mb-6" data-testid="message-success">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-accent">No SEO Issues Found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The heading structure follows SEO best practices with proper hierarchy.
                    </p>
                  </div>
                </div>
              )}

              <HeadingHierarchy headings={result.headings} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
