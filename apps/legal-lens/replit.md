# Local Legal SERP Analyzer

## Overview
A powerful competitive analysis tool for legal professionals that analyzes local search rankings and enriches them with Google Business Profile data. Users enter a legal practice keyword (e.g., "divorce lawyer") and location to receive comprehensive competitive intelligence.

## Recent Changes
**2024-10-08**: Complete MVP with Database Integration
- Created comprehensive schema for search requests, local pack results, organic results, and analysis responses
- Implemented full frontend with beautiful, professional UI following Material Design + SaaS aesthetics
- Built search form, stats overview, local pack table, organic results table, and results dashboard
- Added PDF and CSV export functionality with proper null/undefined handling
- Integrated PostgreSQL database with Drizzle ORM for persistence
- Created database schema for saved searches and historical search results
- Fixed HomePage JSON parsing and ResultsDashboard defensive checks
- Added theme toggle for dark mode support

## Project Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: DataForSEO API, Google Places API
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Export**: jsPDF, papaparse

### Data Model (shared/schema.ts)
- `SearchRequest`: keyword and location input
- `LocalPackResult`: Local Pack SERP result with GBP data
- `OrganicResult`: Organic SERP result with optional GBP data
- `AnalysisResponse`: Complete analysis with summary statistics
- `SavedSearch`: Saved search configurations with email reporting settings
- `SearchResult`: Historical search results for tracking ranking changes

### Key Features
1. **Search Interface**: Clean, centered search form with keyword and location inputs
2. **Stats Overview**: 4 metric cards showing total results, avg rating, claimed percentage, top competitor
3. **Tabbed Results**: Local Pack (top 3) and Organic (top 10) results in separate tabs
4. **Rich Data Display**: Rankings, ratings, reviews, claimed status, contact info, website links
5. **Saved Searches**: Save keyword/location combinations with optional email reporting settings
6. **Historical Tracking**: View ranking trends over time with interactive charts and metrics
7. **Export Functionality**: Download analysis as PDF or CSV reports
8. **Responsive Design**: Mobile-first, works beautifully on all devices
9. **Dark Mode**: Full dark mode support with theme toggle
10. **Sidebar Navigation**: Easy access to New Search, Saved Searches, and History pages

### API Endpoints
- `POST /api/analyze`: Analyzes competition for given keyword and location
  - Fetches SERP data from DataForSEO
  - Enriches with Google Places API data
  - Returns comprehensive analysis response
- `GET/POST/PATCH/DELETE /api/saved-searches`: Manage saved searches
- `GET /api/search-results/:savedSearchId`: Get historical results for a saved search
- `POST /api/search-results`: Save a new search result
- `GET /api/search-history`: Get search history by keyword and location

## Environment Variables
- `DATAFORSEO_LOGIN`: DataForSEO API login/email
- `DATAFORSEO_PASSWORD`: DataForSEO API password
- `GOOGLE_PLACES_API_KEY`: Google Places API key
- `SESSION_SECRET`: Session secret (pre-configured)

## Design Guidelines
See `design_guidelines.md` for comprehensive design specifications including:
- Color palette (professional blue primary, success/warning/error colors)
- Typography (Inter for UI, JetBrains Mono for data)
- Layout system and spacing primitives
- Component usage and patterns
- Data visualization standards
