# LegalService Schema Markup Generator - Design Guidelines

## Design Approach: Professional SaaS Tool
**Selected Approach:** Modern utility-focused design inspired by professional legal tech platforms (Clio, LexisNexis) and developer tools (Stripe Docs, Linear)

**Core Principle:** Establish immediate credibility and trust while making complex technical SEO accessible to non-technical legal professionals.

## Color Palette

**Dark Mode Primary:**
- Background: 222 15% 10%
- Surface: 222 15% 15%
- Primary Accent: 213 94% 68% (Professional blue - trustworthy, corporate)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Success: 142 71% 45%
- Border: 0 0% 25%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary Accent: 213 94% 50%
- Text Primary: 222 15% 15%
- Text Secondary: 0 0% 40%
- Success: 142 71% 45%
- Border: 0 0% 88%

## Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Monospace Font:** JetBrains Mono (for JSON code display)
- **Headings:** font-semibold to font-bold, tracking-tight
- **Body:** text-base, leading-relaxed for readability
- **Code:** text-sm with syntax highlighting

## Layout System
**Spacing Units:** Consistently use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
**Container:** max-w-7xl with responsive padding (px-4 md:px-8)
**Grid System:** Two-column layout on desktop (lg:grid-cols-2) - form on left, live preview on right

## Page Structure

### Header Section
- Compact navigation bar with logo/tool name
- CTA button: "View Documentation" or "See Examples"
- Trust indicator: "Trusted by 500+ Law Firms" badge

### Hero Section (Condensed)
- Brief headline: "Generate Perfect Schema Markup for Your Law Firm"
- Single-line subheadline emphasizing SEO benefits
- NO large hero image - this is a tool, not marketing fluff
- Height: 40vh maximum, keep it focused

### Main Tool Interface (Primary Focus)
**Form Section (Left Column - Desktop):**
- Organized into collapsible/expandable sections:
  - Firm Information (name, address, phone, website, founding date)
  - Practice Areas (checkbox grid + custom input)
  - Attorney Details (dynamic add/remove cards)
  - Additional Locations (optional expansion)
- Field styling: Clean inputs with floating labels, subtle focus states
- Validation: Inline green checkmarks for valid fields, red borders for errors
- Progress indicator: Shows completion percentage at top

**Live Preview Section (Right Column - Desktop, Sticky):**
- Real-time JSON-LD output in code block
- Syntax-highlighted with line numbers
- Actions: Copy to Clipboard (primary), Download .json (secondary)
- Validation status badge: "Schema Valid ✓" or warnings
- Toggle: View Raw JSON / View Formatted

### Supporting Sections
**Benefits Grid (3 columns):**
- SEO Value, Technical Accuracy, Time Savings
- Icon + title + 2-sentence description
- Use Heroicons for consistent iconography

**How It Works (4 steps):**
- Horizontal timeline on desktop
- Numbered steps with icons
- Concise explanation for each phase

**Footer:**
- Created by [Your Brand]
- Links: Documentation, Schema.org Reference, Legal SEO Resources
- Newsletter signup: "Get Legal SEO Tips"

## Component Library

### Form Elements
- **Text Inputs:** Rounded-lg, border-2, focus ring with primary color
- **Select Dropdowns:** Custom styled with chevron icon
- **Checkboxes:** Larger touch targets (min 44px), clear labels
- **Add/Remove Buttons:** Icon buttons with tooltips, subtle hover states

### Action Buttons
- **Primary CTA:** bg-primary with white text, rounded-lg, px-6 py-3
- **Secondary:** outline variant with blur backdrop on images
- **Icon Buttons:** Ghost style for add/remove actions

### Code Display
- **Background:** Slightly darker than surface for contrast
- **Font:** JetBrains Mono at 14px
- **Scrollable:** max-height with custom scrollbar styling
- **Copy Feedback:** Toast notification on successful copy

### Cards
- Subtle shadow on light mode, border on dark mode
- Rounded-xl corners
- Padding: p-6
- Attorney cards: Include photo placeholder, credentials list, badge for bar status

## Responsive Behavior
- **Desktop (lg+):** Side-by-side form and preview
- **Tablet (md):** Stacked layout, preview becomes bottom sheet
- **Mobile:** Single column, sticky "View Preview" button at bottom

## Animations
- **Minimal:** Smooth transitions on form field focus (150ms)
- **Copy Success:** Brief scale animation on copy button
- **NO scroll-triggered animations** - keep it professional

## Images
- **NO large hero image** - this is a functional tool
- **Attorney Placeholders:** Circle avatars in attorney cards (100px diameter)
- **Optional:** Small badge/seal graphics for trust indicators in header

## Accessibility
- High contrast ratios (WCAG AAA where possible)
- Focus indicators on all interactive elements
- Screen reader labels for icon-only buttons
- Keyboard navigation throughout entire form
- Error announcements for validation failures

## Key Differentiators
- Real-time validation with helpful error messages
- Example data "Load Sample Firm" button for demo purposes
- Schema version selector (Schema.org 3.9+)
- Export options: JSON file, HTML embed code, WordPress snippet

**Critical Success Factor:** The form should feel effortless to fill out while the generated schema inspires confidence through clean formatting and visible validation.