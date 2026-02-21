import { z } from "zod";

export const keywordGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Group name is required"),
  keywords: z.array(z.string().min(1)).min(1, "At least one keyword is required"),
});

export const combinationSettingsSchema = z.object({
  pattern: z.enum(["full", "pairs", "custom"]),
  matchType: z.enum(["broad", "phrase", "exact", "modified"]),
  separator: z.enum(["space", "dash", "underscore", "none", "custom"]),
  customSeparator: z.string().optional(),
  includeReverse: z.boolean().default(false),
  includeOriginal: z.boolean().default(false),
  removeStopwords: z.boolean().default(true),
  lowercaseOutput: z.boolean().default(false),
});

export const filterSettingsSchema = z.object({
  minWords: z.number().optional(),
  maxWords: z.number().optional(),
  minChars: z.number().optional(),
  maxChars: z.number().optional(),
  mustInclude: z.string().optional(),
  mustExclude: z.string().optional(),
  includeReverse: z.boolean().optional(),
  includeOriginal: z.boolean().optional(),
  removeStopwords: z.boolean().optional(),
  lowercaseOutput: z.boolean().optional(),
});

export const generateKeywordsRequestSchema = z.object({
  groups: z.array(keywordGroupSchema).min(1, "At least one keyword group is required"),
  settings: combinationSettingsSchema,
  filters: filterSettingsSchema.optional(),
});

export const keywordResultSchema = z.object({
  keyword: z.string(),
  wordCount: z.number(),
  charCount: z.number(),
  groups: z.array(z.string()),
});

export const generateKeywordsResponseSchema = z.object({
  keywords: z.array(keywordResultSchema),
  totalCombinations: z.number(),
  processingTime: z.number(),
  stats: z.object({
    totalGroups: z.number(),
    averageWordCount: z.number(),
    averageCharCount: z.number(),
  }),
});

export const exportRequestSchema = z.object({
  keywords: z.array(z.string()),
  format: z.enum(["csv", "txt", "json", "ads-csv"]),
  campaignName: z.string().optional(),
  adGroupName: z.string().optional(),
});

export type KeywordGroup = z.infer<typeof keywordGroupSchema>;
export type CombinationSettings = z.infer<typeof combinationSettingsSchema>;
export type FilterSettings = z.infer<typeof filterSettingsSchema>;
export type GenerateKeywordsRequest = z.infer<typeof generateKeywordsRequestSchema>;
export type GenerateKeywordsResponse = z.infer<typeof generateKeywordsResponseSchema>;
export type KeywordResult = z.infer<typeof keywordResultSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
