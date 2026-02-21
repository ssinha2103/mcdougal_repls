# Kentucky Asbestos Exposure Sites Map Application

## Overview

This is a professional legal services web application for Satterley & Kelley PLLC, specializing in mesothelioma cases. The application features an interactive map displaying 126 authentic Kentucky asbestos exposure locations from the firm's legal documentation, with contact form functionality for potential clients in Kentucky and surrounding areas. All authentication, dashboard, and partner tracking functionality has been removed for a simpler, client-focused experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for client-side development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom legal theme colors (navy, legal-red, legal-gray)
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Map Integration**: Leaflet.js for interactive mapping functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with Express routes
- **Build System**: ESBuild for production bundling
- **Development**: TSX for TypeScript execution

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon Database)
- **Development Storage**: In-memory storage implementation for development/testing
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Validation**: Zod schemas for runtime type validation

## Key Components

### Database Schema
- **asbestos_sites**: Stores 126 Kentucky location data including precise coordinates, site types, exposure periods, and cleanup status
- **contact_submissions**: Stores client contact form submissions with exposure details (view-only for law firm)
- **featured_sites**: Stores featured site images and details for enhanced presentation
- **Schema Types**: Chemical plants, industrial facilities, power plants, manufacturing, refineries, automotive, transportation, nuclear facilities, and commercial buildings

### API Endpoints
- `GET /api/asbestos-sites`: Retrieve filtered asbestos exposure sites
- `GET /api/asbestos-sites/:id`: Get specific site details
- `GET /api/featured-sites`: Retrieve featured sites with images
- `POST /api/contact`: Submit contact form for legal consultation
- `GET /api/contact-submissions`: Internal endpoint for contact form submissions

### Map Features
- Interactive Leaflet map centered on Kentucky (37.8393, -84.2700) with zoom level 7
- 126 authentic Kentucky asbestos exposure sites with precise coordinates
- Filtering by site type (chemical, industrial, power plants, manufacturing, etc.), exposure period, and search terms
- Enhanced site markers with hover tooltips and detailed popup information
- Mobile-responsive map interface with professional color coding

### Legal Compliance System
- **Legal Popup Component**: Professional modal system displaying comprehensive legal disclaimers and privacy policies
- **Disclaimer Banner**: Dismissible attorney advertising banner with localStorage persistence
- **Attorney Advertising Notices**: Required legal disclaimers for law firm websites
- **Privacy Policy**: Complete data collection and usage information
- **GDPR Compliance**: Cookie and data usage notifications

### Contact System
- Legal consultation contact form with validation
- Exposure details collection for case assessment
- Form submission with disclaimer acceptance requirement
- Integrated legal popup access for disclaimer and privacy policy
- Simplified submission process without user authentication requirements

### External Practice Area Integration
- **Backlink System**: Footer navigation linking to authentic Satterley & Kelley practice areas
- **Practice Areas**: Asbestos & Mesothelioma, Personal Injury, Car Accidents, Wrongful Death, Railroad Injuries, Toxic Torts
- **Resource Links**: About page, verdicts & settlements, attorney profiles, contact information
- **Social Media Integration**: Facebook, Twitter, LinkedIn profiles with proper target="_blank" attributes

## Data Flow

1. **Site Data Loading**: Frontend queries `/api/asbestos-sites` with filters
2. **Map Rendering**: Leaflet dynamically loads and places markers based on site coordinates
3. **User Interaction**: Site selection opens detailed modal with site information
4. **Contact Submission**: Form data validated client-side and submitted to `/api/contact`
5. **Data Storage**: Contact submissions stored in PostgreSQL with unique IDs

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for serverless PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-kit for database operations
- **Validation**: zod for schema validation and type safety
- **UI Library**: @radix-ui components for accessible UI primitives
- **Maps**: Leaflet.js (loaded via CDN) for interactive mapping
- **Forms**: @hookform/resolvers for form validation integration

### Development Tools
- **Replit Integration**: @replit/vite-plugin-runtime-error-modal and cartographer
- **Build Tools**: Vite, ESBuild, TypeScript compiler
- **Styling**: Tailwind CSS with PostCSS processing

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- In-memory storage for rapid development iteration
- Replit-specific development banner and error handling

### Production Build
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command
4. **Environment**: NODE_ENV=production with proper database URL configuration

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **Development**: Uses Vite dev server with proxy to Express API
- **Production**: Serves static files through Express with API routes

The application follows a traditional full-stack architecture with clear separation between client and server code, using modern tooling for both development efficiency and production performance.