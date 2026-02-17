import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Uses service role key to bypass RLS — the booking UUID acts as an unguessable token
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("bookings")
    .select("*, event_types(*), profiles!bookings_host_id_fkey(full_name, username, timezone)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
