# SEMrush Screenshot Scraper & Prospecting Platform

## Overview

This is a B2B prospecting and SEO analysis tool that automates the process of crawling SEMrush organic overview pages for multiple domains. The application captures screenshots of specific UI sections, extracts structured data using DOM parsing and AI vision (Google Gemini), and provides prospect scoring and ranking capabilities to identify SEO opportunities for outreach campaigns.

**Core Functionality:**
- Batch crawling of SEMrush domain analytics pages (500-1,000+ domains)
- Screenshot capture of 9 key SEMrush sections per domain (header KPIs, organic trends, keywords, competitive positioning, etc.)
- Hybrid data extraction using DOM parsing with AI vision fallback
- AI-powered prospect scoring and insight generation
- Real-time crawl monitoring via WebSocket
- Export capabilities (ZIP, CSV, PDF)

**Target Users:** SEO agencies, B2B marketers, and sales teams looking to identify prospects with poor organic search performance as outreach opportunities.

## Deployment Options

This application can be deployed in two ways:

### 1. Replit Cloud (Integrated Platform)
- **Best for:** Quick prototyping, managed infrastructure
- **Setup:** Automatic - uses Replit's integrated services
- **Browser:** Chromium via Nix packages
- **Database:** Neon serverless PostgreSQL (auto-configured)
- **Storage:** Replit Object Storage sidecar (seamless auth)
- **Start:** Automatic via workflow

### 2. Docker/Local PC (Self-Hosted)
- **Best for:** Production deployments, local development, full control
- **Setup:** Manual - requires Docker Desktop and GCS credentials
- **Browser:** Google Chrome stable in Docker container
- **Database:** PostgreSQL 16 in Docker
- **Storage:** Google Cloud Storage with service account credentials
- **Start:** `docker-compose up -d` or `./scripts/start.sh`
- **Documentation:** See `QUICKSTART.md` and `README-DOCKER.md`

The codebase automatically detects the environment and configures services accordingly.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 18** with TypeScript for type safety
- **Vite** for fast development builds and HMR
- **Wouter** for lightweight client-side routing (alternative to React Router)
- **TanStack Query (React Query)** for server state management, caching, and real-time updates

**UI Component System:**
- **shadcn/ui** component library built on Radix UI primitives (New York style variant)
- **Tailwind CSS** with custom design tokens for dark-mode-first analytics dashboard
- Custom CSS variables system for theme management (supports both light/dark modes)
- Design philosophy: Data-first clarity, minimal visual noise, efficient information density (see `design_guidelines.md`)

**State Management Pattern:**
- Server state via React Query with aggressive caching (`staleTime: Infinity`)
- WebSocket integration for real-time crawl progress updates
- No global client state library (relies on React Query + local component state)

**Key Design Decisions:**
- **Dark mode as default** for extended analysis sessions
- **Monospace fonts** for domain names to aid scanning
- **Semantic color system** for prospect scores (green/yellow/red based on thresholds)
- **Card-based layout** with hover elevation effects for visual hierarchy

### Backend Architecture

**Runtime & Framework:**
- **Node.js** with **Express.js** for HTTP API server
- **TypeScript** throughout (ES modules via `"type": "module"`)
- **tsx** for development execution, **esbuild** for production bundling

**Web Scraping & Automation:**
- **Puppeteer** (headless Chrome) for visiting SEMrush pages and capturing screenshots
- **Multi-environment browser support:**
  - Replit: Chromium via Nix (auto-detected with `which chromium`)
  - Docker: Google Chrome stable at `/usr/bin/google-chrome-stable`
  - Local: Falls back to Puppeteer's bundled Chromium
- Browser path detection priority: `PUPPETEER_EXECUTABLE_PATH` env var → Docker Chrome → Nix Chromium → bundled
- **Automatic SEMrush authentication** using SEMRUSH_EMAIL and SEMRUSH_PASSWORD environment variables
- Login verification before each crawl session to ensure valid authenticated access
- Session state management to avoid re-authentication on every domain
- Custom crawler with configurable rate limiting (`maxRequestsPerHour`)
- Screenshot section targeting via DOM selectors and viewport cropping
- Retry logic and error handling for failed crawls
- Development mode available for testing without real browser (returns mock data)

