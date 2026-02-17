"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAvailability } from "@/app/(dashboard)/availability/actions";
import { getDayName } from "@/lib/utils";
import type { Availability, DayAvailability } from "@/types";
import { Loader2, Save, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

// Generate time options from 6:00 AM to 10:00 PM in 30-min increments
function generateTimeOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();
const MAX_RANGES_PER_DAY = 4;

function buildInitialState(availability: Availability[]): DayAvailability[] {
  // Group incoming rows by day_of_week
  const grouped = new Map<number, Availability[]>();
  for (const a of availability) {
    const existing = grouped.get(a.day_of_week) || [];
    existing.push(a);
    grouped.set(a.day_of_week, existing);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const dayRows = grouped.get(i);
    if (dayRows && dayRows.length > 0) {
      return {
        day_of_week: i,
        is_available: dayRows[0].is_available,
        ranges: dayRows
          .map((r) => ({
            start_time: r.start_time.slice(0, 5),
            end_time: r.end_time.slice(0, 5),
          }))
          .sort((a, b) => a.start_time.localeCompare(b.start_time)),
      };
    }
    // Default for days with no data
    return {
      day_of_week: i,
      is_available: i >= 1 && i <= 5, // Mon-Fri
      ranges: [{ start_time: "09:00", end_time: "17:00" }],
    };
  });
}

export default function AvailabilityGrid({
  availability,
}: {
  availability: Availability[];
}) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState<DayAvailability[]>(() =>
    buildInitialState(availability)
  );

  function toggleDay(dayIndex: number, checked: boolean) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, is_available: checked } : d
      )
    );
  }

  function updateRange(
    dayIndex: number,
    rangeIndex: number,
    field: "start_time" | "end_time",
    value: string
  ) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        const newRanges = d.ranges.map((r, ri) =>
          ri === rangeIndex ? { ...r, [field]: value } : r
        );
        return { ...d, ranges: newRanges };
      })
    );
  }

  function addRange(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        if (d.ranges.length >= MAX_RANGES_PER_DAY) return d;

        const lastRange = d.ranges[d.ranges.length - 1];
        const newStart = lastRange ? lastRange.end_time : "09:00";
        const [h, m] = newStart.split(":").map(Number);
        const newEndH = Math.min(h + 2, 22);
        const newEnd = `${String(newEndH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        return {
          ...d,
          ranges: [...d.ranges, { start_time: newStart, end_time: newEnd }],
        };
      })
    );
  }

  function removeRange(dayIndex: number, rangeIndex: number) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex || d.ranges.length <= 1) return d;
        return {
          ...d,
          ranges: d.ranges.filter((_, ri) => ri !== rangeIndex),
        };
      })
    );
  }

  function handleSave() {
    // Client-side validation
    for (const day of days) {
      if (!day.is_available) continue;

      for (const range of day.ranges) {
        if (range.start_time >= range.end_time) {
          toast.error(
            `${getDayName(day.day_of_week)}: End time must be after start time`
          );
          return;
        }
      }

      const sorted = [...day.ranges].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start_time < sorted[i - 1].end_time) {
          toast.error(
            `${getDayName(day.day_of_week)}: Time ranges must not overlap`
          );
          return;
        }
      }
    }

    startTransition(async () => {
      const result = await saveAvailability(days);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Availability saved");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        {days.map((day, dayIndex) => (
          <div
            key={day.day_of_week}
            className={dayIndex < 6 ? "border-b" : ""}
          >
            {/* Day header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="font-medium text-sm">
                {getDayName(day.day_of_week)}
              </span>
              <Switch
                checked={day.is_available}
                onCheckedChange={(checked) => toggleDay(dayIndex, checked)}
                className="cursor-pointer"
              />
            </div>

            {/* Time ranges */}
            <div
              className={`px-5 pb-4 space-y-2 transition-opacity ${
                !day.is_available ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {day.ranges.map((range, rangeIndex) => (
                <div
                  key={rangeIndex}
                  className="flex items-center gap-2"
                >
                  <Select
                    value={range.start_time}
                    onValueChange={(val) =>
                      updateRange(dayIndex, rangeIndex, "start_time", val)
                    }
                  >
                    <SelectTrigger className="h-10 w-[130px] rounded-lg cursor-pointer text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="cursor-pointer"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-muted-foreground text-sm">—</span>

                  <Select
                    value={range.end_time}
                    onValueChange={(val) =>
                      updateRange(dayIndex, rangeIndex, "end_time", val)
                    }
                  >
                    <SelectTrigger className="h-10 w-[130px] rounded-lg cursor-pointer text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="cursor-pointer"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {day.ranges.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer flex-shrink-0"
                      onClick={() => removeRange(dayIndex, rangeIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {day.ranges.length < MAX_RANGES_PER_DAY && (
                <button
                  type="button"
                  onClick={() => addRange(dayIndex)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer pt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add time range
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl cursor-pointer min-w-[140px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Availability
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
