# CalSync — A Calendly Alternative

An appointment booking system for service businesses with Google Calendar integration, built with Next.js, Supabase, and Tailwind CSS.

## What It Does

CalSync lets hosts create event types, set weekly availability, and share a public booking link. Guests can book appointments without creating an account. Bookings automatically sync to the host's Google Calendar, and existing calendar events are checked to prevent double-booking.

## Key Features

- **Event Types** — Create multiple event types with custom durations (15/30/45/60 min), colors, and location types
- **Weekly Availability** — Set available hours per day with multiple time ranges and break support
- **Public Booking Page** — Shareable link (`/book/username`) where guests pick a date, time, and submit details — no login required
- **Smart Slot Generation** — Automatically calculates available time slots based on availability, existing bookings, AND the host's Google Calendar events
- **Google Calendar Sync** — New bookings create calendar events; cancellations remove them
- **Dashboard** — Stats cards, upcoming bookings list, and calendar view
- **Timezone Aware** — Stores everything in UTC, displays in the guest's detected timezone

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Database & Auth | Supabase (PostgreSQL + RLS + Auth) |
| Styling | Tailwind CSS + shadcn/ui |
| Calendar UI | react-big-calendar + react-day-picker |
| Calendar Sync | Google Calendar API v3 (raw fetch) |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Google credentials

# Run database migrations
npx supabase db push

# Seed demo data
npm run seed

# Start development server
npm run dev
```

## Environment Variables

See `.env.local.example` for all required variables.

## Alternative To

**Calendly** — CalSync provides the core scheduling functionality of Calendly: shareable booking links, availability management, and calendar integration, built as an open-source alternative.
