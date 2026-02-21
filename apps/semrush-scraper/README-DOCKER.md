# SEMrush Screenshot Scraper - Docker Setup

This guide will help you run the SEMrush Screenshot Scraper on your local PC using Docker and Chrome browser.

## Prerequisites

1. **Docker Desktop** - Install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Google Cloud Storage Account** - For storing screenshots
3. **Google Gemini API Key** - For AI-powered data extraction
4. **SEMrush Account** - With 2FA disabled (required for automation)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd /path/to/semrush-scraper

# Copy the environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# Required: SEMrush credentials (2FA must be disabled!)
SEMRUSH_EMAIL=your-email@example.com
SEMRUSH_PASSWORD=your-password

# Required: Google Gemini API key
GEMINI_API_KEY=your-gemini-api-key

# Required: Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-gcp-project-id

# Optional: Change if needed
SESSION_SECRET=generate-a-random-secret-here
```

### 3. Setup Google Cloud Storage Credentials

You need to create a service account and download credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Grant it **Storage Object Admin** role
5. Create a JSON key and download it
6. Save the file as `gcs-credentials.json` in the project root

```bash
# The file should be at:
./gcs-credentials.json
```

### 4. Create Your GCS Bucket

```bash
# Using gcloud CLI (install from cloud.google.com/sdk)
gcloud storage buckets create gs://your-bucket-name --location=us-central1

# Or create it manually in Google Cloud Console
```

### 5. Start the Application

```bash
# Start all services (database + app)
docker-compose up -d

# View logs
docker-compose logs -f app

# The application will be available at:
# http://localhost:5000
```

### 6. Initialize the Database

The database schema will be automatically created when the app starts. If you need to manually push schema changes:

```bash
# Run migrations
docker-compose exec app npm run db:push
```

## Usage

### Access the Application

- **Web Interface**: http://localhost:5000
- **Database Admin** (optional): http://localhost:5050 (admin@admin.com / admin)

### Start a Crawl

1. Open http://localhost:5000
2. Add domains to crawl
3. Click "Start Crawl"
4. Monitor progress in real-time via WebSocket updates

### API Endpoints

```bash
# Add domains
curl -X POST http://localhost:5000/api/domains \
  -H "Content-Type: application/json" \
  -d '{"domains": ["example.com", "another.com"]}'

# Start crawl
curl -X POST http://localhost:5000/api/domains/crawl \
  -H "Content-Type: application/json" \
  -d '{"domains": ["example.com"]}'

# Get results
curl http://localhost:5000/api/domains
```

## Docker Commands

### Development

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart app only
docker-compose restart app

# View logs
docker-compose logs -f app

# Access app shell
docker-compose exec app sh

# Rebuild after code changes
docker-compose up -d --build
```

### Production

```bash
# Build production image
docker-compose -f docker-compose.yml build --target production

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d semrush_scraper

# Backup database
docker-compose exec postgres pg_dump -U postgres semrush_scraper > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres semrush_scraper < backup.sql

# Reset database (WARNING: Deletes all data!)
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Chrome/Puppeteer Issues

If you get Chrome-related errors:

```bash
# Rebuild with latest Chrome
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify connection string in .env matches docker-compose.yml
```

### Object Storage Issues

```bash
# Verify credentials file exists
ls -la gcs-credentials.json

# Check GCS permissions
# Make sure service account has "Storage Object Admin" role

# Test bucket access
docker-compose exec app node -e "
  const {Storage} = require('@google-cloud/storage');
  const storage = new Storage({
    keyFilename: '/app/gcs-credentials.json'
  });
  storage.bucket('${GCS_BUCKET_NAME}').exists()
    .then(console.log)
    .catch(console.error);
"
```

### SEMrush Authentication Issues

- **2FA must be disabled** on your SEMrush account
- Check credentials in `.env` are correct
- Try logging in manually to verify account works
- SEMrush may block automated logins - use a dedicated account

## File Structure

```
.
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Application container
├── .env                    # Environment variables (create from .env.example)
├── gcs-credentials.json    # Google Cloud credentials (create yourself)
├── server/                 # Backend code
├── client/                 # Frontend code
└── shared/                 # Shared types
```

## Performance Tuning

### Adjust Rate Limiting

Edit crawl config in the UI or API:

```json
{
  "maxRequestsPerHour": 120,
  "database": "us",
  "enableAI": true
}
```

### Increase Parallelization

Modify `docker-compose.yml`:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 4G
```

### Chrome Memory Settings

If Chrome crashes, increase shared memory:

```yaml
app:
  shm_size: 4gb  # Increase from 2gb
```

## Security Notes

1. **Never commit `.env` or `gcs-credentials.json` to git**
2. Use strong `SESSION_SECRET` in production
3. Restrict GCS service account to minimum permissions
4. Use dedicated SEMrush account for scraping (not your main account)
5. Keep Docker images updated: `docker-compose pull`

## Cost Optimization

- **GCS Storage**: ~$0.02/GB/month for screenshots
- **Gemini API**: Check current pricing at [ai.google.dev/pricing](https://ai.google.dev/pricing)
- **SEMrush**: Requires active subscription

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check Chrome is working: `docker-compose exec app google-chrome-stable --version`

## License

MIT
