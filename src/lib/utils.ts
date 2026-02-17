import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, addMinutes, isBefore, isEqual } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// shadcn/ui class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Slug generator: "30 Min Meeting" -> "30-min-meeting"
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Get the guest's timezone from the browser
export function getGuestTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Format a UTC ISO timestamp to a localized time string
export function formatTimeInTimezone(
  utcTimestamp: string,
  timezone: string
): string {
  const date = new Date(utcTimestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

/**
 * Time slot generation algorithm
 *
 * 1. Parse host's availability start/end time for the day (in host's timezone)
 * 2. Create slots of durationMinutes length
 * 3. Convert each slot to UTC for comparison with existing bookings
 * 4. Check overlap with booked slots
 * 5. Return slots with both UTC timestamps and display-friendly times
 */
export function generateTimeSlots(
  startTime: string, // "09:00" in host timezone
  endTime: string, // "17:00" in host timezone
  durationMinutes: number,
  bookedSlots: Array<{ start_time: string; end_time: string }>, // UTC timestamps
  selectedDate: Date, // the date selected by guest
  hostTimezone: string // e.g., "Asia/Kolkata"
): Array<{
  start: string; // UTC ISO string
  end: string; // UTC ISO string
  displayStart: string; // HH:mm in host timezone
  displayEnd: string; // HH:mm in host timezone
  available: boolean;
}> {
  const slots: Array<{
    start: string;
    end: string;
    displayStart: string;
    displayEnd: string;
    available: boolean;
  }> = [];

  // Build a date in the host's timezone for start and end
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayStartLocal = parse(
    `${dateStr} ${startTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const dayEndLocal = parse(
    `${dateStr} ${endTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  // Convert host-local times to UTC
  const dayStartUTC = fromZonedTime(dayStartLocal, hostTimezone);
  const dayEndUTC = fromZonedTime(dayEndLocal, hostTimezone);

  let current = dayStartUTC;

  while (true) {
    const slotEnd = addMinutes(current, durationMinutes);

    // Stop if slotEnd would exceed the day's end time
    if (!isBefore(slotEnd, dayEndUTC) && !isEqual(slotEnd, dayEndUTC)) {
      break;
    }

    // Check if this slot overlaps with any booked slot (all in UTC)
    const isBooked = bookedSlots.some((booked) => {
      const bookedStart = new Date(booked.start_time);
      const bookedEnd = new Date(booked.end_time);
      return isBefore(current, bookedEnd) && isBefore(bookedStart, slotEnd);
    });

    // Check if slot is in the past
    const now = new Date();
    const isPast = isBefore(current, now);

    // Get display times in host timezone
    const zonedStart = toZonedTime(current, hostTimezone);
    const zonedEnd = toZonedTime(slotEnd, hostTimezone);

    slots.push({
      start: current.toISOString(),
      end: slotEnd.toISOString(),
      displayStart: format(zonedStart, "HH:mm"),
      displayEnd: format(zonedEnd, "HH:mm"),
      available: !isBooked && !isPast,
    });

    current = slotEnd;
  }

  return slots;
}

/**
 * Multi-range variant: generates time slots across multiple availability ranges.
 * Calls generateTimeSlots() once per range and merges results sorted by start time.
 */
export function generateTimeSlotsForDay(
  ranges: Array<{ start_time: string; end_time: string }>,
  durationMinutes: number,
  bookedSlots: Array<{ start_time: string; end_time: string }>,
  selectedDate: Date,
  hostTimezone: string
): Array<{
  start: string;
  end: string;
  displayStart: string;
  displayEnd: string;
  available: boolean;
}> {
  const allSlots: Array<{
    start: string;
    end: string;
    displayStart: string;
    displayEnd: string;
    available: boolean;
  }> = [];

  for (const range of ranges) {
    const slots = generateTimeSlots(
      range.start_time,
      range.end_time,
      durationMinutes,
      bookedSlots,
      selectedDate,
      hostTimezone
    );
    allSlots.push(...slots);
  }

  // Sort by start time (UTC ISO strings are lexicographically sortable)
  allSlots.sort((a, b) => a.start.localeCompare(b.start));

  return allSlots;
}

// Format time for display: "09:00" -> "9:00 AM"
export function formatTime(time: string): string {
  const referenceDate = new Date(2000, 0, 1);
  const parsed = parse(time, "HH:mm", referenceDate);
  return format(parsed, "h:mm a");
}

// Format date for display
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "EEEE, MMMM d, yyyy");
}

// Format short date
export function formatShortDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

// Get day name from number
export function getDayName(dayOfWeek: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek];
}

// Get short day name from number
export function getShortDayName(dayOfWeek: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek];
}

// Location type display labels
export function getLocationLabel(
  locationType: string
): { label: string; icon: string } {
  const map: Record<string, { label: string; icon: string }> = {
    google_meet: { label: "Google Meet", icon: "Video" },
    zoom: { label: "Zoom", icon: "Video" },
    phone: { label: "Phone Call", icon: "Phone" },
    in_person: { label: "In Person", icon: "MapPin" },
  };
  return map[locationType] || { label: locationType, icon: "MapPin" };
}
