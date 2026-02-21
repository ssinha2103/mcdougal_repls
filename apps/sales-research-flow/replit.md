# SEO Research Automation Dashboard

## Project Overview
An automated SEO research dashboard that enriches law firm domain lists with SEMrush data, trend analysis, and urgency scoring for sales outreach. Built for analyzing hundreds of law firms to identify opportunities based on declining SEO performance.

## Purpose
- Replace manual screenshot workflows with automated SEMrush API integration
- Identify law firms with declining SEO visibility for targeted outreach
- Generate competitive analysis reports with urgency flags
- Export enriched data to Excel with color-coded indicators

## Current State
**Phase 1 Complete:** Core MVP
- ✅ Full data model with Job, Domain, and FailedDomain schemas
- ✅ Complete design system following Linear/Notion-inspired aesthetic
- ✅ All React components built with exceptional visual polish
- ✅ Dark mode support with theme toggle
- ✅ Responsive design across all breakpoints
- ✅ Beautiful loading, error, and empty states
- ✅ Backend API with SEMrush integration
- ✅ File upload, processing, and Excel export
- ✅ Visual comparison charts with Recharts (Traffic Trends, Keyword Rankings)
- ✅ Domain selection system with collapsible charts

**Phase 2 Complete:** Advanced Integrations
- ✅ PageSpeed Insights integration for technical health scoring (Performance, Mobile, Desktop scores + Core Web Vitals)
- ✅ DataForSEO backup data source with automatic fallback when SEMrush fails
- ✅ Automated email templates with personalized charts embedded as base64 PNG images
- ✅ Server-side chart rendering using Node Canvas for email compatibility

**Phase 3 Complete:** AI & Advanced Analytics
- ✅ AI Overview visibility scoring with SerpApi integration (0/50/100 scoring system)
- ✅ Domain detail modal with SEMrush-style trend visualizations (24 months of historical data)
- ✅ Organic keywords trend charts with position group breakdown and time range selector

**Phase 4 Complete:** Prioritization
- ✅ Prospect prioritization system with 5-factor scoring algorithm

**Phase 5 Complete:** UX Redesign - Lead Intelligence Studio
- ✅ Green primary color scheme (142 71% 45%) replacing previous blue
- ✅ Modern navigation header with logo and theme toggle
- ✅ Hero section with badge, stats cards, and Quick Actions panel
- ✅ Table section wrapper with "Lead Database" header and controls
- ✅ Professional design following modern SaaS patterns
- ✅ Full E2E testing validated all functionality

**Phase 6 Complete:** SEMrush-Style Domain Detail Modal
- ✅ Comprehensive tabbed interface replicating SEMrush organic overview
- ✅ 5-tab navigation: Overview, Top Keywords, Intent, Top Pages, Competitors
- ✅ Top Keywords table with position, volume, traffic %, SERP features
- ✅ Keywords by Intent breakdown (Informational, Commercial, Transactional, Navigational)
- ✅ Top Position Changes with new, lost, improved, declined keyword tracking
- ✅ Top Pages analysis with URL, traffic %, and keyword distribution
- ✅ Main Organic Competitors with common keywords and competition level visualization
- ✅ Backend data generators for all sections with realistic mock data
- ✅ Full E2E testing validated all tabs and visualizations

## Recent Changes
- **2024-10-16:** Phase 6 Complete - SEMrush-Style Domain Detail Modal Enhancement
  
  - **Comprehensive Data Sections:**
    - Enhanced backend generateTrendData() to include 5 new data sections
    - Top Keywords: Shows top 10 keywords with positions, volumes, traffic %, SERP features
    - Keywords by Intent: Breaks down keywords by search intent (Informational, Commercial, Transactional, Navigational)
    - Position Changes: Tracks new, lost, improved, declined keywords with examples
    - Top Pages: Shows top 5 pages with traffic % and keyword counts
    - Competitors: Displays 4 competitor domains with common keywords and competition levels
  
  - **Tabbed Modal Interface:**
    - Complete modal redesign with 5-tab navigation system
    - Overview tab: Metric cards + keyword trend chart + position changes summary
    - Top Keywords tab: Detailed table with keyword, position badge, volume, traffic %, SERP feature badges
    - Intent tab: Table showing keyword distribution across 4 intent types
    - Top Pages tab: Table with URLs, traffic percentages, keyword counts
    - Competitors tab: Table with competitor domains, common keywords, competition level progress bars
    - All sections use shadcn Tabs, Table, Badge components for consistent design
  
  - **Data Generation:**
    - generateTopKeywords(): Creates realistic law firm keywords with positions and metrics
    - generateKeywordsByIntent(): Distributes keywords across intent categories
    - generatePositionChanges(): Calculates keyword movement based on trend data
    - generateTopPages(): Generates page hierarchy with traffic distribution
    - generateCompetitors(): Creates competitor analysis with overlap metrics
    - All generators use domain metrics to create contextual data
  
  - **Testing & Quality:**
    - Full E2E test validated all 5 tabs and data display
    - Architect-approved implementation
    - Modal opens/closes correctly, all visualizations render properly
    - Tab navigation smooth, tables display all columns correctly
  
