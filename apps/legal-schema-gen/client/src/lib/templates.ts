import { LegalServiceData } from "@shared/schema";

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  schemaType: string;
  data: Partial<LegalServiceData>;
}

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: "legal-service-general",
    name: "General Law Firm",
    description: "Full-service law firm with multiple practice areas",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Personal Injury", "Criminal Defense", "Family Law", "Estate Planning"],
      priceRange: "$$$",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "legal-service-personal-injury",
    name: "Personal Injury Firm",
    description: "Specialized in personal injury and accident cases",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Personal Injury", "Medical Malpractice", "Workers' Compensation"],
      priceRange: "$$$",
      description: "Experienced personal injury attorneys fighting for your rights",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "legal-service-criminal-defense",
    name: "Criminal Defense Firm",
    description: "Focused on criminal defense and DUI cases",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Criminal Defense", "DUI/DWI Defense"],
      priceRange: "$$$",
      description: "Aggressive criminal defense representation",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "legal-service-family-law",
    name: "Family Law Practice",
    description: "Specializing in family law and divorce",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Family Law", "Divorce Law", "Child Custody"],
      priceRange: "$$",
      description: "Compassionate family law attorneys",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "legal-service-business",
    name: "Business Law Firm",
    description: "Corporate and business legal services",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Business Law", "Contract Law", "Intellectual Property"],
      priceRange: "$$$$",
      description: "Strategic business legal counsel",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "legal-service-estate",
    name: "Estate Planning Attorney",
    description: "Estate planning and probate services",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["Estate Planning", "Probate Law"],
      priceRange: "$$",
      description: "Protecting your legacy and family's future",
      attorneys: [],
      additionalLocations: [],
    },
  },
  {
    id: "attorney-solo",
    name: "Solo Attorney",
    description: "Individual attorney practice (Attorney schema type)",
    schemaType: "Attorney",
    data: {
      practiceAreas: ["General Practice"],
      priceRange: "$$",
      attorneys: [
        {
          id: "1",
          name: "",
          jobTitle: "Attorney at Law",
          credentials: "J.D.",
          barNumber: "",
          education: "",
          yearsOfExperience: undefined,
        },
      ],
      additionalLocations: [],
    },
  },
  {
    id: "legal-org-small",
    name: "Small Legal Organization",
    description: "Small legal organization with 2-5 attorneys",
    schemaType: "LegalService",
    data: {
      practiceAreas: ["General Practice"],
      priceRange: "$$",
      attorneys: [
        {
          id: "1",
          name: "",
          jobTitle: "Senior Partner",
          credentials: "J.D.",
          barNumber: "",
          education: "",
          yearsOfExperience: undefined,
        },
        {
          id: "2",
          name: "",
          jobTitle: "Associate Attorney",
          credentials: "J.D.",
          barNumber: "",
          education: "",
          yearsOfExperience: undefined,
        },
      ],
      additionalLocations: [],
    },
  },
];

export function getTemplateById(id: string): SchemaTemplate | undefined {
  return SCHEMA_TEMPLATES.find(template => template.id === id);
}

export function applyTemplate(template: SchemaTemplate, baseData?: Partial<LegalServiceData>): Partial<LegalServiceData> {
  return {
    ...baseData,
    ...template.data,
    name: baseData?.name || "",
    telephone: baseData?.telephone || "",
    address: baseData?.address || {
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "US",
    },
  };
}
