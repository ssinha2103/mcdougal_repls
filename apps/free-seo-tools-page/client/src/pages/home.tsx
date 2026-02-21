import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Tool } from "@shared/schema";
import { Search, ExternalLink, Heart, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const { data: popularTools = [] } = useQuery<{ toolId: string; clickCount: number; tool?: Tool }[]>({
    queryKey: ["/api/analytics/popular"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("seo-tools-favorites");
    if (stored) {
      try {
        const favArray = JSON.parse(stored) as string[];
        setFavorites(new Set(favArray));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
  }, []);

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(toolId)) {
        newFavorites.delete(toolId);
      } else {
        newFavorites.add(toolId);
      }
      localStorage.setItem("seo-tools-favorites", JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];

    if (showFavoritesOnly) {
      result = result.filter((tool) => favorites.has(tool.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.categories.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((tool) =>
        tool.categories.includes(selectedCategory)
      );
    }

    if (sortBy === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "new") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [tools, searchQuery, selectedCategory, sortBy, showFavoritesOnly, favorites]);

  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedTools.slice(startIndex, endIndex);
  }, [filteredAndSortedTools, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTools.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, showFavoritesOnly]);

  const allCategories = useMemo(
    () => Array.from(new Set(tools.flatMap((tool) => tool.categories))).sort(),
    [tools]
  );

  const trackClickMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return apiRequest("POST", "/api/analytics/click", { toolId });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="rounded-[20px] p-8 sm:p-12 mb-8 sm:mb-12 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #f2f8ff 0%, #eaf6ff 50%, #ffffff 100%)",
            }}>
            <div className="h-10 bg-primary/20 rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-primary/10 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-primary/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          className="rounded-[20px] p-8 sm:p-12 mb-8 sm:mb-12 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #f2f8ff 0%, #eaf6ff 50%, #ffffff 100%)",
          }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4" data-testid="text-page-title">
            Free SEO Tools Directory
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl" data-testid="text-page-description">
            Discover our comprehensive collection of professional SEO tools. Analyze, optimize, and improve your website's search engine performance with ease.
          </p>
        </div>

        {popularTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">Popular Tools</h2>
            <div className="flex flex-wrap gap-2">
              {popularTools.map((item) => item.tool && (
                <Link key={item.toolId} href={`/tool/${item.toolId}`}>
                  <Badge
                    variant="outline"
                    className="text-sm border-card-border hover-elevate cursor-pointer px-3 py-1.5"
                    data-testid={`badge-popular-${item.toolId}`}
                  >
                    {item.tool.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({item.clickCount} {item.clickCount === 1 ? 'click' : 'clicks'})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-card-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Search SEO tools"
              data-testid="input-search"
            />
          </div>

          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="sm:w-auto rounded-xl"
            data-testid="button-toggle-favorites"
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
            Favorites {favorites.size > 0 && `(${favorites.size})`}
          </Button>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger 
              className="sm:w-[200px] rounded-xl border-card-border shadow-sm"
              aria-label="Filter by category"
              data-testid="select-category"
            >
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger 
              className="sm:w-[200px] rounded-xl border-card-border shadow-sm"
              aria-label="Sort tools"
              data-testid="select-sort"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A to Z</SelectItem>
              <SelectItem value="za">Z to A</SelectItem>
              <SelectItem value="new">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          aria-live="polite"
          aria-atomic="false"
        >
          {paginatedTools.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-lg" data-testid="text-no-results">
                No tools found matching your criteria
              </p>
            </div>
          ) : (
            paginatedTools.map((tool) => (
              <Card
                key={tool.id}
                className="flex flex-col rounded-2xl border border-card-border hover-elevate transition-all duration-200"
                style={{
                  boxShadow: "0 10px 28px rgba(0,0,0,.06)",
                }}
                data-testid={`card-tool-${tool.id}`}
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-primary leading-tight flex-1">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline focus:outline-2 focus:outline-primary/30 focus:outline-offset-2 rounded-sm"
                        data-testid={`link-tool-${tool.id}`}
                      >
                        {tool.name}
                      </a>
                    </CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(tool.id);
                      }}
                      className="shrink-0"
                      data-testid={`button-favorite-${tool.id}`}
                      aria-label={favorites.has(tool.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(tool.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed min-h-[3rem]">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="text-xs border-card-border text-primary bg-background font-medium px-2.5 py-0.5"
                        data-testid={`badge-category-${category}`}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex gap-2">
                  <Link href={`/tool/${tool.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full rounded-lg"
                      data-testid={`button-view-details-${tool.id}`}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    asChild
                    className="flex-1 font-extrabold rounded-lg shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #46b9fd, #0e73b8)",
                    }}
                    data-testid={`button-open-tool-${tool.id}`}
                  >
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                      onClick={() => trackClickMutation.mutate(tool.id)}
                    >
                      Open Tool
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        )}

        {filteredAndSortedTools.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground" data-testid="text-results-count">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedTools.length)} of {filteredAndSortedTools.length} tools
          </div>
        )}
      </div>
    </div>
  );
}
