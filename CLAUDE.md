# Project Rules — AI Kurukshetra Hackathon
# Product: CalSync — A Calendly Alternative
# Appointment booking system for service businesses with reminders

## Stack (Non-Negotiable)
- **Framework**: Next.js 14+ (App Router ONLY, NO Pages Router)
- **Database/Auth/Storage**: Supabase
- **Styling**: Tailwind CSS (latest)
- **Deployment**: Vercel
- **Language**: TypeScript (strict mode)
- **Drag/Drop or Calendar UI**: react-big-calendar or @fullcalendar/react (pick one)

## Product Definition
CalSync is a Calendly alternative — an appointment booking system where:
- **Hosts** set their availability and create event types
- **Guests** book appointments via a public shareable link (no login required)
- **Dashboard** shows upcoming bookings, past bookings, and analytics

## Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # Overview with upcoming bookings
│   │   ├── event-types/page.tsx        # Manage event types
│   │   ├── event-types/new/page.tsx    # Create new event type
│   │   ├── availability/page.tsx       # Set weekly availability
│   │   ├── bookings/page.tsx           # All bookings list
│   │   └── settings/page.tsx           # Profile settings
│   ├── book/
│   │   └── [username]/
│   │       ├── page.tsx                # Public profile — list of event types
│   │       └── [eventSlug]/page.tsx    # Public booking page — pick date/time
│   ├── confirmation/page.tsx           # Booking confirmation page
│   ├── api/                            # API routes if needed
│   ├── layout.tsx
│   └── page.tsx                        # Landing page (marketing)
├── components/
│   ├── ui/                             # Button, Input, Card, Modal, Badge, etc.
│   ├── booking/                        # DatePicker, TimeSlotGrid, BookingForm
│   ├── dashboard/                      # StatsCards, BookingsList, CalendarView
│   └── layout/                         # Navbar, Sidebar, Footer
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── middleware.ts
│   └── utils.ts                        # Date/time helpers, slug generator
├── types/
│   └── index.ts                        # All TypeScript interfaces
└── scripts/
    └── seed.ts                         # Seed data script
