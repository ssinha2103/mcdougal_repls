export interface FieldTooltip {
  field: string;
  title: string;
  description: string;
  seoBenefit: string;
  bestPractice: string;
}

export const FIELD_TOOLTIPS: Record<string, FieldTooltip> = {
  name: {
    field: "Firm Name",
    title: "Your law firm's official name",
    description: "The legal name of your practice as registered with the bar association.",
    seoBenefit: "Helps Google identify your business in search results and local listings. Appears in rich snippets.",
    bestPractice: "Use your official registered name. Include 'LLC', 'P.C.', or other designations if they're part of your formal name."
  },
  
  description: {
    field: "Description",
    title: "Your firm's unique value proposition",
    description: "A concise summary of your practice areas and what makes your firm unique.",
    seoBenefit: "This text appears in search result snippets, improving click-through rates. Keywords here boost relevance.",
    bestPractice: "Write 150-200 characters. Include primary practice areas and geographic focus. Natural language, not keyword stuffing."
  },
  
  telephone: {
    field: "Phone Number",
    title: "Primary contact number",
    description: "Your firm's main business phone number in local or international format.",
    seoBenefit: "Enables 'click-to-call' in mobile search results. Critical for local SEO and Google My Business.",
    bestPractice: "Use a format like (555) 123-4567 or +1-555-123-4567. Include area code for better local SEO."
  },
  
  email: {
    field: "Email Address",
    title: "Primary business email",
    description: "Your main contact email for client inquiries.",
    seoBenefit: "Provides another contact method in rich snippets. Helps with business verification.",
    bestPractice: "Use a professional domain email (name@lawfirm.com) rather than generic providers."
  },
  
  url: {
    field: "Website URL",
    title: "Your firm's website address",
    description: "The primary URL where clients can find more information about your services.",
    seoBenefit: "Links search results to your website. Essential for driving traffic and conversions.",
    bestPractice: "Use your homepage URL (https://www.yourfirm.com). Must be HTTPS for security."
  },
  
  foundingDate: {
    field: "Founding Date",
    title: "When your firm was established",
    description: "The year your law firm was founded or when you started practicing.",
    seoBenefit: "Demonstrates experience and longevity. Can appear in knowledge panels and rich results.",
    bestPractice: "Use YYYY format (e.g., 2010). Only include if you have significant experience (5+ years)."
  },
  
  address: {
    field: "Street Address",
    title: "Your firm's physical location",
    description: "The complete street address where clients can visit your office.",
    seoBenefit: "Critical for local search and 'near me' queries. Required for Google My Business verification.",
    bestPractice: "Use your exact physical address. PO Boxes are not recommended for local SEO."
  },
  
  city: {
    field: "City",
    title: "City where your office is located",
    description: "The municipality or city of your law firm's address.",
    seoBenefit: "Essential for local search ranking in '[practice area] lawyers in [city]' queries.",
    bestPractice: "Use the official city name as it appears in government records."
  },
  
  state: {
    field: "State/Region",
    title: "State or province",
    description: "The state, province, or region of your office location.",
    seoBenefit: "Helps with state-level and regional search visibility. Important for multi-state practices.",
    bestPractice: "Use two-letter state codes (CA, NY, TX) or full names consistently."
  },
  
  postalCode: {
    field: "ZIP/Postal Code",
    title: "Your office's postal code",
    description: "The postal or ZIP code for precise location identification.",
    seoBenefit: "Enables hyper-local search. Helps Google match you with nearby searchers.",
    bestPractice: "Use the 5-digit ZIP code. Optional: Include ZIP+4 for even better precision."
  },
  
  practiceAreas: {
    field: "Practice Areas",
    title: "Legal specialties your firm handles",
    description: "The specific areas of law where you provide services.",
    seoBenefit: "Matches your firm with practice-specific searches. Each area can rank in relevant queries.",
    bestPractice: "Select 3-7 primary areas. Be specific (e.g., 'Medical Malpractice' vs. just 'Personal Injury')."
  },
  
  priceRange: {
    field: "Price Range",
    title: "Relative cost indication",
    description: "A general indicator of your pricing compared to other firms ($ to $$$$).",
    seoBenefit: "Helps set client expectations. Can appear in rich snippets and local listings.",
    bestPractice: "Be honest and competitive. $$ = moderate, $$$ = above average, $$$$ = premium pricing."
  },
  
  attorneys: {
    field: "Attorneys",
    title: "Lawyers at your firm",
    description: "Individual attorney information including credentials and specializations.",
    seoBenefit: "Creates separate schema entries for each attorney. Improves 'lawyer name' searches and E-A-T signals.",
    bestPractice: "Include bar number for credibility. List education from prestigious schools. Highlight unique expertise."
  },
  
  attorneyName: {
    field: "Attorney Name",
    title: "Full legal name of the attorney",
    description: "The attorney's complete name as it appears on their bar license.",
    seoBenefit: "Enables personal branding and name-based searches. Appears in firm's rich results.",
    bestPractice: "Use full name with middle initial if commonly used (e.g., 'John M. Smith, Esq.')."
  },
  
  attorneyJobTitle: {
    field: "Job Title",
    title: "Attorney's position or title",
    description: "The role or title this attorney holds at your firm.",
    seoBenefit: "Helps differentiate partners, associates, and specialists in search results.",
    bestPractice: "Use standard titles: Partner, Senior Associate, Of Counsel, Managing Attorney."
  },
  
  barNumber: {
    field: "Bar Number",
    title: "State bar admission number",
    description: "The unique license number issued by the state bar association.",
    seoBenefit: "Adds credibility and trust signals. Verifiable credential for Google's E-A-T assessment.",
    bestPractice: "Include state abbreviation (e.g., 'CA Bar #123456'). Verify it's current and active."
  },
  
  education: {
    field: "Education",
    title: "Law school and degree",
    description: "Where the attorney received their legal education.",
    seoBenefit: "Prestigious schools enhance authority signals. 'Harvard Law' or 'Yale Law' can boost rankings.",
    bestPractice: "Format: 'J.D., School Name, Year' (e.g., 'J.D., Stanford Law School, 2010')."
  },
  
  yearsOfExperience: {
    field: "Years of Experience",
    title: "Total years practicing law",
    description: "How many years this attorney has been practicing.",
    seoBenefit: "Demonstrates expertise. 10+ years signals authority to search engines.",
    bestPractice: "Count from bar admission date. Round to nearest year. Only include if 5+ years."
  },
  
  officeLocations: {
    field: "Additional Offices",
    title: "Other office locations",
    description: "Secondary or satellite offices where you practice.",
    seoBenefit: "Expands geographic reach. Each location can rank in local searches for that area.",
    bestPractice: "Only include offices with physical presence and regular hours. Not just mailing addresses."
  }
};

export function getTooltip(field: string): FieldTooltip | null {
  return FIELD_TOOLTIPS[field] || null;
}
