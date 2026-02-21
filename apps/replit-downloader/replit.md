# Replit Code Downloader

## Overview

A web application that lets users download source code from public Replit projects as ZIP files. Users paste a Replit project URL, the server fetches the ZIP from Replit's public download endpoint, and streams it back to the user. Download history is tracked in a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (client/)
- **Framework**: React with TypeScript, built with Vite
- **Routing**: Wouter (lightweight router) with two routes: Home page and 404
- **State Management**: TanStack React Query for server state and data fetching
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support), custom color system using HSL variables
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (server/)
- **Framework**: Express 5 on Node.js with TypeScript (runs via tsx in dev)
- **API Pattern**: REST API under `/api/` prefix. Currently one main endpoint: `POST /api/download` which proxies ZIP downloads from Replit
- **Dev Server**: Vite dev server is integrated as middleware in development; in production, static files are served from `dist/public`
- **Build**: Custom build script (`script/build.ts`) uses Vite for client and esbuild for server, outputting to `dist/`

### Database
- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema**: Defined in `shared/schema.ts` — single table `downloads` tracking download history (id, replitUrl, replName, username, status, downloadedAt)
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database
- **Connection**: Node `pg` Pool via `server/db.ts`

### Shared Code (shared/)
- `shared/schema.ts` contains Drizzle table definitions, Zod validation schemas, and TypeScript types used by both client and server
- The `downloadRequestSchema` validates Replit URLs on both client (form validation) and server (request validation)

### Key Design Decisions
1. **Proxy pattern for downloads**: The server fetches ZIPs from Replit and streams them to the client, avoiding CORS issues with direct browser requests
2. **Shared schema**: Zod schemas in `shared/` ensure consistent validation between frontend forms and backend API handlers
3. **No authentication**: This is a public utility tool — no auth system is implemented
4. **Database storage for history**: Uses `connect-pg-simple` for session storage (available but not actively used), and Drizzle ORM for download tracking

## External Dependencies

- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable. Used for storing download history
- **Replit ZIP endpoint**: The app fetches from `https://replit.com/@{username}/{replName}.zip` to get project source code. This only works for public Replit projects
- **Google Fonts**: Loads Architects Daughter, DM Sans, Fira Code, and Geist Mono fonts from Google Fonts CDN
- **No other external APIs or services**: No auth providers, no payment systems, no email services are actively used (though dependencies like passport, stripe, nodemailer exist in package.json as part of the template)