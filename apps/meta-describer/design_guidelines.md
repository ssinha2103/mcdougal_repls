# Meta Description Generator - Design Guidelines

## Design Approach
**Selected Approach:** Design System-Inspired (Linear/Notion/Modern SaaS)
**Justification:** As a utility-focused SEO tool, this application prioritizes clarity, efficiency, and professional aesthetics. Drawing inspiration from modern productivity tools like Linear and Notion ensures a clean, functional interface that SEO professionals will find intuitive and trustworthy.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 8% (deep charcoal)
- Surface: 222 15% 12% (elevated surface)
- Border: 222 10% 20% (subtle borders)
- Primary: 210 100% 60% (vibrant blue for CTAs)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%
- Success: 142 76% 45% (green for character count in range)
- Warning: 38 92% 50% (amber when approaching limit)
- Error: 0 72% 55% (red when over limit)

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 10% 90%
- Primary: 210 100% 50%
- Text Primary: 0 0% 15%
- Text Secondary: 0 0% 45%

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - all UI text, forms, and body content
- Monospace: 'JetBrains Mono' (Google Fonts) - generated meta descriptions for clarity

**Type Scale:**
- Hero Heading: text-4xl md:text-5xl font-bold (tool title)
- Section Heading: text-2xl font-semibold (results section)
- Body: text-base (form labels, descriptions)
- Meta Text: text-sm font-mono (generated descriptions)
- Small: text-xs (character counter, helper text)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing: gap-2, p-2 (tight elements)
- Standard spacing: gap-4, p-4, mb-6 (form fields, cards)
- Section spacing: py-12, py-16, py-24 (vertical rhythm)
- Container padding: px-4 md:px-8

**Grid System:**
- Main container: max-w-4xl mx-auto
- Form layout: Single column on mobile, optimized width on desktop
- Results grid: Single column stack for easy comparison

### D. Component Library

**Input Form Section:**
- Prominent input card with subtle shadow and border
- Large textarea for topic input (min-h-24)
- Keyword inputs in a 2-column grid on desktop (stacked on mobile)
- Real-time character counter badge positioned top-right of each keyword field
- Helper text below inputs explaining optimal usage
- Generate button: Large (h-12), full-width on mobile, inline on desktop, primary color

**Character Counter Display:**
- Dynamic color coding: Green (0-150), Amber (151-160), Red (160+)
- Format: "155/160 characters" with icon indicator
- Positioned prominently near/within generated results

**Results Display:**
- Each result in a distinct card (border, rounded-lg, p-4)
- Meta description in monospace font for accurate preview
- Character count badge (top-right corner of each card)
- Copy button (right-aligned, icon + text)
- Hover state: Subtle elevation and border color change
- Stagger animation when results appear (50ms delay between each)

**Copy Feedback:**
- Toast notification on successful copy (top-right, 3s duration)
- Temporary button state change (checkmark icon, success color)

**Navigation/Header:**
- Clean header with tool logo/name
- Subtle "Powered by OpenAI" badge
- GitHub/About link (if applicable)

**Footer:**
- Minimal footer with creator credit and related tool links
- SEO-focused tip or best practice callout

### E. Animations

**Minimal Motion Approach:**
- Form submission: Subtle loading spinner on button
- Results appearance: Gentle fade-in with 200ms stagger
- Copy button: Scale transform on click (scale-95)
- Toast notifications: Slide-in from top-right
- No decorative animations - function over flash

## Page Structure

**Hero Section (Above Fold):**
- Concise headline: "Generate Perfect Meta Descriptions"
- Subheadline: One-line value proposition about SEO optimization and keyword integration
- Immediate access to input form (no scroll required)

**Input Section:**
- Visual hierarchy: Topic input most prominent
- Keyword inputs clearly labeled "Primary Keyword" and "Secondary Keyword (optional)"
- Generate button as primary CTA with prominent placement

**Results Section:**
- Appears below form after generation
- Clear heading: "Your Generated Meta Descriptions"
- Instruction text: "Choose the one that best fits your page, or use as inspiration"
- 4-5 distinct result cards in vertical stack

**Educational Footer:**
- "Pro Tip" callout box with meta description best practices
- Links to related SEO resources (optional upsell to other tools)

## Images

**No large hero image required.** This utility tool focuses on immediate functionality. However, include:

1. **Subtle Background Pattern:** Abstract, low-opacity grid or dot pattern in the hero section for visual interest without distraction
2. **Icon Library:** Use Heroicons for all UI icons (copy, checkmark, info, warning indicators)
3. **OpenAI Badge:** Small, tasteful "Powered by OpenAI" logo in header or footer

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout throughout
- Full-width form inputs
- Full-width generate button
- Stacked keyword inputs
- Touch-optimized copy buttons (min 44px height)

**Desktop (≥ 768px):**
- Centered container (max-w-4xl)
- Keyword inputs in 2-column grid
- Inline generate button (not full-width)
- Results maintain single column for easy comparison

## Accessibility

- High contrast ratios (WCAG AAA where possible)
- Focus visible states on all interactive elements (ring-2 ring-primary)
- Character counter uses color AND text/icons
- Screen reader announcements for generated results
- Keyboard navigation fully supported