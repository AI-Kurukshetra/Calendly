# Calslot — Architecture Plan

## Product Overview
Calslot is a Calendly alternative — an appointment booking system where hosts set their availability, create event types, and guests book meetings via a public shareable link (no login required).

---

## System Architecture

```
+--------------------------------------------------+
|                   FRONTEND                        |
|               (Next.js 14 App Router)             |
|                                                   |
|  +-------------+  +-------------+  +----------+  |
|  |   Public     |  | Dashboard   |  |  Auth    |  |
|  |   Pages      |  | (Protected) |  |  Pages   |  |
|  |              |  |             |  |          |  |
|  | /            |  | /dashboard  |  | /login   |  |
|  | /book/[user] |  | /event-types|  | /signup  |  |
|  | /book/[]/[]  |  | /availability|  |          |  |
|  | /confirmation|  | /bookings   |  |          |  |
|  +------+-------+  | /settings   |  +----+-----+  |
|         |          +------+------+       |        |
+---------+--+---------------+-------+-----+--------+
             |               |       |
             v               v       v
+--------------------------------------------------+
|              MIDDLEWARE LAYER                      |
|          (src/middleware.ts)                       |
|                                                   |
|  - Session refresh via updateSession()            |
|  - Route protection: /dashboard/* -> /login       |
|  - Auth redirect: /login,/signup -> /dashboard    |
+--------------------------------------------------+
             |
             v
+--------------------------------------------------+
|             SUPABASE BACKEND                      |
|                                                   |
|  +----------------+   +----------------------+   |
|  |  Auth Service   |   |   PostgreSQL DB      |   |
|  |                 |   |                      |   |
|  | - Email/Pass    |   | - profiles           |   |
|  | - Session mgmt  |   | - event_types        |   |
|  | - JWT tokens    |   | - availability        |   |
|  |                 |   | - bookings            |   |
|  +--------+--------+   +----------+-----------+   |
|           |                       |               |
|           v                       v               |
|  +------------------------------------------+    |
|  |      Row Level Security (RLS)             |    |
|  |                                           |    |
|  |  Enforces access control at DB level      |    |
|  |  - Public read for profiles/availability  |    |
|  |  - Auth-only CRUD for own resources       |    |
|  |  - Anon INSERT for guest bookings         |    |
|  +------------------------------------------+    |
+--------------------------------------------------+
```

---

## Database Schema

```
┌─────────────────────────┐       ┌──────────────────────────────┐
│       auth.users         │       │          profiles             │
│  (Supabase managed)      │       │                              │
├─────────────────────────┤       ├──────────────────────────────┤
│ id (uuid) PK             │──────>│ id (uuid) PK, FK auth.users  │
│ email                    │       │ full_name (text)              │
│ raw_user_meta_data       │       │ username (text) UNIQUE        │
│ ...                      │       │ email (text)                  │
└─────────────────────────┘       │ bio (text, nullable)          │
        │                          │ avatar_url (text, nullable)   │
        │ trigger:                 │ timezone (text) = 'Asia/      │
        │ on_auth_user_created     │                   Kolkata'    │
        │ => handle_new_user()     │ created_at (timestamptz)      │
        └──────────────────────────┤                              │
                                   └──────┬───────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    v                     v                     v
┌────────────────────────┐ ┌────────────────────┐ ┌──────────────────────┐
│     event_types         │ │   availability      │ │      bookings         │
├────────────────────────┤ ├────────────────────┤ ├──────────────────────┤
│ id (uuid) PK            │ │ id (uuid) PK        │ │ id (uuid) PK          │
│ user_id (uuid) FK ──────│ │ user_id (uuid) FK───│ │ event_type_id (uuid)  │
│ title (text)            │ │ day_of_week (int)   │ │   FK event_types ─────│
│ slug (text)             │ │   0=Sun ... 6=Sat   │ │ host_id (uuid)        │
│ description (text?)     │ │ start_time (time)   │ │   FK profiles ────────│
│ duration_minutes (int)  │ │ end_time (time)     │ │ guest_name (text)     │
│   CHECK(15,30,45,60)   │ │ is_available (bool) │ │ guest_email (text)    │
│ location_type (text)    │ │                     │ │ booking_date (date)   │
│   CHECK(google_meet,   │ │ UNIQUE(user_id,     │ │ start_time(timestamptz│
│   zoom,phone,in_person)│ │   day_of_week)      │ │ end_time (timestamptz)│
│ color (text) = '#6366f1'│ │                     │ │ status (text)         │
│ is_active (bool) = true │ └────────────────────┘ │   CHECK(confirmed,    │
│ created_at (timestamptz)│                        │   cancelled,completed)│
│                         │                        │ notes (text?)         │
│ UNIQUE(user_id, slug)   │                        │ created_at(timestamptz│
└────────────────────────┘                        └──────────────────────┘
```

