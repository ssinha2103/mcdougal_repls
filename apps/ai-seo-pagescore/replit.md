# SEO Analysis Tool - Project Documentation

## Overview
This project is a comprehensive SEO analysis tool designed to provide competitive intelligence and AI Trust Score metrics for websites. It enables users to analyze multiple URLs simultaneously, generating detailed SEO metrics including E-E-A-T signals, Google Reviews data, YouTube analytics, and competitive analysis. The business vision is to offer a robust solution for digital marketers and businesses to gain actionable insights into their online presence and competitive landscape.

## User Preferences
(None recorded yet - will be updated as user expresses preferences)

## System Architecture
The application features a full-stack JavaScript architecture. The **frontend** is built with React and TypeScript, utilizing Vite for fast development, Tailwind CSS for styling, Radix UI with shadcn/ui for UI components, TanStack Query for server state management, and Wouter for routing. The **backend** is an Express.js server developed in TypeScript. For **data persistence**, PostgreSQL is used in conjunction with Drizzle ORM.

Core design decisions include:
- **UI/UX:** A professional, modern aesthetic is maintained throughout the application, featuring glassmorphism design elements, curved edges, subtle gradients, and consistent branding (McDougall Interactive). Visual stability is prioritized through refined animations.
- **Technical Implementation:**
    - **Multi-URL Analysis:** Supports concurrent processing of multiple URLs to significantly reduce analysis time.
    - **PDF Export:** Advanced PDF generation system with a professional, print-optimized landscape layout, featuring structured report sections, visual data representations (bar charts), AI-generated strategic recommendations, and branded elements.
    - **E-E-A-T Scoring:** A refined 10-point E-E-A-T scoring algorithm calculates website trust and authority based on author credibility, technical authority, experience signals, and content depth.
    - **Progress Tracking:** Smooth, incremental progress tracking with visual enhancements during analysis.
- **Feature Specifications:**
    - Multi-URL batch analysis.
    - Comprehensive SEO metrics collection (backlinks, organic traffic, keywords).
    - E-E-A-T signal detection.
    - Integration with Google Reviews and YouTube analytics.
    - Social media presence analysis.
    - Technology stack detection.
    - Competitive intelligence.
    - Professional PDF export of analysis reports.
    - Help and Contact Us pages with agency branding.

## External Dependencies
- **DataForSEO API:** Used for collecting various SEO metrics.
- **Google Places API:** Integrated for Google Reviews data.
- **YouTube API:** Utilized for YouTube channel analytics.
- **PostgreSQL:** Primary database for storing analysis jobs and SEO metrics.
- **Puppeteer:** Used for server-side PDF generation.

## Recent Changes
- 2025-09-18: Fixed Critical Platform Count and LinkedIn Detection Issues
  - **YouTube Platform Count Bug**: Fixed issue where YouTube analytics were detected (subscribers, videos, etc.) but platform count showed 0
  - **LinkedIn Detection Enhancement**: Improved LinkedIn profile detection with enhanced regex patterns supporting company, personal, school, and pub profiles
  - **Technical Implementation**: Added centralized `ensurePlatform()` helper function for consistent platform handling across manual and auto-detection scenarios
  - **Database Verification**: Confirmed fix works - socialMediaPresence now properly includes 'youtube' when YouTube data is detected (changed from {} to {youtube})
  - **Guard Condition Fix**: Corrected logic to prevent redundant API calls when manual YouTube URLs are provided
  - **Architecture Review**: All changes reviewed and approved by architect tool, following established coding patterns and security practices
- 2025-02-05: Enhanced Advanced AI Search Analysis with Website Logo Integration
  - Repositioned Advanced AI Search Analysis table as 5th section (before insights) with professional visual hierarchy
  - Added website favicon integration using Google's S2 favicon service with fallback gradient logos
  - Implemented "Your Website" visual distinction with blue highlighting, border accent, and "You" indicator
  - Enhanced domain display with proper favicon loading and branded fallback colors
  - Added comprehensive methodology legend with color-coded analysis criteria
  - Updated PDF generator to include matching Advanced AI Search Analysis section with proper page numbering (now 9 pages total)
  - Synchronized frontend table design with PDF export for consistent E-E-A-T scoring and AI readiness metrics
- 2025-02-04: Added professional favicon and enhanced meta tags
  - Created custom SVG favicon with blue-to-purple gradient matching platform branding
  - Favicon features analytics chart bars with AI indicator dot representing SEO analysis functionality
  - Enhanced HTML head with comprehensive meta tags including Open Graph and Twitter Card support
  - Added theme color meta tag for better mobile browser integration
  - Improved SEO with proper favicon implementation for brand recognition
- 2025-02-04: Enhanced Advanced AI Search Analysis Display
  - Redesigned AI Search Optimization Insights section with prominent visual styling
  - Added comprehensive Traditional Authority, AI Trust Signals, and AI Overview Strategy analysis
  - Implemented detailed E-E-A-T evaluation with actionable insights
  - Added AI readiness assessment and future-proofing recommendations
  - Enhanced visual hierarchy with gradient cards, icons, and hover effects
  - Provided comprehensive AI optimization takeaways and strategic guidance
- 2025-02-04: Restored Advanced AI Search Analysis Table
  - Re-implemented dedicated tabular view showing E-E-A-T Score, Trust Signals, AI Readiness, and Content Authority for each domain
  - Added visual progress indicators with purple dots for Trust Signals scoring
  - Implemented color-coded badges for Content Authority levels (Expert/Intermediate/Basic)
  - Added AI Readiness percentage bars with gradient styling
  - Included comprehensive methodology legend explaining analysis criteria
  - Enhanced domain display with branded icons and detailed URL information