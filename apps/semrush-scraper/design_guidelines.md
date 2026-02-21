# Design Guidelines: SEMrush Screenshot Scraper & Prospecting Platform

## Design Approach: Modern Analytics Dashboard System

**Selected Approach**: Design System (tailored from Linear + Vercel Dashboard patterns)

**Justification**: This is a utility-focused, information-dense B2B productivity tool where efficiency, data clarity, and usability are paramount. The interface must support extended analysis sessions with 500-1000 domains, making readability and functional hierarchy critical.

**Core Principles**:
- Data-first clarity with minimal visual noise
- Efficient information density without overwhelming users
- Fast scanning and comparison of metrics
- Professional, trustworthy aesthetic for enterprise use

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (default for extended analysis sessions):
- Background Base: `222 10% 10%` (deep slate)
- Surface: `222 10% 14%` (elevated panels)
- Surface Elevated: `222 10% 18%` (cards, modals)
- Border: `222 10% 25%` (subtle dividers)

**Light Mode**:
- Background: `0 0% 98%`
- Surface: `0 0% 100%`
- Border: `220 13% 91%`

**Accent Colors**:
- Primary (actions): `217 91% 60%` (vibrant blue for CTAs)
- Success: `142 76% 36%` (extraction success, positive metrics)
- Warning: `38 92% 50%` (pending states, throttling alerts)
- Danger: `0 84% 60%` (failed scrapes, decline signals)
- Info: `199 89% 48%` (AI insights, neutral data)

**Semantic Colors**:
- Prospect Score High: `142 76% 36%` (good targets)
- Prospect Score Medium: `38 92% 50%` (moderate)
- Prospect Score Low: `0 84% 60%` (poor targets)

**Text Hierarchy**:
- Primary text: `222 10% 95%` (dark) / `222 47% 11%` (light)
- Secondary text: `222 10% 65%` (dark) / `222 13% 45%` (light)
- Tertiary text: `222 10% 50%` (dark) / `222 13% 60%` (light)

### B. Typography

**Font Families**:
- Primary: Inter (Google Fonts) - for UI, tables, metrics
- Monospace: JetBrains Mono (Google Fonts) - for domains, URLs, technical data

**Type Scale**:
- Display (page titles): `text-2xl font-semibold` (24px)
- Heading 1 (section headers): `text-xl font-semibold` (20px)
- Heading 2 (card titles): `text-lg font-medium` (18px)
- Body (default): `text-sm` (14px)
- Small (metadata, labels): `text-xs` (12px)
- Tiny (timestamps, counts): `text-[11px]` (11px)

**Font Weights**:
- Semibold (600) for headings and emphasis
- Medium (500) for labels and secondary headings
- Regular (400) for body text
- Monospace (400) for domains/URLs

### C. Layout System

**Spacing Primitives**: Use Tailwind units `2, 3, 4, 6, 8, 12` for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section spacing: `gap-6` to `gap-8`
- Page margins: `p-6` to `p-8`
- Micro spacing: `gap-2` to `gap-3`

**Grid Layouts**:
- Domain cards gallery: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Screenshot sections: `grid-cols-1 lg:grid-cols-2 gap-6` (split view)
- Metrics dashboard: `grid-cols-2 md:grid-cols-4 gap-4` (KPI tiles)

**Container Strategy**:
- Main content: `max-w-[1600px] mx-auto` (wide for data tables)
- Forms/uploads: `max-w-2xl mx-auto`
- Modals: `max-w-4xl` (screenshot viewers)

### D. Component Library

**1. Navigation & Layout**
- **Top Bar**: Fixed header with logo, global search, run status indicator, user menu - `h-14 border-b`
- **Sidebar**: Collapsible left nav with icons + labels - domains list, runs history, settings, exports
- **Breadcrumbs**: Show context path (All Domains > example.com > Organic Overview)

