# YouTube SEO Research Tool

## Overview

A web application that helps YouTube creators and marketers analyze top-performing videos for specific keywords. Users can search for keywords, view detailed metrics of ranking videos, discover trending tags, and get data-driven insights to optimize their content strategy. The tool provides a clean, data-focused interface with dark mode support and comprehensive analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system extending the "New York" style preset

**Design System**:
- Material Design-inspired approach focused on data clarity and scannable information
- Custom color palette with dark mode as primary (deep charcoal backgrounds with vibrant blue accents)
- Typography using Inter for UI/metrics and JetBrains Mono for technical data
- Comprehensive component library including cards, buttons, badges, dialogs, and data visualization components

**Key Pages**:
- Home page with hero section and search functionality
- Search results page with video cards, metrics dashboard, and filtering options
- Theme toggle supporting light/dark modes

### Backend Architecture

**Server Framework**: Express.js running on Node.js
- **API Design**: RESTful endpoints with rate limiting
- **Development Setup**: Vite middleware integration for HMR in development
- **Build Process**: esbuild for production server bundling

**API Endpoints**:
- `/api/search` - YouTube video search with rate limiting (10 requests/minute)
  - Query parameters: keyword, maxResults, order
  - Returns video data including metrics, tags, and channel information

**Data Validation**: Zod schemas for request/response validation ensuring type safety across client and server

**Rate Limiting**: Express rate limiter protecting the search endpoint from abuse

### Data Storage Solutions

**Current Implementation**: In-memory storage using Map-based data structures
- User management with `MemStorage` class implementing `IStorage` interface
- Designed for easy migration to persistent storage (interface-based abstraction)

**Database Configuration**: Drizzle ORM configured for PostgreSQL via Neon serverless
- Schema defined in `shared/schema.ts`
- Migration support configured but not actively used
- Database URL expected via `DATABASE_URL` environment variable

**Session Management**: Connect-pg-simple for PostgreSQL session store (configured but not actively implemented)

### External Dependencies

**YouTube Data API v3**:
- Primary data source for video search and metrics
- Requires `YOUTUBE_API_KEY` environment variable
- Fetches video snippets, statistics, and metadata
- Error handling for quota limits and API failures

**Third-Party Libraries**:
- Radix UI primitives for accessible component foundations
- TanStack React Query for API state management and caching
- Wouter for lightweight routing
- date-fns for date formatting
- Lucide React for iconography

**Development Tools**:
- Replit-specific plugins for runtime error handling and development banners
- TypeScript for type safety across the entire stack
- Vite plugins for enhanced development experience

**Design Assets**:
- Google Fonts: Inter and JetBrains Mono
- Custom generated hero images stored in `attached_assets`

**Production Considerations**:
- Environment-based configuration for API keys
- Rate limiting to prevent API quota exhaustion
- Error boundaries and user-friendly error messages
- Responsive design supporting mobile and desktop viewports