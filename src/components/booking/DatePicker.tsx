"use client";

import { Calendar } from "@/components/ui/calendar";
import { addMonths, isBefore, startOfDay } from "date-fns";

export default function DatePicker({
  availableDays,
  onSelect,
  selectedDate,
}: {
  availableDays: Set<number>;
  onSelect: (date: Date) => void;
  selectedDate: Date | undefined;
}) {
  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 2);

  function isDisabled(date: Date): boolean {
    // Disable past dates
    if (isBefore(date, today)) return true;
    // Disable dates beyond 2 months
    if (date > maxDate) return true;
    // Disable days where host is not available
    const dayOfWeek = date.getDay();
    return !availableDays.has(dayOfWeek);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select a Date</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a date that works for you.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 w-fit">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelect(date)}
          disabled={isDisabled}
          fromDate={today}
          toDate={maxDate}
        />
      </div>
    </div>
  );
}
