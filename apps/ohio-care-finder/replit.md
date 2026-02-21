# Ohio Maternity Access Map

## Project Overview

A production-ready FastAPI web application that maps Ohio hospitals providing Labor & Delivery (L&D) services and NICU care. Designed for journalists, researchers, and the public to understand maternity care access across Ohio.

**Live Status**: ✅ Fully functional
**Last Updated**: October 20, 2025

## Purpose

- Help Ohioans find nearest maternity care facilities
- Track closures of maternity services since 2022
- Provide transparent, downloadable data for reporting and research
- Enable journalists to cite accurate information about maternity care access

## Key Features

### Interactive Map
- Leaflet-based map showing all Ohio hospitals with maternity services
- Color-coded markers by NICU level (None/II/III/IV)
- L&D badge indicators on markers
- Marker clustering for better visibility
- Hospital popups with quick info

### ZIP Code Search
- Find nearest hospitals from any Ohio ZIP code
- Real-time distance calculation using haversine formula
- Optional OpenRouteService API integration for actual drive times
- Graceful fallback to distance-based estimates (45 mph avg speed)
- Results show distance, estimated travel time, and services

### Filtering
- Filter by L&D availability
- Filter by NICU level (II+, III+, IV only)
- Toggle closure timeline visibility

### Data Export
- Download hospitals CSV
- Download closures CSV
- Suitable for data journalism and analysis

### Closures Timeline
- Track maternity service closures since 2022
- Links to source documentation
- Filterable and sortable

## Tech Stack

**Backend**:
- Python 3.11
- FastAPI (web framework)
- SQLModel (SQLite ORM)
- Uvicorn (ASGI server)
- httpx (for OpenRouteService API)
- pandas (CSV processing)

**Frontend**:
- Jinja2 templates (server-side rendering)
- Leaflet.js (interactive maps)
- Leaflet.markercluster (marker clustering)
- Turf.js (geospatial calculations)
- Vanilla JavaScript (no frameworks)

**Data**:
- SQLite database (auto-created)
- CSV seed files for easy updates
- 25 Ohio hospitals with current data
- 3 closure records since 2022
- 27 Ohio ZIP codes for geocoding

## Project Structure

```
/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLModel database models
│   ├── db.py                # Database connection & init
│   ├── seed.py              # CSV seeding logic
│   ├── routers/
│   │   ├── pages.py         # HTML page routes
│   │   └── api.py           # JSON API endpoints
│   ├── services/
│   │   ├── geocode.py       # ZIP to lat/lng
│   │   ├── routing.py       # Haversine + ORS integration
│   │   └── nearest.py       # Hospital search & filters
│   └── utils/
│       └── csv_io.py        # CSV utilities
├── templates/               # Jinja2 templates
├── static/                  # CSS, JS, images
├── data/                    # Seed CSV files
├── tests/                   # Pytest test suite
└── ohio_maternity.db        # SQLite DB (auto-created)
```

## Database Schema

### hospitals
- Facility information (name, address, county, etc.)
- Coordinates (lat/lng)
- Services: has_ld (bool), nicu_level (None/II/III/IV)
- Metadata: website, last_verified date

### closures
- Service closure records (L&D or NICU)
- Links to hospitals table
- Date, notes, source URL

### sources
- Data source references
- Links to hospitals (optional)
- Verification dates

## Running the Project

The application starts automatically via the configured workflow.

**Manual start**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

**Run tests**:
```bash
pytest tests/ -v
```

All 10 tests pass successfully.

## API Endpoints

- `GET /` - Home page with map
- `GET /hospital/{id}` - Hospital detail page
- `GET /methodology` - Data methodology & citation guide
- `GET /about` - About & disclaimers
- `GET /api/hospitals` - All hospitals (GeoJSON)
- `GET /api/search?zip={zip}&need={need}` - Search nearest
- `GET /api/closures?since={date}` - Get closures
- `GET /api/download/hospitals` - CSV export
- `GET /api/download/closures` - CSV export

## Data Updates

### Update Hospital Data
1. Edit `data/hospitals.seed.csv`
2. Delete `ohio_maternity.db`
3. Restart application (auto-seeds from CSV)

### Update Closures
1. Edit `data/closures.seed.csv`
2. Delete database and restart

### Add ZIP Codes
- Edit `data/zips_ohio.csv`

## Configuration

### Environment Variables

**Optional**: `OPENROUTESERVICE_API_KEY`
- Get free key at: https://openrouteservice.org/dev/#/signup
- Enables real driving time estimates
- App works fine without it (uses distance-based estimates)

**Auto-generated**: `SESSION_SECRET`
- Managed by Replit

## Recent Changes

**October 20, 2025**:
- ✅ Initial project setup
- ✅ Database models and seed data
- ✅ API endpoints for search, closures, downloads
- ✅ Interactive Leaflet map with clustering
- ✅ ZIP code search with distance calculation
- ✅ Closures timeline widget
- ✅ Hospital detail pages
- ✅ Complete test suite (10 tests passing)
- ✅ Responsive, accessible UI
- ✅ SEO optimization with meta tags

## User Preferences

None specified yet.

## Known Issues

None. Application is production-ready.

## Future Enhancements

- Admin interface for CSV uploads
- County-level analysis views
- Interactive charts showing closure trends
- Email alerts for new closures
- RSS feed for updates
- Performance caching for API responses
- Additional filters (by hospital system, date ranges)

## Disclaimers

- **Not medical advice**: Informational only
- **Emergency**: Always call 911
- **Verification**: Confirm services with hospitals directly
- **Accuracy**: Data updated regularly but services change frequently

## Credits

- Map tiles: OpenStreetMap contributors
- Mapping: Leaflet.js
- Optional routing: OpenRouteService
- Built with FastAPI and SQLModel
