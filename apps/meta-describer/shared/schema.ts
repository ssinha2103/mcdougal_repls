import { z } from "zod";

// Meta Description Generation Request Schema
export const generateMetaDescriptionSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500, "Topic must be less than 500 characters"),
  primaryKeyword: z.string().min(1, "Primary keyword is required").max(100, "Primary keyword must be less than 100 characters"),
  secondaryKeyword: z.string().max(100, "Secondary keyword must be less than 100 characters").optional(),
});

export type GenerateMetaDescriptionRequest = z.infer<typeof generateMetaDescriptionSchema>;

// Meta Description Response Schema
export const metaDescriptionSchema = z.object({
  description: z.string(),
  characterCount: z.number(),
});

export type MetaDescription = z.infer<typeof metaDescriptionSchema>;

export const metaDescriptionResponseSchema = z.object({
  descriptions: z.array(metaDescriptionSchema),
});

export type MetaDescriptionResponse = z.infer<typeof metaDescriptionResponseSchema>;
