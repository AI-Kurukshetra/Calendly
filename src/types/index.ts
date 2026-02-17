// ============================================
// CalSync — TypeScript Interfaces
// ============================================

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
}

export interface EventType {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  location_type: "google_meet" | "zoom" | "phone" | "in_person";
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Availability {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sunday ... 6=Saturday
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_available: boolean;
}

export interface Booking {
  id: string;
  event_type_id: string;
  host_id: string;
  guest_name: string;
  guest_email: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // ISO 8601 timestamptz (UTC)
  end_time: string; // ISO 8601 timestamptz (UTC)
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
}

export interface GoogleToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
}

// Extended types with joins
export interface BookingWithEventType extends Booking {
  event_types: Pick<
    EventType,
    "title" | "duration_minutes" | "color" | "location_type"
  >;
}

export interface BookingWithDetails extends Booking {
  event_types: EventType;
  profiles: Pick<Profile, "full_name" | "username" | "timezone">;
}

// Form types
export interface EventTypeFormData {
  title: string;
  description: string;
  duration_minutes: number;
  location_type: EventType["location_type"];
  color: string;
}

export interface BookingFormData {
  guest_name: string;
  guest_email: string;
  notes: string;
}

export interface AvailabilityFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Grouped availability for multi-range UI
export interface DayAvailability {
  day_of_week: number;
  is_available: boolean;
  ranges: Array<{ start_time: string; end_time: string }>;
}

// Stats type for dashboard
export interface DashboardStats {
  total_bookings: number;
  upcoming_bookings: number;
  todays_bookings: number;
  completed_bookings: number;
}

// Time slot type
export interface TimeSlot {
  start: string; // ISO 8601 UTC timestamp
  end: string; // ISO 8601 UTC timestamp
  displayStart: string; // HH:mm in host timezone (for generation)
  displayEnd: string; // HH:mm in host timezone (for generation)
  available: boolean;
}