### Relationships
- `profiles.id` -> `auth.users.id` (1:1, cascade delete)
- `event_types.user_id` -> `profiles.id` (many:1, cascade delete)
- `availability.user_id` -> `profiles.id` (many:1, cascade delete)
- `bookings.event_type_id` -> `event_types.id` (many:1, cascade delete)
- `bookings.host_id` -> `profiles.id` (many:1, cascade delete)

---

## RLS (Row Level Security) Policy Map

```
┌─────────────┬───────────┬─────────────────────────────────────────────┐
│ Table       │ Operation │ Policy                                      │
├─────────────┼───────────┼─────────────────────────────────────────────┤
│ profiles    │ SELECT    │ Everyone (public booking needs profile data)│
│             │ UPDATE    │ Own only (auth.uid() = id)                  │
├─────────────┼───────────┼─────────────────────────────────────────────┤
│ event_types │ SELECT    │ Active by everyone OR own (incl. inactive)  │
│             │ INSERT    │ Own only (auth.uid() = user_id)             │
│             │ UPDATE    │ Own only                                    │
│             │ DELETE    │ Own only                                    │
├─────────────┼───────────┼─────────────────────────────────────────────┤
│ availability│ SELECT    │ Everyone (guests need to see host hours)    │
│             │ INSERT    │ Own only                                    │
│             │ UPDATE    │ Own only                                    │
│             │ DELETE    │ Own only                                    │
├─────────────┼───────────┼─────────────────────────────────────────────┤
│ bookings    │ SELECT    │ Host only (auth.uid() = host_id)            │
│             │ INSERT    │ anon + authenticated (guests book w/o login)│
│             │ UPDATE    │ Host only (for cancellation)                │
└─────────────┴───────────┴─────────────────────────────────────────────┘
```

---

## Route Map & Component Tree

```
/ (Landing Page - Server Component)
├── Layout: RootLayout (Inter font, Toaster)
│
├── /(auth)/ (Auth Layout - centered, Calslot branding)
│   ├── /login .......... LoginPage (Client) -> loginAction
│   └── /signup ......... SignupPage (Client) -> signupAction
│
├── /(dashboard)/ (Dashboard Layout - Sidebar + main area)
│   │   Layout fetches user session + profile
│   │
│   ├── /dashboard ...... DashboardPage (Server)
│   │   ├── StatsCards (Server) - 4 metric cards
│   │   ├── UpcomingBookingsList (Client) - cancel, copy link
│   │   └── CalendarView (Client) - react-big-calendar
│   │
│   ├── /event-types .... EventTypesPage (Server)
│   │   ├── EventTypeCard (Client) - toggle, edit, delete
│   │   └── /new ........ NewEventTypePage (Client) - create form
│   │
│   ├── /availability ... AvailabilityPage (Server)
│   │   └── AvailabilityGrid (Client) - 7-day grid, toggles
│   │
│   ├── /bookings ....... BookingsPage (Server)
│   │   ├── BookingsFilter (Client) - Tabs: upcoming/past/cancelled
│   │   └── BookingRow (Client) - cancel dialog
│   │
│   └── /settings ....... SettingsPage (Client) - profile form
│
├── /book/
│   ├── /[username] ..... HostProfilePage (Server)
│   │   └── EventTypePublicCard -> links to booking page
│   │
│   └── /[username]/[eventSlug] ... BookingSlugPage (Server)
│       └── BookingFlow (Client) - 3-step state machine
│           ├── Step 1: DatePicker (shadcn Calendar)
│           ├── Step 2: TimeSlotGrid (available slots)
│           └── Step 3: BookingForm (guest details)
│
├── /confirmation ....... ConfirmationPage (Server)
│   └── Fetches via /api/bookings/[id] (service role)
│
└── /api/
    └── /bookings/[id] .. GET route (service role, for confirmation)
```

