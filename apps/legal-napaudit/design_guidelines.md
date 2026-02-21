# Legal Directory NAP Consistency Checker - Design Guidelines

## Design Approach
**Selected Approach**: Professional SaaS Design System  
**Primary Reference**: Linear, Stripe Dashboard, Vercel Analytics  
**Justification**: This is a utility-focused B2B tool requiring clarity, trust, and efficient data presentation. The design should prioritize information hierarchy and professional credibility over visual flair.

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 217 91% 60% (Professional blue - trust, authority)
- Background: 0 0% 100% (Pure white)
- Surface: 220 13% 97% (Light gray backgrounds)
- Border: 220 13% 91% (Subtle dividers)
- Text Primary: 222 47% 11% (Nearly black)
- Text Secondary: 215 16% 47% (Medium gray)
- Success: 142 71% 45% (Consistent NAP indicator)
- Warning: 38 92% 50% (Minor inconsistencies)
- Error: 0 84% 60% (Critical inconsistencies)

**Dark Mode**:
- Primary: 217 91% 60% (Same blue for consistency)
- Background: 222 47% 11% (Deep navy-black)
- Surface: 217 19% 18% (Elevated surfaces)
- Border: 217 19% 27% (Subtle borders)
- Text Primary: 210 40% 98% (Off-white)
- Text Secondary: 215 20% 65% (Light gray)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - clean, professional, excellent readability
- **Headings**: Font weights 700 (bold) for H1/H2, 600 (semibold) for H3/H4
- **Body**: Font weight 400 (regular), line-height 1.6 for optimal reading
- **Monospace**: JetBrains Mono for displaying exact NAP data, phone numbers, addresses

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 24 (e.g., p-4, gap-6, my-12)  
**Container**: max-w-7xl for main content area, max-w-3xl for forms  
**Grid System**: Use 1-column mobile, 2-column tablet/desktop for comparison views

### D. Component Library

**Navigation**:
- Sticky header with logo, minimal navigation (Tool, How It Works, Pricing)
- Clean white background with subtle bottom border

**Search Form Section**:
- Centered card layout (max-w-2xl)
- Large, clear input fields with labels above
- Two-field form: "Law Firm Name" and "Location/Address"
- Primary CTA button: "Check NAP Consistency" - full width on mobile, inline on desktop
- Secondary text below form explaining what the tool does
- Loading state with professional spinner and status messages

**Results Dashboard**:
- Summary cards at top showing: Total Directories Checked, Consistent Listings, Inconsistencies Found
- Each card with large number, label, and status color indicator
- Google Places "Canonical Data" prominently displayed in a bordered container at top

**Directory Comparison Table**:
- Clean table layout with alternating row backgrounds
- Columns: Directory Name | Name Status | Address Status | Phone Status | Actions
- Visual indicators: Green checkmarks (consistent), Yellow warning icons (minor differences), Red X icons (major discrepancies)
- Expandable rows showing exact data comparison when clicked
- "View Details" button per row to see side-by-side NAP comparison

**Inconsistency Detail View**:
- Side-by-side comparison: "Google Places (Canonical)" vs "Directory Listing"
- Highlight differences in yellow background
- Clear labels for each field (Name, Address, Phone)
- Actionable advice: "Recommended Action: Update listing on [Directory]"

**Export Section**:
- Floating action button or prominent "Export Report" button
- Options: PDF Report, CSV Download
- Include timestamp and firm name in export

**Data Visualization**:
- Simple donut chart showing consistency percentage
- Color-coded segments: Green (consistent), Yellow (minor issues), Red (critical issues)

**Trust Elements**:
- "Powered by Google Places API" badge
- Disclaimer about data accuracy and last checked timestamp
- "Directories Checked" count with logos of major directories

**Footer**:
- Minimal footer with links: Privacy Policy, Terms of Service, Contact
- Copyright notice
- Social proof: "Trusted by 1,000+ law firms"

### E. Images

**Hero Section**: 
- Full-width hero with subtle gradient background (no image needed - keep it professional and fast-loading)
- Alternatively: Use a clean illustration showing directory icons connected to a central "law firm" node with consistency checkmarks

**Directory Logos**: 
- Display small, monochrome logos of checked directories (Avvo, FindLaw, Justia, Yelp, etc.) in the results section
- Use grayscale versions for consistent visual appearance

**Illustration Spots**:
- Empty state illustration when no search performed yet (magnifying glass over documents)
- Success state illustration when all NAP data is consistent (green checkmark shield)

### Interaction Patterns
- Smooth transitions between states (loading → results)
- Expandable/collapsible directory details
- Hover states on table rows for better scannability
- Copy-to-clipboard buttons for NAP data fields
- Toast notifications for export success

### Key Design Principles
1. **Clarity First**: Data should be instantly scannable
2. **Professional Trust**: Design conveys authority and accuracy
3. **Action-Oriented**: Clear next steps for fixing inconsistencies
4. **Minimal Distractions**: No unnecessary animations or decorative elements
5. **Data Transparency**: Show exactly what was checked and when