import { NextRequest, NextResponse } from "next/server";
import {
  getValidAccessToken,
  listCalendarEvents,
} from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const hostId = request.nextUrl.searchParams.get("hostId");
  const date = request.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  const timezone = request.nextUrl.searchParams.get("timezone"); // e.g. Asia/Kolkata

  if (!hostId || !date || !timezone) {
    return NextResponse.json({ busyTimes: [] });
  }

  try {
    const accessToken = await getValidAccessToken(hostId);
    if (!accessToken) {
      // Host hasn't connected Google Calendar — no busy times
      return NextResponse.json({ busyTimes: [] });
    }

    // Build start/end of day in the host's timezone, converted to UTC
    // Use a broad 36-hour window to safely cover the full calendar day
    // regardless of timezone offsets
    const dayStart = new Date(`${date}T00:00:00`);
    // Approximate offset: fetch a wider window to be safe
    const timeMin = new Date(
      dayStart.getTime() - 14 * 60 * 60 * 1000
    ).toISOString();
    const timeMax = new Date(
      dayStart.getTime() + 38 * 60 * 60 * 1000
    ).toISOString();

    const busyTimes = await listCalendarEvents(
      accessToken,
      timeMin,
      timeMax
    );

    return NextResponse.json({ busyTimes });
  } catch {
    return NextResponse.json({ busyTimes: [] });
  }
}
