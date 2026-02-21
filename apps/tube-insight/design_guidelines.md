# YouTube SEO Research Tool - Design Guidelines

## Design Approach

**Selected Approach:** Design System Approach (Material Design inspired)
**Justification:** This is a utility-focused, data-heavy application where clarity, efficiency, and information hierarchy are paramount. Users need to quickly scan results, compare metrics, and extract insights.

**Reference Products:** TubeBuddy, VidIQ, Google Search Console
**Key Principles:** 
- Data clarity over visual flourish
- Scannable information architecture
- Efficient user workflows
- Professional credibility

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 10% (deep charcoal)
- Surface: 222 12% 15% (elevated cards)
- Surface elevated: 222 10% 18% (modals, dropdowns)
- Primary: 210 100% 60% (vibrant blue for CTAs and key actions)
- Primary hover: 210 100% 55%
- Text primary: 0 0% 95%
- Text secondary: 0 0% 65%
- Border: 222 10% 25%
- Success: 142 76% 45% (positive metrics)
- Warning: 38 92% 50% (moderate metrics)
- Danger: 0 84% 60% (low performance indicators)

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Surface elevated: 0 0% 100%
- Primary: 210 100% 50%
- Primary hover: 210 100% 45%
- Text primary: 222 15% 15%
- Text secondary: 222 10% 45%
- Border: 222 10% 88%

### B. Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts) - for UI, metrics, headings
- Monospace: 'JetBrains Mono' - for tags, IDs, technical data

**Hierarchy:**
- Hero/H1: text-4xl md:text-5xl font-bold
- H2 (Section headers): text-2xl md:text-3xl font-semibold
- H3 (Card titles): text-lg md:text-xl font-semibold
- Body: text-base leading-relaxed
- Small/Meta: text-sm text-secondary
- Metrics: text-xl md:text-2xl font-bold (for view counts, engagement)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm.
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-16
- Card gaps: gap-4 to gap-6
- Container max-width: max-w-7xl

**Grid System:**
- Search area: Single column, centered, max-w-4xl
- Results grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for video cards
- Metrics dashboard: grid-cols-2 md:grid-cols-4 for stat cards

### D. Component Library

**Search Interface:**
- Large, prominent search bar with icon (min-h-14)
- Keyword input with suggestions dropdown
- Advanced filters panel (collapsible): date range, video length, sort options
- Search button: Primary color, bold text

**Video Result Cards:**
- Thumbnail preview (16:9 aspect ratio) with play icon overlay
- Title (2 lines max, truncated with ellipsis)
- Channel name with verified badge if applicable
- Metrics row: Views • Comments • Published date
- Tags section: Pill-style badges with monospace font
- Description preview (3 lines, expandable)
- Analyze button: Secondary action

**Metrics Display:**
- Stat cards: Icon + Number + Label format
- Progress bars for engagement rates
- Comparison charts using simple bar/line visualizations
- Trend indicators (up/down arrows with percentage change)

**Data Tables (for detailed view):**
- Sticky headers
- Sortable columns
- Row hover states
- Alternating row backgrounds for readability

**Navigation:**
- Top navbar: Logo, Search shortcut (Cmd+K style), Dark mode toggle
- Breadcrumbs for navigation context
- Tabs for switching between Results / Analytics / Export views

**Interactive Elements:**
- Tooltips for metric explanations (appear on hover)
- Skeleton loaders for API data fetching
- Empty states with clear calls-to-action
- Toast notifications for actions (copy tags, export data)

### E. Animations

Use sparingly:
- Skeleton shimmer during loading (subtle)
- Smooth transitions for filter panels (200ms)
- Hover lift on cards (translate-y-1)
- NO complex scroll animations or parallax

---

## Images

**Hero Section Image:**
Yes, include a large hero background image depicting YouTube analytics dashboard or SEO concept visualization. Use a gradient overlay (from dark to transparent) to ensure text readability.
- Placement: Full-width hero section at top
- Style: Modern, professional screenshot or abstract data visualization
- Overlay: Linear gradient from primary-dark at 60% opacity

**Video Thumbnails:**
Dynamically pulled from YouTube API for each result. Display with rounded corners (rounded-lg) and subtle shadow.

**Empty State Illustrations:**
Use simple, modern illustrations for:
- Initial state (no search yet): Magnifying glass icon with "Enter keyword to begin"
- No results found: Empty folder with "Try different keywords"

---

## Page Structure

**Landing/Search Page:**
1. Hero section with background image, headline, search bar (h-screen or 85vh)
2. Quick stats bar: "Trusted by X creators • Y searches today"
3. How it works: 3-column grid explaining the tool
4. CTA section: "Start Your Research" with background accent

**Results Page:**
1. Sticky search bar (compact version)
2. Filters sidebar (collapsible on mobile)
3. Results header: Result count, sort options, view toggle (grid/list)
4. Video cards grid with infinite scroll or pagination
5. Export floating action button (bottom-right)

**Accessibility:**
- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus visible states with blue outline
- High contrast mode compatible
- Screen reader friendly metric announcements

This design creates a professional, data-focused experience that empowers YouTube creators with clear, actionable insights while maintaining visual polish and usability.