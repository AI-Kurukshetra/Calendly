"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDayName } from "@/lib/utils";
import type { DayAvailability } from "@/types";

export async function saveAvailability(days: DayAvailability[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate each day
  for (const day of days) {
    if (!day.is_available) continue;

    for (const range of day.ranges) {
      if (range.start_time >= range.end_time) {
        return {
          error: `${getDayName(day.day_of_week)}: End time must be after start time`,
        };
      }
    }

    // Check for overlaps within the same day
    const sorted = [...day.ranges].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start_time < sorted[i - 1].end_time) {
        return {
          error: `${getDayName(day.day_of_week)}: Time ranges must not overlap`,
        };
      }
    }
  }

  // Build flat rows from grouped structure
  const rows: Array<{
    user_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }> = [];

  for (const day of days) {
    if (day.ranges.length === 0) {
      // Preserve "off" state with default range
      rows.push({
        user_id: user.id,
        day_of_week: day.day_of_week,
        start_time: "09:00",
        end_time: "17:00",
        is_available: false,
      });
    } else {
      for (const range of day.ranges) {
        rows.push({
          user_id: user.id,
          day_of_week: day.day_of_week,
          start_time: range.start_time,
          end_time: range.end_time,
          is_available: day.is_available,
        });
      }
    }
  }

  // Delete existing availability for this user
  const { error: deleteError } = await supabase
    .from("availability")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) return { error: deleteError.message };

  // Insert all new rows
  const { error: insertError } = await supabase
    .from("availability")
    .insert(rows);

  if (insertError) return { error: insertError.message };

  revalidatePath("/availability");
  return { success: true };
}
