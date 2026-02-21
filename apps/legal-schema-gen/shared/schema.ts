import { z } from "zod";

export const addressSchema = z.object({
  streetAddress: z.string().min(1, "Street address is required"),
  addressLocality: z.string().min(1, "City is required"),
  addressRegion: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "ZIP code is required"),
  addressCountry: z.string().default("US"),
});

export const attorneySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Attorney name is required"),
  jobTitle: z.string().optional(),
  credentials: z.string().optional(),
  barNumber: z.string().optional(),
  education: z.string().optional(),
  yearsOfExperience: z.number().optional(),
});

export const officeLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Location name is required"),
  address: addressSchema,
  telephone: z.string().optional(),
});

export const legalServiceSchema = z.object({
  name: z.string().min(1, "Firm name is required"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  telephone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  address: addressSchema,
  foundingDate: z.string().optional(),
  logo: z.string().url("Please enter a valid logo URL").optional().or(z.literal("")),
  priceRange: z.string().optional(),
  practiceAreas: z.array(z.string()).min(1, "Select at least one practice area"),
  attorneys: z.array(attorneySchema).optional(),
  additionalLocations: z.array(officeLocationSchema).optional(),
});

export type Address = z.infer<typeof addressSchema>;
export type Attorney = z.infer<typeof attorneySchema>;
export type OfficeLocation = z.infer<typeof officeLocationSchema>;
export type LegalServiceData = z.infer<typeof legalServiceSchema>;

export const PRACTICE_AREAS = [
  "Personal Injury",
  "Criminal Defense",
  "Family Law",
  "Estate Planning",
  "Real Estate Law",
  "Business Law",
  "Employment Law",
  "Immigration Law",
  "Bankruptcy Law",
  "Intellectual Property",
  "Tax Law",
  "Civil Litigation",
  "Medical Malpractice",
  "Workers' Compensation",
  "DUI/DWI Defense",
  "Divorce Law",
  "Child Custody",
  "Probate Law",
  "Contract Law",
  "Environmental Law",
];

export interface SchemaOutput {
  "@context": string;
  "@type": string;
  name: string;
  description?: string;
  url?: string;
  telephone: string;
  email?: string;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  foundingDate?: string;
  logo?: string;
  priceRange?: string;
  areaServed?: string[];
  attorney?: Array<{
    "@type": string;
    name: string;
    jobTitle?: string;
    credentials?: string;
    [key: string]: any;
  }>;
  location?: Array<{
    "@type": string;
    name: string;
    address: {
      "@type": string;
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    telephone?: string;
  }>;
}
