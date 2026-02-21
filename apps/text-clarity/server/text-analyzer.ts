import type { 
  TextAnalysis, 
  KeywordDensity, 
  ReadabilityScore, 
  WordFrequency, 
  NGram,
  ReadabilityLevel,
  KeywordSuggestion 
} from "@shared/schema";

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will',
  'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where',
  'who', 'which', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
  'now', 'i', 'you', 'your', 'their', 'we', 'our', 'been', 'were', 'would',
]);

/**
 * Tokenize text into words
 * Treats hyphens as word separators so "AI-powered" becomes ["ai", "powered"]
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Remove stop words from tokens
 */
function removeStopWords(tokens: string[]): string[] {
  return tokens.filter(token => !STOP_WORDS.has(token) && token.length > 1);
}

/**
 * Count syllables in a word (approximation for Flesch-Kincaid)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  // Remove silent e at the end
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
}

/**
 * Split text into sentences
 */
function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(
  text: string,
  keyword: string
): KeywordDensity {
  const tokens = tokenize(text);
  const totalWords = tokens.length;
  const keywordTokens = tokenize(keyword);
  const keywordLength = keywordTokens.length;

  let count = 0;

  // Search for exact phrase or individual keyword
  if (keywordLength === 1) {
    count = tokens.filter(token => token === keywordTokens[0]).length;
  } else {
    // Multi-word keyword - search for phrase
    for (let i = 0; i <= tokens.length - keywordLength; i++) {
      const phrase = tokens.slice(i, i + keywordLength).join(' ');
      if (phrase === keywordTokens.join(' ')) {
        count++;
      }
    }
  }

  const density = totalWords > 0 ? (count / totalWords) * 100 : 0;

  let status: "low" | "optimal" | "warning" | "danger";
  if (density < 0.5) {
    status = "low";
  } else if (density >= 0.5 && density <= 2.5) {
    status = "optimal";
  } else if (density > 2.5 && density <= 4) {
    status = "warning";
  } else {
    status = "danger";
  }

  return {
    keyword,
    count,
    density,
    status,
  };
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return n + "st";
  if (j === 2 && k !== 12) return n + "nd";
  if (j === 3 && k !== 13) return n + "rd";
  return n + "th";
}

/**
 * Get grade level interpretation
 */
function getGradeInterpretation(grade: number): string {
  if (grade <= 6) return `${getOrdinalSuffix(grade)} grade`;
  if (grade <= 8) return `${getOrdinalSuffix(grade)}-${getOrdinalSuffix(grade + 1)} grade`;
  if (grade <= 12) return `${getOrdinalSuffix(grade)} grade - High School`;
  if (grade <= 16) return `College Level`;
  return `College Graduate Level`;
}

/**
 * Count polysyllabic words (3+ syllables) for SMOG index
 */
function countPolysyllabicWords(tokens: string[]): number {
  return tokens.filter(word => countSyllables(word) >= 3).length;
}

/**
 * Calculate Flesch-Kincaid readability score
 */
export function calculateReadability(text: string): ReadabilityScore {
  const sentences = getSentences(text);
  const tokens = tokenize(text);
  
  const totalSentences = sentences.length;
  const totalWords = tokens.length;
  const totalSyllables = tokens.reduce((sum, word) => sum + countSyllables(word), 0);
  const polysyllabicWords = countPolysyllabicWords(tokens);

  const avgWordsPerSentence = totalWords / Math.max(totalSentences, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(totalWords, 1);

  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const freScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  const clampedFREScore = Math.max(0, Math.min(100, freScore));

  let level: ReadabilityLevel;
  let freInterpretation: string;

  if (clampedFREScore >= 90) {
    level = "very_easy";
    freInterpretation = "Very Easy (5th grade)";
  } else if (clampedFREScore >= 80) {
    level = "easy";
    freInterpretation = "Easy (6th grade)";
  } else if (clampedFREScore >= 70) {
    level = "fairly_easy";
    freInterpretation = "Fairly Easy (7th grade)";
  } else if (clampedFREScore >= 60) {
    level = "standard";
    freInterpretation = "Standard (8th-9th grade)";
  } else if (clampedFREScore >= 50) {
    level = "fairly_difficult";
    freInterpretation = "Fairly Difficult (10th-12th grade)";
  } else if (clampedFREScore >= 30) {
    level = "difficult";
    freInterpretation = "Difficult (College)";
  } else {
    level = "very_difficult";
    freInterpretation = "Very Difficult (College graduate)";
  }

  // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fkGradeLevel = Math.max(1, Math.round(
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  ));

  // SMOG Index: 1.043 * sqrt(polysyllables * (30 / sentences)) + 3.1291
  const smogScore = totalSentences >= 3 
    ? 1.043 * Math.sqrt(polysyllabicWords * (30 / totalSentences)) + 3.1291
    : fkGradeLevel; // Fallback to FK for short texts
  const smogGradeLevel = Math.max(1, Math.round(smogScore));

  // Coleman-Liau Index: 0.0588 * L - 0.296 * S - 15.8
  // L = average number of letters per 100 words
  // S = average number of sentences per 100 words
  const totalLetters = tokens.join('').length;
  const L = (totalLetters / Math.max(totalWords, 1)) * 100;
  const S = (totalSentences / Math.max(totalWords, 1)) * 100;
  const colemanScore = 0.0588 * L - 0.296 * S - 15.8;
  const colemanGradeLevel = Math.max(1, Math.round(colemanScore));

  return {
    fleschReadingEase: {
      score: clampedFREScore,
      interpretation: freInterpretation,
      level,
    },
    fleschKincaid: {
      gradeLevel: fkGradeLevel,
      interpretation: getGradeInterpretation(fkGradeLevel),
    },
    smogIndex: {
      gradeLevel: smogGradeLevel,
      interpretation: getGradeInterpretation(smogGradeLevel),
    },
    colemanLiau: {
      gradeLevel: colemanGradeLevel,
      interpretation: getGradeInterpretation(colemanGradeLevel),
    },
  };
}