**2. Data Display**
- **Domain Cards**: Compact card with domain name (mono font), status badge, key metrics (keywords count, traffic, score), last crawl timestamp, quick actions (view/export/re-crawl)
- **Screenshot Gallery**: Grid layout with section labels, thumbnail previews, click to enlarge modal, extracted data overlay on hover
- **Metrics Tables**: Sticky header, zebra striping (subtle), sortable columns, inline status badges, row hover highlight, compact row height (`h-10`)
- **KPI Tiles**: 2x4 grid of stat cards with icon, label, value (large), trend indicator (arrow + percentage)

**3. Forms & Inputs**
- **File Upload**: Drag-drop zone with file type indicators (CSV/JSON/TXT), batch size preview, validation messages
- **Configuration Panel**: Grouped form sections (Rate Limits, Pacing, Section Selection) with help text, toggle switches, number inputs
- **Search/Filter Bar**: Sticky toolbar with search input, filter dropdowns (status, score range, date), quick sort options

**4. Feedback & Status**
- **Progress Tracker**: Real-time crawl monitor with domain queue list, current processing domain, progress bar, domains/hour metric, ETA
- **Status Badges**: Pill-shaped with dot indicator - `pending` (gray), `running` (blue pulse), `success` (green), `failed` (red), `paused` (orange)
- **Toast Notifications**: Slide-in from top-right for actions (export ready, crawl completed, errors)
- **Empty States**: Centered illustrations with heading, description, primary CTA

**5. Modals & Overlays**
- **Screenshot Viewer**: Full-screen modal with navigation arrows, section tabs, extracted data side panel, download button, dark backdrop
- **Domain Detail Panel**: Slide-over from right with tabs (Screenshots, Metrics, AI Insights, History), close button
- **Confirmation Dialogs**: Centered modal for destructive actions (delete run, cancel crawl)

**6. AI Insights Display**
- **Insight Cards**: Bordered cards with AI badge icon, insight title, severity indicator, expandable detailed analysis, confidence score
- **Trend Visualization**: Inline mini charts (sparklines) for decline signals, color-coded by severity

**7. Actions & Controls**
- **Primary Buttons**: `bg-primary text-white rounded-md px-4 py-2` with hover lift
- **Secondary Buttons**: `border border-border bg-transparent` with hover background
- **Icon Buttons**: Square `w-8 h-8` for compact actions (refresh, settings, download)
- **Dropdown Menus**: Floating menu with dividers, icons, keyboard shortcuts

**8. Tables & Lists**
- **Data Tables**: Sticky header, alternating row backgrounds, inline actions (icon buttons), sortable columns with arrow indicators, pagination footer
- **Domain Queue List**: Compact rows with status dot, domain name (mono), priority label, elapsed time, cancel button

### E. Animations & Interactions

**Use Sparingly**:
- Status badge pulse for "running" state: `animate-pulse`
- Skeleton loaders for data fetching: subtle shimmer
- Modal entrance: `scale-95 opacity-0` to `scale-100 opacity-100` (100ms)
- Toast slide-in: `translate-x-full` to `translate-x-0` (200ms)

**Avoid**: Page transitions, decorative animations, scroll effects

---

## Page-Specific Layouts

### Dashboard (Main View)
- Top: KPI tiles (total domains, active crawls, success rate, avg score)
- Middle: Domain cards gallery with filters/search bar
- Right sidebar: Recent activity feed, quick actions

### Domain Detail View
- Left: Screenshot gallery (3-column grid on desktop, masonry layout)
- Right: Tabbed panel (Metrics table, AI insights, Export options)
- Sticky action bar: Re-crawl, Export ZIP, View history

### Run Monitor
- Split layout: Left queue list (scrollable), Right current domain detail
- Top progress bar with pause/stop controls
- Bottom log stream (monospace, auto-scroll)

### Export Center
- File tree structure showing organized exports by run/domain
- Bulk selection checkboxes, download all/selected actions
- Preview panel for CSVs/PDFs

---

## Accessibility & Quality Standards
- Maintain WCAG AA contrast ratios in both dark/light modes
- All interactive elements have focus rings (`ring-2 ring-primary ring-offset-2`)
- Form inputs have clear labels and validation states
- Tables support keyboard navigation
- Screenshot viewer has keyboard shortcuts (arrow keys, escape)