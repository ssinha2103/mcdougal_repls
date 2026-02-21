# Rainstar Digital Legal Marketing Website

## Overview

This is a comprehensive legal marketing website for Rainstar Digital, a company specializing in digital marketing services for law firms since 1995. The application is built as a full-stack solution featuring a React frontend with modern UI components and an Express.js backend with PostgreSQL database integration. The site serves as both a marketing platform and lead generation tool, showcasing services like SEO, content marketing, social media management, and web design specifically tailored for legal practices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form submissions
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming

### Backend Architecture  
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Development**: Hot module replacement via Vite integration for development workflow

### Data Storage Solutions
- **Primary Database**: PostgreSQL accessed via Neon Database serverless connection
- **ORM**: Drizzle ORM with schema definitions in TypeScript
- **Database Schema**: Two main tables - users for authentication and contact_inquiries for lead capture
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Fallback Storage**: In-memory storage implementation for development/testing scenarios

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with secure cookie configuration
- **User Management**: Basic user creation and retrieval with hashed password storage
- **Database Sessions**: PostgreSQL session store for production persistence
- **Security**: CSRF protection and secure session configuration

## External Dependencies

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting service for production database
- **Google Services**: Integration references for Google Premier Partner status and Google Ads compliance
- **External APIs**: Contact form submissions can integrate with email services and CRM systems

### UI and Development Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration  
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets including social media icons
- **Date-fns**: Date manipulation and formatting utilities

### Build and Development Tools
- **Vite**: Frontend build tool and development server with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production builds
- **Replit Integration**: Development environment integration with error overlays and cartographer plugin for enhanced debugging