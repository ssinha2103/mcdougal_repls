import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MetaDescriptionResult {
  description: string;
  characterCount: number;
}

/**
 * Intelligently truncates a description to a maximum length
 * - Truncates at last complete word before maxLength
 * - Ensures proper punctuation (. or !) or adds ellipsis (...)
 * @param description The description to truncate
 * @param maxLength Maximum length (default 160)
 * @returns Truncated description
 */
function truncateDescription(description: string, maxLength: number = 160): string {
  // If already within limit, return as is
  if (description.length <= maxLength) {
    return description;
  }

  // Need to truncate - start by taking substring up to maxLength
  let truncated = description.substring(0, maxLength);
  
  // Find the last space to ensure we break at a word boundary
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }
  
  // Trim any trailing whitespace or commas/semicolons/colons
  truncated = truncated.replace(/[,;:\s]+$/, '');
  
  // Check if the last character is proper punctuation (. or !)
  const lastChar = truncated.charAt(truncated.length - 1);
  
  if (lastChar === '.' || lastChar === '!') {
    // Already ends with proper punctuation
    return truncated;
  }
  
  // Need to add ellipsis - make sure it fits within maxLength
  if (truncated.length + 3 > maxLength) {
    // Need to shorten further to accommodate ellipsis
    while (truncated.length + 3 > maxLength && truncated.length > 0) {
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace).replace(/[,;:\s]+$/, '');
      } else {
        // No spaces left, just truncate to fit
        truncated = truncated.substring(0, maxLength - 3);
        break;
      }
    }
  }
  
  return truncated + '...';
}

export async function generateMetaDescriptions(
  topic: string,
  primaryKeyword: string,
  secondaryKeyword?: string
): Promise<MetaDescriptionResult[]> {
  try {
    const keywords = secondaryKeyword
      ? `"${primaryKeyword}" and "${secondaryKeyword}"`
      : `"${primaryKeyword}"`;

    const systemPrompt = `You are an expert SEO copywriter specializing in meta descriptions. 
Your task is to generate compelling, SEO-optimized meta descriptions that:
1. MUST BE between 150-160 characters in length (THIS IS CRITICAL - COUNT EVERY CHARACTER)
2. Naturally incorporate the specified keywords
3. Include a clear call-to-action (CTA) that encourages clicks
4. Are unique and distinct from each other
5. Are engaging and persuasive
6. Accurately represent the webpage content

CRITICAL REQUIREMENT: Each description MUST be 150-160 characters. If a description exceeds 160 characters, you MUST shorten it. If it's under 150 characters, you MUST expand it with relevant details.

Respond with JSON in this exact format:
{
  "descriptions": [
    { "description": "your meta description here", "characterCount": 157 },
    { "description": "another meta description", "characterCount": 159 },
    { "description": "third meta description", "characterCount": 156 },
    { "description": "fourth meta description", "characterCount": 158 },
    { "description": "fifth meta description", "characterCount": 160 }
  ]
}

Generate exactly 5 distinct meta descriptions. VERIFY that each one is 150-160 characters before including it in the response.`;

    const userPrompt = `Generate 5 unique meta descriptions for a webpage about: ${topic}

Target keywords to incorporate naturally: ${keywords}

Remember:
- Each description must be 155-160 characters
- Include a compelling CTA in each
- Make them distinct from each other
- Incorporate the keywords naturally
- Be specific and actionable`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            descriptions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  characterCount: { type: "number" },
                },
                required: ["description", "characterCount"],
              },
            },
          },
          required: ["descriptions"],
        },
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
    });

    // Extract text from response using robust candidate/parts iteration
    let rawJson = "";
    
    if (response.candidates && response.candidates.length > 0) {
      // Iterate through ALL candidates to collect text
      for (const candidate of response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.text) {
              rawJson += part.text;
            }
          }
        }
      }
    }

    if (!rawJson) {
      throw new Error("Empty response from Gemini - no text content in candidates");
    }

    const data = JSON.parse(rawJson);

    if (!data.descriptions || !Array.isArray(data.descriptions)) {
      throw new Error("Invalid response format from Gemini - missing descriptions array");
    }

    // Validate, truncate, and ensure character counts are accurate
    const descriptions = data.descriptions.map((item: any) => {
      const truncatedDesc = truncateDescription(item.description);
      return {
        description: truncatedDesc,
        characterCount: truncatedDesc.length,
      };
    });

    return descriptions;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to generate meta descriptions: ${error instanceof Error ? error.message : String(error)}`);
  }
}
