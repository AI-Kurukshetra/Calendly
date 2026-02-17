import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingFlow from "@/components/booking/BookingFlow";
import type { EventType, Profile, Availability } from "@/types";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ username: string; eventSlug: string }>;
}) {
  const { username, eventSlug } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Fetch event type
  const { data: eventType } = await supabase
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", eventSlug)
    .eq("is_active", true)
    .single();

  if (!eventType) notFound();

  // Fetch availability
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_available", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="min-h-screen bg-muted/30">
      <BookingFlow
        profile={profile as Profile}
        eventType={eventType as EventType}
        availability={(availability as Availability[]) || []}
      />
    </div>
  );
}
