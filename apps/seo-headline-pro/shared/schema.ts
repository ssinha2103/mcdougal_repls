import { z } from "zod";

export const toneOptions = ["professional", "casual", "urgent", "friendly"] as const;
export type Tone = typeof toneOptions[number];

export const generateHeadlinesSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic must be less than 500 characters"),
  tone: z.enum(toneOptions).optional(),
});

export type GenerateHeadlinesInput = z.infer<typeof generateHeadlinesSchema>;

export interface Headline {
  text: string;
  format: "listicle" | "question" | "how-to" | "benefit" | "guide" | "comparison" | "ultimate" | "tips";
  characterCount: number;
  seoScore?: number;
  clickScore?: number;
}

export interface HeadlineResponse {
  headlines: Headline[];
}
