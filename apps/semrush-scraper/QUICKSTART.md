# Quick Start Guide - Docker Setup

Run the SEMrush Screenshot Scraper on your local PC in 5 minutes.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Google Cloud account (for screenshot storage)
- SEMrush account with 2FA disabled
- Google Gemini API key

## Step 1: Get Your Credentials

### Google Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy it for later

### Google Cloud Storage
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Create a storage bucket:
   ```bash
   # Note your bucket name and project ID
   ```
4. Create service account:
   - Go to **IAM & Admin** → **Service Accounts**
   - Create new service account
   - Grant **Storage Object Admin** role
   - Create JSON key
   - Download and save as `gcs-credentials.json` in project root

### SEMrush Account
- Email and password
- **IMPORTANT:** Disable 2FA (required for automation)

## Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials
# Windows: notepad .env
# Mac/Linux: nano .env
```

Required values:
```env
SEMRUSH_EMAIL=your-email@example.com
SEMRUSH_PASSWORD=your-password
GEMINI_API_KEY=your-gemini-key
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id
```

## Step 3: Start Application

### Windows
```cmd
scripts\start.bat
```

### Mac/Linux
```bash
./scripts/start.sh
```

### Manual
```bash
docker-compose up -d
```

## Step 4: Access Application

Open in browser: **http://localhost:5000**

## Usage

1. **Add Domains** - Enter domains to crawl (one per line)
2. **Start Crawl** - Click to begin screenshot capture
3. **View Results** - Monitor progress in real-time
4. **Export** - Download screenshots as ZIP

## Common Commands

```bash
# View logs
docker-compose logs -f app

# Stop application
docker-compose down

# Restart after code changes
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d semrush_scraper

# View all containers
docker-compose ps
```

## Troubleshooting

### "Cannot connect to database"
```bash
docker-compose down
docker-compose up -d
```

### "Chrome failed to start"
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### "Authentication failed"
- Verify SEMrush credentials in `.env`
- Ensure 2FA is disabled on SEMrush account
- Try logging in manually to verify account works

### "GCS upload failed"
- Check `gcs-credentials.json` exists
- Verify service account has Storage Object Admin role
- Test bucket access in Google Cloud Console

## File Structure

```
.
├── .env                    # Your credentials (create from .env.example)
├── gcs-credentials.json    # GCS service account key (download yourself)
├── docker-compose.yml      # Docker configuration
├── scripts/
│   ├── start.sh           # Quick start (Mac/Linux)
│   ├── start.bat          # Quick start (Windows)
│   └── stop.sh            # Stop services
└── README-DOCKER.md       # Full documentation
```

## Next Steps

- See **README-DOCKER.md** for full documentation
- Configure rate limiting in the UI (default: 120 pages/hour)
- Set up scheduled crawls for automated monitoring
- Export results to CSV/PDF for reporting

## Security Notes

- Never commit `.env` or `gcs-credentials.json` to git
- Use dedicated SEMrush account (not your main account)
- Keep Docker images updated: `docker-compose pull`

## Support

Check logs first:
```bash
docker-compose logs -f
```

For issues, verify:
1. Docker Desktop is running
2. All credentials are correct in `.env`
3. `gcs-credentials.json` exists and is valid
4. SEMrush account has 2FA disabled