```

## Database Schema (Supabase Tables)

### profiles
- id (uuid, FK to auth.users)
- full_name (text)
- username (text, UNIQUE) — used for public booking URL
- email (text)
- bio (text, nullable)
- avatar_url (text, nullable)
- timezone (text, default 'Asia/Kolkata')
- created_at (timestamptz)

### event_types
- id (uuid, PK)
- user_id (uuid, FK to profiles.id)
- title (text) — e.g., "30 Min Meeting", "Quick Call"
- slug (text) — URL-friendly version of title
- description (text, nullable)
- duration_minutes (int) — 15, 30, 45, 60
- location_type (text) — 'google_meet', 'zoom', 'phone', 'in_person'
- color (text) — hex color for UI display
- is_active (boolean, default true)
- created_at (timestamptz)
- UNIQUE(user_id, slug)

### availability
- id (uuid, PK)
- user_id (uuid, FK to profiles.id)
- day_of_week (int) — 0=Sunday, 1=Monday ... 6=Saturday
- start_time (time) — e.g., '09:00' (in host's local timezone)
- end_time (time) — e.g., '17:00' (in host's local timezone)
- is_available (boolean, default true)
- timezone (text) — host's timezone e.g., 'Asia/Kolkata'

### bookings
- id (uuid, PK)
- event_type_id (uuid, FK to event_types.id)
- host_id (uuid, FK to profiles.id)
- guest_name (text)
- guest_email (text)
- start_time (timestamptz) — booking start in UTC
- end_time (timestamptz) — booking end in UTC
- status (text) — 'confirmed', 'cancelled', 'completed'
- guest_timezone (text) — guest's detected timezone
- notes (text, nullable)
- created_at (timestamptz)

## Core Features (MVP — Build These Only)

### 1. Authentication
- Email/password signup & login
- Auto-create profile with username on signup
- Protected dashboard routes via middleware

### 2. Event Types Management
- Create event types (title, duration, location type, color)
- Edit / delete / toggle active
- Auto-generate slug from title
- Show list as cards with color indicator

### 3. Availability Settings
- Weekly schedule grid (Mon-Sun)
- Set start_time and end_time per day
- Toggle days on/off
- Default: Mon-Fri, 9 AM - 5 PM

### 4. Public Booking Page (NO AUTH REQUIRED)
- URL pattern: /book/[username]
- Shows host's active event types as cards
- Click event type → date picker → available time slots → booking form
- Time slots auto-calculated from availability minus existing bookings
- Guest enters: name, email, optional notes
- Confirmation page after booking

### 5. Dashboard
- Stats cards: Total bookings, Upcoming, Today's, Completed
- Upcoming bookings list with guest info
- Quick actions: copy booking link, cancel booking
- Calendar view of bookings (optional if time permits)

### 6. Bookings Management
- List all bookings with filters (upcoming, past, cancelled)
- Cancel booking functionality
- View booking details

## DO NOT BUILD (Skip These)
- ❌ Google Calendar / Outlook integration
- ❌ Email notifications / reminders (just show UI placeholder)
- ❌ Zoom/Google Meet auto-link generation
- ❌ Team/organization features
- ❌ Payment collection
- ❌ Custom branding per user
- ❌ Recurring events
- ❌ Buffer time between meetings
- ❌ Webhook integrations

## Supabase Rules
- Use `@supabase/ssr` package (NOT deprecated `@supabase/auth-helpers-nextjs`)
- Browser client: `createBrowserClient()` for client components
- Server client: `createServerClient()` for server components & API routes
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Enable Row Level Security (RLS) on ALL tables
- RLS policies:
  - profiles: users can read all, update own
  - event_types: users CRUD own, public can read active ones
  - availability: users CRUD own
  - bookings: hosts see own bookings, public can INSERT (for booking)
- Use Supabase Auth trigger to auto-create profile on signup

## Database Migrations (Supabase CLI)
- Supabase CLI installed as dev dependency (`supabase`)
- Migrations live in `supabase/migrations/` with timestamp prefixes
- **Apply migrations**: `npm run db:push` (runs `npx supabase db push`)
- **Reset database**: `npm run db:reset` (runs `npx supabase db reset`)
- **Seed data**: `npm run seed` (runs `npx tsx scripts/seed.ts`)
- Before running `db:push`, link your project: `npx supabase link --project-ref <your-project-ref>`
- Workflow: create migration file → `npm run db:push` → `npm run seed`
- New migrations: `npx supabase migration new <name>` creates a timestamped file

## Seed Data (MANDATORY)
The seed script MUST create:
- 3 demo users with profiles and usernames
- 2-3 event types per user (variety of durations and colors)
- Weekly availability for each user (Mon-Fri, 9-5)
- 15-20 bookings spread across upcoming and past dates
- Mix of confirmed, completed, and cancelled statuses
- Use realistic names and emails

Seed script uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS.

### Package.json Scripts
```json
"db:push": "npx supabase db push",
"db:reset": "npx supabase db reset",
"seed": "npx tsx scripts/seed.ts"
```

## UI/UX Requirements
- Clean, modern, professional UI (think Calendly's simplicity)
- Color palette: Use a primary blue/purple with clean whites and grays
- Responsive: must work on mobile (especially the public booking page)
- Loading states with skeletons/spinners
- Toast notifications for actions (booking created, event saved, etc.)
- The public booking page must feel polished — this is the demo showpiece
- Use cards, badges, and clean typography
- Smooth transitions between booking steps

## Time Slot Logic & Timezone Handling
- Store ALL times as `timestamptz` (UTC) in Supabase
- Display times using `toLocaleTimeString()` — browser auto-converts to user's local timezone
- Detect user's timezone with `Intl.DateTimeFormat().resolvedOptions().timeZone` and show label on booking page
- Create a shared helper function `formatTime(utcDate: string)` that uses toLocaleTimeString with hour/minute format
- Host sets availability in THEIR local timezone → convert to UTC before storing
- When generating time slots: work in UTC internally, display in local timezone
- Generate slots based on event duration and host availability
- Exclude already-booked slots for the selected date
- Slots in increments matching duration (e.g., 30-min event = 9:00, 9:30, 10:00...)
- Last slot must END before availability end_time
- On public booking page show: "Times shown in [detected timezone]"

## Coding Standards
- Server Components by default; "use client" only when needed
- Proper TypeScript types everywhere — no `any`
- Handle loading with loading.tsx
- Handle errors with error.tsx
- Use Server Actions for mutations where possible
- All dates/times stored as `timestamptz` (UTC) in Supabase — display using toLocaleTimeString() for auto timezone adaptation

## Landing Page
- Hero section: "Schedule meetings without the back-and-forth"
- Features section (3-4 cards)
- How it works (3 steps)
- CTA: Sign up free
- Clean, marketing-style page

## Deployment Checklist
- `npm run build` passes with zero errors
- All env vars configured in Vercel
- No console errors in production
- Public booking page works without authentication
- Seed data visible in dashboard
- Mobile responsive
