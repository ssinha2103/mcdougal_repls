import { type Search, type InsertSearch, type SearchHistoryItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Search history methods
  createSearch(search: InsertSearch): Promise<Search>;
  getSearchHistory(): Promise<SearchHistoryItem[]>;
}

export class MemStorage implements IStorage {
  private searches: Map<string, Search>;

  constructor() {
    this.searches = new Map();
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = {
      ...insertSearch,
      id,
      timestamp: new Date(),
    };
    this.searches.set(id, search);
    return search;
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const allSearches = Array.from(this.searches.values());
    // Sort by timestamp descending (most recent first)
    allSearches.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allSearches.map(search => ({
      id: search.id,
      keyword: search.keyword,
      timestamp: search.timestamp.toISOString(),
    }));
  }
}

export const storage = new MemStorage();
