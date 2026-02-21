# SEO Research Tool - People Also Ask & Related Searches

## Overview
A professional SEO research tool that extracts Google's "People Also Ask" (PAA) questions and Related Searches using the DataForSEO API. This tool helps content marketers, copywriters, and SEO strategists understand user intent and discover what their audience is searching for.

## Project Status
**Current State:** MVP Complete
- ✅ Complete frontend with professional design
- ✅ DataForSEO API integration
- ✅ Search functionality with real-time results
- ✅ Search history tracking
- ✅ Copy to clipboard functionality
- ✅ Clean light theme design (dark theme removed per user request)

## Features

### Core Functionality
1. **Keyword Search**: Enter any keyword to extract PAA questions and related searches
2. **People Also Ask Questions**: Displays all PAA questions found for the keyword
3. **Related Searches**: Shows all related search terms from Google
4. **Copy Functionality**: 
   - Copy individual questions/searches
   - Copy all questions or searches at once
5. **Search History**: Track recent searches with timestamps
6. **Theme Toggle**: Dark and light mode support

### Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
- **API**: DataForSEO API for SERP data
- **State Management**: TanStack Query (React Query)

## Architecture

### Data Flow
1. User enters keyword in search form
2. Frontend sends POST request to `/api/search`
3. Backend calls DataForSEO API with keyword
4. DataForSEO returns SERP data with PAA and Related Searches
5. Backend stores search in history and returns formatted results
6. Frontend displays results in organized sections

### API Endpoints
- `POST /api/search` - Search for keyword and get PAA/Related Searches
- `GET /api/history` - Get search history

### Storage Schema
```typescript
interface Search {
  id: string;
  keyword: string;
  timestamp: Date;
}

interface SearchResult {
  keyword: string;
  paaQuestions: PAAQuestion[];
  relatedSearches: RelatedSearch[];
  timestamp: string;
}
```

## Environment Variables
- `DATAFORSEO_LOGIN` - DataForSEO API username
- `DATAFORSEO_PASSWORD` - DataForSEO API password

## Design System

### Color Palette
- **Primary**: Professional blue (#3B9EFF) - Used for branding and CTAs
- **Success**: Green (#4ADE80) - Used for PAA questions indicators
- **Info**: Purple (#A78BFA) - Used for Related Searches indicators
- **Background**: Clean slate/white design for clarity

### Components
- Professional header with branding
- Large search input with clear button
- Two-column results layout (PAA | Related Searches)
- Numbered badges for easy reference
- Hover states with copy buttons
- Beautiful loading skeletons
- Empty state with guidance

### User Experience
- Auto-focus on search input
- Loading states during API calls
- Toast notifications for copy actions
- Responsive design (mobile-first)
- Accessible components throughout

## Recent Changes
- 2025-01-08: Initial MVP implementation
  - Created data schemas and TypeScript types
  - Built complete frontend UI with all components
  - Integrated DataForSEO API
  - Implemented search history
  - Added copy to clipboard functionality
  - Created theme toggle system

## User Preferences
- Professional, data-focused design aesthetic
- Clean, organized presentation of search data
- Easy export/copy functionality for research workflow
