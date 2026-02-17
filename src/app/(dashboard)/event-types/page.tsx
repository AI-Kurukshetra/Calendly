import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventTypeCard from "@/components/dashboard/EventTypeCard";
import type { EventType } from "@/types";
import { Plus, CalendarDays } from "lucide-react";

export default async function EventTypesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your scheduling events.
          </p>
        </div>
        <Link href="/event-types/new">
          <Button className="rounded-xl cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            New Event Type
          </Button>
        </Link>
      </div>

      {!eventTypes || eventTypes.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No event types yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first event type to start receiving bookings.
          </p>
          <Link href="/event-types/new">
            <Button className="rounded-xl cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Create Event Type
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((eventType: EventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} />
          ))}
        </div>
      )}
    </div>
  );
}
