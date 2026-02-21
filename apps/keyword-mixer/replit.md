# Replit.md - Keyword Combiner Web Application

## Overview

This is a professional-grade Keyword Combiner Tool designed for SEO experts, marketers, and advertisers. The application allows users to input multiple keyword lists and generate all possible keyword combinations using smart combination logic and filtering techniques. It's built as a full-stack web application with a React frontend and Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Build**: ESBuild for production bundling

### Project Structure
```
/client          - React frontend application
/server          - Express backend API
/shared          - Shared TypeScript schemas and types
/migrations      - Database migration files
```

## Key Components

### Keyword Processing Engine
- **Combination Logic**: Cartesian product generation with configurable patterns (full, pairs, custom)
- **Match Type Support**: Broad, phrase, exact, and modified broad match formatting
- **Filtering System**: Word count, character count, inclusion/exclusion filters
- **Enhancement Features**: Stopword removal, duplicate detection, word order correction

### User Interface Components
1. **KeywordInputSection**: Dynamic keyword group management with color-coded lists
2. **CombinationSettings**: Configuration panel for combination patterns and match types
3. **ResultsSection**: Paginated results display with sorting and export functionality
4. **StatsPanel**: Real-time statistics and filter controls
5. **TemplateModal**: Pre-built templates for common use cases (e-commerce, local SEO, etc.)

### API Endpoints
- `POST /api/generate-keywords` - Main keyword generation endpoint
- `POST /api/export-keywords` - Export functionality for various formats (CSV, TXT, JSON, Google Ads CSV)
- `GET /health` - Health check endpoint for server uptime monitoring

## Data Flow

1. **Input Phase**: Users create keyword groups through the input interface
2. **Configuration**: Settings are applied for combination patterns, match types, and filters
3. **Processing**: Backend generates all possible combinations using Cartesian product logic
4. **Filtering**: Results are filtered based on user-defined criteria
5. **Formatting**: Keywords are formatted according to selected match type
6. **Display**: Results are paginated and displayed with statistics
7. **Export**: Users can export results in multiple formats

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight client-side routing
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **drizzle-orm**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL database driver
- **express**: Web framework for Node.js
- **zod**: Runtime type validation for schemas

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- TSX for backend development with auto-restart
- Shared TypeScript configuration for consistent type checking

### Production Build
- Vite builds frontend to `/dist/public`
- ESBuild bundles backend to `/dist/index.js`
- Static file serving integrated into Express server

### Database Management
- Drizzle Kit for schema management and migrations
- Environment-based database URL configuration
- PostgreSQL session storage for user sessions

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Development/production environment detection
- Replit-specific optimizations when running on Replit platform

## Key Features Implemented

1. **Multi-Group Keyword Input**: Up to 5+ dynamic keyword groups with custom labels
2. **Advanced Combination Logic**: Full Cartesian product with partial combination support
3. **Match Type Formatting**: Google Ads compatible output formats
4. **Smart Filtering**: Multiple filter criteria with real-time statistics
5. **Export Functionality**: Multiple export formats including Google Ads CSV
6. **Template System**: Pre-built templates for common SEO/PPC scenarios
7. **Responsive Design**: Mobile-friendly interface with adaptive layouts
8. **Performance Optimization**: Efficient processing and pagination for large result sets
9. **McDougall Interactive Branding**: Professional header and footer with client branding
10. **Liquid Glass Design**: Modern glassmorphism styling with backdrop blur effects

## Recent Changes

### October 6, 2025

✓ **Fixed Combination Calculator to Show Unique Keywords**
  - Statistics panel now counts UNIQUE keywords instead of total entries including duplicates
  - Calculation display now accurately reflects expected number of combinations
  - Prevents user confusion when duplicate keywords are entered (e.g., "hiiiii" repeated 21 times)
  - Example: Instead of misleading "21 × 27 × 37 = 20,979", now shows "2 × 2 × 2 = 8" when only 2 unique keywords exist per column

### October 4, 2025

✓ **Deployment Configuration Fixes for Replit Autoscale**
  - Removed health check interval self-pinging behavior that caused deployment failures
  - Removed reusePort option from server.listen for cleaner Autoscale deployment
  - Kept /health endpoint available for external health monitoring if needed
  - Server now starts cleanly without unnecessary startup processes

✓ **UI Layout Improvements**
  - Moved statistics panel from sidebar to below Generate Keywords button (full-width)
  - Expanded keyword input columns: increased height from 200px to 350px (+75% taller)
  - Increased textarea font size from 14px to 16px for better readability
  - Enhanced vertical space utilization with improved layout flow

✓ **iFrame Embedding Support**
  - Added iframe-resizer script for automatic iframe height adjustment
  - Application can now be embedded in other websites with proper resizing

### September 30, 2025

✓ **True HTML Placeholder Behavior**
  - Refactored keyword input sections to use native HTML placeholders
  - Columns now start completely empty with placeholder text that disappears on typing
  - Simplified state management by removing complex placeholder synchronization
  - Enhanced user experience with natural input behavior

✓ **Export Functionality Fixes**
  - Fixed TXT export to output clean plain text keyword lists
  - Fixed CSV export to proper RFC4180 compliant format
  - Fixed JSON export to valid JSON array structure
  - Fixed Google Ads CSV export with proper headers and formatting
  - All exports now work correctly with large keyword lists (1000+ keywords)

✓ **Manual Keyword Input Improvements**
  - Fixed textarea controlled input issues preventing manual keyword entry
  - Users can now freely type in all three columns (A, B, C)
  - Preserved natural typing experience with proper newline handling
  - Backend filtering ensures clean data processing

### July 30, 2025

✓ **McDougall Interactive Branding Integration**
  - Added professional header with McDougall Interactive logo and navigation
  - Created comprehensive footer with company links and services
  - Updated page title and SEO meta tags for better search visibility
  - Added company tagline and branding throughout the application

✓ **Design System Updates**
  - Applied liquid glass (glassmorphism) styling across all components
  - Fixed input and textarea styling with consistent backdrop blur effects
  - Enhanced visual hierarchy with proper spacing and typography
  - Integrated gradient backgrounds for modern aesthetic

The application follows modern web development best practices with type safety, component reusability, and scalable architecture patterns.