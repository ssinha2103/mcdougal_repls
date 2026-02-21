# Dog Bite Law Application

## Overview

This is a full-stack web application designed for a Massachusetts law firm specializing in dog bite cases. The application provides an interactive map of North Shore towns with legal information and allows potential clients to submit bite reports. The system serves as both an educational resource about Massachusetts dog bite laws and a lead generation tool for the law firm.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture. Key architectural decisions include:

- **Vite Build System**: Chosen for fast development builds and hot module replacement
- **Wouter Router**: Lightweight routing solution for single-page navigation
- **React Query**: Handles server state management, caching, and API interactions
- **Shadcn/ui Components**: Provides a consistent design system with Radix UI primitives and Tailwind CSS styling
- **Responsive Design**: Mobile-first approach with dedicated mobile components and overlays

### State Management
- **React Query**: Manages server state, API caching, and data synchronization
- **React Hooks**: Local component state and form management
- **Form Management**: React Hook Form with Zod validation for type-safe form handling

### UI/UX Design Patterns
- **Design System**: Custom legal-themed color palette with professional blue and gold colors
- **Interactive Map**: Mapbox integration for town selection and geographic visualization
- **Mobile-Responsive**: Dedicated mobile overlay components for smaller screens
- **Accessibility**: Proper ARIA labels, keyboard navigation, and semantic HTML

### Backend Architecture
The server follows a REST API pattern with Express.js:

- **Express.js Framework**: Handles HTTP routing, middleware, and request processing
- **Type-Safe APIs**: Shared schema validation between client and server using Zod
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Integration**: Vite middleware integration for seamless development experience

### Data Storage Solutions
The application uses a flexible storage pattern:

- **Storage Interface**: Abstract storage interface allows for multiple database implementations
- **Memory Storage**: In-memory implementation for development and testing
- **Drizzle ORM**: Configured for PostgreSQL with type-safe database operations
- **Schema Design**: Shared TypeScript schemas ensure type safety across the entire stack

### Database Schema
Two main entities:
- **Users**: Basic user authentication structure
- **Bite Reports**: Comprehensive incident reporting with contact information, location, and incident details

### Town Data
- **Coverage**: 37 North Shore Massachusetts towns with accurate GPS coordinates
- **Contact Information**: Complete animal control, police, and town clerk phone numbers
- **Regional Services**: Some towns share Ipswich Regional Animal Control
- **Updates (2025-08-20)**: Corrected coordinates for Newbury, West Newbury, and Salisbury to ensure accurate map positioning

### API Structure
RESTful endpoints following standard conventions:
- `POST /api/bite-reports`: Submit new bite reports with validation
- `GET /api/bite-reports`: Retrieve all reports (admin functionality)
- Proper HTTP status codes and error responses
- Request/response validation using shared Zod schemas

### Build and Deployment
- **Development**: Vite dev server with Express API integration
- **Production**: Static build output with server-side API deployment
- **TypeScript**: Full type safety across client, server, and shared code
- **ESBuild**: Fast server bundling for production deployment