"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateTimeSlotsForDay, formatTimeInTimezone } from "@/lib/utils";
import type { EventType, Availability, TimeSlot } from "@/types";
import { Loader2, Globe } from "lucide-react";

export default function TimeSlotGrid({
  date,
  eventType,
  availability,
  hostTimezone,
  hostId,
  guestTimezone,
  onSelect,
}: {
  date: Date;
  eventType: EventType;
  availability: Availability[];
  hostTimezone: string;
  hostId: string;
  guestTimezone: string;
  onSelect: (slot: TimeSlot) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);

      // Get availability ranges for the selected day
      const dayOfWeek = date.getDay();
      const dayRanges = availability
        .filter((a) => a.day_of_week === dayOfWeek && a.is_available)
        .map((a) => ({
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
        }));

      if (dayRanges.length === 0) {
        setSlots([]);
        setLoading(false);
        return;
      }

      // Fetch existing bookings for this date (ALL bookings for the host, not just this event type)
      const supabase = createClient();
      const dateStr = date.toISOString().split("T")[0];
      const [bookingsRes, busyTimesRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("start_time, end_time")
          .eq("host_id", hostId)
          .eq("booking_date", dateStr)
          .in("status", ["confirmed"]),
        // Fetch Google Calendar busy times for this host
        fetch(
          `/api/google/busy-times?hostId=${hostId}&date=${dateStr}&timezone=${encodeURIComponent(hostTimezone)}`
        )
          .then((r) => r.json())
          .catch(() => ({ busyTimes: [] })),
      ]);

      const bookedSlots = (bookingsRes.data || []).map((b) => ({
        start_time: b.start_time,
        end_time: b.end_time,
      }));

      // Add Google Calendar busy times as additional booked slots
      const googleBusySlots = (
        busyTimesRes.busyTimes as Array<{ start: string; end: string }>
      ).map((bt) => ({
        start_time: new Date(bt.start).toISOString(),
        end_time: new Date(bt.end).toISOString(),
      }));

      bookedSlots.push(...googleBusySlots);

      // Generate available time slots across all ranges
      const generated = generateTimeSlotsForDay(
        dayRanges,
        eventType.duration_minutes,
        bookedSlots,
        date,
        hostTimezone
      );

      setSlots(generated);
      setLoading(false);
    }

    loadSlots();
  }, [date, eventType, availability, hostTimezone, hostId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading available times...</span>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select a Time</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <Globe className="h-3.5 w-3.5" />
          Times shown in {guestTimezone.replace(/_/g, " ")}
        </div>
      </div>

      {availableSlots.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="font-medium">No available times</p>
          <p className="text-sm text-muted-foreground mt-1">
            All slots are booked for this day. Please try another date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => onSelect(slot)}
              className="rounded-xl border bg-card px-4 py-3 text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary transition-all cursor-pointer text-center"
            >
              {formatTimeInTimezone(slot.start, guestTimezone)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
