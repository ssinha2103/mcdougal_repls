# Meta Description Generator

## Overview
A professional SEO tool that generates optimized meta descriptions using Google's Gemini AI. Users provide their webpage topic and target keywords, and the AI generates 4-5 distinct meta description options under 160 characters with natural keyword integration and compelling CTAs.

## Recent Changes
- **2025-10-09**: Enhanced output insights for better user experience
  - Added visual keyword highlighting in generated descriptions
  - Implemented intelligent "Best Pick" recommendation system
  - Added quality indicators (Optimal/Good/Short badges)
  - Included keyword coverage indicators for each description
  - Added contextual SEO tips and helpful insights
  - Reordered results to display Best Pick at the top automatically
  
- **2025-10-08**: Initial implementation with Gemini AI integration
  - Created schema-first architecture with TypeScript interfaces
  - Built beautiful, responsive UI following design guidelines
  - Integrated Gemini 2.5 Flash for meta description generation
  - Fixed response parsing to properly extract JSON from Gemini API
  - Enhanced prompt engineering for better 150-160 character compliance
  - Removed debug code and polished production-ready UI
  - Successfully tested end-to-end with copy-to-clipboard functionality
  - Removed header and footer for cleaner, focused UI
  - Switched to light theme only (removed dark mode toggle)
  - Added backend validation to guarantee all descriptions ≤ 160 characters
  - Implemented intelligent truncation at word boundaries with proper punctuation

## Project Architecture

### Frontend (React + TypeScript)
- **Pages**: Generator page with input form and results display
- **Components**: 
  - Theme provider and toggle for dark/light mode
  - Form components with validation
  - Result cards with copy functionality
  - Character counter with color-coded status
- **Styling**: Tailwind CSS with custom design tokens, shadcn/ui components

### Backend (Express + TypeScript)
- **API Routes**: `/api/generate-meta-description` endpoint
- **AI Integration**: Gemini 2.5 Flash for generating meta descriptions
- **Storage**: In-memory storage (MemStorage)

### Data Model
```typescript
GenerateMetaDescriptionRequest {
  topic: string (1-500 chars)
  primaryKeyword: string (1-100 chars)
  secondaryKeyword?: string (0-100 chars)
}

MetaDescription {
  description: string
  characterCount: number
}

MetaDescriptionResponse {
  descriptions: MetaDescription[]
}
```

## Key Features
1. **AI-Powered Generation**: Uses Gemini 2.5 Flash to create SEO-optimized descriptions
2. **Keyword Integration**: Naturally incorporates 1-2 keywords into descriptions
3. **Character Limit**: Backend validation ensures all descriptions ≤ 160 characters
4. **Multiple Options**: Generates 5 distinct variations per request
5. **Smart Recommendations**: Automatically identifies the "Best Pick" based on SEO criteria
6. **Keyword Highlighting**: Visual highlighting of keywords within each description
7. **Quality Indicators**: Shows Optimal/Good/Short badges based on character count
8. **SEO Insights**: Displays keyword coverage and helpful tips for each description
9. **Copy Functionality**: One-click copy to clipboard for each description
10. **Clean UI**: Focused interface with no header/footer distractions
11. **Responsive Design**: Mobile-first, works beautifully on all devices

## Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express, TypeScript
- **AI**: Google Gemini 2.5 Flash
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI generation

## User Preferences
- Theme: Light theme only (no dark mode)
- Font family: Inter (UI), JetBrains Mono (meta descriptions)
- Design approach: Modern SaaS style (Linear/Notion-inspired)
- UI style: Clean and focused (no header/footer)
