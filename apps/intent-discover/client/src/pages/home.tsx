import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SearchForm } from "@/components/search-form";
import { ResultsSection } from "@/components/results-section";
import { ContentInsights } from "@/components/content-insights";
import { SearchHistory } from "@/components/search-history";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SearchResult, SearchHistoryItem } from "@shared/schema";

export default function Home() {
  const [currentKeyword, setCurrentKeyword] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  // Fetch search history
  const { data: history = [] } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/history"],
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await apiRequest("POST", "/api/search", { keyword });
      const data = await response.json();
      return data as SearchResult;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      setCurrentKeyword(data.keyword);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "Failed to fetch search results. Please try again.",
      });
    },
  });

  const handleSearch = (keyword: string) => {
    setCurrentKeyword(keyword);
    searchMutation.mutate(keyword);
  };

  const handleHistorySelect = (keyword: string) => {
    handleSearch(keyword);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mx-auto mb-12 max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Unlock Search Intent Insights
            </h2>
            <p className="text-lg text-muted-foreground">
              Extract Google's "People Also Ask" questions and Related Searches to understand
              what your audience is searching for
            </p>
          </div>
          <SearchForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
        </div>

        {/* Results Section */}
        <div className="mx-auto max-w-6xl space-y-6">
          {searchMutation.isPending ? (
            <LoadingSkeleton />
          ) : searchResult ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Results for: <span className="font-mono text-primary">{searchResult.keyword}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchResult.timestamp ? new Date(searchResult.timestamp).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
              <ResultsSection
                paaQuestions={searchResult.paaQuestions}
                relatedSearches={searchResult.relatedSearches}
                keyword={searchResult.keyword}
                onRelatedSearchClick={handleSearch}
              />
              
              {/* Content Insights */}
              <ContentInsights
                paaQuestions={searchResult.paaQuestions}
                relatedSearches={searchResult.relatedSearches}
                keyword={searchResult.keyword}
              />
            </>
          ) : (
            <EmptyState />
          )}

          {/* Search History */}
          {history.length > 0 && !searchMutation.isPending && (
            <SearchHistory history={history} onSelectKeyword={handleHistorySelect} />
          )}
        </div>
      </main>
    </div>
  );
}
