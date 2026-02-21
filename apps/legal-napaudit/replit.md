# Legal Directory NAP Consistency Checker

## Overview
A web application that helps law firms verify the consistency of their Name, Address, and Phone (NAP) information across major legal and local directories. Inconsistent NAP data negatively impacts local SEO rankings.

## Purpose
- Fetch canonical NAP data from Google Places API
- Check law firm listings across 8 major directories
- Identify inconsistencies that hurt local search rankings
- Provide exportable reports and historical tracking
- Enable batch checking for multiple locations

## Features
### Core Functionality
- ✅ Google Places API integration for canonical NAP data
- ✅ Single law firm analysis with comprehensive results
- ✅ Batch checking (CSV upload or manual entry for multiple locations)
- ✅ Database persistence with PostgreSQL (Neon)
- ✅ Historical tracking with trend visualization
- ✅ Before/After comparison view for check history

### User Interface
- ✅ Tab-based navigation (Single Analysis / Bulk Analysis)
- ✅ Clean, centered layout inspired by modern SEO tools
- ✅ Form autocomplete for better UX (organization, address-level2)
- ✅ Comprehensive results dashboard with:
  - Summary statistics (total directories, consistent/inconsistent counts)
  - Canonical NAP display with copy-to-clipboard
  - Visual consistency percentage chart
  - Detailed directory-by-directory comparison table
  - Side-by-side NAP comparison dialogs
- ✅ CSV and report export functionality
- ✅ Dark mode support with professional B2B SaaS design
- ✅ Responsive design for mobile/tablet/desktop

### Historical Tracking
- ✅ Check history page with all past analyses
- ✅ Time-series chart showing consistency trends
- ✅ Advanced filtering (by firm name and date range)
- ✅ Before/After comparison (select 2 checks to see delta)
- ✅ Batch results view with individual check cards

## Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query v5, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript, Google Places API
- **Database**: PostgreSQL (Neon HTTP driver) with Drizzle ORM
- **Validation**: Zod schemas with drizzle-zod integration
- **Charts**: Recharts for trend visualization
- **CSV**: Papaparse for robust CSV parsing

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── search-form.tsx
│   │   │   ├── results-dashboard.tsx
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── home.tsx (Single + Bulk tabs)
│   │   │   ├── history.tsx (with filtering and comparison)
│   │   │   ├── batch-check.tsx
│   │   │   └── check-detail.tsx
│   │   └── lib/             # Utilities and query client
├── server/
│   ├── google-places.ts     # Google Places API integration
│   ├── directory-scrapers.ts # Directory checking logic
│   ├── storage.ts           # Database abstraction layer
│   └── routes.ts            # API endpoints
├── shared/
│   └── schema.ts            # Shared TypeScript types, Drizzle schema, Zod schemas
└── design_guidelines.md     # UI/UX design specifications
```

## Database Schema
- **nap_checks**: Stores each NAP consistency check
  - id, firmName, location, checkedAt, googlePlacesId
  - Computed: totalDirectories, consistentCount, inconsistentCount, missingCount
  - Foreign key: batchId (nullable)
  
- **directory_results**: Individual directory results per check
  - id, checkId, directoryName, directoryUrl, found
  - NAP match status: nameMatch, addressMatch, phoneMatch
  - Actual NAP data: name, address, phone

- **batch_checks**: Batch processing records
  - id, createdAt, completedAt, status, totalFirms, completedFirms

## API Endpoints
- `POST /api/check-nap` - Check NAP consistency for a single law firm
  - Request: `{ firmName: string, location: string }`
  - Response: `NAPCheckResponse` with canonical data, directory results, summary
  - Saves to database and returns check ID
  
- `POST /api/batch-check` - Process multiple law firms in batch
  - Request: `{ firms: Array<{ firmName: string, location: string }> }`
  - Response: `{ batch: BatchCheck, checkIds: number[] }`
  - Creates batch record and individual checks atomically
  
- `GET /api/checks` - Retrieve all NAP checks with stats
  - Returns: Array of `NAPCheck` with computed consistency metrics
  
- `GET /api/checks/:id` - Get single check with all directory results
  - Returns: `NAPCheck` with full directory_results array
  
- `GET /api/batches` - List all batch check records
  - Returns: Array of `BatchCheck` with completion status

## Environment Variables
- `GOOGLE_PLACES_API_KEY` - Required for Google Places API calls (configured in Replit Secrets)
- `SESSION_SECRET` - Session secret for Express
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)

## Current State (2025-10-09)
### What's Working
- ✅ Full Google Places API integration
- ✅ Complete frontend UI with tab navigation
- ✅ Database persistence with Neon PostgreSQL
- ✅ Batch checking (CSV + manual entry with papaparse)
- ✅ Historical tracking with trend charts and filtering
- ✅ Before/After comparison view
- ✅ Data fetching, validation, and error handling
- ✅ Export functionality (CSV and text reports)
- ✅ Form autocomplete for better UX
- ✅ Responsive design and dark mode
- ✅ Comprehensive end-to-end testing

### Recent Changes (2025-10-09)
#### UX Improvements
- ✅ Redesigned home page with centered layout and tab navigation
- ✅ Integrated Single Analysis and Bulk Analysis into one page with tabs
- ✅ Added autocomplete attributes to all form inputs:
  - `autocomplete="organization"` for firm names
  - `autocomplete="address-level2"` for locations
- ✅ Cleaner, more focused design inspired by modern SEO tools
- ✅ Larger typography and better visual hierarchy

#### Historical Tracking
- ✅ Time-series chart showing consistency trends over time
- ✅ Advanced filtering by firm name and date range
- ✅ Before/After comparison feature with side-by-side metrics
- ✅ Delta calculations showing change in consistency

#### Batch Processing
- ✅ Robust CSV parsing with Papaparse (handles quoted commas)
- ✅ Flexible header matching (supports various column names)
- ✅ Sample CSV download with proper formatting
- ✅ Data preservation on errors (no loss of user input)
- ✅ Accurate batch status with updated completion counts

### MVP Limitations
The directory scrapers currently return placeholder results (`found: false`) rather than actual web scraping data. This is intentional for the MVP because:
1. **Legal/TOS Issues**: Many directories explicitly prohibit automated scraping
2. **Complexity**: Each directory requires custom parsing logic (HTML structure varies)
3. **Reliability**: Sites change frequently, breaking scrapers
4. **Core Value**: The tool demonstrates the Google Places integration, comparison framework, and historical tracking

### Production Enhancement Path
To make this production-ready with real directory checking:
1. **Use Official APIs**: Integrate with directory APIs where available (Yelp, Better Business Bureau)
2. **Partner Integrations**: Work with directories to access their data officially
3. **Manual Data Entry**: Allow users to manually input directory NAP data for comparison
4. **Crowdsourced Data**: Build a database of verified directory listings
5. **Ethical Scraping**: If scraping, ensure compliance with robots.txt and terms of service

## Design Guidelines
See `design_guidelines.md` for complete UI/UX specifications including:
- Professional B2B SaaS design system
- Color palette (light/dark modes)
- Typography (Inter + JetBrains Mono)
- Component usage patterns
- Interaction guidelines
- Centered, clean layouts with appropriate whitespace

## User Preferences
- Prefers clean, centered UX similar to modern SEO tools
- Values autocomplete for better form usability
- Wants tab navigation for easy switching between single/bulk analysis

## Known Issues
None critical. The app functions as designed for the enhanced MVP scope with full database persistence and historical tracking.

## Future Enhancements
- Scheduled monitoring and automated re-checks
- Email/SMS alerts for consistency changes
- Direct links to update each directory listing
- Integration with more directories (state bar associations, Super Lawyers, etc.)
- PDF report generation with branding
- Advanced analytics and reporting dashboard
- Multi-user support with team collaboration features
