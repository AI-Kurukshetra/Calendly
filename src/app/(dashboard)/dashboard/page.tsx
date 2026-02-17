import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingBookingsList from "@/components/dashboard/UpcomingBookingsList";
import type { DashboardStats, BookingWithEventType } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Fetch stats in parallel
  const [totalRes, upcomingRes, todayRes, completedRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("host_id", user.id),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("host_id", user.id)
      .eq("status", "confirmed")
      .gte("start_time", now),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("host_id", user.id)
      .eq("booking_date", today)
      .eq("status", "confirmed"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("host_id", user.id)
      .eq("status", "completed"),
  ]);

  const stats: DashboardStats = {
    total_bookings: totalRes.count ?? 0,
    upcoming_bookings: upcomingRes.count ?? 0,
    todays_bookings: todayRes.count ?? 0,
    completed_bookings: completedRes.count ?? 0,
  };

  // Fetch upcoming bookings with event type info
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select("*, event_types(title, duration_minutes, color, location_type)")
    .eq("host_id", user.id)
    .eq("status", "confirmed")
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your schedule.
        </p>
      </div>

      <StatsCards stats={stats} />

      <UpcomingBookingsList
        bookings={(upcomingBookings as BookingWithEventType[]) || []}
        timezone={profile?.timezone || "Asia/Kolkata"}
      />
    </div>
  );
}
