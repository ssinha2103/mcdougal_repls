import { GoogleGenAI } from "@google/genai";
import type { Headline, Tone } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const toneInstructions: Record<Tone, string> = {
  professional: "Maintain a professional, authoritative tone. Use industry terminology appropriately. Headlines should sound expert and trustworthy.",
  casual: "Use a conversational, friendly tone. Make headlines approachable and easy to understand. Avoid jargon and keep it relatable.",
  urgent: "Create a sense of urgency and immediate action. Use words like 'now', 'today', 'don't miss', 'limited time'. Make readers feel they need to act quickly.",
  friendly: "Be warm and welcoming. Use inclusive language and positive framing. Headlines should feel like advice from a helpful friend."
};

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
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
      console.error("Gemini response object:", JSON.stringify(response, null, 2));
      throw new Error("Empty response from AI model");
    }

    const data = JSON.parse(rawJson);
    
    if (!data.headlines || !Array.isArray(data.headlines)) {
      throw new Error("Invalid response format from AI model");
    }

    return data.headlines;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate headlines: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
