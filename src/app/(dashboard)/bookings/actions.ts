"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import {
  getValidAccessToken,
  deleteCalendarEvent,
} from "@/lib/google/calendar";

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Fetch the booking to check for a Google Calendar event
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: booking } = await serviceClient
    .from("bookings")
    .select("google_calendar_event_id, host_id")
    .eq("id", bookingId)
    .eq("host_id", user.id)
    .single();

  // Delete Google Calendar event if it exists
  if (booking?.google_calendar_event_id) {
    try {
      const accessToken = await getValidAccessToken(user.id);
      if (accessToken) {
        await deleteCalendarEvent(
          accessToken,
          booking.google_calendar_event_id
        );
      }
    } catch {
      // Don't block cancel if calendar deletion fails
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", google_calendar_event_id: null })
    .eq("id", bookingId)
    .eq("host_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}
