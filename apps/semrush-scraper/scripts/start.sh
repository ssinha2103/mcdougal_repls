#!/bin/bash
set -e

echo "🚀 Starting SEMrush Screenshot Scraper..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "✏️  Please edit .env with your credentials:"
    echo "   - SEMRUSH_EMAIL"
    echo "   - SEMRUSH_PASSWORD"
    echo "   - GEMINI_API_KEY"
    echo "   - GCS_BUCKET_NAME"
    echo "   - GCS_PROJECT_ID"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if gcs-credentials.json exists
if [ ! -f gcs-credentials.json ]; then
    echo "⚠️  gcs-credentials.json not found!"
    echo ""
    echo "Please create a Google Cloud service account and download the JSON key:"
    echo "1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts"
    echo "2. Create a service account with 'Storage Object Admin' role"
    echo "3. Download the JSON key file"
    echo "4. Save it as 'gcs-credentials.json' in this directory"
    echo ""
    exit 1
fi

echo "✅ Configuration files found"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are healthy
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📊 Application running at: http://localhost:5000"
    echo "🗄️  Database running at: localhost:5432"
    echo ""
    echo "📋 View logs with:"
    echo "   docker-compose logs -f app"
    echo ""
    echo "🛑 Stop services with:"
    echo "   docker-compose down"
else
    echo ""
    echo "❌ Failed to start services. Check logs:"
    echo "   docker-compose logs"
fi
