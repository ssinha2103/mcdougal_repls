import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSavedSearchSchema, type SavedSearch, type InsertSavedSearch } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Play, Mail, Clock, History } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function SavedSearchesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: savedSearches, isLoading } = useQuery<SavedSearch[]>({
    queryKey: ["/api/saved-searches"],
  });

  const form = useForm<InsertSavedSearch>({
    resolver: zodResolver(insertSavedSearchSchema),
    defaultValues: {
      keyword: "",
      location: "",
      name: "",
      emailReportEnabled: false,
      emailAddress: undefined,
      reportFrequency: "weekly",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSavedSearch) => {
      const res = await apiRequest("POST", "/api/saved-searches", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Search saved",
        description: "Your search has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save search",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/saved-searches/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({
        title: "Search deleted",
        description: "The saved search has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete search",
        variant: "destructive",
      });
    },
  });

  const runSearchMutation = useMutation({
    mutationFn: async (search: SavedSearch) => {
      const res = await apiRequest("POST", "/api/analyze", {
        keyword: search.keyword,
        location: search.location,
      });
      const response = await res.json();

      // Save the result
      await apiRequest("POST", "/api/search-results", {
        savedSearchId: search.id,
        keyword: search.keyword,
        location: search.location,
        localPackData: response.localPack,
        organicData: response.organic,
        totalResults: response.summary.totalResults,
        avgRating: response.summary.avgRating,
        claimedPercentage: response.summary.claimedPercentage,
        topCompetitor: response.summary.topCompetitor,
      });

      // Update lastRun timestamp
      await apiRequest("PATCH", `/api/saved-searches/${search.id}`, {
        lastRun: new Date().toISOString(),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({
        title: "Search completed",
        description: "Results have been saved to history.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to run search",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSavedSearch) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading saved searches...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Saved Searches</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved keyword and location combinations for ongoing competitive monitoring.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-search">
              <Plus className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Save New Search</DialogTitle>
              <DialogDescription>
                Save a keyword and location combination for ongoing monitoring and historical tracking.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="keyword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keyword</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., divorce lawyer"
                          data-testid="input-keyword"
                        />
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., New York, NY"
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., NYC Divorce Lawyers"
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this search
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailReportEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Reports</FormLabel>
                        <FormDescription>
                          Receive automated ranking reports via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-email-reports"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch("emailReportEnabled") && (
                  <>
                    <FormField
                      control={form.control}
                      name="emailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              type="email"
                              placeholder="your@email.com"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reportFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Frequency</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              data-testid="select-frequency"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-save-search"
                  >
                    {createMutation.isPending ? "Saving..." : "Save Search"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!savedSearches || savedSearches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No saved searches yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first saved search to start tracking rankings over time
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover-elevate" data-testid={`card-search-${search.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{search.keyword}</CardTitle>
                    <CardDescription className="truncate">{search.location}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(search.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${search.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {search.emailReportEnabled && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{search.reportFrequency} reports</span>
                    </div>
                  )}
                  {search.lastRun && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last run: {format(new Date(search.lastRun), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => runSearchMutation.mutate(search)}
                      disabled={runSearchMutation.isPending}
                      data-testid={`button-run-${search.id}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Now
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                      data-testid={`button-history-${search.id}`}
                    >
                      <Link href={`/history?keyword=${encodeURIComponent(search.keyword)}&location=${encodeURIComponent(search.location)}`}>
                        <History className="w-4 h-4 mr-2" />
                        History
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
