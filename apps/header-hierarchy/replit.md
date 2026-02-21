# Header Tag Structure Checker

## Overview
A professional SEO analysis tool that visualizes the complete H1-H6 heading hierarchy from any URL and identifies common SEO issues.

## Features
- **Single URL Analysis**: Analyze individual webpages for heading structure
- **Batch URL Analysis**: Analyze multiple URLs simultaneously with progress tracking
- **Visual Heading Hierarchy**: Tree structure with colored badges and connecting lines
- **SEO Error Detection**:
  - Missing H1 tag
  - Multiple H1 tags
  - Forward hierarchy gaps (e.g., H1 → H3, skipping H2)
  - Empty heading tags
- **Accessibility Assessment**: Scoring system with WCAG compliance checks
- **Export Options**: 
  - PDF Report - Professional formatted report with complete analysis
  - JSON export for data processing
  - CSV export for spreadsheet analysis
  - Copy to clipboard for quick sharing
- **Statistics Panel**: Detailed heading counts and distribution
- **Dark/Light Mode**: Full theme support with persistent preferences
- **Screenshot-Friendly UI**: Professional design suitable for SEO guides and tutorials

## Architecture
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Cheerio for HTML parsing
- **Storage**: In-memory (no persistence needed for this tool)

## Design Decisions

### Heading Hierarchy Validation
The analyzer detects **forward hierarchy gaps** (e.g., H1 → H3) which violate SEO best practices. 

**Intentional**: Backward jumps in heading levels (e.g., H4 → H2) are **not** flagged as errors. This is by design because:
- Backward jumps are semantically correct when closing subsections
- Standard SEO best practices allow backward navigation in heading structure
- Real-world examples:
  ```
  H1: Page Title
    H2: Section 1
      H3: Subsection
      H3: Another subsection
    H2: Section 2  ← H3 to H2 is correct!
  ```

## Testing
All features have been verified with e2e tests:
- Theme toggle functionality
- URL analysis with real websites (example.com, developer.mozilla.org)
- Proper statistics display
- Heading hierarchy visualization with tree structure
- Error detection and display

## API Routes
- `POST /api/analyze` - Analyzes a URL and returns heading structure, SEO errors, and accessibility assessment
  - Request: `{ url: string }`
  - Response: `{ url, headings, errors, statistics, accessibility }`

## Pages
- `/` - Single URL analysis with export functionality
- `/batch` - Batch URL analysis with parallel processing

## Environment
- Development server runs on port 5000
- Vite dev server integrated with Express
- All routes prefixed with `/api`
- Database connection via DATABASE_URL environment variable