/**
 * Get word frequencies (excluding stop words)
 */
export function getWordFrequencies(text: string, limit: number = 20): WordFrequency[] {
  const tokens = tokenize(text);
  const filteredTokens = removeStopWords(tokens);
  
  const frequencyMap = new Map<string, number>();
  
  filteredTokens.forEach(token => {
    frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Extract n-grams (bigrams or trigrams)
 */
export function getNGrams(text: string, n: number, limit: number = 15): NGram[] {
  const tokens = tokenize(text);
  const ngramMap = new Map<string, number>();

  for (let i = 0; i <= tokens.length - n; i++) {
    const ngram = tokens.slice(i, i + n).join(' ');
    ngramMap.set(ngram, (ngramMap.get(ngram) || 0) + 1);
  }

  return Array.from(ngramMap.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .filter(item => item.count > 1) // Only show repeated phrases
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Generate keyword suggestions based on content analysis
 */
export function getKeywordSuggestions(text: string, limit: number = 10): KeywordSuggestion[] {
  const tokens = tokenize(text);
  const filteredTokens = removeStopWords(tokens);
  const totalWords = filteredTokens.length;

  // Get word frequencies
  const wordFreq = new Map<string, number>();
  filteredTokens.forEach(token => {
    wordFreq.set(token, (wordFreq.get(token) || 0) + 1);
  });

  // Get bigram frequencies
  const bigramFreq = new Map<string, number>();
  for (let i = 0; i <= filteredTokens.length - 2; i++) {
    const bigram = filteredTokens.slice(i, i + 2).join(' ');
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
  }

  const suggestions: KeywordSuggestion[] = [];

  // Add single-word suggestions
  wordFreq.forEach((count, word) => {
    if (word.length >= 3) { // Only suggest words with 3+ characters
      const density = (count / totalWords) * 100;
      const score = count * (word.length / 10); // Score based on frequency and word length
      
      let relevance: "high" | "medium" | "low";
      if (density >= 1.5) relevance = "high";
      else if (density >= 0.8) relevance = "medium";
      else relevance = "low";

      suggestions.push({
        keyword: word,
        score,
        frequency: count,
        relevance,
      });
    }
  });

  // Add bigram suggestions (2-word phrases)
  bigramFreq.forEach((count, phrase) => {
    if (count >= 2) { // Only suggest repeated bigrams
      const density = (count / totalWords) * 100;
      const score = count * 1.5; // Bigrams get a boost
      
      let relevance: "high" | "medium" | "low";
      if (density >= 1) relevance = "high";
      else if (density >= 0.5) relevance = "medium";
      else relevance = "low";

      suggestions.push({
        keyword: phrase,
        score,
        frequency: count,
        relevance,
      });
    }
  });

  // Sort by score (descending) and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Analyze complete text
 */
export function analyzeText(text: string, keyword: string): TextAnalysis {
  const tokens = tokenize(text);
  const sentences = getSentences(text);

  return {
    keywordDensity: calculateKeywordDensity(text, keyword),
    readability: calculateReadability(text),
    wordFrequencies: getWordFrequencies(text, 20),
    bigrams: getNGrams(text, 2, 15),
    trigrams: getNGrams(text, 3, 15),
    keywordSuggestions: getKeywordSuggestions(text, 10),
    totalWords: tokens.length,
    totalSentences: sentences.length,
  };
}
