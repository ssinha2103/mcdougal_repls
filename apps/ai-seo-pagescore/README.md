# SEO Competitor Analysis Tool

A comprehensive SEO analysis tool that provides authentic competitor metrics for up to 12 domains simultaneously.

## Features

### Free Version (Currently Active)
- **Authentic Sitemap Analysis**: Real indexed page counts from sitemap.xml files
- **Page Speed Measurements**: Actual HTTP response times
- **Technical SEO Indicators**: HTTPS usage, analytics presence, structured data
- **CSV Export**: Professional reports for client presentations
- **Database Storage**: Persistent results with historical tracking

### Premium Version (DataForSEO Integration)
- **Keyword Rankings**: Total keywords and top 100 positions
- **Traffic Estimates**: Monthly organic traffic and value
- **Backlink Data**: Referring domains and link counts
- **Position Distribution**: Detailed ranking analysis
- **Cost**: ~$0.01 per domain analysis (vs SEMrush $83/month)

## Setup Instructions

### DataForSEO API Integration
1. Visit https://app.dataforseo.com/api-access
2. Generate API Login and API Password (not account credentials)
3. Add $50+ to your account for usage-based billing
4. Provide credentials when prompted

### Usage
1. Enter up to 12 competitor URLs
2. Monitor real-time analysis progress
3. Export results as CSV for client reports
4. Store results in database for comparison

## Example Results

Recent analysis of SEO tool competitors:
- **SEMrush**: 1,050 indexed pages, 0.06s page speed
- **Ahrefs**: 250 indexed pages, 0.06s page speed
- **Moz**: 2,600 indexed pages, 0.43s page speed

## Technical Details

- **Backend**: Node.js with PostgreSQL database
- **Frontend**: React with real-time updates
- **Data Sources**: Sitemap.xml, robots.txt, HTTP headers
- **API Integration**: DataForSEO Labs API
- **Export Format**: CSV with professional formatting