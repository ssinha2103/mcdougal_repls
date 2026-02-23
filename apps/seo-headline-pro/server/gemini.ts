import { GoogleGenAI } from "@google/genai";
import type { Headline, Tone } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const googleApiKey = process.env.GOOGLE_API_KEY?.trim();
const selectedApiKey = geminiApiKey || googleApiKey || "";

if (geminiApiKey && googleApiKey && geminiApiKey !== googleApiKey) {
  // @google/genai prefers GOOGLE_API_KEY when both env vars exist.
  // Keep them aligned so this service consistently uses the GEMINI key.
  process.env.GOOGLE_API_KEY = geminiApiKey;
}

const ai = new GoogleGenAI({ apiKey: selectedApiKey });

const toneInstructions: Record<Tone, string> = {
  professional: "Maintain a professional, authoritative tone. Use industry terminology appropriately. Headlines should sound expert and trustworthy.",
  casual: "Use a conversational, friendly tone. Make headlines approachable and easy to understand. Avoid jargon and keep it relatable.",
  urgent: "Create a sense of urgency and immediate action. Use words like 'now', 'today', 'don't miss', 'limited time'. Make readers feel they need to act quickly.",
  friendly: "Be warm and welcoming. Use inclusive language and positive framing. Headlines should feel like advice from a helpful friend."
};

const allowedFormats: Headline["format"][] = [
  "listicle",
  "question",
  "how-to",
  "benefit",
  "guide",
  "comparison",
  "ultimate",
  "tips",
];

function normalizeFormat(value: string | undefined, fallbackText: string): Headline["format"] {
  if (value && allowedFormats.includes(value as Headline["format"])) {
    return value as Headline["format"];
  }

  const text = fallbackText.toLowerCase();
  if (text.includes("?")) return "question";
  if (text.includes("how to") || text.includes("step-by-step")) return "how-to";
  if (text.includes("ultimate") || text.includes("complete guide")) return "ultimate";
  if (text.includes("vs")) return "comparison";
  if (text.match(/\d+/)) return "listicle";
  if (text.includes("tips")) return "tips";
  if (text.includes("guide")) return "guide";
  return "benefit";
}

function parseHeadlines(rawJson: string): Headline[] {
  const cleaned = rawJson
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  const data = JSON.parse(cleaned);
  if (!data?.headlines || !Array.isArray(data.headlines)) {
    throw new Error("Invalid response format from AI model");
  }

  return data.headlines
    .map((item: any) => {
      const text = typeof item?.text === "string" ? item.text.trim() : "";
      if (!text) return null;

      return {
        text,
        format: normalizeFormat(item?.format, text),
        characterCount: text.length,
      } as Headline;
    })
    .filter((item: Headline | null): item is Headline => Boolean(item));
}

function getModelCandidates(): string[] {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const candidates = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
  ].filter((model): model is string => Boolean(model));

  return Array.from(new Set(candidates));
}

function generateFallbackHeadlines(topic: string, tone: Tone): Headline[] {
  const topicText = topic.trim();
  const starters: Record<Tone, string> = {
    professional: "Proven",
    casual: "Easy",
    urgent: "Now",
    friendly: "Friendly",
  };

  const templates: Array<{ text: string; format: Headline["format"] }> = [
    { text: `10 ${starters[tone]} ${topicText} Strategies That Drive Better Results`, format: "listicle" },
    { text: `How to Improve ${topicText} in 30 Days: A Step-by-Step Plan`, format: "how-to" },
    { text: `What Is the Best Way to Approach ${topicText} Today?`, format: "question" },
    { text: `The Ultimate Guide to ${topicText} for 2026`, format: "ultimate" },
    { text: `${topicText} vs Traditional Methods: Which One Wins?`, format: "comparison" },
    { text: `7 Common ${topicText} Mistakes and How to Avoid Them`, format: "listicle" },
    { text: `Quick ${topicText} Tips You Can Use Right Now`, format: "tips" },
    { text: `How ${topicText} Can Boost Growth for Your Business`, format: "benefit" },
    { text: `Beginner's Guide to ${topicText}: Where to Start`, format: "guide" },
    { text: `12 Expert ${topicText} Ideas for Faster Results`, format: "listicle" },
  ];

  return templates.map((item) => ({
    text: item.text,
    format: item.format,
    characterCount: item.text.length,
  }));
}

export async function generateHeadlines(topic: string, tone: Tone = "professional"): Promise<Headline[]> {
  const toneGuidance = toneInstructions[tone];
  
  const systemPrompt = `You are an expert SEO copywriter and headline specialist with 15+ years of experience. Your headlines consistently achieve high click-through rates and rank well in search engines.

Your task is to generate exactly 8 or 10 diverse, compelling, and SEO-optimized headlines for the given topic or keyword. 

TONE REQUIREMENT:
${toneGuidance}

REQUIREMENTS:
1. Naturally incorporate the target keyword/topic into each headline
2. Create headlines in diverse formats:
   - Listicles (numbered lists): "7 Ways to...", "10 Best...", "15 Tips for..."
   - Questions: "How Can You...?", "What Are The Best...?", "Why Do..."
   - How-To Guides: "How to...", "Step-by-Step Guide to..."
   - Benefit-Driven: Focus on outcomes and results
   - Ultimate Guides: "The Ultimate Guide to...", "Complete Guide to..."
   - Comparisons: "X vs Y:", "Best ... Compared"
   - Tips & Tricks: "Expert Tips for...", "Pro Secrets to..."

3. Each headline should:
   - Be 50-70 characters for optimal SEO (can extend to 90 for compelling headlines)
   - Include power words appropriate for the tone (proven, essential, ultimate, secret, expert, simple, quick)
   - Be specific and actionable
   - Promise clear value to the reader
   - Be naturally readable (not keyword-stuffed)

4. Vary the headline styles to give diverse options
5. Make them click-worthy while matching the requested tone

Respond with JSON in this exact format:
{
  "headlines": [
    {
      "text": "The headline text here",
      "format": "listicle|question|how-to|benefit|guide|comparison|ultimate|tips",
      "characterCount": 65
    }
  ]
}`;

  const models = getModelCandidates();
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              headlines: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    format: { type: "string" },
                    characterCount: { type: "number" },
                  },
                  required: ["text", "format", "characterCount"],
                },
              },
            },
            required: ["headlines"],
          },
        },
        contents: `Generate SEO-optimized headlines for the following topic/keyword: ${topic}`,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from AI model");
      }

      const parsed = parseHeadlines(rawJson);
      if (parsed.length > 0) {
        return parsed.slice(0, 10);
      }

      throw new Error("No headlines returned by AI model");
    } catch (error) {
      lastError = error;
      console.error(`Gemini API error with model ${model}:`, error);
    }
  }

  console.error("All Gemini models failed; using deterministic fallback headlines.", lastError);
  return generateFallbackHeadlines(topic, tone);
}
