# Keyword Density & Readability Scorer

## Overview

This is a professional SEO content analysis tool that provides keyword density analysis and readability scoring. The application allows users to input text content and a target keyword, then analyzes the text to provide metrics including keyword density, word frequency distribution, n-gram extraction, and Flesch-Kincaid readability scores. The tool is designed with a focus on information clarity and data presentation, following professional SEO tool design patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: Shadcn/ui with Radix UI primitives
- Utilizes a comprehensive design system with components in the "new-york" style
- Light mode only - dark theme removed for simplified user experience
- Professional color palette with primary blue accent for CTAs

**Styling Approach**: 
- Tailwind CSS for utility-first styling with custom configuration
- Custom CSS variables for theming flexibility
- Design system follows professional SEO tool patterns (Ahrefs, SEMrush-inspired)
- Typography uses Inter for UI and JetBrains Mono for metric displays

**State Management**: 
- TanStack React Query for server state and API data fetching
- React hooks for local component state
- Custom hooks for mobile responsiveness and toast notifications

**Routing**: Wouter for lightweight client-side routing

**Design Philosophy**: 
- Clean, centered single-page layout without headers or footers
- Information clarity over visual flair - emphasis on scannable, actionable data presentation
- Generous spacing and responsive design for optimal readability
- Primary blue accent for call-to-action buttons

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Language**: TypeScript with ES modules

**API Structure**:
- RESTful API design with single analysis endpoint (`POST /api/analyze`)
- Request validation using Zod schemas
- JSON-based request/response format

**Text Analysis Engine** (`server/text-analyzer.ts`):
- Tokenization and text processing
- Stop word filtering (common English words)
- Syllable counting for readability metrics
- Keyword density calculation with status indicators (low/optimal/warning/danger)
- Word frequency analysis
- N-gram extraction (2-gram and 3-gram phrases)
- **Multiple Readability Metrics** (all dynamically calculated):
  - Flesch Reading Ease (0-100 score with interpretation)
  - Flesch-Kincaid Grade Level
  - SMOG Index (polysyllabic word analysis)
  - Coleman-Liau Index (letter-based calculation)
  - Info tooltips explain each metric for user understanding
- **Keyword Suggestion Engine**: Extracts potential keywords based on frequency, word length, and density
- **Competitive Benchmarking**: Visual density comparison against industry standards

**Error Handling**: Centralized error middleware with proper HTTP status codes

**Development Tools**:
- Hot module replacement via Vite in development
- Custom logging middleware for API request tracking
- Runtime error overlay for development debugging

### Data Storage Solutions

**Current Implementation**: In-memory storage using Map data structures
- User storage interface defined but minimal implementation
- Storage abstraction (`IStorage` interface) allows for future database integration
- No persistent storage currently implemented for analysis results

**Database Configuration**: 
- Drizzle ORM configured for PostgreSQL
- Schema definitions in `shared/schema.ts`
- Migration support configured but database not actively used
- Neon serverless Postgres driver included

**Session Management**: Connect-pg-simple configured for PostgreSQL session store (not actively used)

### External Dependencies

**UI Component Libraries**:
- Radix UI primitives (accordion, dialog, dropdown, popover, tabs, toast, etc.)
- Embla Carousel for carousel functionality
- CMDK for command palette interface
- Class Variance Authority for component variant management

**Data Fetching & State**:
- TanStack React Query v5 for server state management
- Zod for runtime type validation and schema definitions
- Drizzle Zod for database schema validation

**Database & Storage**:
- Drizzle ORM for database operations
- @neondatabase/serverless for Postgres connectivity
- Connect-pg-simple for session storage

**Development Tools**:
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)
- ESBuild for production bundling
- TypeScript for type safety

**Styling & Utilities**:
- Tailwind CSS with PostCSS
- clsx and tailwind-merge for className management
- date-fns for date manipulation
- Lucide React for iconography

**Fonts**: 
- Google Fonts: Inter (primary UI font)
- JetBrains Mono (monospace for metrics)

**Build & Runtime**:
- Vite for frontend development and building
- TSX for TypeScript execution in development
- Path aliasing configured for clean imports (@/, @shared/, @assets/)