---

## Timezone Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    TIMEZONE FLOW                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  HOST (IST - Asia/Kolkata)                               │
│  Sets availability: Mon-Fri, 9:00 AM - 5:00 PM          │
│  Stored in DB as: time '09:00' - '17:00'                 │
│  Host timezone stored in: profiles.timezone              │
│                                                          │
│                    ┌─────────────┐                       │
│                    │  Time Slot   │                       │
│                    │  Generator   │                       │
│                    └──────┬──────┘                       │
│                           │                              │
│  1. Read host availability (09:00-17:00 in host TZ)      │
│  2. Generate slots: 09:00, 09:30, 10:00 ... (host TZ)   │
│  3. Convert to UTC for comparison with existing bookings │
│  4. Filter out booked slots                              │
│  5. Return UTC timestamps                                │
│                           │                              │
│                    ┌──────v──────┐                       │
│                    │   Browser    │                       │
│                    │   Display    │                       │
│                    └──────┬──────┘                       │
│                           │                              │
│  Guest in NYC (EST):      │                              │
│  toLocaleTimeString() --> "10:30 PM" (auto-converted)    │
│                                                          │
│  Guest in London (GMT):                                  │
│  toLocaleTimeString() --> "3:30 AM" (auto-converted)     │
│                                                          │
│  Guest in India (IST):                                   │
│  toLocaleTimeString() --> "9:00 AM" (same as host)       │
│                                                          │
│  Label shown: "Times shown in {detected timezone}"       │
│  Detection: Intl.DateTimeFormat().resolvedOptions().tz   │
│                                                          │
│  BOOKINGS stored as timestamptz (full UTC) in DB         │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow: Public Booking

```
Guest visits /book/priya-sharma
        │
        v
┌─────────────────────────────┐
│  Server: Fetch profile       │
│  WHERE username = 'priya-   │
│  sharma'                     │
│  + active event_types        │
└──────────────┬──────────────┘
               │
        Guest clicks "30 Min Consultation"
               │
               v
┌─────────────────────────────┐
│  Server: Fetch event_type    │
│  + host availability         │
│  Pass to BookingFlow client  │
└──────────────┬──────────────┘
               │
        Step 1: Guest picks a date (Feb 20)
               │
               v
┌─────────────────────────────┐
│  Client: Check day_of_week   │
│  Feb 20 = Thursday (4)       │
│  Host available? YES         │
│  Fetch existing bookings for │
│  that date from Supabase     │
│  Generate time slots:        │
│  09:00-17:00, 30-min gaps    │
│  Minus booked slots          │
└──────────────┬──────────────┘
               │
        Step 2: Guest picks 10:00 AM
               │
               v
┌─────────────────────────────┐
│  Client: Show booking form   │
│  Guest enters:               │
│  - Name: "John Doe"          │
│  - Email: "john@example.com" │
│  - Notes: "Discuss project"  │
└──────────────┬──────────────┘
               │
        Step 3: Guest submits
               │
               v
┌─────────────────────────────┐
│  Client: INSERT into bookings│
│  via Supabase anon client    │
│  (RLS allows anon INSERT)    │
│                              │
│  {                           │
│    event_type_id: "...",     │
│    host_id: "...",           │
│    guest_name: "John Doe",   │
│    guest_email: "john@...",  │
│    booking_date: "2026-02-20"│
│    start_time: UTC timestamp,│
│    end_time: UTC timestamp,  │
│    status: "confirmed"       │
│  }                           │
└──────────────┬──────────────┘
               │
        Redirect to /confirmation?id={uuid}
               │
               v
┌─────────────────────────────┐
│  Server: Fetch booking via   │
│  /api/bookings/[id]          │
│  (service role, bypasses RLS)│
│  Display confirmation page   │
└─────────────────────────────┘
```

---

