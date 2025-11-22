# Anime Tracker

## Overview

Anime Tracker is a community-driven platform where users can track their anime watching journey, share timeline-based reviews, and discover what others are watching. The application features a moderation system where admins approve user submissions before they appear in the public feed.

**Core Purpose**: Enable anime enthusiasts to document their viewing experience through start/update/complete entries while maintaining content quality through admin moderation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Type
**Full-stack monorepo** with React frontend and Express backend, deployed as separate services:
- Frontend: Vercel (static hosting)
- Backend: Render (Node.js service)
- Database: MongoDB Atlas (cloud-hosted)

### Frontend Architecture

**Framework & Routing**:
- React 18 with TypeScript for type safety
- Wouter for lightweight client-side routing (alternative to React Router)
- Vite as build tool and development server

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Context API for authentication state (AuthContext) and theme state (ThemeProvider)
- No Redux or external state management libraries

**UI Component Strategy**:
- Shadcn UI component library (Radix UI primitives + Tailwind CSS)
- Design system inspired by MyAnimeList (content density) + Discord (community feel) + Linear (clean hierarchy)
- Custom typography using Inter (UI text), Poppins (headers), and JetBrains Mono (timestamps)

**Form Handling**:
- React Hook Form for form state management
- Zod for schema validation (shared between frontend and backend)
- @hookform/resolvers for Zod integration

**Styling**:
- Tailwind CSS with custom configuration
- Dark mode support via CSS variables and class-based theming
- Custom spacing system using Tailwind primitives (2, 4, 8, 12, 16)

### Backend Architecture

**Framework**: Express.js with TypeScript, running on Node.js

**Database Layer**:
- MongoDB with Mongoose ODM for data modeling
- Connection management in `server/config/database.ts`
- Models: User, AnimeGroup (contains timeline entries)

**Authentication & Authorization**:
- JWT-based authentication with bcryptjs for password hashing
- Token stored in localStorage on client, sent via Authorization header
- Middleware: `authenticate` (verifies JWT), `requireAdmin` (role check)
- JWT_SECRET environment variable for token signing

**API Structure**:
- RESTful endpoints organized by domain:
  - `/api/auth` - Registration and login
  - `/api/anime` - User anime tracking (my-anime, feed)
  - `/api/users` - Profile management (profile links)
  - `/api/admin` - Admin operations (stats, approve/reject entries)

**CORS Configuration**:
- Development: Allow all origins with credentials
- Production: Whitelist-based using FRONTEND_URL environment variable
- Supports multiple frontend URLs (comma-separated)

### Data Model

**Users**:
- Basic fields: username, email, password (hashed), role (admin/normal)
- Profile links: Arrays of anime/manga site links (name, url pairs)
- No complex relationships; users referenced by ID in AnimeGroup

**AnimeGroup** (timeline container):
- One group per user per anime
- Fields: animeName, genre, totalEpisodes, links (external anime resources)
- Embedded entries array (timeline of start/update/complete)
- Owner: userId reference to User model

**Entry** (embedded in AnimeGroup):
- Type: "start" | "update" | "complete"
- Fields: thoughts (review text), date, optional startTime/endTime
- Approval status: adminApproved boolean (defaults to false)
- Entries are NOT separate documents; they're embedded in AnimeGroup

**Content Moderation Flow**:
1. User creates entry → adminApproved = false
2. Entry appears in admin panel pending list
3. Admin approves → adminApproved = true → shows in public feed
4. Admin rejects → entry deleted from group

### Deployment Strategy

**Infrastructure as Code**: Configured for Vercel (frontend) + Render (backend)

**Environment Variables**:
- Backend (Render):
  - `MONGODB_URI` - MongoDB Atlas connection string
  - `JWT_SECRET` - Token signing secret (generate with openssl)
  - `NODE_ENV` - production
  - `FRONTEND_URL` - Vercel URL for CORS whitelist

- Frontend (Vercel):
  - `VITE_API_URL` - Backend API URL (Render service URL)

**Build Process**:
- Frontend: `npm run build` → outputs to `dist/public`
- Backend: `npm run build` → bundles with esbuild to `dist/index.js`
- Production start: `npm start` (runs bundled backend, serves static frontend)

**Database Schema Management**:
- Drizzle Kit configured (`drizzle.config.ts`) but NOT currently used
- Note: Application uses Mongoose/MongoDB, not PostgreSQL
- Drizzle configuration may be vestigial or for future migration

### Key Architectural Decisions

**Monorepo Structure**:
- **Rationale**: Share TypeScript types (Zod schemas) between frontend/backend
- **Implementation**: Shared schemas in `/shared` directory, imported via path aliases
- **Trade-off**: Single repository but separate deployment pipelines

**Embedded Timeline Entries**:
- **Rationale**: Entries always belong to one AnimeGroup, never queried independently
- **Alternative considered**: Separate Entry collection with references
- **Pros**: Atomic updates, simpler queries, natural document structure
- **Cons**: Cannot query all entries across all groups efficiently

**JWT in localStorage**:
- **Rationale**: Simple authentication for SPA, no server-side session management
- **Security consideration**: Vulnerable to XSS; mitigated by Content Security Policy and secure coding practices
- **Alternative considered**: HttpOnly cookies (requires same-domain or complex CORS setup with Vercel/Render)

**Admin Approval System**:
- **Rationale**: Maintain content quality in public feed
- **Implementation**: Boolean flag on each entry, filtered in feed queries
- **Trade-off**: Extra admin work but prevents spam/low-quality content

**Wouter over React Router**:
- **Rationale**: Smaller bundle size, simpler API for basic routing needs
- **Limitation**: No nested routes or complex route matching (not needed for this app)

## External Dependencies

### Third-Party Services

**MongoDB Atlas**:
- Cloud-hosted MongoDB database
- Connection string format: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>`
- Configuration: Whitelist IP 0.0.0.0/0 for Render access
- Used for: All persistent data (users, anime groups, entries)

**Render** (Backend Hosting):
- Platform: Node.js runtime
- Build command: `npm install`
- Start command: `npm run start:prod`
- Region: Configurable (choose closest to users)
- Free tier available

**Vercel** (Frontend Hosting):
- Framework: Auto-detected as Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: VITE_API_URL
- Automatic deployments from GitHub

### NPM Packages

**Core Framework**:
- `express` - Web server framework
- `react` (v18) - UI library
- `vite` - Build tool and dev server
- `typescript` - Type system

**Database & ODM**:
- `mongoose` - MongoDB object modeling
- `@neondatabase/serverless` - Present but not actively used (PostgreSQL client)

**Authentication**:
- `jsonwebtoken` - JWT creation and verification
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing

**UI Components**:
- `@radix-ui/*` - Accessible UI primitives (17+ packages)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `clsx` + `tailwind-merge` - Conditional class merging

**Forms & Validation**:
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Integration bridge

**Data Fetching**:
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client with interceptors

**Routing**:
- `wouter` - Minimal routing library (~1.5KB)

**Date Handling**:
- `date-fns` - Date formatting and manipulation

**Development Tools**:
- `@replit/vite-plugin-*` - Replit-specific development enhancements (runtime errors, cartographer, dev banner)
- `esbuild` - Backend bundler for production builds
- `drizzle-kit` - Database migration tool (configured but not in active use)