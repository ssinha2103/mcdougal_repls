# Design Guidelines: Broken Link & Redirect Finder

## Design Approach

**Selected Approach:** Design System - Material Design with data-focused customization

**Justification:** This is a utility-focused professional tool for SEO specialists and webmasters where efficiency, clarity, and data presentation are paramount. Similar to tools like Ahrefs, Screaming Frog, and Google Search Console, the interface should prioritize functionality over visual flair.

**Key Design Principles:**
- Data clarity over decoration
- Instant visual status recognition through color coding
- Scannable results with clear hierarchy
- Professional, trustworthy appearance
- Efficient workflow with minimal friction

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 98% (neutral gray)
- Surface: 0 0% 100% (white cards)
- Primary Action: 221 83% 53% (professional blue)
- Status Colors:
  - Success (2xx): 142 76% 36% (green)
  - Redirect (3xx): 38 92% 50% (amber/orange)
  - Client Error (4xx): 0 84% 60% (red)
  - Server Error (5xx): 0 72% 51% (darker red)
- Text Primary: 222 47% 11% (dark blue-gray)
- Text Secondary: 215 16% 47% (medium gray)
- Border: 214 32% 91% (light gray)

**Dark Mode:**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Primary Action: 217 91% 60%
- Status Colors (slightly desaturated for dark mode):
  - Success: 142 71% 45%
  - Redirect: 38 90% 55%
  - Client Error: 0 72% 63%
  - Server Error: 0 65% 58%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%
- Border: 217 19% 27%

### B. Typography

**Font Family:** 
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts)
- Monospace: 'Fira Code', 'Consolas', monospace (for URLs and status codes)

**Type Scale:**
- Hero/H1: text-4xl (36px), font-bold, tracking-tight
- Section Headers: text-2xl (24px), font-semibold
- Subsection/H3: text-lg (18px), font-semibold
- Body: text-base (16px), font-normal
- Small/Labels: text-sm (14px), font-medium
- URLs/Code: text-sm (14px), font-mono

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, and 12
- Micro spacing (between related elements): 2 (0.5rem)
- Standard spacing (general padding/margins): 4 (1rem)
- Section spacing: 6-8 (1.5-2rem)
- Large spacing (between major sections): 12 (3rem)

**Container Strategy:**
- Max width: max-w-6xl (1152px) for main content area
- Padding: px-4 on mobile, px-6 on tablet, px-8 on desktop
- Results table: Full width within container for maximum data visibility

### D. Component Library

**Input Form:**
- Single prominent text input with rounded-lg borders
- Placeholder text in muted color
- Focus state with primary color ring
- Large "Analyze Links" button (primary blue, rounded-lg, px-8 py-3)
- Input validation feedback inline below field

**Status Summary Cards:**
- Grid of 4-5 cards showing link counts by category
- Each card with subtle border-l-4 in status color
- Large number display (text-3xl, font-bold)
- Category label below (text-sm, text-secondary)
- Slight shadow on hover for depth

**Results Table:**
- Clean, striped rows for scannability (alternating subtle background)
- Fixed-width status column with color-coded badges
- Flexible URL columns with truncation and hover tooltip
- Sortable headers (clickable with sort icons)
- Sticky header on scroll for long lists
- Row hover state with slight background change
- Status badges: rounded-full px-3 py-1 with status color background and white text

**Status Badges:**
- 2xx Success: Green background, white text, "200 OK"
- 3xx Redirect: Orange background, white text, "301 Redirect" with arrow icon
- 4xx Client Error: Red background, white text, "404 Not Found"
- 5xx Server Error: Dark red background, white text, "500 Error"

**Empty States:**
- Centered illustration or icon (link/chain icon)
- Instructional text explaining how to use the tool
- Sample URL suggestion

**Loading States:**
- Spinner with progress indicator showing "Checking X of Y links..."
- Disable input during analysis
- Animated pulse on analyzing button

### E. Navigation & Header

**Header:**
- Simple top bar with tool name (text-xl, font-semibold)
- Optional: Link to documentation or "How it works"
- Minimal height (h-16) to maximize content space

**No Hero Image Needed:** This is a utility tool, not a marketing page. Start directly with the input form and tool description.

### F. Page Structure

1. **Tool Header** (compact, py-4)
   - Tool title and brief one-line description
   - Subtle background differentiation from main content

2. **Input Section** (py-8)
   - Centered, max-w-2xl
   - Clear instructional text above input
   - Prominent input field and analyze button
   - Example URL suggestion below in muted text

3. **Results Summary** (py-6, when results exist)
   - Grid of status category cards (grid-cols-2 md:grid-cols-4 gap-4)
   - Total links analyzed prominently displayed

4. **Results Table** (pt-4)
   - Full width with horizontal scroll on mobile
   - Columns: Status | Original URL | Final URL (for redirects) | Status Code
   - Grouped by status category with category headers
   - Export button above table (CSV download)

### G. Interactions

**Minimal Animations:**
- Fade-in for results (duration-300)
- Smooth transition on status badge hover
- Button press states (scale-95 on active)
- NO complex scroll animations or excessive motion

### H. Responsive Behavior

- Mobile: Stack status cards vertically, horizontally scrollable table
- Tablet: 2-column status card grid
- Desktop: 4-column status card grid, full table visible

**Mobile Table Optimization:**
- Consider card-based layout for mobile instead of table
- Each link as a card showing status, URLs stacked vertically