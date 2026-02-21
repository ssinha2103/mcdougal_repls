# SEMrush Screenshot Scraper & Prospecting Platform

A B2B prospecting tool that automates SEMrush crawling, captures screenshots of analytics sections, and uses AI to identify sales opportunities based on SEO decline signals.

## 🚀 Quick Start

### Docker (Recommended for Local PC)
```bash
# 1. Clone and setup
cp .env.example .env
# Edit .env with your credentials

# 2. Start services (Mac/Linux)
./scripts/start.sh

# Or Windows
scripts\start.bat

# 3. Access application
# http://localhost:5000
```

**See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions**

### Replit Cloud
This application is ready to run on Replit with automatic configuration:
1. Secrets auto-loaded from environment
2. Database auto-configured (Neon serverless)
3. Object storage auto-configured (Replit sidecar)
4. Browser auto-configured (Nix Chromium)

Just click Run and you're ready to go!

## 📋 Prerequisites

### Required for Both Deployments
- **SEMrush Account** (with 2FA disabled)
- **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)
- **Google Cloud Storage** account and bucket

### Additional for Docker
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **GCS Service Account** credentials (JSON file)

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes with Docker
- **[README-DOCKER.md](README-DOCKER.md)** - Complete Docker setup guide
- **[replit.md](replit.md)** - Technical architecture documentation

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript, Puppeteer
- **Database:** PostgreSQL (Neon serverless on Replit, PostgreSQL 16 in Docker)
- **Storage:** Google Cloud Storage
- **AI:** Google Gemini 2.5 Pro for vision-based data extraction
- **Browser:** Chrome/Chromium for screenshot automation

### Key Features
- ✅ Batch crawl 500-1,000+ domains
- ✅ Capture 9 SEMrush analytics sections per domain
- ✅ AI-powered data extraction from screenshots
- ✅ Real-time crawl monitoring via WebSocket
- ✅ Prospect scoring and ranking
- ✅ ZIP/CSV/PDF export capabilities
- ✅ Automatic SEMrush authentication
- ✅ Rate limiting (120 pages/hour default)

## 🎯 Use Cases

Perfect for:
- **SEO Agencies** - Identify prospects with declining organic traffic
- **B2B Sales Teams** - Find companies needing SEO help
- **Marketing Agencies** - Generate qualified leads for outreach
- **Consultants** - Analyze competitor landscapes at scale

## ⚙️ Configuration

### Environment Variables

#### Replit Environment
```env
SEMRUSH_EMAIL=your-email@example.com
SEMRUSH_PASSWORD=your-password
GEMINI_API_KEY=your-gemini-key
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
SESSION_SECRET=random-secret-string
```

#### Docker Environment
```env
SEMRUSH_EMAIL=your-email@example.com
SEMRUSH_PASSWORD=your-password
GEMINI_API_KEY=your-gemini-key
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-gcp-project-id
SESSION_SECRET=random-secret-string
```

Plus `gcs-credentials.json` file in project root.

## 🔧 Development

### Run Locally (Replit)
```bash
npm install
npm run dev
# Open http://localhost:5000
```

### Run Locally (Docker)
```bash
docker-compose up -d
docker-compose logs -f app
```

### Database Migrations
```bash
# Replit
npm run db:push

# Docker
docker-compose exec app npm run db:push
```

### View Logs
```bash
# Replit
# Logs visible in Replit console

# Docker
docker-compose logs -f app
docker-compose logs -f postgres
```

## 📊 API Endpoints

```bash
# Add domains
POST /api/domains
Content-Type: application/json
{"domains": ["example.com", "another.com"]}

# Start crawl
POST /api/domains/crawl
Content-Type: application/json
{"domains": ["example.com"]}

# Get results
GET /api/domains
GET /api/runs
GET /api/stats

# WebSocket for real-time updates
ws://localhost:5000/ws
```

## 🐳 Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Access database
docker-compose exec postgres psql -U postgres -d semrush_scraper

# Backup database
docker-compose exec postgres pg_dump -U postgres semrush_scraper > backup.sql
```

## 🔒 Security

- Never commit `.env` or `gcs-credentials.json`
- Use strong `SESSION_SECRET` in production
- Restrict GCS service account permissions
- Use dedicated SEMrush account (not your main)
- Keep Docker images updated

## ⚠️ Important Notes

### SEMrush Authentication
- **2FA MUST be disabled** on your SEMrush account
- Automation requires username/password login only
- Use a dedicated account for scraping

### Rate Limiting
- Default: 120 pages/hour
- Configurable per crawl run
- Respects SEMrush ToS with human-like pacing

### Browser Compatibility
- Replit: Chromium via Nix
- Docker: Chrome stable
- Local: Puppeteer bundled Chromium
- Auto-detects best available option

## 💰 Cost Considerations

- **GCS Storage:** ~$0.02/GB/month
- **Gemini API:** Check [pricing](https://ai.google.dev/pricing)
- **SEMrush:** Requires active subscription
- **Hosting:**
  - Replit: Free tier or paid hosting
  - Docker: Your own server costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

### Common Issues

**"Cannot connect to database"**
```bash
# Replit: Check DATABASE_URL secret is set
# Docker: docker-compose down && docker-compose up -d
```

**"Chrome failed to start"**
```bash
# Docker: Rebuild container
docker-compose build --no-cache
docker-compose up -d
```

**"SEMrush authentication failed"**
- Verify credentials in `.env`
- Ensure 2FA is disabled
- Try manual login to verify account

**"GCS upload failed"**
- Check credentials file exists
- Verify service account permissions
- Test bucket access manually

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Review [README-DOCKER.md](README-DOCKER.md)
3. Verify all prerequisites are met
4. Check environment variables are correct

## 🎬 Demo

![Demo Screenshot](https://via.placeholder.com/800x400?text=SEMrush+Screenshot+Scraper)

## 🗺️ Roadmap

- [ ] CSV export with AI-extracted metrics
- [ ] PDF report generation
- [ ] Scheduled crawl automation
- [ ] Advanced prospect scoring algorithms
- [ ] Email notification system
- [ ] Multi-user support with authentication
- [ ] Competitive analysis dashboards

---

**Built with ❤️ for SEO professionals and B2B marketers**
