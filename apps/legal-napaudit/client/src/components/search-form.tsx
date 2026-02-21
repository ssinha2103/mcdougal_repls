import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { searchRequestSchema, type SearchRequest, type NAPCheckResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearchStart: () => void;
  onSearchComplete: (data: NAPCheckResponse) => void;
  onSearchError?: () => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearchStart, onSearchComplete, onSearchError, isLoading }: SearchFormProps) {
  const { toast } = useToast();
  
  const form = useForm<SearchRequest>({
    resolver: zodResolver(searchRequestSchema),
    defaultValues: {
      firmName: "",
      location: "",
    },
  });

  const checkMutation = useMutation({
    mutationFn: async (data: SearchRequest) => {
      const response = await apiRequest<NAPCheckResponse>(
        "POST",
        "/api/check-nap",
        data
      );
      console.log("API Response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Success handler - data:", data);
      onSearchComplete(data);
      toast({
        title: "Check Complete",
        description: `Found ${data.directoryResults?.length || 0} directory listings`,
      });
    },
    onError: (error: Error) => {
      console.error("Error handler:", error);
      onSearchError?.();
      toast({
        title: "Check Failed",
        description: error.message || "Failed to check NAP consistency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchRequest) => {
    onSearchStart();
    checkMutation.mutate(data);
  };

  const isPending = isLoading || checkMutation.isPending;

  return (
    <Card className="max-w-2xl mx-auto p-6 sm:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firmName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Law Firm Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Smith & Associates Law Firm"
                      className="pl-10"
                      {...field}
                      disabled={isPending}
                      autoComplete="organization"
                      data-testid="input-firm-name"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Chicago, IL"
                      className="pl-10"
                      {...field}
                      disabled={isPending}
                      autoComplete="address-level2"
                      data-testid="input-location"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
            data-testid="button-check-nap"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Checking Directories...
              </>
            ) : (
              "Check NAP Consistency"
            )}
          </Button>

          {isPending && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This may take 30-60 seconds as we check multiple directories
              </p>
            </div>
          )}
        </form>
      </Form>
    </Card>
  );
}
