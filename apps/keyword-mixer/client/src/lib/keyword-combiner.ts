// Utility functions for keyword combination logic

export interface CombinationOptions {
  pattern: 'full' | 'pairs' | 'custom';
  separator: string;
  includeReverse: boolean;
  includeOriginal: boolean;
  removeStopwords: boolean;
  lowercaseOutput: boolean;
}

export interface FilterOptions {
  minWords?: number;
  maxWords?: number;
  minChars?: number;
  maxChars?: number;
  mustInclude?: string;
  mustExclude?: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
]);

export function calculateTotalCombinations(groups: string[][]): number {
  return groups.reduce((acc, group) => {
    return acc === 0 ? group.length : acc * group.length;
  }, 0);
}

export function estimateProcessingTime(totalCombinations: number): number {
  // Rough estimate: 1000 combinations per millisecond
  return Math.max(0.1, totalCombinations / 1000000);
}

export function validateKeywordGroups(groups: Array<{ keywords: string[] }>): boolean {
  return groups.length > 0 && groups.every(group => group.keywords.length > 0);
}

export function formatKeywordForMatchType(keyword: string, matchType: string): string {
  switch (matchType) {
    case 'phrase':
      return `"${keyword}"`;
    case 'exact':
      return `[${keyword}]`;
    case 'modified':
      return keyword.split(' ').map(word => 
        STOPWORDS.has(word.toLowerCase()) ? word : `+${word}`
      ).join(' ');
    default:
      return keyword;
  }
}

export function removeStopwordsFromKeyword(keyword: string): string {
  const words = keyword.split(' ');
  const filtered = words.filter((word, index) => {
    // Keep stopwords in the middle, remove from start/end
    if (index === 0 || index === words.length - 1) {
      return !STOPWORDS.has(word.toLowerCase());
    }
    return true;
  });
  return filtered.join(' ');
}

export function applyFiltersToKeywords(keywords: string[], filters: FilterOptions): string[] {
  return keywords.filter(keyword => {
    const wordCount = keyword.split(' ').length;
    const charCount = keyword.length;

    // Word count filters
    if (filters.minWords && wordCount < filters.minWords) return false;
    if (filters.maxWords && wordCount > filters.maxWords) return false;

    // Character count filters
    if (filters.minChars && charCount < filters.minChars) return false;
    if (filters.maxChars && charCount > filters.maxChars) return false;

    // Must include filter
    if (filters.mustInclude && !keyword.toLowerCase().includes(filters.mustInclude.toLowerCase())) {
      return false;
    }

    // Must exclude filter
    if (filters.mustExclude && keyword.toLowerCase().includes(filters.mustExclude.toLowerCase())) {
      return false;
    }

    return true;
  });
}
