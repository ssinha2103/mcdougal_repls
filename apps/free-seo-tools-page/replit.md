# Free SEO Tools Directory

## Overview
A full-featured, responsive web application that displays a curated directory of free SEO tools. The app features a beautiful blue gradient design, real-time search, category filtering, sorting, favorites, tool detail pages, admin management, analytics tracking, and pagination support.

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Storage**: JSON file-based storage (data.json)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Authentication**: Express Session with admin panel
- **Styling**: Tailwind CSS with custom design tokens

### Design System
- **Primary Blue**: #0e73b8
- **Accent Blue**: #46b9fd
- **Body Text**: #3b4750
- **Muted Text**: #687889
- **Hero Gradient**: linear-gradient(135deg, #f2f8ff 0%, #eaf6ff 50%, #ffffff 100%)
- **CTA Gradient**: linear-gradient(135deg, #46b9fd, #0e73b8)
- **Font**: Montserrat, Arial, sans-serif

### Key Features
1. **Hero Section**: Gradient background with page title and description
2. **Search Functionality**: Real-time filtering across tool names, descriptions, and categories
3. **Category Filter**: Dropdown to filter tools by specific categories
4. **Sorting**: Sort tools alphabetically (A-Z, Z-A) or by newest
5. **Favorites System**: Client-side bookmarking with localStorage, toggle on cards, filter view
6. **Tool Detail Pages**: Individual pages with screenshots, usage guides, and related tools
7. **Admin Panel**: Secure authentication, CRUD operations (Create, Read, Update, Delete tools)
8. **Analytics Tracking**: Click tracking with popular tools display
9. **Pagination**: Support for 50+ tools with page controls
10. **Responsive Grid**: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
11. **Accessible**: ARIA labels, keyboard navigation, focus states

## Data Model

### Tool Schema
```typescript
{
  id: string (UUID)
  name: string
  url: string
  description: string
  categories: string[]
  screenshot: string | null
  usageGuide: string | null
  createdAt: timestamp
}
```

### User Schema
```typescript
{
  id: string (UUID)
  username: string (unique)
  password: string
}
```

### Analytics Schema
```typescript
{
  id: string (UUID)
  toolId: string (foreign key to tools.id)
  clickedAt: timestamp
}
```

### Initial Tools (9 SEO Tools)
1. Keyword Combiner - Utilities, Content
2. Word Counter - Utilities, Content
3. AI SEO Page Score - Analysis, On-Page
4. SERP Snippet Audit - On-Page, Analysis
5. Header Hierarchy - On-Page, Technical
6. Link Auditor - Technical, On-Page
7. Intent Discover - Analysis, Content
8. YouTube Insight Tool - YouTube, Content
9. SEO Headline Pro - Content, On-Page

## API Endpoints

### Public Routes
- **GET /api/tools** - Returns all SEO tools (Response: `Tool[]`)
- **GET /api/tools/:id** - Returns a specific tool by ID (Response: `Tool`)
- **POST /api/analytics/click** - Track a tool click (Request: `{ toolId: string }`)
- **GET /api/analytics/popular** - Get popular tools (Response: `{ toolId: string; clickCount: number; tool?: Tool }[]`)

### Auth Routes
- **POST /api/auth/login** - Login (Request: `{ username: string; password: string }`)
- **POST /api/auth/logout** - Logout
- **GET /api/auth/me** - Get current user session

### Protected Admin Routes
- **POST /api/tools** - Create a new tool (Admin only)
- **PATCH /api/tools/:id** - Update a tool (Admin only)
- **DELETE /api/tools/:id** - Delete a tool (Admin only)

## Project Structure
```
client/
  src/
    pages/
      home.tsx          # Main tools directory page
      tool-detail.tsx   # Tool detail page
      admin-login.tsx   # Admin login page
      admin.tsx         # Admin dashboard
    components/ui/      # Shadcn components
    index.css           # Tailwind config and custom CSS
  index.html            # HTML entry point with Montserrat font

server/
  storage.ts            # JSON file storage with seeded tools & admin user
  routes.ts             # API endpoints with auth middleware
  index.ts              # Express server setup with session

shared/
  schema.ts             # TypeScript types and Zod schemas

data.json               # JSON file storing all application data (users, tools, analytics)
```

## Development

### Running the Application
```bash
npm run dev
```
The app runs on port 5000 and serves both frontend and backend.

### Admin Access
Default admin credentials:
- Username: `admin`
- Password: `admin123`

Login at: `/admin/login`

### Adding New Tools
To add a new tool to the directory:
1. Login to the admin panel at `/admin/login`
2. Click "Add Tool" button
3. Fill in the tool details (name, URL, description, categories, screenshot URL, usage guide)
4. Click "Add Tool" to save

## User Experience

### Accessibility
- All inputs have proper ARIA labels
- Focus indicators visible on all interactive elements
- `aria-live="polite"` announces filter/sort changes
- Semantic HTML with `<article>` elements for cards

### Responsive Design
- Desktop (>1024px): 3-column grid
- Tablet (768px-1024px): 2-column grid  
- Mobile (<768px): 1-column stacked layout
- Controls stack vertically on mobile

### Performance
- Memoized filtering and sorting for optimal performance
- Loading states with skeleton cards
- Empty state messaging when no results found
- Lightweight bundle with minimal dependencies

## Security Features
- **Password Security**: All passwords are hashed using bcrypt (10 salt rounds) before storage
- **Role-Based Access**: Admin privileges verified from user `isAdmin` field in data.json
- **Session Security**: HttpOnly cookies with SameSite=strict protection
- **Environment Security**: Production deployment requires SESSION_SECRET environment variable
- **Data Persistence**: All data stored in JSON file with automatic save on every modification

**Production Deployment Considerations**:

For production environments, consider these enhancements:

1. **Session Store**: For high-traffic production, replace in-memory session store with:
   - Redis-based session store for distributed systems
   - File-based session store for single-server deployments
   - Current development setup uses memory store

2. **CSRF Protection**: For enhanced security, implement CSRF token validation:
   - Add CSRF token middleware (e.g., `csurf` package)
   - Update admin forms to include CSRF tokens
   - Validate tokens on all state-changing requests

3. **Security Best Practices**:
   - Use a strong, randomly generated SESSION_SECRET (automatically enforced)
   - Enable HTTPS/TLS in production (secure cookies already configured)
   - Regular security audits and dependency updates
   - Consider rate limiting on authentication endpoints
   - Implement file-level backups for data.json

## Recent Updates (October 2025)
- ✅ Migrated from PostgreSQL to JSON file-based storage (data.json)
- ✅ Implemented favorites/bookmarking feature with localStorage
- ✅ Added tool detail pages with screenshots, usage guides, and related tools
- ✅ Built admin panel with session-based authentication
- ✅ Added analytics tracking for tool clicks
- ✅ Implemented pagination for scalability to 50+ tools
- ✅ Implemented secure password hashing with bcrypt
- ✅ Added role-based access control for admin operations
