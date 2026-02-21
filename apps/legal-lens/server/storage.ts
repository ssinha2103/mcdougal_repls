// Storage interface for the Local Legal SERP Analyzer
// Using PostgreSQL database with Drizzle ORM (blueprint:javascript_database)

import { db } from "./db";
import { savedSearches, searchResults, type SavedSearch, type InsertSavedSearch, type SearchResult, type InsertSearchResult } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Saved Searches
  getSavedSearches(): Promise<SavedSearch[]>;
  getSavedSearch(id: number): Promise<SavedSearch | undefined>;
  createSavedSearch(data: InsertSavedSearch): Promise<SavedSearch>;
  updateSavedSearch(id: number, data: Partial<InsertSavedSearch>): Promise<SavedSearch | undefined>;
  deleteSavedSearch(id: number): Promise<void>;
  
  // Search Results (Historical Data)
  getSearchResults(savedSearchId: number): Promise<SearchResult[]>;
  getLatestSearchResult(savedSearchId: number): Promise<SearchResult | undefined>;
  createSearchResult(data: InsertSearchResult): Promise<SearchResult>;
  getSearchResultsByKeywordLocation(keyword: string, location: string): Promise<SearchResult[]>;
}

export class DatabaseStorage implements IStorage {
  // Saved Searches
  async getSavedSearches(): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches).orderBy(desc(savedSearches.createdAt));
  }

  async getSavedSearch(id: number): Promise<SavedSearch | undefined> {
    const [result] = await db.select().from(savedSearches).where(eq(savedSearches.id, id));
    return result || undefined;
  }

  async createSavedSearch(data: InsertSavedSearch): Promise<SavedSearch> {
    const [result] = await db.insert(savedSearches).values(data).returning();
    return result;
  }

  async updateSavedSearch(id: number, data: Partial<InsertSavedSearch>): Promise<SavedSearch | undefined> {
    const [result] = await db.update(savedSearches)
      .set({ ...data, lastRun: new Date() })
      .where(eq(savedSearches.id, id))
      .returning();
    return result || undefined;
  }

  async deleteSavedSearch(id: number): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }

  // Search Results
  async getSearchResults(savedSearchId: number): Promise<SearchResult[]> {
    return await db.select()
      .from(searchResults)
      .where(eq(searchResults.savedSearchId, savedSearchId))
      .orderBy(desc(searchResults.timestamp));
  }

  async getLatestSearchResult(savedSearchId: number): Promise<SearchResult | undefined> {
    const [result] = await db.select()
      .from(searchResults)
      .where(eq(searchResults.savedSearchId, savedSearchId))
      .orderBy(desc(searchResults.timestamp))
      .limit(1);
    return result || undefined;
  }

  async createSearchResult(data: InsertSearchResult): Promise<SearchResult> {
    const [result] = await db.insert(searchResults).values(data).returning();
    return result;
  }

  async getSearchResultsByKeywordLocation(keyword: string, location: string): Promise<SearchResult[]> {
    return await db.select()
      .from(searchResults)
      .where(and(
        eq(searchResults.keyword, keyword),
        eq(searchResults.location, location)
      ))
      .orderBy(desc(searchResults.timestamp));
  }
}

export const storage = new DatabaseStorage();
