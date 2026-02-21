import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeadlineCard } from "@/components/headline-card";
import { Star, Trash2, ArrowLeft } from "lucide-react";
import { getFavorites, removeFavorite, type SavedHeadline } from "@/lib/favorites";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Favorites() {
  const [favorites, setFavorites] = useState<SavedHeadline[]>([]);

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      favorites.forEach(fav => removeFavorite(fav.id));
      setFavorites([]);
    }
  };

  const groupedByTopic = favorites.reduce((acc, fav) => {
    const key = `${fav.topic} (${fav.tone})`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(fav);
    return acc;
  }, {} as Record<string, SavedHeadline[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Saved Headlines
                </h1>
              </div>
              <p className="text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'headline' : 'headlines'} saved
              </p>
            </div>
            
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                data-testid="button-clear-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Saved Headlines Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Click the star icon on any headline to save it for later reference.
              </p>
              <Link href="/">
                <Button data-testid="button-start-generating">
                  Start Generating Headlines
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByTopic).map(([topicKey, headlines]) => (
              <div key={topicKey} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {headlines[0].topic}
                  </h2>
                  <Badge variant="secondary" className="capitalize">
                    {headlines[0].tone}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {headlines.length} saved
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {headlines.map((headline, index) => (
                    <HeadlineCard
                      key={headline.id}
                      headline={headline}
                      index={index}
                      topic={headline.topic}
                      tone={headline.tone}
                      onFavoriteChange={loadFavorites}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
