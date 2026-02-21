import type { Headline } from "@shared/schema";

export interface SavedHeadline extends Headline {
  id: string;
  savedAt: number;
  topic: string;
  tone: string;
}

const FAVORITES_KEY = "seo-headline-favorites";

export function getFavorites(): SavedHeadline[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading favorites:", error);
    return [];
  }
}

export function saveFavorite(headline: Headline, topic: string, tone: string): SavedHeadline {
  const favorites = getFavorites();
  const newFavorite: SavedHeadline = {
    ...headline,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    savedAt: Date.now(),
    topic,
    tone,
  };
  
  favorites.unshift(newFavorite);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  return newFavorite;
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorite(headline: Headline): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.text === headline.text);
}
