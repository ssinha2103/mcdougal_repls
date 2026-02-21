# SEO Research Automation Dashboard - Design Guidelines

## Design Approach: Lead Intelligence Studio

**Selected Approach:** Modern SaaS Intelligence Platform
**Justification:** Professional lead intelligence interface with clean cards, green accents, refined typography, and data-focused layouts for credibility and efficiency.

**Core Principles:**
- Clean, spacious layouts with generous white space
- Green as primary action color (trust, growth, action)
- Card-based information architecture
- Badge/pill visual language for status indicators
- Professional navigation with clear hierarchy

---

## Color Palette

### Light Mode
- **Background Layers:** 0 0% 100% (white), 0 0% 97% (subtle gray for card backgrounds)
- **Primary Action (Green):** 152 69% 31% (professional green for buttons/actions)
- **Secondary/Accents:**
  - Blue badges: 210 100% 95% (background), 210 100% 45% (text)
  - Purple badges: 270 95% 95% (background), 270 80% 50% (text)
  - Green badges: 152 90% 95% (background), 152 69% 31% (text)
- **Status Indicators:**
  - Red (Urgent/Declining): 0 84% 60%
  - Orange (Review): 25 95% 53%
  - Green (Healthy): 152 69% 31%
- **Text Hierarchy:** 
  - Primary: 220 13% 9%
  - Secondary: 220 9% 46%
  - Tertiary: 220 9% 70%
- **Borders:** 220 13% 91%
- **Card Background:** 0 0% 97%

### Dark Mode
- **Background Layers:** 220 13% 9%, 220 13% 12%
- **Primary Action:** 152 69% 45%
- **Status Indicators:** Adjusted lightness for dark backgrounds
- **Text:** 220 9% 98%, 220 9% 70%, 220 9% 50%
- **Borders:** 220 13% 18%

---

## Typography

**Font Stack:** Inter (all text), SF Mono (tabular data)

**Hierarchy:**
- Hero Titles: 32px / font-bold
- Page Titles: 20px / font-semibold
- Section Headers: 16px / font-semibold
- Table Headers: 11px / font-medium / uppercase / letter-spacing-wider / text-tertiary
- Body/Data: 14px / font-normal
- Small Pills/Badges: 11px / font-medium
- Large Metrics: 36px / font-bold / tabular-nums

---

## Layout System

**Spacing Primitives:** Tailwind units of 3, 4, 6, 8, 12, 16, 24
- Hero card padding: p-8 to p-12
- Section padding: p-6
- Card padding: p-6
- Table cell padding: px-4 py-3
- Badge padding: px-3 py-1

**Grid Structure:**
- Hero section: Large card with internal 2-column layout (content + quick actions)
- Stats row: 3-column grid within hero
- Data table: Full-width below hero
- Page container: max-w-7xl mx-auto px-6

---

## Component Library

### Core Navigation
- **Top Navigation Bar:** 
  - Clean white background, border-bottom
  - Logo + title on left
  - Nav items: Home, Explore, Activity, Pricing, Profile, Logout, Admin
  - Icon + text format, subtle hover states
  - Height: 64px

### Hero Section
- **Large Hero Card:**
  - White background, subtle shadow, rounded-lg
  - Small badge/pill at top (e.g., "LEAD INTELLIGENCE STUDIO")
  - Large bold title
  - Description text below
  - Stats grid (3 columns): Total Leads, Currently Viewing, Filters
  - Quick Actions panel on right side with stacked buttons

### Data Display Components

**Stat Cards (within Hero):**
- Label above (uppercase, small, tertiary color)
- Large number display (bold, tabular-nums)
- Subtitle text below (secondary color)

**Quick Actions Panel:**
- Dark card on right side of hero
- Icon + text buttons stacked vertically
- Subtle icons (export, view, research)

**Data Table:**
- Clean white background
- Header row: uppercase labels, tertiary color, letter-spacing
- Checkbox column for selection
- Badge/pill elements for categories
- Score badges with icon
- Location text with icon
- Green action buttons
- Hover state: subtle background
- Controls above table: pagination dropdown, selection count, action button

**Badges/Pills:**
- Rounded-full, px-3 py-1
- Icon + text format
- Color-coded backgrounds with matching text colors
- Examples: Event Planner (purple), Website (blue), Score (with star icon)

### Action Components

**Primary Buttons (Green):**
- Background: green-600
- Text: white
- Rounded-md, px-4 py-2
- Icon + text format
- Examples: "Start Research", "Launch Research", "Export Data"

**Secondary Buttons:**
- Light background with colored text
- Icon + text format
- Rounded-md
- Examples: "View Exports", "Research Jobs"

**Icon Buttons:**
- Minimal, ghost style
- Rounded-full for floating actions
- 40px size

---

## Page-Specific Layouts

### Dashboard View (Main)
1. **Top Navigation** - Fixed header with logo and nav items
2. **Hero Card** - Large card with:
   - Badge label
   - Title + description
   - 3-column stats grid
   - Quick Actions panel (right side)
3. **Data Table Section** - Full-width table with:
   - Section title + description
   - Controls (pagination, selection, actions)
   - Clean table with badges and action buttons

### Upload View
- Centered card with drag-drop zone
- Quick Actions panel for export options
- Processing overlay when active

---

## Badge/Pill System

**Category Badges:**
- Icon + text format
- Rounded-full, px-3 py-1, text-xs
- Color-coded: Purple (event), Blue (website), etc.

**Score Badges:**
- Star icon + score number
- Neutral gray background
- Monospace numbers

**Status Pills:**
- Small colored dot (6px) + text
- Success (green), Warning (orange), Danger (red)

---

## Export & Client-Facing Design

**Excel Exports:**
- Green header row for primary actions
- Color-coded status columns
- Professional formatting

**Interface Screenshots:**
- Clean white backgrounds
- Generous padding around content
- Professional green accent color

---

## Empty States
- Simple icon illustration
- Friendly but professional copy
- Call-to-action button (green)
- Example: "No domains yet. Upload your first list to begin."
