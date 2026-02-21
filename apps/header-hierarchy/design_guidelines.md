# Design Guidelines: Header Tag Structure Checker

## Design Approach

**Selected Approach**: Clean, Professional SEO Tool (AI SEO PageScore Style)

Professional, modern design with clean white layouts, card-based UI, and a blue/green color scheme that conveys trust and clarity. Optimized for screenshot sharing and professional documentation.

**Key Design Principles**:
- Clean, spacious layouts with generous whitespace
- Card-based design with subtle shadows
- Professional blue primary color with green accents
- Clear visual hierarchy and information structure
- Screenshot-optimized presentation

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Background: 214 32% 97% (light grayish-blue)
- Surface/Card: 0 0% 100% (pure white)
- Primary: 217 91% 60% (professional blue - for titles, headings)
- Accent: 142 71% 45% (green - for section headers, icons)
- Success: 142 71% 45% (green)
- Warning: 38 92% 50% (amber)
- Error: 0 84% 60% (red)
- Text Primary: 222 47% 11% (near black)
- Text Secondary: 215 20% 55% (medium gray)
- Text Tertiary: 215 16% 65% (lighter gray)
- Border: 214 32% 91% (subtle gray)

**Dark Mode**:
- Background: 222 47% 11%
- Surface/Card: 217 19% 18%
- Primary: 217 91% 70%
- Accent: 142 71% 55%
- Success: 142 71% 55%
- Warning: 38 92% 60%
- Error: 0 84% 70%
- Text Primary: 210 20% 98%
- Text Secondary: 215 16% 65%
- Text Tertiary: 215 16% 55%
- Border: 217 19% 27%

### B. Typography

**Font Stack**: System fonts for performance
- Primary: `font-sans` (system font stack)
- Monospace: `font-mono` for URLs

**Hierarchy**:
- Hero Title: text-4xl/text-5xl, font-bold, text-primary (blue)
- Hero Subtitle: text-lg, font-normal, text-secondary
- Section Title: text-2xl, font-bold, text-accent (green)
- Card Heading: text-lg, font-semibold
- Body: text-base, font-normal
- Helper Text: text-sm, text-secondary
- Labels: text-sm, font-medium

### C. Layout System

**Spacing Primitives**:
- Micro: gap-2, p-2 (8px)
- Small: gap-4, p-4 (16px)
- Medium: p-6, gap-6 (24px)
- Large: p-8, gap-8 (32px)
- Section: py-12, py-16 (48px-64px)

**Container Strategy**:
- Page wrapper: min-h-screen with background color
- Content container: max-w-6xl mx-auto px-4
- Hero section: max-w-4xl mx-auto, text-center
- Form cards: max-w-4xl mx-auto
- Results: max-w-5xl mx-auto

### D. Component Library

**Header Navigation**:
- Clean white background (bg-white/bg-card)
- Logo/branding on left with icon and text
- Navigation links on right (text-sm, text-secondary)
- Border bottom for separation
- Sticky positioning for persistent access
- Padding: px-6 py-4

**Hero Section**:
- Centered content with max-w-4xl
- Large blue title (text-4xl font-bold text-primary)
- Subtitle below in secondary text
- Optional info box with blue accent
- Background: light (bg-background)
- Padding: py-12 or py-16

**Card/Panel Design**:
- White background (bg-card)
- Rounded corners: rounded-lg
- Subtle shadow: shadow-sm or shadow-md
- Padding: p-6 or p-8
- Border: subtle 1px border (optional)

**Form Elements**:
- Section headers: Green text with icon, text-2xl font-bold
- Input fields: Rounded (rounded-lg), with icon prefix
- Globe icon for URL inputs
- Placeholder text in muted color
- Focus states with blue ring
- Generous padding: px-4 py-3

**Action Buttons**:
- Primary: Blue background, white text, rounded-md
- Secondary: White background, border, text-primary
- "+ Add" buttons: Text with icon, subtle hover
- Size: px-6 py-2.5 or larger for primary actions

**Info Boxes**:
- Light blue background (bg-primary/5 or bg-blue-50)
- Blue border-l-4 accent
- Rounded corners
- Padding: p-4 or p-6
- Blue text for emphasis

**Heading Level Badges**:
- Small rounded pills: px-2 py-1, text-xs, rounded
- H1: bg-blue-100 text-blue-800 (dark: bg-blue-900/30)
- H2: bg-purple-100 text-purple-800
- H3: bg-green-100 text-green-800
- H4: bg-yellow-100 text-yellow-800
- H5: bg-orange-100 text-orange-800
- H6: bg-gray-100 text-gray-800

**Results Display**:
- White card container
- Clear visual hierarchy with indentation
- Tree structure with connecting lines
- Statistics in grid layout
- Error banners at top when present

---

## Layout Specifications

**Page Structure**:
1. Header Navigation (sticky): Logo + nav links
2. Hero Section (py-16): Title + subtitle + info box
3. Main Content Card (py-8): Form or results in white card
4. Footer (optional): Minimal credits

**Responsive Breakpoints**:
- Mobile (base): Full width, stacked elements
- Tablet (md): Wider containers, maintained stack
- Desktop (lg): Max-width centered layouts

**Visual Hierarchy**:
- Use card elevation to separate content sections
- Green section headers to denote major sections
- Blue for primary actions and titles
- Generous whitespace between sections

---

## Component Patterns

**URL Input Pattern**:
```
[Card Container]
  [Green Icon + Section Title]
  [Helper Text]
  [Label]
  [Input with Globe Icon]
  [Action Button]
```

**Analysis Results Pattern**:
```
[Hero Title + Analyzed URL]
[Info Box with Key Metrics]
[Statistics Grid]
[Error Banners if any]
[Heading Hierarchy Tree]
[Export Actions]
```

**Navigation Pattern**:
```
[Header]
  [Logo/Brand] ... [Nav Links] [Theme Toggle]
```

---

## Animations

Minimal, purposeful animations:
- Smooth transitions on hover (transition-colors)
- Loading states with spinners
- Fade-in for results (animate-in)
- No excessive motion

**Interaction States**:
- Hover: Subtle elevation or color shift
- Active: Slight scale or color change
- Focus: Blue ring (ring-2 ring-primary)
- Disabled: Reduced opacity (opacity-50)
