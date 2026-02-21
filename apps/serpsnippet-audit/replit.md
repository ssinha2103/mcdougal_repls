# SERP Preview & SEO Auditor

## Overview

This is a full-stack web application that analyzes webpage SEO metadata and provides Google search result previews. Users can input any URL to get detailed analysis of title tags and meta descriptions, view how content appears in search results (both desktop and mobile), and receive actionable SEO recommendations. The application features real-time character counting, comprehensive SEO auditing, and smart optimization suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with centralized route registration
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot reload with Vite integration for seamless development experience

### Data Management
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Definition**: Centralized schema definitions in shared directory using Zod
- **Data Storage**: Currently using in-memory storage with interface for easy database migration
- **Caching**: Built-in analysis caching with configurable TTL (10 minutes default)

### Web Scraping Service
- **Engine**: Cheerio for HTML parsing and data extraction
- **User Agent Rotation**: Multiple user agents to avoid blocking
- **Timeout Handling**: 10-second request timeout for reliability
- **Error Recovery**: Graceful error handling with detailed error messages

### SEO Analysis Engine
- **Title Analysis**: Character count validation with optimal length recommendations (50-60 characters)
- **Meta Description Analysis**: Length validation with best practice guidelines (150-160 characters)
- **Issue Detection**: Automated identification of missing tags, length issues, and optimization opportunities
- **Recommendation System**: Context-aware suggestions for improving SEO performance

### Shared Schema System
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Validation**: Zod schemas for runtime validation and type inference
- **API Contracts**: Strongly typed API request/response interfaces

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database platform
- **Drizzle ORM**: Lightweight TypeScript ORM with excellent type safety
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production builds
- **Replit Plugins**: Development banner, cartographer, and runtime error modal for Replit environment

### Web Scraping and Parsing
- **Cheerio**: Server-side jQuery-like HTML parsing and manipulation
- **Fetch API**: Native HTTP client for making web requests

### Validation and Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Utilities
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **class-variance-authority**: Tool for building type-safe component APIs
- **nanoid**: Compact URL-safe unique string ID generator