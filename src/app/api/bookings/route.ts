import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type_id,
      host_id,
      guest_name,
      guest_email,
      booking_date,
      start_time,
      end_time,
      notes,
    } = body;

    if (!event_type_id || !host_id || !guest_name || !guest_email || !booking_date || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use service role to bypass RLS — guests can't SELECT after INSERT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        event_type_id,
        host_id,
        guest_name,
        guest_email,
        booking_date,
        start_time,
        end_time,
        status: "confirmed",
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: booking.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
