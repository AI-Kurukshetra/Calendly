import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvailabilityGrid from "@/components/dashboard/AvailabilityGrid";
import type { Availability } from "@/types";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground mt-1">
          Set your weekly availability for bookings. Add multiple time ranges per day for breaks.
        </p>
      </div>

      <AvailabilityGrid availability={(availability as Availability[]) || []} />
    </div>
  );
}
