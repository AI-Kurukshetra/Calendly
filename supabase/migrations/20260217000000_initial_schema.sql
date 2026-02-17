-- =============================================
-- CalSync Initial Schema Migration
-- Tables: profiles, event_types, availability, bookings
-- Includes RLS policies and auth trigger
-- =============================================

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  username text unique not null,
  email text not null,
  bio text,
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create unique index profiles_username_idx on public.profiles (username);

-- 2. EVENT_TYPES TABLE
create table public.event_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  duration_minutes integer not null check (duration_minutes in (15, 30, 45, 60)),
  location_type text not null check (location_type in ('google_meet', 'zoom', 'phone', 'in_person')),
  color text not null default '#6366f1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, slug)
);

create index event_types_user_id_idx on public.event_types (user_id);

-- 3. AVAILABILITY TABLE
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  is_available boolean not null default true,
  unique(user_id, day_of_week)
);

create index availability_user_id_idx on public.availability (user_id);

-- 4. BOOKINGS TABLE
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid references public.event_types(id) on delete cascade not null,
  host_id uuid references public.profiles(id) on delete cascade not null,
  guest_name text not null,
  guest_email text not null,
  booking_date date not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create index bookings_host_id_idx on public.bookings (host_id);
create index bookings_event_type_id_idx on public.bookings (event_type_id);
create index bookings_date_idx on public.bookings (booking_date);
create index bookings_status_idx on public.bookings (status);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- PROFILES RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- EVENT_TYPES RLS
alter table public.event_types enable row level security;

create policy "Active event types are viewable by everyone, owners see all"
  on public.event_types for select
  using (is_active = true or auth.uid() = user_id);

create policy "Users can insert own event types"
  on public.event_types for insert
  with check (auth.uid() = user_id);

create policy "Users can update own event types"
  on public.event_types for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own event types"
  on public.event_types for delete
  using (auth.uid() = user_id);

-- AVAILABILITY RLS
alter table public.availability enable row level security;

create policy "Availability is viewable by everyone"
  on public.availability for select
  using (true);

create policy "Users can insert own availability"
  on public.availability for insert
  with check (auth.uid() = user_id);

create policy "Users can update own availability"
  on public.availability for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own availability"
  on public.availability for delete
  using (auth.uid() = user_id);

-- BOOKINGS RLS
alter table public.bookings enable row level security;

create policy "Hosts can view own bookings"
  on public.bookings for select
  using (auth.uid() = host_id);

create policy "Anyone can create bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

create policy "Hosts can update own bookings"
  on public.bookings for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- =============================================
-- AUTH TRIGGER: Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
