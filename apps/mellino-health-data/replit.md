# Ohio Maternity Care Finder

## Overview

Ohio Maternity Care Finder is a full-stack web application designed to help pregnant people in Ohio find safe, appropriate maternity hospitals. The application uses objective maternity-related quality data from CMS (Centers for Medicare & Medicaid Services) to help users make informed decisions based on their location and pregnancy risk profile.

The system ingests hospital data from multiple CMS datasets, filters for Ohio hospitals, geocodes them using ZIP code lookups, and presents the information through an interactive web interface with search and mapping capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: FastAPI (Python 3) running on port 3000
- **Database**: SQLite for local data storage (`maternity_hospitals.db`)
- **API Design**: RESTful endpoints under `/api` prefix for hospital search and retrieval
- **Data Processing**: Separate ETL scripts for data ingestion that can run independently

The backend serves both the API and static frontend files in production. The architecture separates data ingestion from the web application, allowing periodic data refreshes without service interruption.

### Frontend Architecture
- **Framework**: React 19 with Vite as the build tool
- **Styling**: Tailwind CSS v4 with custom color scheme (navy, blue, gold theme)
- **Typography**: Playfair Display for headings, Inter for body text
- **Mapping**: Leaflet with React-Leaflet for interactive hospital location maps
- **Development Server**: Port 5000 with proxy to backend API

### Data Pipeline
- **Source**: CMS Provider Data Catalog via API (3 datasets: Hospital General Information, Maternal Health, Birthing Friendly Hospitals)
- **Processing**: Python scripts in `scripts/` directory handle data download and transformation
- **Geocoding**: ZIP code lookup table for Ohio coordinates (no external API calls needed)
- **Storage**: CSV files in `data/` directory serve as intermediate storage before SQLite ingestion

### Key Design Decisions

**Separation of Data Pipeline and Web App**
- Data ingestion scripts run independently of the web server
- Allows scheduled data refreshes without downtime
- CSV files provide a checkpoint between external data and database

**ZIP Code-Based Geocoding**
- Uses pre-built coordinate lookup table for Ohio ZIP codes
- Eliminates need for external geocoding API calls
- Fast and reliable for Ohio-specific use case

**SQLite Database**
- Lightweight, file-based storage suitable for read-heavy workload
- No external database server required
- Easy to refresh by rebuilding from CSV sources

## External Dependencies

### CMS Data Sources
- Hospital General Information (`xubh-q36u`)
- Maternal Health - Hospital (`nrdb-3fcy`)
- Birthing Friendly Hospitals (`hbf-map`)
- Base URL: `https://data.cms.gov/provider-data/api/1/metastore/schemas/dataset/items`

### Frontend Libraries
- React 19, React DOM
- Axios for HTTP requests
- Leaflet/React-Leaflet for maps
- Tailwind CSS for styling

### Backend Libraries
- FastAPI with CORS middleware
- Uvicorn ASGI server
- Pandas for data processing
- SQLite3 (standard library)

### Optional External Services
- Google Maps Geocoding API (optional, environment variable `GOOGLE_MAPS_API_KEY`)
- Currently using ZIP code lookup instead for Ohio hospitals