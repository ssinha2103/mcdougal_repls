import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Search, Play, Eye, MessageSquare, Calendar, Copy, ExternalLink, ArrowLeft, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchResponse, VideoResult } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchPage() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const initialKeyword = params.get("q") || "";
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [order, setOrder] = useState<string>("relevance");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchQuery)}&order=${order}`],
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchQuery(keyword.trim());
      setLocation(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10 h-10"
                  data-testid="input-search-bar"
                />
              </div>
            </form>
          </div>
        </div>

        {searchQuery && (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                  Results for "{searchQuery}"
                </h1>
                {data && (
                  <p className="text-muted-foreground" data-testid="text-results-count">
                    Found {data.totalResults.toLocaleString()} videos
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger className="w-[160px]" data-testid="select-sort-order">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Upload date</SelectItem>
                      <SelectItem value="viewCount">View count</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <Card className="p-8 text-center">
                <p className="text-destructive mb-2">Error loading results</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "Please try again"}
                </p>
              </Card>
            )}

            {data && data.videos.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </Card>
            )}

            {data && data.videos.length > 0 && (
              <Tabs defaultValue="results" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="results" data-testid="tab-results">
                    <Play className="h-4 w-4 mr-2" />
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="analytics" data-testid="tab-analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.videos.map((video: VideoResult) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onCopy={copyToClipboard}
                        formatNumber={formatNumber}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <MetricsDashboard videos={data.videos} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        {!searchQuery && (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enter a keyword to begin</h3>
            <p className="text-muted-foreground">
              Search for any topic to discover top-ranking YouTube videos
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

function VideoCard({ 
  video, 
  onCopy, 
  formatNumber, 
  formatDate 
}: { 
  video: VideoResult; 
  onCopy: (text: string, label: string) => void;
  formatNumber: (num: string) => string;
  formatDate: (date: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-video-${video.id}`}>
      <div className="relative aspect-video bg-muted">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <a 
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
          data-testid={`link-video-${video.id}`}
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          </div>
        </a>
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-semibold line-clamp-2 leading-snug" data-testid={`text-video-title-${video.id}`}>
          {video.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1" data-testid={`text-channel-${video.id}`}>
          {video.channelTitle}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" title="Views">
            <Eye className="h-3.5 w-3.5" />
            <span data-testid={`text-views-${video.id}`}>{formatNumber(video.viewCount)}</span>
          </div>
          {video.commentCount && (
            <div className="flex items-center gap-1" title="Comments">
              <MessageSquare className="h-3.5 w-3.5" />
              <span data-testid={`text-comments-${video.id}`}>{formatNumber(video.commentCount)}</span>
            </div>
          )}
          <div className="flex items-center gap-1" title="Published">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>

        {video.tags && video.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onCopy(video.tags!.join(', '), 'Tags')}
                data-testid={`button-copy-tags-${video.id}`}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, expanded ? undefined : 3).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs font-mono"
                  data-testid={`badge-tag-${idx}`}
                >
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setExpanded(!expanded)}
                  data-testid={`button-toggle-tags-${video.id}`}
                >
                  {expanded ? 'Show less' : `+${video.tags.length - 3} more`}
                </Button>
              )}
            </div>
          </div>
        )}

        {video.description && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {video.description}
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          asChild
        >
          <a 
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`button-view-video-${video.id}`}
          >
            View on YouTube
            <ExternalLink className="h-3.5 w-3.5 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
