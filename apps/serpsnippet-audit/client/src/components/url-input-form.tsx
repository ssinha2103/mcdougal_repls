import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { urlAnalysisRequestSchema, type UrlAnalysis, type UrlAnalysisRequest } from "@shared/schema";

interface UrlInputFormProps {
  onAnalysisComplete: (analysis: UrlAnalysis) => void;
}

export function UrlInputForm({ onAnalysisComplete }: UrlInputFormProps) {
  const { toast } = useToast();
  
  const form = useForm<UrlAnalysisRequest>({
    resolver: zodResolver(urlAnalysisRequestSchema),
    defaultValues: {
      url: ""
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: UrlAnalysisRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json() as Promise<UrlAnalysis>;
    },
    onSuccess: (analysis) => {
      onAnalysisComplete(analysis);
      toast({
        title: "Analysis Complete",
        description: "Your URL has been successfully analyzed."
      });
    },
    onError: (error: any) => {
      // Parse error message from JSON response if it's a server error
      let errorMessage = "Failed to analyze URL. Please check the URL and try again.";
      
      if (error?.message) {
        try {
          // The error message might be "400: {\"message\":\"...\"}"
          const match = error.message.match(/^\d+:\s*(.+)$/);
          if (match) {
            const jsonPart = match[1];
            try {
              const parsed = JSON.parse(jsonPart);
              if (parsed.message) {
                errorMessage = parsed.message;
              }
            } catch {
              // If not JSON, use the part after the status code
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

  const onSubmit = (data: UrlAnalysisRequest) => {
    analyzeMutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Website URL to Analyze
                  </FormLabel>
                  <div className="flex gap-3">
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        className="flex-1"
                        data-testid="input-url"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="submit" 
                      disabled={analyzeMutation.isPending}
                      className="px-6 py-3 whitespace-nowrap"
                      data-testid="button-analyze"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <p className="text-sm text-muted-foreground mt-2">
          Enter any website URL to analyze its title tag and meta description
        </p>
      </div>
    </div>
  );
}