## Tech Stack

| Layer          | Technology                          | Purpose                         |
|----------------|-------------------------------------|---------------------------------|
| Framework      | Next.js 14+ (App Router)            | SSR, routing, server components |
| Language       | TypeScript (strict)                 | Type safety                     |
| Styling        | Tailwind CSS + shadcn/ui            | Utility-first CSS + components  |
| Database       | Supabase (PostgreSQL)               | Data storage + RLS              |
| Auth           | Supabase Auth                       | Email/password authentication   |
| Supabase SDK   | @supabase/ssr + @supabase/supabase-js| Server & browser clients       |
| Calendar UI    | react-big-calendar + date-fns       | Dashboard calendar view         |
| Date Picker    | react-day-picker (via shadcn)       | Booking date selection          |
| Icons          | lucide-react                        | Icon library                    |
| Notifications  | react-hot-toast                     | Toast messages                  |
| Deployment     | Vercel                              | Hosting & CI/CD                 |

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Centered auth layout
│   │   ├── login/page.tsx          # Login form (Client)
│   │   ├── signup/page.tsx         # Signup form (Client)
│   │   └── actions.ts             # Server actions: login, signup, logout
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar layout (Server)
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Overview (Server)
│   │   │   ├── loading.tsx         # Skeleton loader
│   │   │   └── error.tsx           # Error boundary
│   │   ├── event-types/
│   │   │   ├── page.tsx            # List (Server)
│   │   │   ├── new/page.tsx        # Create form (Client)
│   │   │   ├── actions.ts          # CRUD server actions
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── availability/
│   │   │   ├── page.tsx            # Grid (Server)
│   │   │   ├── actions.ts          # Save server action
│   │   │   └── loading.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx            # List (Server)
│   │   │   ├── actions.ts          # Cancel server action
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── settings/
│   │       └── page.tsx            # Profile form (Client)
│   │
│   ├── book/
│   │   ├── [username]/
│   │   │   ├── page.tsx            # Host profile (Server)
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── [eventSlug]/
│   │   │       ├── page.tsx        # Booking flow wrapper (Server)
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │
│   ├── confirmation/
│   │   └── page.tsx                # Booking confirmed (Server)
│   │
│   ├── api/
│   │   └── bookings/
│   │       └── [id]/
│   │           └── route.ts        # GET booking (service role)
│   │
│   ├── layout.tsx                  # Root layout (Inter, Toaster)
│   ├── page.tsx                    # Landing page (Server)
│   ├── not-found.tsx               # 404 page
│   └── globals.css                 # Tailwind + shadcn CSS vars
│
├── components/
│   ├── ui/                         # shadcn/ui generated components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── calendar.tsx
│   │   ├── skeleton.tsx
│   │   └── switch.tsx
│   │
│   ├── booking/
│   │   ├── BookingFlow.tsx         # 3-step state machine (Client)
│   │   ├── DatePicker.tsx          # Calendar selection (Client)
│   │   ├── TimeSlotGrid.tsx        # Time slot buttons (Client)
│   │   └── BookingForm.tsx         # Guest details form (Client)
│   │
│   ├── dashboard/
│   │   ├── StatsCards.tsx          # 4 metric cards (Server)
│   │   ├── UpcomingBookingsList.tsx # Booking list (Client)
│   │   ├── CalendarView.tsx        # react-big-calendar (Client)
│   │   ├── EventTypeCard.tsx       # Event type card (Client)
│   │   ├── AvailabilityGrid.tsx    # 7-day grid (Client)
│   │   ├── BookingsFilter.tsx      # Tab filter (Client)
│   │   └── BookingRow.tsx          # Booking row (Client)
│   │
│   └── layout/
│       ├── Sidebar.tsx             # Dashboard nav (Client)
│       └── Navbar.tsx              # Public pages nav (Client)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # createBrowserClient()
│   │   ├── server.ts              # createServerClient() + cookies
│   │   └── middleware.ts          # updateSession() helper
│   └── utils.ts                   # cn, generateSlug, generateTimeSlots,
│                                  # formatTime, formatDate, getDayName,
│                                  # getGuestTimezone, convertToTimezone
│
├── types/
│   └── index.ts                   # All TypeScript interfaces
│
└── middleware.ts                   # Next.js root middleware