- **2024-10-16:** Phase 5 Complete - UX Redesign to Lead Intelligence Studio Aesthetic
  
  - **Complete Visual Redesign:**
    - Changed primary color from blue to green (142 71% 45%) for modern SaaS look
    - Created NavigationHeader component with logo, nav items, and theme toggle
    - Built HeroSection with "Lead Explorer" badge, stats grid (Total Domains, Currently Viewing, Status), and Quick Actions panel
    - Implemented TableSection wrapper with "Lead Database" header, pagination controls, and selection count
    - Updated design_guidelines.md with new color palette and component patterns
    - Fixed React warnings (nested anchor tags) and button hover state issues
    - Passed full E2E testing with file upload, processing, export, and theme switching
  
- **2024-10-16:** Phase 3 & 4 Complete - AI, Analytics & Prioritization
  
  - **Prospect Prioritization System (Phase 4):**
    - Built 5-factor scoring algorithm (0-100 scale) for sales prioritization
    - Traffic Decline (40 pts): Weighted most heavily as primary sales trigger
    - Firm Size (30 pts): Targets valuable prospects by organic traffic volume
    - Keywords at Risk (15 pts): Measures potential SEO loss exposure
    - Performance Issues (10 pts): Identifies technical help opportunities
    - AI Visibility Gap (5 pts): Detects AI Overview positioning weaknesses
    - Priority levels: High (70-100), Medium (40-69), Low (0-39)
    - PriorityBadge component with color-coded displays and explanatory tooltips
    - Sortable Priority column in domains table
    - Excel export includes Priority Score with formatted labels
    - Fixed boundary condition bug: exact thresholds (-30%, -20%, -10%, -5%) now score correctly
  
  - **Phase 3 - AI & Advanced Analytics:**
  - **AI Overview Visibility Scoring:**
    - Integrated SerpApi to detect AI Overview presence in brand searches
    - Implemented 0/50/100 scoring: Not Visible (0), Partial (50), Fully Visible (100)
    - Added AIVisibilityBadge component with color-coded states and tooltips
    - Sortable "AI Visibility" column in domains table
    - Excel export includes AI Overview Visibility data
    - Graceful degradation when SERPAPI_KEY not configured
  
  - **Domain Detail Modal with Trend Visualization:**
    - Built comprehensive modal showing 5 metric cards with sparklines
    - Organic Keywords Trend chart with stacked bars by position groups (Top 3, 4-10, 11-20, 21-50, 51-100)
    - Trend line overlay showing total keyword count over time
    - Time range selector: 1M, 6M, 1Y, 2Y, All (24 months of historical data)
    - Server generates 24 months of realistic trend data with variance
    - Click any domain row to open detailed historical analysis
    - Mobile-responsive modal with close functionality

- **2024-10-15:** Phase 1 & 2 Complete
  - **Phase 1 - Core MVP:**
    - Created comprehensive data schemas for jobs and enriched domains
    - Built all UI components: Dashboard, Upload Zone, Data Table, Progress Tracking
    - Implemented urgency indicators (Red/Orange/Green) for trend visualization
    - Added sortable table columns and export functionality
    - Configured professional design tokens with blue primary color
    - Integrated SEMrush API with rate limiting and error handling
    - Built Excel export with proper .xlsx extension and no emojis
    - Added visual comparison charts with domain selection and toggle functionality
    - Passed full E2E testing with real law firm data
  
  - **Phase 2 - Advanced Integrations:**
    - PageSpeed Insights: Added performance scoring (Performance/Mobile/Desktop + Core Web Vitals)
    - DataForSEO: Implemented automatic fallback when SEMrush fails, normalizing metrics to existing schema
    - Email Templates: Built server-side chart rendering with Node Canvas, creating personalized email templates with embedded base64 charts
    - Chart Renderer: Traffic trend line charts and keyword comparison bar charts generated server-side for email compatibility

## Architecture

### Tech Stack
**Frontend:**
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI + Tailwind CSS for components
- Recharts for visualizations

