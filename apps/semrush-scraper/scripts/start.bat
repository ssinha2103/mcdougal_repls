@echo off
echo Starting SEMrush Screenshot Scraper...
echo.

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env with your credentials:
    echo    - SEMRUSH_EMAIL
    echo    - SEMRUSH_PASSWORD
    echo    - GEMINI_API_KEY
    echo    - GCS_BUCKET_NAME
    echo    - GCS_PROJECT_ID
    echo.
    echo Then run this script again.
    exit /b 1
)

REM Check if gcs-credentials.json exists
if not exist gcs-credentials.json (
    echo Warning: gcs-credentials.json not found!
    echo.
    echo Please create a Google Cloud service account and download the JSON key:
    echo 1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
    echo 2. Create a service account with 'Storage Object Admin' role
    echo 3. Download the JSON key file
    echo 4. Save it as 'gcs-credentials.json' in this directory
    echo.
    exit /b 1
)

echo Configuration files found
echo.

REM Start services
echo Starting Docker containers...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak > nul

echo.
echo Services started successfully!
echo.
echo Application running at: http://localhost:5000
echo Database running at: localhost:5432
echo.
echo View logs with:
echo    docker-compose logs -f app
echo.
echo Stop services with:
echo    docker-compose down

pause
