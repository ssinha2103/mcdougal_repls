# Env Checklist To Fill

Set values in the matching files under `env/`.

## Core

- `DATABASE_URL`
  - Default local value already set in each env file:
    `postgresql://postgres:postgres@postgres:5432/mcdougal_tools`
  - For GCP/prod, replace with your managed Postgres URL.

- `SESSION_SECRET`
  - Used by: `free-seo-tools-page`

## Data/SEO APIs

- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`
- `DATAFORSEO_API_LOGIN`
- `DATAFORSEO_API_PASSWORD`
- `SEMRUSH_API_KEY`
- `SERPAPI_KEY`

## Google APIs

- `GOOGLE_PLACES_API_KEY`
- `GOOGLE_PLACES_API_KEY_PRODUCTION`
- `GOOGLE_API_KEY`
- `GOOGLE_PAGESPEED_API_KEY`
- `PAGESPEED_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `OPENROUTESERVICE_API_KEY` (for Ohio Care Finder drive-time)

## Social / LLM APIs

- `YOUTUBE_API_KEY`
- `TWITTER_BEARER_TOKEN`
- `GEMINI_API_KEY`

## Semrush Scraper Storage/Auth

- `SEMRUSH_EMAIL`
- `SEMRUSH_PASSWORD`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GCS_PROJECT_ID`
- `GCS_BUCKET_NAME`
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `PRIVATE_OBJECT_DIR`

## Runtime Browser / Optional

- `PUPPETEER_EXECUTABLE_PATH`
- `CHROME_PATH`
- `REPLIT_CONNECT_SID`

