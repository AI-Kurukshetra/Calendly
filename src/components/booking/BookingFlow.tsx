"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DatePicker from "./DatePicker";
import TimeSlotGrid from "./TimeSlotGrid";
import BookingForm from "./BookingForm";
import {
  getLocationLabel,
  formatDate,
  formatTimeInTimezone,
  getGuestTimezone,
} from "@/lib/utils";
import type { EventType, Profile, Availability, TimeSlot } from "@/types";
import {
  Clock,
  Video,
  Phone,
  MapPin,
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type Step = "date" | "time" | "form";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-4 w-4" />;
  if (loc.icon === "Phone") return <Phone className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

export default function BookingFlow({
  profile,
  eventType,
  availability,
}: {
  profile: Profile;
  eventType: EventType;
  availability: Availability[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const guestTimezone = getGuestTimezone();

  // Get available day numbers from availability
  const availableDays = new Set(availability.map((a) => a.day_of_week));

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("time");
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep("form");
  }

  function handleBack() {
    if (step === "time") {
      setStep("date");
      setSelectedSlot(null);
    } else if (step === "form") {
      setStep("time");
      setSelectedSlot(null);
    }
  }

  async function handleBookingSubmit(data: {
    guest_name: string;
    guest_email: string;
    notes: string;
  }) {
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const bookingDate = selectedDate.toISOString().split("T")[0];

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          event_type_id: eventType.id,
          host_id: profile.id,
          guest_name: data.guest_name,
          guest_email: data.guest_email,
          booking_date: bookingDate,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          status: "confirmed",
          notes: data.notes || null,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to create booking. Please try again.");
        setSubmitting(false);
        return;
      }

      // Fire-and-forget: create Google Calendar event for host (if connected)
      fetch("/api/bookings/calendar-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      }).catch(() => {});

      router.push(`/confirmation?id=${booking.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to profile */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg cursor-pointer text-muted-foreground"
          onClick={() => {
            if (step === "date") {
              router.push(`/book/${profile.username}`);
            } else {
              handleBack();
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {step === "date" ? "All events" : "Back"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Left panel — Event info */}
        <div className="rounded-xl border bg-card p-6 h-fit lg:sticky lg:top-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {profile.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{profile.full_name}</p>
            </div>
          </div>

          <div
            className="h-1 rounded-full mb-4"
            style={{ backgroundColor: eventType.color }}
          />

          <h2 className="text-xl font-bold">{eventType.title}</h2>
          {eventType.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {eventType.description}
            </p>
          )}

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {eventType.duration_minutes} minutes
            </div>
            <div className="flex items-center gap-2">
              <LocationIcon type={eventType.location_type} />
              {getLocationLabel(eventType.location_type).label}
            </div>
            {selectedDate && (
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(selectedDate.toISOString())}
              </div>
            )}
            {selectedSlot && (
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Clock className="h-4 w-4" />
                {formatTimeInTimezone(selectedSlot.start, guestTimezone)} –{" "}
                {formatTimeInTimezone(selectedSlot.end, guestTimezone)}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Steps */}
        <div className="min-w-0">
          {step === "date" && (
            <DatePicker
              availableDays={availableDays}
              onSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          )}

          {step === "time" && selectedDate && (
            <TimeSlotGrid
              date={selectedDate}
              eventType={eventType}
              availability={availability}
              hostTimezone={profile.timezone}
              hostId={profile.id}
              guestTimezone={guestTimezone}
              onSelect={handleSlotSelect}
            />
          )}

          {step === "form" && (
            <BookingForm
              onSubmit={handleBookingSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <User className="h-3 w-3" />
          </div>
          <span>
            Powered by{" "}
            <span className="font-semibold text-foreground">Calslot</span>
          </span>
        </div>
      </div>
    </div>
  );
}
