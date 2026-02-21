import { z } from "zod";

// Text Analysis Request
export const analyzeTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  keyword: z.string().min(1, "Keyword is required"),
});

export type AnalyzeTextRequest = z.infer<typeof analyzeTextSchema>;

// Word Frequency Item
export interface WordFrequency {
  word: string;
  count: number;
}

// N-gram (phrase) Item
export interface NGram {
  phrase: string;
  count: number;
}

// Readability Score Interpretation
export type ReadabilityLevel = 
  | "very_easy"
  | "easy"
  | "fairly_easy"
  | "standard"
  | "fairly_difficult"
  | "difficult"
  | "very_difficult";

export interface ReadabilityScore {
  fleschReadingEase: {
    score: number;
    interpretation: string;
    level: ReadabilityLevel;
  };
  fleschKincaid: {
    gradeLevel: number;
    interpretation: string;
  };
  smogIndex: {
    gradeLevel: number;
    interpretation: string;
  };
  colemanLiau: {
    gradeLevel: number;
    interpretation: string;
  };
}

// Keyword Density Result
export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number; // percentage
  status: "low" | "optimal" | "warning" | "danger"; // based on density ranges
}

// Keyword Suggestion
export interface KeywordSuggestion {
  keyword: string;
  score: number;
  frequency: number;
  relevance: "high" | "medium" | "low";
}

// Complete Analysis Response
export interface TextAnalysis {
  keywordDensity: KeywordDensity;
  readability: ReadabilityScore;
  wordFrequencies: WordFrequency[];
  bigrams: NGram[];
  trigrams: NGram[];
  keywordSuggestions: KeywordSuggestion[];
  totalWords: number;
  totalSentences: number;
}
