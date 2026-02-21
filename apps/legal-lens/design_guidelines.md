# Local Legal SERP Analyzer - Design Guidelines

## Design Approach

**System:** Material Design + Modern SaaS Tool Aesthetics (inspired by Ahrefs, Linear, SEMrush)

**Rationale:** This is a utility-focused, data-intensive professional tool requiring efficient data presentation, clear hierarchy, and rapid comprehension of competitive metrics. The design prioritizes information density, scanability, and actionable insights over visual flourish.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 220 70% 50% (Professional blue for CTAs and key actions)
- Background: 0 0% 98% (Clean, reduces eye strain)
- Surface: 0 0% 100% (Cards, tables)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%
- Success: 142 70% 45% (High rankings, claimed profiles)
- Warning: 38 92% 50% (Medium performance)
- Error: 0 70% 50% (Low rankings, issues)

**Dark Mode:**
- Primary: 220 70% 60%
- Background: 220 15% 12%
- Surface: 220 12% 16%
- Text Primary: 220 5% 95%
- Text Secondary: 220 5% 65%
- Borders: 220 10% 25%

**Data Visualization:**
- Rank badges: Green (1-3), Blue (4-7), Gray (8-10)
- Review stars: 48 95% 55% (Gold, only for star ratings)

### B. Typography

**Font Stack:** Inter (Google Fonts) for UI, JetBrains Mono for data/metrics

- Hero/Headers: 2.5rem/3rem, font-bold (40px/48px)
- Section Headers: 1.5rem, font-semibold (24px)
- Body Text: 0.875rem, font-normal (14px)
- Data Labels: 0.75rem, font-medium, uppercase tracking-wide (12px)
- Metrics/Numbers: 1.25rem, JetBrains Mono font-bold (20px)

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Card gaps: gap-4 to gap-6
- Container: max-w-7xl mx-auto px-4

**Grid System:**
- Search form: Single column, max-w-2xl centered
- Results dashboard: 12-column grid for flexible layouts
- Data tables: Full-width with responsive horizontal scroll

### D. Component Library

**Search Interface:**
- Large, centered search card (max-w-2xl) with shadow-lg
- Two input fields: Keyword (text) and Location (text with location icon)
- Primary CTA button: "Analyze Competition" (w-full, h-12)
- Recent searches dropdown below form

**Results Dashboard:**
- Top metrics bar: 4 stat cards showing Total Results, Avg Rating, Claimed Profiles %, Top Competitor
- Tabbed interface: "Local Pack" and "Organic Results" tabs
- Table view with sortable columns: Rank, Business Name, Rating, Reviews, Claimed Status, Actions

**Data Cards:**
- Firm profile cards with: Logo placeholder, Name (font-semibold), Rating stars + count, Address snippet
- Status badges: "Claimed" (green), "Unclaimed" (gray), rank position pill
- Expandable details: Click to reveal full GBP data

**Comparison View:**
- Side-by-side competitor comparison (max 3 firms)
- Metric bars for visual comparison
- Review velocity chart (if time-series data available)

**Navigation:**
- Top navbar: Logo left, Search shortcut center, Export/Settings right
- Breadcrumbs for analysis history
- Fixed position on scroll with subtle shadow

### E. Data Visualization

**Tables:**
- Zebra striping (subtle: bg-gray-50/bg-gray-800)
- Hover state: bg-blue-50/bg-blue-900/10
- Sticky headers on scroll
- Sort indicators: Arrow icons in headers
- Responsive: Stack on mobile with card layout

**Badges & Indicators:**
- Rank position: Circular badges with rank number
- Rating stars: Gold filled stars (★) with count in gray
- Status pills: Rounded-full px-3 py-1 text-xs
- Verified checkmark for claimed profiles

**Charts (if implemented):**
- Bar charts for review comparison
- Trend lines for ranking changes
- Use primary color palette, single accent color

### F. Micro-Interactions

**Minimal Animation Budget:**
- Button states: Standard hover/active (no custom)
- Loading states: Simple skeleton screens (shimmer effect)
- Table sorting: Instant, no animation
- Card expansion: Max-height transition (150ms ease-in-out)

**Focus States:**
- 2px ring in primary color with offset
- High contrast for accessibility

## Images

**Hero Section:** No hero image required - this is a tool-focused app
**Tool Icons:** Use Heroicons CDN for all UI icons (search, location-marker, star, check-circle, etc.)
**Logos:** Placeholder circles for law firm logos (bg-gray-200 with firm initials)
**Favicon:** Simple "L" monogram in primary color

## Key UX Principles

1. **Data First:** Information hierarchy prioritizes competitive metrics over decorative elements
2. **Scan Efficiency:** Use visual indicators (colors, badges, icons) for rapid data comprehension
3. **Export Ready:** All tables/reports designed for clean PDF/CSV export
4. **Progressive Disclosure:** Show summary, reveal details on demand
5. **Professional Trust:** Clean, uncluttered layouts signal reliability and accuracy