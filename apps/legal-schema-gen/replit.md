# LegalService Schema Markup Generator

## Overview
A professional web-based tool that enables law firms to generate properly formatted JSON-LD schema markup for improved local SEO. This specialized tool provides an intuitive interface for creating Schema.org compliant structured data without requiring technical expertise.

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI
- **Form Management**: React Hook Form with Zod validation
- **Routing**: Wouter
- **Backend**: Express.js (minimal - health check only)
- **Styling**: Tailwind CSS with custom design tokens

### Key Features
1. **Comprehensive Form Interface**
   - Firm information (name, contact, address, founding date)
   - Practice area selection (20+ predefined + custom options)
   - Dynamic attorney cards (name, credentials, bar number, education, experience)
   - Additional office locations with full address details
   - Real-time form validation with inline error messages
   - Progress indicator showing completion percentage

2. **Real-time Schema Generation**
   - Instant JSON-LD generation as users type
   - Schema.org 3.9+ compliant output
   - Validation against LegalService schema requirements
   - Visual indicators for valid/invalid/incomplete schemas

3. **Export Options**
   - JSON-LD format (default)
   - HTML embed code with script tag
   - WordPress snippet for functions.php
   - One-click copy to clipboard
   - Download as file (.json, .html, .php)

4. **Professional Design**
   - Modern professional legal tech aesthetic
   - Two-column layout: form (left) + live preview (right)
   - Dark/light theme support
   - Fully responsive (desktop, tablet, mobile)
   - Accessibility compliant (WCAG standards)

5. **User Experience Enhancements**
   - Load sample data button for demo/testing
   - Clear form button for fresh start
   - Inline validation with helpful error messages
   - Warning messages for recommended fields
   - Syntax-highlighted code preview
   - Toast notifications for copy/download actions

### File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── theme-provider.tsx      # Dark/light theme context
│   │   ├── theme-toggle.tsx        # Theme switcher button
│   │   ├── header.tsx              # App header with branding
│   │   ├── hero.tsx                # Hero section
│   │   ├── firm-info-form.tsx      # Firm details form
│   │   ├── practice-areas-form.tsx # Practice areas selection
│   │   ├── attorneys-form.tsx      # Dynamic attorney cards
│   │   ├── office-locations-form.tsx # Additional locations
│   │   ├── schema-preview.tsx      # Live preview with export
│   │   ├── benefits-section.tsx    # Benefits grid
│   │   ├── how-it-works-section.tsx # Process steps
│   │   └── footer.tsx              # Footer with resources
│   ├── lib/
│   │   └── schema-generator.ts     # Schema generation utilities
│   ├── pages/
│   │   └── home.tsx                # Main generator page
│   ├── App.tsx                     # App entry point
│   └── index.css                   # Global styles + theme tokens
├── index.html                      # HTML with SEO meta tags
└── tailwind.config.ts              # Tailwind configuration

server/
├── routes.ts                       # API routes (health check)
└── storage.ts                      # Storage interface (unused)

shared/
└── schema.ts                       # TypeScript types & Zod schemas
```

### Design Guidelines
The application follows a professional SaaS tool design approach:
- **Colors**: Professional blue primary (#3B82F6 light, #60A5FA dark)
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: Consistent 4/6/8/12/16/24 units
- **Components**: Shadcn UI with custom theming
- **Accessibility**: High contrast, keyboard navigation, screen reader support

### Schema Generation Logic
The `schema-generator.ts` module provides:
- `generateSchemaMarkup()`: Converts form data to JSON-LD
- `validateSchema()`: Checks required fields and provides warnings
- `formatSchemaForDisplay()`: Pretty-prints JSON
- `generateHTMLEmbed()`: Creates script tag wrapper
- `generateWordPressSnippet()`: Generates PHP code for WordPress

### Data Model
Main types defined in `shared/schema.ts`:
- `LegalServiceData`: Complete form data structure
- `Address`: Postal address schema
- `Attorney`: Attorney information
- `OfficeLocation`: Additional office details
- `SchemaOutput`: Final JSON-LD structure

### State Management
- React Hook Form manages all form state
- Real-time validation with Zod schemas
- useEffect watches form values and regenerates schema on change
- Theme state persisted to localStorage

### Recent Changes (2025-10-08)
- Initial implementation of complete schema generator
- All MVP features implemented
- Frontend-only architecture (no database needed)
- Full dark/light theme support
- Export to multiple formats (JSON, HTML, WordPress)

## Running the Application
The workflow "Start application" runs `npm run dev` which starts both the Express server and Vite dev server on the same port (5000).

## User Flow
1. User fills out firm information, practice areas, and attorney details
2. Schema generates in real-time in the preview panel
3. Validation shows required fields and recommendations
4. User selects export format (JSON-LD, HTML, or WordPress)
5. User copies to clipboard or downloads as file
6. User pastes schema into their website's HTML head or WordPress theme

## SEO Benefits
- Enhanced local search visibility
- Rich snippets in search results
- Better indexing of practice areas and attorney information
- Improved click-through rates from search results
- Google My Business integration potential

## Target Audience
- Law firms and legal professionals
- Legal marketing agencies
- SEO consultants specializing in legal industry
- Web developers building law firm websites
- Solo practitioners managing their own marketing
