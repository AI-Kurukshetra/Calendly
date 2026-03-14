import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocationLabel } from "@/lib/utils";
import type { EventType, Profile } from "@/types";
import { Calendar, Clock, Video, Phone, MapPin, User } from "lucide-react";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-4 w-4" />;
  if (loc.icon === "Phone") return <Phone className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const typedProfile = profile as Profile;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile header */}
        <div className="text-center mb-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold mx-auto mb-4">
            {typedProfile.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </div>
          <h1 className="text-2xl font-bold">{typedProfile.full_name}</h1>
          {typedProfile.bio && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {typedProfile.bio}
            </p>
          )}
        </div>

        {/* Event types */}
        {!eventTypes || eventTypes.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No events available</p>
            <p className="text-sm text-muted-foreground mt-1">
              This user hasn&apos;t set up any event types yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-6">
              Select an event to schedule a meeting
            </p>
            {(eventTypes as EventType[]).map((event) => (
              <Link
                key={event.id}
                href={`/book/${username}/${event.slug}`}
                className="block"
              >
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                  <div
                    className="h-full w-1.5 rounded-full self-stretch min-h-[50px]"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {event.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <LocationIcon type={event.location_type} />
                        {getLocationLabel(event.location_type).label}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <User className="h-3 w-3" />
            </div>
            <span>Powered by <span className="font-semibold text-foreground">Calslot</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
