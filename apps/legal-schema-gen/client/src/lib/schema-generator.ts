import { LegalServiceData, SchemaOutput } from "@shared/schema";

export function generateSchemaMarkup(data: LegalServiceData): SchemaOutput {
  const schema: SchemaOutput = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: data.name,
    telephone: data.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
  };

  if (data.description) schema.description = data.description;
  if (data.url) schema.url = data.url;
  if (data.email) schema.email = data.email;
  if (data.foundingDate) schema.foundingDate = data.foundingDate;
  if (data.logo) schema.logo = data.logo;
  if (data.priceRange) schema.priceRange = data.priceRange;

  if (data.practiceAreas && data.practiceAreas.length > 0) {
    schema.areaServed = data.practiceAreas;
  }

  if (data.attorneys && data.attorneys.length > 0) {
    schema.attorney = data.attorneys.map((attorney) => ({
      "@type": "Person",
      name: attorney.name,
      ...(attorney.jobTitle && { jobTitle: attorney.jobTitle }),
      ...(attorney.credentials && { credentials: attorney.credentials }),
      ...(attorney.barNumber && { additionalProperty: { "@type": "PropertyValue", name: "Bar Number", value: attorney.barNumber } }),
      ...(attorney.education && { alumniOf: attorney.education }),
      ...(attorney.yearsOfExperience && { award: `${attorney.yearsOfExperience} years of experience` }),
    }));
  }

  if (data.additionalLocations && data.additionalLocations.length > 0) {
    schema.location = data.additionalLocations.map((location) => ({
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address.streetAddress,
        addressLocality: location.address.addressLocality,
        addressRegion: location.address.addressRegion,
        postalCode: location.address.postalCode,
        addressCountry: location.address.addressCountry,
      },
      ...(location.telephone && { telephone: location.telephone }),
    }));
  }

  return schema;
}

export function formatSchemaForDisplay(schema: SchemaOutput): string {
  return JSON.stringify(schema, null, 2);
}

export function generateHTMLEmbed(schema: SchemaOutput): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

export function generateWordPressSnippet(schema: SchemaOutput): string {
  const jsonString = JSON.stringify(schema, null, 2);
  return `<?php
// Add this to your theme's functions.php file
function add_legal_schema() {
  $schema = <<<'JSON'
${jsonString}
JSON;
  echo '<script type="application/ld+json">' . $schema . '</script>';
}
add_action('wp_head', 'add_legal_schema');
?>`;
}

export function validateSchema(data: Partial<LegalServiceData>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.name) errors.push("Firm name is required");
  if (!data.telephone) errors.push("Phone number is required");
  if (!data.address?.streetAddress) errors.push("Street address is required");
  if (!data.address?.addressLocality) errors.push("City is required");
  if (!data.address?.addressRegion) errors.push("State is required");
  if (!data.address?.postalCode) errors.push("ZIP code is required");
  if (!data.practiceAreas || data.practiceAreas.length === 0) errors.push("At least one practice area is required");

  if (!data.description) warnings.push("Adding a description improves SEO");
  if (!data.url) warnings.push("Website URL recommended for better visibility");
  if (!data.email) warnings.push("Email address helps with local SEO");
  if (!data.attorneys || data.attorneys.length === 0) warnings.push("Adding attorney information enhances credibility");

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
