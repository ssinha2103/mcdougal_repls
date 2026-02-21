import { type AnalysisResult } from "@shared/schema";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<AnalysisResult>>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  
  constructor(maxSize: number = 100, ttlMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  private getCacheKey(url: string): string {
    // Normalize URL for consistent caching
    try {
      const urlObj = new URL(url);
      // Remove hash and sort query params for consistent keys
      urlObj.hash = '';
      const params = new URLSearchParams(urlObj.search);
      const sortedParams = new URLSearchParams([...params].sort());
      urlObj.search = sortedParams.toString();
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
  
  get(url: string): AnalysisResult | null {
    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update hit count
    entry.hits++;
    
    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    console.log(`[Cache] Hit for ${url} (${entry.hits} hits)`);
    return entry.data;
  }
  
  set(url: string, data: AnalysisResult): void {
    const key = this.getCacheKey(url);
    
    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Evict least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        console.log(`[Cache] Evicted ${firstKey} (cache full)`);
      }
    }
    
    const entry: CacheEntry<AnalysisResult> = {
      data,
      timestamp: Date.now(),
      hits: 0
    };
    
    this.cache.set(key, entry);
    console.log(`[Cache] Stored ${url} (cache size: ${this.cache.size}/${this.maxSize})`);
  }
  
  has(url: string): boolean {
    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  invalidate(url: string): boolean {
    const key = this.getCacheKey(url);
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] Invalidated ${url}`);
    }
    return deleted;
  }
  
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] Cleared ${size} entries`);
  }
  
  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`[Cache] Cleaned up ${expiredCount} expired entries`);
    }
  }
  
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    avgHitsPerEntry: number;
  } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    
    const size = this.cache.size;
    const avgHitsPerEntry = size > 0 ? totalHits / size : 0;
    const hitRate = size > 0 ? (totalHits / (totalHits + size)) * 100 : 0;
    
    return {
      size,
      maxSize: this.maxSize,
      hitRate,
      totalHits,
      avgHitsPerEntry
    };
  }
}

// Global cache instance
export const analysisCache = new CacheService(100, 30); // 100 items, 30 minutes TTL