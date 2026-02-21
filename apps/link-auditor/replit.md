# Broken Link & Redirect Finder

## Overview
A professional web-based tool for SEO specialists and webmasters to analyze webpages for broken links, redirects, and HTTP errors. This tool crawls a single page's outbound links and categorizes them by HTTP status codes.

## Purpose
- Identify broken links (4xx and 5xx errors) on any webpage
- Detect redirect chains (3xx status codes)
- Analyze link health for SEO and website maintenance
- Professional alternative to tools like Screaming Frog and Ahrefs' link checker

## Current State
✅ Fully functional MVP with beautiful, professional UI
✅ All core features implemented and tested
✅ Dark mode support with theme toggle
✅ Responsive design for all screen sizes
✅ Production-ready code quality

## Recent Changes (October 6, 2025)
### Phase 1 - Core MVP ✅
- Initial implementation of broken link checker tool
- Created comprehensive schema for link analysis
- Built all React components with exceptional design quality
- Implemented backend crawler using Cheerio and Axios
- Added dark mode with persistent theme preference

### Phase 2 - Advanced Features ✅
- Added filtering by status category (2xx/3xx/4xx/5xx/errors) and search functionality
- Implemented redirect chain visualization with expandable table rows
- Added export functionality for CSV (RFC4180-compliant) and JSON formats
- Created PostgreSQL database with indexed scans table for historical storage
- Built scan history UI with History page and Scan Details page
- All features tested end-to-end and working correctly

### Phase 3 - Security Hardening ✅
- Implemented comprehensive SSRF protection with DNS rebinding prevention
- Added URL validation for protocols (HTTP/HTTPS only) and metadata endpoints
- Created DNS resolution with IP validation for all hostnames
- Implemented custom axios lookup function to prevent time-of-check/time-of-use attacks
- Extended IPv6 protection to full fe80::/10 link-local range
- Blocked all private IP ranges: IPv4 (RFC1918, loopback, link-local) and IPv6 (ULA, link-local, multicast)
- Added redirect chain validation with per-hop DNS resolution
- Architect reviewed and passed - production-ready security

### Phase 4 - Professional Hero UX Redesign ✅
- Redesigned home page with blue gradient hero section
- Added large centered title "Professional Broken Link & Redirect Finder"
- Implemented descriptive subtitle highlighting SEO specialist features
- Added feature badges (SEO Optimized, Advanced Filtering, Secure & Private)
- Redesigned input form as card with "Link Analysis" section title
- Changed analyze button to icon-only search button on right side
- Moved theme toggle and history button to compact header
- Created centered, professional layout matching industry standards

## Project Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Theme**: Custom dark/light mode implementation

### Backend
- **Server**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **HTML Parser**: Cheerio for extracting links
- **HTTP Client**: Axios for status code checking
- **API**: RESTful endpoints for analysis, history, and scan retrieval

### Key Features
1. **URL Analysis Form**: Single input with validation for webpage URLs
2. **Status Summary Cards**: Visual breakdown of link categories (2xx, 3xx, 4xx, 5xx)
3. **Results Table**: Advanced table with:
   - Filter by status category (All/2xx/3xx/4xx/5xx/Errors)
   - Search functionality across URLs
   - Expandable rows showing full redirect chains
   - Sort by URL or status code
4. **Redirect Chain Visualization**: Expandable rows showing complete redirect path
5. **Export Functionality**: Download results as CSV or JSON
6. **Scan History**: Browse all previous scans with timestamps and summaries
7. **Scan Details**: View full results of any historical scan
8. **Empty States**: Clear instructions when no results
9. **Loading States**: Professional loading indicators during analysis
10. **Error Handling**: Comprehensive error messages for failed requests
11. **Dark Mode**: Full theme support with persistent preference
12. **Security**: Comprehensive SSRF protection with DNS rebinding prevention

### Data Flow
1. User enters URL in form
2. Frontend validates and sends POST to /api/analyze
3. Backend fetches page HTML using Axios
4. Cheerio extracts all <a href> links
5. HEAD requests check each link's status code
6. Response includes categorized results and summary
7. Frontend displays color-coded results in table and cards

## User Preferences
- Professional, data-focused design preferred
- Minimal animations for efficiency
- Clear visual hierarchy and status recognition
- Mobile-responsive layouts

## Design System
- **Hero Design**: Blue gradient header with centered title, subtitle, and feature badges
- **Colors**: Professional blue primary (gradient), status colors for link categories
- **Typography**: Inter for UI, Fira Code for URLs and status codes
- **Layout**: Centered hero section, card-based input form, spacious content areas
- **Spacing**: Consistent 4px-based spacing system
- **Components**: Shadcn UI with custom theming
- **Interactions**: Subtle hover effects, smooth transitions

## Technical Decisions
- Using PostgreSQL database with indexed scans table for historical storage
- HEAD requests for efficiency (only fetch headers, not full pages)
- Absolute URL resolution for relative links
- 5-second timeout per link to prevent hanging
- Maximum 5 redirects followed per link
- User-Agent header to avoid blocking
- Drizzle ORM with Zod validation for type safety
- React Query for efficient data fetching and caching

## Security Implementation
- **Protocol Validation**: Only HTTP and HTTPS protocols allowed
- **Metadata Endpoint Protection**: Blocks access to cloud metadata services (169.254.169.254, etc.)
- **IPv4 Protection**: Blocks RFC1918 private networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), loopback (127.0.0.0/8), link-local (169.254.0.0/16), and other special-use addresses
- **IPv6 Protection**: Blocks ULA (fc00::/7), full link-local range (fe80::/10), multicast, and special-use addresses
- **DNS Resolution**: All hostnames are resolved to IP addresses before requests
- **DNS Rebinding Prevention**: Custom axios lookup function ensures only pre-validated IPs are used, preventing time-of-check/time-of-use attacks
- **Redirect Chain Validation**: Every redirect hop undergoes full DNS resolution and IP validation
- **Direct IP Blocking**: Direct IP URLs (e.g., http://192.168.1.1) are blocked if private
