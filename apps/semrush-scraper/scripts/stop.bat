@echo off
echo Stopping SEMrush Screenshot Scraper...
docker-compose down

echo.
echo Services stopped
echo.
echo To remove all data (including database), run:
echo    docker-compose down -v

pause
