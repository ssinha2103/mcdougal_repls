import type { Headline } from "@shared/schema";

const powerWords = [
  "proven", "essential", "ultimate", "secret", "expert", "simple", "quick",
  "best", "top", "complete", "amazing", "effective", "powerful", "critical",
  "incredible", "guaranteed", "advanced", "revolutionary", "game-changing",
  "exclusive", "instant", "perfect", "remarkable", "stunning", "breakthrough"
];

const urgentWords = [
  "now", "today", "immediately", "urgent", "limited", "don't miss", "hurry",
  "deadline", "expires", "last chance", "act now", "time-sensitive", "quickly"
];

const emotionalTriggers = [
  "you", "your", "free", "new", "save", "easy", "how", "why", "what",
  "discover", "learn", "master", "unlock", "transform", "boost", "avoid"
];

export function scoreHeadline(headline: Headline, topic: string): { seoScore: number; clickScore: number } {
  const text = headline.text.toLowerCase();
  const topicLower = topic.toLowerCase();
  
  let seoScore = 50;
  let clickScore = 50;
  
  const charCount = headline.characterCount;
  if (charCount >= 50 && charCount <= 70) {
    seoScore += 20;
  } else if (charCount > 70 && charCount <= 90) {
    seoScore += 10;
  } else if (charCount < 50) {
    seoScore -= 10;
  } else {
    seoScore -= 15;
  }
  
  if (text.includes(topicLower)) {
    seoScore += 15;
    const firstThird = text.substring(0, text.length / 3);
    if (firstThird.includes(topicLower)) {
      seoScore += 10;
    }
  }
  
  const numberMatch = text.match(/\d+/);
  if (numberMatch) {
    seoScore += 10;
    clickScore += 15;
  }
  
  if (headline.format === "question") {
    clickScore += 10;
  } else if (headline.format === "listicle") {
    seoScore += 5;
    clickScore += 12;
  } else if (headline.format === "how-to") {
    seoScore += 8;
    clickScore += 8;
  }
  
  const foundPowerWords = powerWords.filter(word => text.includes(word));
  seoScore += Math.min(foundPowerWords.length * 3, 15);
  clickScore += Math.min(foundPowerWords.length * 2, 10);
  
  const foundUrgentWords = urgentWords.filter(word => text.includes(word));
  clickScore += Math.min(foundUrgentWords.length * 5, 15);
  
  const foundEmotionalTriggers = emotionalTriggers.filter(word => text.includes(word));
  clickScore += Math.min(foundEmotionalTriggers.length * 2, 10);
  
  const words = text.split(/\s+/);
  if (words.length >= 6 && words.length <= 12) {
    seoScore += 5;
  }
  
  if (text.includes(":") || text.includes("-")) {
    clickScore += 5;
  }
  
  seoScore = Math.max(0, Math.min(100, seoScore));
  clickScore = Math.max(0, Math.min(100, clickScore));
  
  return { seoScore, clickScore };
}

export function scoreHeadlines(headlines: Headline[], topic: string): Headline[] {
  return headlines.map(headline => {
    const { seoScore, clickScore } = scoreHeadline(headline, topic);
    return {
      ...headline,
      seoScore,
      clickScore
    };
  });
}
