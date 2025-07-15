# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoorToMath is a Korean educational platform for mathematics education built with Next.js 15. The project serves "대치 수학의문" (Daechi Math Questions) academy with multi-role user management (admin, instructor, student).

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Authentication & Authorization
- **Supabase Auth**: User authentication with role-based access control
- **Middleware**: Route protection based on user roles (admin, instructor, student)
- **Role System**: Three distinct user types with different dashboard access levels
- **Session Management**: Server-side session handling with cookies

### Database Integration
- **Supabase**: PostgreSQL database with migrations in `supabase/migrations/`
- **Client Pattern**: Separate browser and server clients (`supabaseClientBrowser.js`, `supabaseClientServer.js`)
- **Data Fetching**: Utility functions for courses, schedules, and content management

### Routing Structure
- **Public Routes**: Home, about, courses, blog, contact
- **Protected Routes**: Role-based dashboard access
  - `/dashboard/student` - Student dashboard
  - `/dashboard/instructor` - Instructor dashboard  
  - `/dashboard2/admin` - Admin dashboard (newer version)
- **Authentication Routes**: Sign in/up, password reset, email verification

### Component Architecture
- **Layout System**: Centralized layout with HeaderThree and FooterThree
- **UI Components**: Combination of Radix UI primitives and custom components
- **Styling**: Tailwind CSS with custom theme + Bootstrap 5 for legacy components
- **State Management**: React hooks with Supabase real-time subscriptions

### Content Management
- **Dynamic Content**: Main page content stored in Supabase `main_page_content` table
- **Blog System**: TipTap rich text editor for content creation
- **Course Management**: Admin interface for course creation and management
- **File Uploads**: Image and document management through Supabase Storage

## Key Patterns

### Supabase Client Usage
```javascript
// Browser client (client components)
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';

// Server client (server components)
import { createServerClient } from '@supabase/ssr';
```

### Role-Based Access Control
- Middleware checks user roles and redirects appropriately
- Role verification in both middleware and component level
- Default role is 'student' when no role is specified

### Content Loading Pattern
- Server components fetch data directly from Supabase
- Fallback to default content when database content is unavailable
- Logging with custom logger utility for debugging

### Dashboard Layout
- Shared dashboard layout with role-based sidebar navigation
- Modern admin dashboard uses shadcn/ui components
- Dashboard page design uses only shadcn/ui

## Important File Locations

### Configuration
- `next.config.mjs` - Next.js configuration with standalone output
- `tailwind.config.js` - Tailwind CSS with custom theme variables
- `middleware.js` - Route protection and role-based access control
- `components.json` - shadcn/ui component configuration

### Authentication
- `src/lib/auth/` - Authentication utilities and helpers
- `src/hooks/useAuth.js` - Custom authentication hook
- `src/app/auth/` - Authentication pages and API routes

### Database
- `src/lib/supabase/` - Supabase client configuration and utilities
- `supabase/migrations/` - Database migrations
- `scripts/` - Database utility scripts

### Styling
- `src/styles/globals.css` - Global styles and CSS variables
- `src/assets/css/` - Legacy CSS files (Bootstrap, animations)
- `src/components/ui/` - Reusable UI components

## Development Notes

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Additional Supabase service keys for server-side operations

### Build Configuration
- ESLint and TypeScript errors are ignored during builds
- React Strict Mode is disabled
- Standalone output for deployment

### Content Management
- Main page content is editable through admin dashboard
- Content falls back to hardcoded defaults if database is unavailable
- Real-time updates through Supabase subscriptions

### Multi-language Support
- Primary language is Korean
- UI text is hardcoded in Korean with some English fallbacks
- No internationalization framework currently implemented