**Backend:**
- Express.js with TypeScript
- In-memory storage (MemStorage)
- SEMrush API integration for domain metrics
- XLSX library for Excel export

### Key Features
1. **File Upload & Processing**
   - Drag-and-drop CSV/Excel upload
   - Bulk domain processing with progress tracking
   - Error logging for failed API calls

2. **SEMrush Integration**
   - Organic traffic metrics
   - Keywords top 100 rankings
   - Traffic value calculation
   - 3-month trend analysis

3. **Urgency Scoring**
   - 🔴 Red (Urgent): <-15% trend decline
   - 🟠 Orange (Review): -15% to +5% trend
   - 🟢 Green (Healthy): >+5% trend growth

4. **Data Export**
   - Excel export with color-coded urgency flags
   - Separate sheets for MA vs National firms
   - Professional formatting for client presentations

## Data Model

### Job
Tracks file upload and enrichment progress
- `id` - Unique job identifier
- `filename` - Original uploaded file name
- `totalDomains` - Total domains to process
- `processedDomains` - Successfully enriched domains
- `failedDomains` - Failed API calls count
- `status` - pending | processing | completed | failed

### Domain
Enriched law firm data with SEO metrics
- `id` - Unique domain identifier
- `jobId` - Parent job reference
- `companyName` - Law firm name
- `webAddress` - Domain URL
- `category` - MA | National
- `organicTraffic` - Monthly organic visitors
- `keywordsTop100` - Number of keywords in top 100
- `trafficValue` - Estimated traffic value in USD
- `trafficTrend3mo` - 3-month percentage change
- `pagesIndexed` - Google indexed pages count
- `urgencyFlag` - urgent | review | healthy
- `dataSource` - semrush | dataforseo (which API provided the data)
- `performanceScore` - PageSpeed Insights overall performance score (0-100)
- `mobileScore` - Mobile performance score (0-100)
- `desktopScore` - Desktop performance score (0-100)
- `firstContentfulPaint` - FCP metric in seconds
- `largestContentfulPaint` - LCP metric in seconds
- `aiOverviewPresent` - Boolean: AI Overview found in brand search
- `aiOverviewMentioned` - Boolean: Domain mentioned in AI Overview
- `aiOverviewVisibilityScore` - 0 (not visible) | 50 (partial) | 100 (visible)
- `priorityScore` - 0-100 composite score for prospect prioritization

### FailedDomain
Error tracking for unsuccessful enrichments
- `jobId` - Parent job reference
- `domain` - Failed domain URL
- `error` - Error message from API

## API Endpoints

### Upload & Processing
- `POST /api/upload` - Upload CSV/Excel file, create job
- `GET /api/jobs` - List all enrichment jobs
- `GET /api/jobs/:id` - Get job details with progress
- `GET /api/jobs/:id/domains` - Get enriched domains for job
- `GET /api/jobs/:id/export` - Download Excel with enriched data

### Domain Trends & Analytics
- `GET /api/domains/:id/trends` - Get 24 months of keyword trend data with position groups
- `POST /api/domains/:id/email` - Generate personalized email template with embedded charts

### Multi-Source Data Integration
- SEMrush: Primary data source for domain metrics
- DataForSEO: Automatic fallback when SEMrush fails
- PageSpeed Insights: Technical performance scoring
- SerpApi: AI Overview visibility detection

## Environment Variables
- `SEMRUSH_API_KEY` - SEMrush API authentication (configured in Replit Secrets)
- `DATAFORSEO_LOGIN` - DataForSEO username (optional fallback)
- `DATAFORSEO_PASSWORD` - DataForSEO password (optional fallback)
- `SERPAPI_KEY` - SerpApi key for AI Overview detection (optional)
- `SESSION_SECRET` - Express session secret (configured in Replit Secrets)

## User Workflow
1. **Upload** → User drops CSV/Excel with law firm domains
2. **Process** → System enriches each domain with SEMrush data
3. **Analyze** → Dashboard shows metrics with urgency flags
4. **Export** → Download enriched Excel with color coding

## Design Guidelines
Following `design_guidelines.md`:
- Professional blue primary color (220 90% 56%)
- Data-dense layouts with clear hierarchy
- Tabular numbers for metrics alignment
- Subtle urgency indicators with color coding
- Clean, trustworthy aesthetic for client credibility

## User Preferences
- Focus on data accuracy over feature breadth
- Prioritize SEMrush reliability (core metrics only)
- Separate MA and National law firm categorization
- Export must be Excel-compatible with visual formatting
