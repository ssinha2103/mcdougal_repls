# Ohio Maternity Access Map

An interactive web application mapping Ohio hospitals providing Labor & Delivery (L&D) services and NICU care. Search by ZIP code to find nearest facilities, view closure information since 2022, and download data for reporting.

## Features

- **Interactive Map**: View all Ohio hospitals with L&D and NICU services, color-coded by NICU level
- **ZIP Code Search**: Find nearest hospitals and estimate travel time from any Ohio ZIP
- **Service Filters**: Filter by L&D availability and NICU level (II/III/IV)
- **Closures Timeline**: Track maternity service closures since 2022
- **Data Export**: Download hospital and closure data as CSV files
- **Journalist-Friendly**: Citation guidance and transparent methodology

## Tech Stack

- **Backend**: Python, FastAPI, SQLite (SQLModel ORM)
- **Frontend**: Jinja2 templates, Leaflet.js, vanilla JavaScript
- **Data**: CSV seed files for easy updates
- **Optional**: OpenRouteService API for real drive-time estimates

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or if using `uv`:

```bash
uv pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

To enable real driving time estimates, add your OpenRouteService API key to `.env`:

```
OPENROUTESERVICE_API_KEY=your_key_here
```

Get a free API key at: https://openrouteservice.org/dev/#/signup

**Note**: The app works fine without the API key—it will use distance-based estimates instead.

### 3. Run the Application

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

Or for development with auto-reload:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

The application will:
- Create the SQLite database automatically
- Load seed data from `/data/*.seed.csv` on first run
- Be available at `http://localhost:5000`

### 4. Run Tests

```bash
pytest tests/
```

## Project Structure

```
/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── db.py                # Database connection
│   ├── seed.py              # Data seeding
│   ├── routers/
│   │   ├── pages.py         # HTML page routes
│   │   └── api.py           # JSON API routes
│   ├── services/
│   │   ├── geocode.py       # ZIP to lat/lng
│   │   ├── routing.py       # Travel time calculation
│   │   └── nearest.py       # Hospital search logic
│   └── utils/
│       └── csv_io.py        # CSV utilities
├── templates/               # Jinja2 templates
│   ├── base.html
│   ├── index.html
│   ├── hospital.html
│   ├── methodology.html
│   └── about.html
├── static/
│   ├── css/styles.css       # Application styles
│   └── js/
│       ├── app.js           # Map and search logic
│       └── timeline.js      # Closures timeline
├── data/                    # Seed CSV files
│   ├── hospitals.seed.csv
│   ├── closures.seed.csv
│   └── zips_ohio.csv
├── tests/                   # Pytest tests
│   └── test_api.py
├── ohio_maternity.db        # SQLite database (auto-created)
├── .env.example             # Environment template
└── README.md
```

## Data Management

### Updating Hospital Data

1. Edit `data/hospitals.seed.csv` with new information
2. Delete `ohio_maternity.db`
3. Restart the application (database will be re-seeded)

**Hospital CSV Format:**
```csv
id,name,system,address,city,county,state,zip,lat,lng,has_ld,nicu_level,website,last_verified
```

Fields:
- `has_ld`: `1` for yes, `0` for no
- `nicu_level`: `None`, `II`, `III`, or `IV`
- `last_verified`: Date in `YYYY-MM-DD` format

### Updating Closure Data

Edit `data/closures.seed.csv`:

```csv
id,hospital_id,closure_date,service,notes,source_url
```

### Adding ZIP Codes

Edit `data/zips_ohio.csv`:

```csv
zip,lat,lng,city,county
```

## API Endpoints

- `GET /` - Home page with interactive map
- `GET /hospital/{id}` - Hospital detail page
- `GET /methodology` - Methodology and citation guide
- `GET /about` - About and disclaimers
- `GET /api/hospitals` - All hospitals as GeoJSON
- `GET /api/search?zip={zip}&need={need}` - Search nearest hospitals
  - `need`: `ld`, `nicu2`, `nicu3`, `nicu4`, or `any`
- `GET /api/closures?since={date}` - Get closures since date
- `GET /api/download/hospitals` - Download hospitals CSV
- `GET /api/download/closures` - Download closures CSV

## Citation

When using this data in journalism or research:

**Suggested Citation:**
> Ohio Maternity Access Map (2025). [Hospital name or search results]. Retrieved [date] from [URL]

Please verify critical information independently before publication.

## Disclaimers

- **Not Medical Advice**: This tool provides general information only. Always consult qualified healthcare providers.
- **Emergency Care**: In an emergency, call 911 immediately.
- **Data Accuracy**: Hospital services change frequently. Verify current services directly with facilities.
- **Travel Times**: Estimates are approximate and do not account for real-time traffic or emergency response.

## Data Sources

- Individual hospital websites and service directories
- Ohio Department of Health facility registries
- News reports for closure information
- Public facility announcements

Data is verified regularly with "Last Verified" dates shown for each hospital.

## License

This application is provided as a public resource for informational purposes.

## Support

For corrections or updated information about Ohio maternity services, please contribute to keeping this resource accurate and current.
