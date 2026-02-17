"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatTimeInTimezone, formatShortDate, getLocationLabel } from "@/lib/utils";
import { cancelBooking } from "@/app/(dashboard)/bookings/actions";
import type { BookingWithEventType } from "@/types";
import { Calendar, Clock, User, MapPin, Video, Phone, X } from "lucide-react";
import toast from "react-hot-toast";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-3.5 w-3.5" />;
  if (loc.icon === "Phone") return <Phone className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export default function UpcomingBookingsList({
  bookings,
  timezone,
}: {
  bookings: BookingWithEventType[];
  timezone: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleCancel(bookingId: string) {
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Booking cancelled");
      }
    });
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-lg font-medium">No upcoming bookings</p>
        <p className="text-sm text-muted-foreground mt-1">
          Share your booking link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="h-12 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: booking.event_types.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{booking.event_types.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {booking.guest_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatShortDate(booking.booking_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTimeInTimezone(booking.start_time, timezone)} –{" "}
                  {formatTimeInTimezone(booking.end_time, timezone)}
                </span>
                <span className="flex items-center gap-1.5">
                  <LocationIcon type={booking.event_types.location_type} />
                  {getLocationLabel(booking.event_types.location_type).label}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0 cursor-pointer"
              onClick={() => handleCancel(booking.id)}
              disabled={isPending}
              title="Cancel booking"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