scripts/
└── seed.ts                        # Seed data script

supabase/
└── schema.sql                     # Full database schema + RLS

Calslot/
└── ARCHITECTURE.md                # This file
```

---

## Color Palette

```
Primary:     #6366f1 (Indigo 500) — buttons, links, accents
Primary Dk:  #4f46e5 (Indigo 600) — hover states
Secondary:   #f59e0b (Amber 500)  — warnings, highlights
Success:     #10b981 (Emerald 500) — confirmed status
Danger:      #ef4444 (Red 500)    — cancelled, delete
Background:  #f9fafb (Gray 50)    — page background
Surface:     #ffffff (White)       — cards, inputs
Text:        #111827 (Gray 900)   — primary text
Text Muted:  #6b7280 (Gray 500)   — secondary text
Border:      #e5e7eb (Gray 200)   — borders, dividers

Event Type Colors (preset swatches):
  #6366f1  #3b82f6  #10b981  #f59e0b
  #ef4444  #8b5cf6  #f97316  #ec4899
```

---

## Security Model

1. **Authentication**: Supabase Auth with email/password, JWT-based sessions
2. **Session Management**: Middleware refreshes tokens on every request
3. **Route Protection**: Middleware redirects unauthenticated users from /dashboard/* to /login
4. **Row Level Security**: All tables have RLS enabled — access enforced at database level
5. **Public Access**: Profiles, active event types, and availability are publicly readable (required for booking flow)
6. **Guest Booking**: Anon role can INSERT bookings (FK constraints prevent invalid data)
7. **Confirmation Page**: Uses service role via API route (UUID as unguessable token)
8. **No Service Role on Client**: Service role key only used server-side (seed script, API route)

---

## Google Calendar Integration

### Overview

Hosts can connect their Google Calendar from the Settings page. Once connected:
- New bookings automatically create Google Calendar events
- Cancelled bookings delete the calendar event
- Existing Google Calendar events block those time slots from being bookable

### Database

```
google_tokens
├── id (uuid) PK
├── user_id (uuid) FK profiles, UNIQUE
├── access_token (text)
├── refresh_token (text)
├── token_expiry (timestamptz)
└── created_at (timestamptz)

bookings (added column)
└── google_calendar_event_id (text, nullable)
```

### OAuth Flow

```
Settings Page                Google                     Callback
─────────────               ──────                     ────────
Click "Connect"
      │
      ├──> GET /api/google/connect
      │         │
      │         ├──> Build OAuth URL (calendar.events scope)
      │         └──> Redirect to Google consent screen
      │                        │
      │                  User approves
      │                        │
      │               GET /api/google/callback?code=...&state=...
      │                        │
      │                  Exchange code for tokens
      │                  Store in google_tokens (service role)
      │                        │
      │               Redirect to /settings?google=connected
      │                        │
      └──────── Toast: "Connected!" ◄──┘
```

### Busy Time Checking

```
Guest picks a date on booking page
      │
      ├──> Fetch Calslot bookings for that date (Supabase)
      │
      ├──> GET /api/google/busy-times?hostId=...&date=...
      │         │
      │         ├──> getValidAccessToken() — refresh if expired
      │         └──> Google Calendar events.list API
      │              └──> Return busy time ranges
      │
      ├──> Merge both into bookedSlots array
      │
      └──> Generate slots, excluding all busy times
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/google/connect` | GET | Redirect to Google OAuth consent |
| `/api/google/callback` | GET | Exchange code, store tokens |
| `/api/google/disconnect` | POST | Revoke token, delete from DB |
| `/api/google/busy-times` | GET | Return host's calendar busy times |
| `/api/bookings/calendar-event` | POST | Create calendar event for booking |

### Key Design Decisions

- **Raw `fetch` instead of googleapis SDK** — keeps bundle small, no heavy dependencies
- **Fire-and-forget calendar event creation** — guest isn't blocked waiting for Google API
- **Token refresh with 5-minute buffer** — prevents edge-case expiry during API calls
- **Graceful degradation** — if host hasn't connected Google, everything still works normally
