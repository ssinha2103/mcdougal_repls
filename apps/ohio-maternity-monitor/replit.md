# Ohio Maternity Care Finder

## Overview

A full-stack web application that helps pregnant people in Ohio find safe, appropriate maternity hospitals based on their location, pregnancy risk profile, and objective quality data from CMS (Centers for Medicare & Medicaid Services). The app integrates real hospital data including C-section rates, maternal morbidity rates, birthing-friendly designations, and geographic information to provide personalized hospital recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled with Vite
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack React Query for server state and data fetching
- **Maps**: Leaflet for interactive hospital location mapping
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx
- **API Design**: RESTful endpoints under `/api/` prefix
- **Database**: SQLite via better-sqlite3 for hospital data storage
- **Build System**: Custom esbuild script for production bundling

### Data Pipeline
- **ETL Scripts**: Python scripts in `scripts/` directory for downloading and processing CMS hospital data
- **Data Sources**: Three CMS datasets (Hospital General Information, Maternal Health, Birthing Friendly Hospitals)
- **Geocoding**: Google Maps API integration for Ohio hospital coordinates
- **Database Building**: `scripts/build_database.py` creates `maternity_care.db` SQLite database

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route page components
    lib/          # Utilities and API client
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer
shared/           # Shared types and schema (Drizzle ORM for PostgreSQL - prepared for future use)
scripts/          # Python data pipeline scripts
data/             # Downloaded CMS CSV files
```

### Key Design Decisions
1. **SQLite for hospital data**: Chosen for simplicity and portability; hospital data is read-heavy and relatively static
2. **Separate data pipeline**: Python scripts can be run independently to refresh CMS data without affecting the running application
3. **Risk-based search**: Hospitals are filtered and ranked based on user's pregnancy risk level (low/medium/high)
4. **Distance-based results**: Uses Haversine formula to calculate distances from user's ZIP code

## Complete Feature List

### Search Functionality
- **ZIP Code Search**: Search hospitals by Ohio ZIP code (130+ ZIP codes supported)
- **Distance Filter**: Adjustable search radius from 5 to 100 miles
- **Risk Assessment**: Checkboxes for high-risk pregnancy, prior C-section, and conditions (diabetes, blood pressure, multiples, preterm history)
- **Smart Sorting**: Different sorting algorithms based on risk level:
  - Low risk: Prioritizes distance with birthing-friendly bonus
  - Medium risk: Balances distance with C-section rate and morbidity
  - High risk: Prioritizes quality metrics over distance

### Hospital Cards
- Hospital name with ranking number
- Address and distance from search location
- Phone number with click-to-call functionality
- C-section rate with color coding (green < 30%, red > 30%)
- Maternal morbidity rate
- Birthing Friendly badge when applicable
- Feature tags (up to 3 shown, with "+X more" indicator)
- Quick action buttons: Directions, Call, Details

### Hospital Details Page
- Full hospital information header
- Click-to-call phone number link
- Interactive Leaflet map showing exact location
- Quality metrics cards: C-section rate, early elective delivery, complication rate, overall rating
- About section with description and features list
- Action buttons:
  - **Call Hospital**: Opens phone dialer with hospital number
  - **Get Directions**: Opens Google Maps with hospital as destination
  - **Share**: Uses Web Share API or copies link to clipboard
  - **Contact Mellino Law**: Links to law firm contact page

### Interactive Map
- Numbered markers for each hospital
- Birthing Friendly hospitals shown in gold color
- Popups with hospital name, address, distance, and "View Details" link
- Click marker to navigate to hospital details page
- Auto-fit bounds to show all search results

### Data
- 158 Ohio hospitals with geocoded locations
- Real CMS quality data where available
- Phone numbers for direct contact

## External Dependencies

### Database
- **SQLite**: Primary database via better-sqlite3 for hospital data (`maternity_care.db`)
- **PostgreSQL**: Drizzle ORM schema configured for future user authentication (requires `DATABASE_URL` environment variable)

### APIs & Services
- **CMS Provider Data Catalog**: Source for hospital quality metrics and maternal health data
- **Google Maps Geocoding API**: Used for geocoding Ohio hospital addresses (requires `GOOGLE_MAPS_API_KEY` environment variable)
- **Leaflet/CARTO**: Map tiles for hospital location visualization

### Key NPM Packages
- `better-sqlite3`: SQLite database driver
- `drizzle-orm` + `drizzle-kit`: PostgreSQL ORM (for user schema)
- `@tanstack/react-query`: Data fetching and caching
- `wouter`: Lightweight routing
- `react-hook-form` + `zod`: Form handling and validation
- `leaflet`: Interactive maps

### Python Requirements
- `requests`: For downloading CMS data