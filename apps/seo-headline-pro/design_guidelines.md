# SEO Headline Generator - Design Guidelines

## Design Approach: Utility-Focused Modern Interface

**Selected Approach:** Design System - Drawing from Linear's precision, Notion's clarity, and modern AI writing tools' efficiency.

**Justification:** This is a productivity tool for SEO professionals and content creators who prioritize speed, clarity, and usability over visual flair. The interface should get users to their goal (generating headlines) with minimal friction.

**Key Design Principles:**
- Clarity over decoration - every element serves the user's workflow
- Immediate functionality - no hero section, lead with the tool itself
- Scannable results - headlines must be easy to read and compare
- Professional credibility - instill confidence in AI-generated content

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 210 90% 55% (vibrant blue for CTAs and accents)
- Background: 0 0% 100% (pure white)
- Surface: 240 20% 98% (subtle warm gray for cards)
- Text Primary: 220 20% 15% (near-black for headlines)
- Text Secondary: 220 15% 45% (medium gray for metadata)
- Success: 145 65% 50% (for copy confirmations)
- Border: 220 15% 90% (subtle dividers)

**Dark Mode:**
- Primary: 210 85% 60% (slightly brighter blue)
- Background: 222 15% 10% (deep navy-gray)
- Surface: 220 15% 14% (elevated card background)
- Text Primary: 220 15% 95% (near-white)
- Text Secondary: 220 10% 65% (muted text)
- Border: 220 15% 20% (subtle dark borders)

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - for UI elements, labels, body text
- Headlines Display: 'Cal Sans' or 'Plus Jakarta Sans' (Google Fonts) - for generated headlines to make them stand out

**Type Scale:**
- Input Label: text-sm font-medium (14px)
- Generated Headline: text-lg font-semibold leading-snug (18px) - must be highly readable
- Character Count: text-xs (12px)
- Button Text: text-sm font-medium
- Page Title: text-3xl font-bold

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 3, 4, 6, 8, 12, 16 consistently
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Form spacing: space-y-4
- Card spacing: p-6

**Container Strategy:**
- Max width: max-w-4xl mx-auto (focused, comfortable width)
- Vertical padding: py-12 md:py-16
- No full-height viewport constraints - natural content flow

### D. Component Library

**Primary Components:**

1. **Input Section** (top of page, no hero)
   - Large textarea for topic/keyword input (min-h-24)
   - Character counter below input
   - Prominent "Generate Headlines" button (w-full md:w-auto)
   - Optional: Tone selector (Professional, Casual, Urgent) as pill buttons

2. **Results Grid**
   - Each headline in its own card (border rounded-lg p-4)
   - Two-column layout on desktop (grid-cols-1 md:grid-cols-2 gap-4)
   - Headline text prominent at top
   - Format badge (Listicle, Question, How-to) as small pill
   - Character count in muted text
   - Copy button (icon only, positioned top-right of card)

3. **Navigation**
   - Minimal header: Logo/title left, optional settings/theme toggle right
   - Sticky positioning (sticky top-0) with backdrop blur

4. **Feedback States**
   - Loading: Skeleton cards with pulse animation
   - Success: Subtle check mark on copy with 2s toast notification
   - Empty state: Centered message with icon and CTA

5. **Footer**
   - Compact, single row
   - Credits, links to documentation, powered by OpenAI badge

### E. Interactions

**Micro-interactions (minimal):**
- Button hover: slight scale (scale-105) and brightness increase
- Card hover: subtle border color change and shadow lift
- Copy success: brief scale animation on button (scale-110) then bounce back
- Form focus: enhanced border color with subtle glow (ring-2)

**No complex animations** - keep interface snappy and professional

## Layout Strategy

**Single-Page Application Flow:**
1. Header (h-16, sticky)
2. Input Section (immediate, above fold, pt-8)
3. Results Section (mt-12, dynamic height)
4. Footer (mt-auto, py-8)

**Responsive Behavior:**
- Mobile: Single column, full-width buttons, stacked results
- Tablet: Begin two-column results grid
- Desktop: Comfortable max-w-4xl container, two-column results

## Visual Hierarchy

**Priority Order:**
1. Generated headlines (largest, boldest)
2. Generate button (vibrant color, prominent)
3. Input area (clear focus states)
4. Metadata (character counts, format badges - subtle)

**Card Design for Headlines:**
- Clean white/dark surface with subtle border
- Ample padding (p-6) for readability
- Clear separation between headline text and metadata
- Copy button always visible (no hide/reveal)

## Images

**No hero image required** - This is a utility-first tool where functionality takes precedence. Users should land directly on the input interface to start generating headlines immediately.

**Optional brand element:** Small abstract geometric pattern or gradient in header background (very subtle, low opacity) to add minimal visual interest without distraction.