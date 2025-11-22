# Design Guidelines: Anime Tracking Community Platform

## Design Approach: Hybrid System

**Primary Inspiration**: Combination of **MyAnimeList's content density** + **Discord's community feel** + **Linear's clean information hierarchy**

**Rationale**: This is a social utility application requiring both community engagement and efficient data display. The timeline-based entry system needs clear visual hierarchy while maintaining an approachable, anime-enthusiast-friendly aesthetic.

---

## Typography

**Font Families** (via Google Fonts):
- **Primary**: 'Inter' - Clean, modern sans-serif for all UI text
- **Accent**: 'Poppins' - Slightly rounded headers for friendly feel
- **Monospace**: 'JetBrains Mono' - Timestamps and metadata

**Hierarchy**:
- Page Headers: Poppins Bold, 2xl-3xl
- Section Titles: Poppins Semibold, xl-2xl
- Card Headers: Inter Semibold, base-lg
- Body Text: Inter Regular, sm-base
- Metadata/Timestamps: JetBrains Mono Regular, xs-sm
- Buttons: Inter Medium, sm-base

---

## Layout System

**Spacing Units**: Tailwind primitives of **2, 4, 8, 12, 16**
- Tight spacing: p-2, gap-2 (form fields, small cards)
- Standard spacing: p-4, gap-4 (card padding, section gaps)
- Generous spacing: p-8, gap-8 (page sections, major divisions)
- Extra spacing: p-12, gap-12 (hero sections, feature blocks)

**Container Strategy**:
- Max width: max-w-7xl for main content
- Full-width sections: Public feed, admin tables
- Centered narrow: max-w-2xl for forms (login, register)
- Profile sections: max-w-4xl

---

## Core Components

### 1. Navigation Bar
- Fixed top navigation with blur backdrop
- Left: Logo/brand with anime aesthetic icon
- Center: Main navigation links (Feed, My Profile, Dashboard)
- Right: User avatar dropdown + notifications bell
- Admin users see additional "Admin Panel" link with badge
- Height: h-16, backdrop-blur-md

### 2. Authentication Pages (Login/Register)
- Centered card layout: max-w-md
- Clean form with floating labels
- Social proof text: "Join 1,000+ anime enthusiasts"
- Minimal background pattern (subtle anime motifs)
- Clear error states inline with fields
- No hero image - focus on conversion

### 3. Dashboard (User Home)
- Two-column layout on desktop
- Left sidebar (w-64): Quick stats, profile completion, recent activity
- Main content: Tabbed interface (Currently Watching, Completed, All)
- Top section: Quick action button "Start New Anime"
- Grid cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### 4. Public Feed
- Masonry-style timeline layout
- Each entry card shows:
  - User avatar + username (top left)
  - Anime title (bold, prominent)
  - Entry type badge (Start/Update/Complete) with icons
  - Thought excerpt (truncated at 150 chars)
  - Timestamp + episode count
  - Anime links as chips
  - Admin approval status (subtle badge)
- Infinite scroll implementation
- Filter sidebar (genre, status, user)

### 5. Anime Group Thread
- Hero section: Anime title + genre tags + total episodes
- Timeline view (vertical, left-aligned timestamps)
- Each entry expandable card:
  - Entry type icon + badge
  - Full thoughts content
  - Timestamp (start time or end time when applicable)
  - Edit button (only for entry owner)
  - Approval status indicator
- Sticky sidebar: Anime links section, user profile links
- Bottom action bar: Add Update/Complete buttons (owner only)

### 6. User Profile Page
- Profile header: Avatar, username, bio, anime/manga site links as badges
- Two-section tabs:
  - **Watching**: Grid of anime cards with progress indicators
  - **Completed**: Grid with completion dates and ratings
- Each card: Cover placeholder, title, episode count, latest entry preview
- Click card → opens anime group thread

### 7. Admin Panel
- Dashboard layout with stats cards at top:
  - Total users, pending entries, total anime groups, completion rate
- Main table: Pending entries list
  - Columns: User, Anime, Entry Type, Date, Preview, Actions
  - Actions: Approve (green) / Reject (red) buttons
  - Inline preview of thoughts (expandable)
- Secondary tabs: All Users, All Anime Groups, Statistics
- No editing capabilities - view and approve only

---

## Component Library

### Cards
- Elevated with subtle shadow: shadow-sm hover:shadow-md
- Rounded corners: rounded-lg
- Standard padding: p-4 or p-6
- Border treatment: border with subtle opacity

### Buttons
- Primary: Solid background, rounded-md, px-4 py-2
- Secondary: Outlined, transparent background
- Danger: For reject/delete actions
- Success: For approve/complete actions
- Icon buttons: Circular for actions (edit, delete)

### Badges
- Pill-shaped: rounded-full px-3 py-1
- Entry type badges: Color-coded (Start=blue, Update=yellow, Complete=green)
- Admin badge: Distinct accent for admin users
- Status badges: Pending/Approved visual distinction

### Forms
- Floating label pattern
- Clear focus states with ring
- Inline validation messages
- Helper text below fields
- Textarea auto-expand for thoughts

### Links Section
- Display as chip grid: flex flex-wrap gap-2
- Each link: Icon + label, clickable, external link indicator
- Add link: Plus button with modal popup
- Edit mode: Inline editing with save/cancel

### Timeline
- Vertical line connecting entries
- Entry nodes with icons
- Alternating left alignment for visual interest
- Timestamps in monospace font, right-aligned

---

## Icons

**Library**: Heroicons (via CDN)
- Navigation: Home, User, Cog, Bell
- Entry types: Play (start), Pencil (update), CheckCircle (complete)
- Actions: Plus, Trash, Pencil, Eye, ExternalLink
- Status: Clock (pending), CheckBadge (approved), XCircle (rejected)

---

## Animations

**Minimal, purposeful only**:
- Card hover: Subtle lift (transform translateY(-2px))
- Button hover: Slight scale (scale-105)
- Page transitions: Fade in/out
- Dropdown menus: Slide down with fade
- Modal overlays: Backdrop blur with fade
- No scroll-triggered animations
- No auto-playing carousels

---

## Images

**Hero Images**: None - This is a utility-focused app
**User Content**: Anime cover placeholders (use solid gradients with anime title initials)
**Profile Avatars**: Circular, default avatar for users without uploads
**Admin Panel**: Icon-based, no decorative images

**Image Placement**:
- User avatars: 40x40 in feed, 80x80 in profile header
- Anime cards: 16:9 aspect ratio placeholders, gradient backgrounds

---

## Responsive Behavior

- Mobile: Single column, collapsible sidebar, bottom nav
- Tablet: Two-column where appropriate, side navigation
- Desktop: Full multi-column layouts, persistent sidebars

**Breakpoints**: sm, md, lg, xl (standard Tailwind)