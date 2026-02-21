# Design Guidelines: Keyword Density & Readability Scorer

## Design Approach

**Selected Approach**: Design System (Professional Data Tool)
**Primary Reference**: Professional SEO tools (Ahrefs, SEMrush) combined with clean dashboard patterns
**Key Principle**: Information clarity over visual flair - data should be immediately scannable and actionable

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: 222 47% 11% (deep charcoal)
- Surface: 215 28% 17% (slate surface)
- Primary accent: 217 91% 60% (professional blue)
- Success: 142 71% 45% (green for good metrics)
- Warning: 38 92% 50% (amber for caution)
- Danger: 0 84% 60% (red for issues)
- Text primary: 210 40% 98%
- Text secondary: 215 20% 65%
- Border: 215 28% 25%

**Light Mode**
- Background: 0 0% 100%
- Surface: 210 20% 98%
- Primary accent: 217 91% 60%
- Text primary: 222 47% 11%
- Text secondary: 215 16% 47%
- Border: 214 32% 91%

### B. Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, professional
- Monospace: 'JetBrains Mono' for metric displays

**Hierarchy**:
- H1 (Tool Title): text-3xl font-bold
- H2 (Section Headers): text-xl font-semibold
- Metric Labels: text-sm font-medium uppercase tracking-wide
- Metric Values: text-4xl font-bold (monospace)
- Body text: text-base
- Helper text: text-sm text-secondary

### C. Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section gaps: space-y-6 or space-y-8
- Card spacing: gap-4 or gap-6
- Input fields: p-4

**Container Strategy**:
- Max width: max-w-7xl mx-auto
- Tool workspace: Two-column layout on desktop (input | results)
- Mobile: Stacked single column

### D. Component Library

**Input Section**:
- Large textarea with clear label and character count
- Keyword input field with icon prefix (search icon)
- Prominent "Analyze" button (primary blue, full width on mobile)
- Clear visual hierarchy: Input → Action → Results

**Results Dashboard** (Grid of metric cards):
- **Keyword Density Card**: Large percentage display with color-coded indicator (green: 0.5-2.5%, amber: 2.5-4%, red: >4%)
- **Readability Score Card**: Flesch-Kincaid grade level with interpretation text and color indicator
- **Word Frequency Table**: Scrollable list with word + count columns, zebra striping
- **Phrase Analysis (Bigrams/Trigrams)**: Separate tabbed sections or accordion panels

**Data Visualization**:
- Horizontal bar indicators for density metrics
- Badge-style count displays for word frequencies
- Color-coded score indicators (traffic light system)
- Tooltips on hover explaining each metric

**States**:
- Empty state: Illustration with clear CTA to paste text
- Loading state: Skeleton screens for metric cards
- Error state: Clear error messages with retry option

### E. Key Interactions

**Minimal Animations** (subtle, performance-focused):
- Fade-in for results (150ms)
- Smooth number counting for metric values (300ms)
- Hover states on interactive elements (scale-105 for cards)

**No Distracting Effects**: No parallax, no scroll animations, no decorative transitions

## Layout Structure

**Header**: 
- Tool title and tagline
- Optional: Quick tips dropdown or info icon
- Dark/light mode toggle (top-right)

**Main Workspace** (Two-column on lg+):
- **Left Column (40%)**: Sticky input panel
  - Textarea (min-h-96)
  - Keyword input
  - Analyze button
  - Sample text link (pre-fills demo content)
  
- **Right Column (60%)**: Results panel
  - Metric cards in 2-column grid
  - Expandable sections for word lists
  - Export results button (secondary)

**Footer**: Simple, minimal - links to documentation/about

## Professional SEO Tool Aesthetics

- **Data-First Design**: Metrics are hero elements, not decorative UI
- **Scannable Layouts**: Clear card separation, ample whitespace
- **Trustworthy Colors**: Professional blues, avoid playful gradients
- **Functional Icons**: Use Heroicons for clarity (search, chart-bar, document-text)
- **Professional Tone**: Clean sans-serif, generous line-height (1.6), clear labeling

## Images

**No hero image needed** - This is a tool interface, not a marketing page. Focus on functional UI elements and clear data presentation. Optional: Small icon/logo in header for branding.