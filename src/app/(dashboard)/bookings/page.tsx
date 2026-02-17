import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingsView from "@/components/dashboard/BookingsView";
import type { BookingWithEventType } from "@/types";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, event_types(title, duration_minutes, color, location_type)")
    .eq("host_id", user.id)
    .order("start_time", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your bookings.
        </p>
      </div>

      <BookingsView
        bookings={(bookings as BookingWithEventType[]) || []}
        timezone={profile?.timezone || "Asia/Kolkata"}
      />
    </div>
  );
}
