"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatTimeInTimezone,
  getLocationLabel,
  getGuestTimezone,
} from "@/lib/utils";
import type { BookingWithDetails } from "@/types";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Video,
  Phone,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-4 w-4" />;
  if (loc.icon === "Phone") return <Phone className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const guestTimezone = getGuestTimezone();

  useEffect(() => {
    if (!bookingId) {
      setError(true);
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBooking(data);
      } catch {
        setError(true);
      }
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="rounded-xl border bg-card p-8 text-center max-w-md">
          <p className="text-lg font-medium">Booking not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            The booking you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/">
            <Button className="mt-4 rounded-xl cursor-pointer">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          {/* Success icon */}
          <div className="text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            <p className="text-muted-foreground mt-1">
              You&apos;re all set. Here are your booking details.
            </p>
          </div>

          {/* Booking details */}
          <div
            className="h-1 rounded-full mb-5"
            style={{ backgroundColor: booking.event_types.color }}
          />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{booking.event_types.title}</h3>
              <p className="text-sm text-muted-foreground">
                with {booking.profiles.full_name}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{formatDate(booking.booking_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>
                  {formatTimeInTimezone(booking.start_time, guestTimezone)} –{" "}
                  {formatTimeInTimezone(booking.end_time, guestTimezone)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LocationIcon type={booking.event_types.location_type} />
                <span>
                  {getLocationLabel(booking.event_types.location_type).label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{booking.guest_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{booking.guest_email}</span>
              </div>
              {booking.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{booking.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t text-center">
            <p className="text-xs text-muted-foreground">
              A confirmation has been sent to your email.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Calendar className="h-3 w-3" />
            </div>
            <span>
              Powered by{" "}
              <span className="font-semibold text-foreground">Calslot</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