**AI/ML Integration:**
- **Google Gemini 2.5 Pro** (`@google/genai`) for vision-based data extraction from screenshots
- Structured JSON output via `responseMimeType: "application/json"`
- AI-powered prospect scoring algorithm based on extracted SEO metrics
- Insight generation for identifying SEO weaknesses (content gaps, keyword opportunities, technical issues)

**Job Processing:**
- **Bull queue** for background crawl job management (referenced in `package.json`)
- Asynchronous processing of domain batches to prevent request blocking
- WebSocket broadcasting for real-time progress updates to connected clients

**API Design:**
- RESTful endpoints for CRUD operations (`/api/domains`, `/api/runs`, `/api/stats`)
- WebSocket endpoint (`/ws`) for crawl event streaming
- Middleware for request logging with response JSON capture
- Error handling middleware with status code normalization

### Data Storage Solutions

**Primary Database:**
- **PostgreSQL** via **Neon serverless** (`@neondatabase/serverless`)
- **Drizzle ORM** for type-safe database queries and migrations
- WebSocket-based connection pooling for serverless compatibility

**Database Schema Design:**
- `domains` - Master list of target domains with status tracking
- `runs` - Crawl session metadata with progress counters
- `snapshots` - Individual domain crawl attempts linked to runs
- `sections` - Screenshot and extracted data for each of 9 SEMrush sections
- `metrics` - Aggregated KPIs and prospect scores per snapshot
- `insights` - AI-generated opportunity findings per snapshot
- `crawler_logs` - Audit trail of crawl events

**Relationships:**
- Runs contain multiple snapshots (one per domain)
- Snapshots contain multiple sections (up to 9 per SEMrush page)
- Snapshots have one metrics record and multiple insights
- Foreign key constraints ensure referential integrity

**Key Schema Patterns:**
- JSONB columns for flexible data storage (`extractedData`, `rawMetrics`)
- Enum types for status fields (`domainStatuses`, `runStatuses`, `sectionTypes`)
- Timestamps for audit trails (`createdAt`, `lastCrawledAt`)
- Numeric scores stored as integers (0-100 range for prospect scores)

### External Dependencies

**Cloud Services:**
- **Google Cloud Storage** - Screenshot blob storage
  - Replit: Via Object Storage sidecar (automatic authentication)
  - Docker/Local: Standard GCS with service account JSON credentials
  - Bucket configuration: `DEFAULT_OBJECT_STORAGE_BUCKET_ID` (Replit) or `GCS_BUCKET_NAME` (Docker)
- **Google Gemini API** - Vision model for screenshot OCR and data extraction
- **PostgreSQL Database:**
  - Replit: Neon serverless with WebSocket support
  - Docker: PostgreSQL 16 container with persistent volumes

**Third-Party Services:**
- **SEMrush** - Target scraping platform using browser automation (UI scraping only)
- **Authentication:** Requires SEMrush account credentials (SEMRUSH_EMAIL, SEMRUSH_PASSWORD)
- **Limitations:** 2FA must be disabled on SEMrush account for automated login
- **Compliance:** Application respects ToS via configurable throttling and human-like pacing

**Development Tools:**
- **Replit infrastructure** - Vite plugins for dev banner, cartographer, and runtime error overlay
- **WebSocket (ws library)** - Real-time bidirectional communication
- **Archiver** - ZIP file generation for bulk screenshot exports

**Authentication & Storage:**
- **SEMrush Authentication:** Automatic login using SEMRUSH_EMAIL and SEMRUSH_PASSWORD secrets
- **Login Flow:** Validates credentials, detects 2FA challenges, verifies successful authentication
- **Session Management:** Maintains authenticated session throughout crawler lifecycle
- **Error Handling:** Aborts crawl if authentication fails to prevent capturing login pages
- **Object Storage:** Uses Replit sidecar with external account credentials (Google ADC pattern)
- **User Access:** No user authentication system (assumes single-tenant usage)

**Rate Limiting & Compliance:**
- Configurable `maxRequestsPerHour` to avoid SEMrush rate limits (default: 120)
- Request pacing with randomized delays between crawls
- User-agent customization for transparency
- Browser automation designed to mimic human behavior
- Automated login enforcement prevents unauthorized access attempts

**Export & Reporting:**
- **date-fns** for timestamp formatting
- **archiver** for ZIP archive creation
- Planned support for CSV (tabular metrics) and PDF (visual reports)