# SEO Headline Generator

## Overview
An AI-powered SEO headline generator that creates diverse, keyword-optimized headlines using Google's Gemini AI. The tool helps content creators, marketers, and bloggers generate compelling, SEO-friendly headlines in multiple formats instantly.

## Features
- **AI-Powered Generation**: Uses Gemini 2.5 Pro with expert SEO copywriter prompts
- **Diverse Formats**: Generates exactly 8 or 10 headlines (even numbers) in various styles:
  - Listicles (numbered lists)
  - Questions
  - How-To Guides
  - Benefit-Driven statements
  - Ultimate Guides
  - Comparisons
  - Tips & Tricks
- **Tone Selection**: Choose from professional, casual, urgent, or friendly tones
- **Performance Scoring**: Each headline includes SEO strength and click-worthiness scores (0-100)
- **Favorites/Saved Headlines**: Star favorite headlines and access them from dedicated favorites page
- **SEO Optimized**: Headlines are 50-90 characters with natural keyword integration
- **Copy Functionality**: One-click copy to clipboard for each headline
- **Character Counts**: Display character count for SEO optimization
- **Dark Mode**: Full dark mode support with theme toggle
- **Beautiful UI**: Professional, utility-focused design with blue color scheme

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query for data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Fonts**: Inter (UI) + Plus Jakarta Sans (headlines display)

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **AI Integration**: Google Gemini 2.5 Pro via @google/genai
- **Validation**: Zod schemas for request validation
- **Storage**: In-memory (no persistence needed for headline generation)

### Key Files
- `shared/schema.ts` - TypeScript types and Zod schemas with tone types
- `server/gemini.ts` - Gemini AI integration with SEO prompt engineering and tone support
- `server/scoring.ts` - Performance scoring algorithm for SEO and click-worthiness
- `server/routes.ts` - API endpoints
- `client/src/pages/home.tsx` - Main application page
- `client/src/pages/favorites.tsx` - Saved headlines page
- `client/src/components/headline-card.tsx` - Headline display component with scores and favorites
- `client/src/lib/favorites.ts` - Local storage service for saved headlines
- `design_guidelines.md` - Design system with blue color scheme

## API Integration
- **Provider**: Google Gemini AI
- **Model**: gemini-2.5-pro
- **Secret**: GEMINI_API_KEY (configured via Replit Secrets)

## User Flow
1. User enters a topic or primary keyword (minimum 3 characters)
2. User selects desired tone (professional, casual, urgent, or friendly)
3. Clicks "Generate Headlines" button
4. AI generates exactly 8 or 10 diverse, SEO-optimized headlines
5. Results display in a grid with format badges, character counts, SEO scores, and click scores
6. User can favorite headlines by clicking the star icon
7. User can copy any headline with one click
8. User can view saved headlines in the favorites page
9. User can regenerate with same or different topics and tones as needed

## Design Principles
- **Utility-First**: Immediate functionality, no footers or hero sections
- **Blue Color Scheme**: Vibrant blue (hue 210) as primary color throughout
- **Professional**: Instills confidence in AI-generated content
- **Scannable**: Headlines are easy to read and compare with clear scoring indicators
- **Consistent Spacing**: Uses design tokens for spacing (p-6, gap-4, etc.)
- **Accessibility**: All interactive elements have data-testid attributes

## Recent Changes (October 8, 2025)
- Initial MVP implementation with Gemini AI integration
- Added tone selection feature (professional, casual, urgent, friendly)
- Implemented performance scoring (SEO strength and click-worthiness 0-100)
- Built favorites/save functionality with local storage persistence
- Added dedicated favorites page with grouping by topic and tone
- Updated to generate even number of headlines (exactly 8 or 10)
- Changed color scheme to blue (hue 210) throughout application
- Removed footer from all pages for cleaner interface
- Responsive grid layout for headline results
- Dark mode support with theme persistence
- Copy-to-clipboard functionality
- Fixed metadata capture bug: favorites now save generation context, not current form state
