"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelBooking } from "@/app/(dashboard)/bookings/actions";
import { formatTimeInTimezone, formatShortDate, getLocationLabel } from "@/lib/utils";
import type { BookingWithEventType } from "@/types";
import {
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  Video,
  Phone,
  X,
  FileText,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "upcoming" | "past" | "cancelled";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-3.5 w-3.5" />;
  if (loc.icon === "Phone") return <Phone className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/10">
        Confirmed
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
        Completed
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="bg-destructive/10 text-destructive hover:bg-destructive/10">
      Cancelled
    </Badge>
  );
}

export default function BookingsView({
  bookings,
  timezone,
}: {
  bookings: BookingWithEventType[];
  timezone: string;
}) {
  const [tab, setTab] = useState<TabType>("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const now = new Date().toISOString();

  const filtered = bookings.filter((b) => {
    if (tab === "upcoming") return b.status === "confirmed" && b.start_time >= now;
    if (tab === "past") return b.status === "completed" || (b.status === "confirmed" && b.start_time < now);
    return b.status === "cancelled";
  });

  const tabs: { key: TabType; label: string; count: number }[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: bookings.filter((b) => b.status === "confirmed" && b.start_time >= now).length,
    },
    {
      key: "past",
      label: "Past",
      count: bookings.filter((b) => b.status === "completed" || (b.status === "confirmed" && b.start_time < now)).length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: bookings.filter((b) => b.status === "cancelled").length,
    },
  ];

  function handleCancel() {
    if (!cancelId) return;
    startTransition(async () => {
      const result = await cancelBooking(cancelId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Booking cancelled");
        setCancelId(null);
      }
    });
  }

  return (
    <>
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === t.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">No {tab} bookings</p>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "upcoming"
              ? "Share your booking link to get started."
              : "Nothing to show here yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-full w-1.5 rounded-full flex-shrink-0 self-stretch min-h-[60px]"
                  style={{ backgroundColor: booking.event_types.color }}
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">
                      {booking.event_types.title}
                    </h3>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                      {booking.guest_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{booking.guest_email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      {formatShortDate(booking.booking_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      {formatTimeInTimezone(booking.start_time, timezone)} –{" "}
                      {formatTimeInTimezone(booking.end_time, timezone)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LocationIcon type={booking.event_types.location_type} />
                      {getLocationLabel(booking.event_types.location_type).label}
                    </span>
                    {booking.notes && (
                      <span className="flex items-center gap-1.5 sm:col-span-2">
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{booking.notes}</span>
                      </span>
                    )}
                  </div>
                </div>

                {booking.status === "confirmed" && booking.start_time >= now && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0 cursor-pointer"
                    onClick={() => setCancelId(booking.id)}
                    title="Cancel booking"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription>
              This will cancel the booking. The guest will need to rebook if they
              want a new time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelId(null)}
              className="cursor-pointer"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
