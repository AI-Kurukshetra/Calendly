import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getValidAccessToken,
  createCalendarEvent,
} from "@/lib/google/calendar";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Use service role to access all data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch booking with event type and host profile
    const { data: booking } = await supabase
      .from("bookings")
      .select(
        "*, event_types(title, description, location_type, duration_minutes), profiles!bookings_host_id_fkey(full_name, timezone)"
      )
      .eq("id", bookingId)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if host has Google Calendar connected
    const accessToken = await getValidAccessToken(booking.host_id);
    if (!accessToken) {
      // Host hasn't connected Google Calendar — silently skip
      return NextResponse.json({ skipped: true });
    }

    // Build description
    const lines = [
      `Guest: ${booking.guest_name}`,
      `Email: ${booking.guest_email}`,
      booking.notes ? `Notes: ${booking.notes}` : "",
      "",
      "Booked via Calslot",
    ].filter(Boolean);

    const eventId = await createCalendarEvent(accessToken, {
      summary: `${booking.event_types.title} — ${booking.guest_name}`,
      description: lines.join("\n"),
      startTime: booking.start_time,
      endTime: booking.end_time,
      attendeeEmail: booking.guest_email,
      hostTimezone: booking.profiles.timezone,
    });

    if (eventId) {
      // Store the event ID on the booking
      await supabase
        .from("bookings")
        .update({ google_calendar_event_id: eventId })
        .eq("id", bookingId);
    }

    return NextResponse.json({ success: true, eventId });
  } catch (err) {
    console.error("Calendar event creation error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
