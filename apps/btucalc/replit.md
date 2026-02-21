# BTU Calculator Application

## Overview

This is a full-stack HVAC BTU Calculator web application designed to help homeowners estimate heating and cooling requirements for their homes. The application uses ZIP code-based climate zone mapping and various building parameters to provide accurate BTU calculations for different HVAC systems including Ductless Mini-Split, Central AC, and Gas Boiler systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Hook Form for form state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for climate zone lookup and BTU calculations
- **Development**: Hot reload with Vite integration in development mode

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Drizzle ORM)
- **ORM**: Drizzle ORM with Zod schema validation
- **Development Storage**: In-memory storage implementation for development/testing
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Database Schema
- **Users Table**: Basic user management (id, username, password)
- **BTU Calculations Table**: Stores calculation history with all input parameters and results
- **Climate Zones Table**: ZIP code to IECC climate zone mapping for New England region

### API Endpoints
- `GET /api/climate-zone/:zipCode` - Retrieves climate zone data for a ZIP code
- `POST /api/calculate-btu` - Performs BTU calculations and stores results

### Core Calculation Logic
- **Climate Zone Mapping**: ZIP codes mapped to IECC Climate Zones (1-7)
- **Base Load Calculations**: 
  - Heating: 30-60 BTU per sq ft based on climate zone and insulation
  - Cooling: 15-30 BTU per sq ft based on climate zone
- **Adjustment Factors**:
  - Ceiling height adjustment (normalized to 8ft baseline)
  - Insulation quality multipliers (Poor: 1.2x, Average: 1.0x, Good: 0.9x)
  - Window heat loss/solar gain calculations
  - Occupant load adjustments

### UI Components
- **BTU Calculator Form**: Multi-section form with validation
- **Results Panel**: Displays calculation results with visual indicators
- **Glass Morphism Design**: Modern UI with transparency effects and N.E.T.R. branding

## Data Flow

1. **User Input**: Form data collected via React Hook Form with Zod validation
2. **Climate Zone Lookup**: ZIP code triggers API call to determine climate zone
3. **Calculation Processing**: Form submission sends data to backend calculation engine
4. **Results Storage**: Calculations stored in database with unique ID
5. **Results Display**: Formatted results shown with breakdown and recommendations

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI primitives, Shadcn/ui components
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Data Fetching**: TanStack React Query
- **Styling**: Tailwind CSS, Class Variance Authority, CLSX
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend Dependencies
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod for schema validation
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full TypeScript support with strict configuration
- **Linting/Formatting**: ESLint and Prettier configurations
- **Replit Integration**: Cartographer plugin and runtime error overlay

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with Express middleware integration
- **Database**: In-memory storage for rapid development iteration
- **Error Handling**: Runtime error overlay for development debugging

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Database**: PostgreSQL via Neon Database with connection pooling
- **Static Assets**: Express serves built frontend from public directory

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: PostgreSQL-backed session storage for user sessions
- **Build Scripts**: Separate dev, build, and start commands for different environments

The application follows a monorepo structure with shared types and schemas between frontend and backend, ensuring type safety across the full stack. The modular architecture allows for easy extension of HVAC system types and calculation methods.

## Recent Changes

### January 30, 2025 - Comprehensive Climate Zone System & Embedding Support
- **Complete USA Climate Zone Coverage**: Implemented comprehensive IECC climate zone detection for all US ZIP codes (Zones 1A-8)
- **Regional Mapping**: Accurate climate zone mapping using ZIP code ranges covering all 50 states
- **Climate-Driven Calculations**: BTU calculations now vary significantly by climate zone:
  - Base cooling loads: 15-30 BTU/sq ft based on climate zone
  - Base heating loads: 30-65 BTU/sq ft based on climate zone
  - Window heat loss multipliers adjusted for northern climates
- **Embedding Support**: Added X-Frame-Options "ALLOWALL" header to enable embedding in external websites
- **Enhanced Database**: Added major US cities across all climate zones for testing and validation

### January 26, 2025 - Single-Page Professional PDF Report
- **Condensed Professional PDF**: Comprehensive single-page report with professional branding
- **Load Calculations**: Detailed BTU breakdown with heating/cooling loads and tonnage
- **Two-Column Layout**: Efficient space utilization with calculation breakdown tables
- **Cost Analysis**: Annual operating cost estimates for heating and cooling seasons
- **Equipment Recommendations**: SEER ratings, efficiency recommendations, and rebate information
- **Installation Notes**: System-specific installation considerations and requirements
- **Professional Footer**: N.E.T.R. contact information, licensing, and service details
- **ACCA Compliance**: Manual J standard compliance with climate zone analysis