import { createClient } from "@supabase/supabase-js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "http://localhost:3000"}`;

function getRedirectUri() {
  // Use the app's origin, not Supabase URL
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/google/callback`;
}

// ── OAuth URL ──────────────────────────────────────────────

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ── Exchange code for tokens ───────────────────────────────

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_in: data.expires_in as number, // seconds
  };
}

// ── Refresh access token ───────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    expires_in: data.expires_in as number,
  };
}

// ── Get valid access token (refresh if expired) ────────────

export async function getValidAccessToken(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: token } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!token) return null;

  // Check if token is still valid (with 5-min buffer)
  const expiry = new Date(token.token_expiry);
  const now = new Date(Date.now() + 5 * 60 * 1000);

  if (expiry > now) {
    return token.access_token as string;
  }

  // Token expired — refresh it
  try {
    const refreshed = await refreshAccessToken(token.refresh_token);
    const newExpiry = new Date(
      Date.now() + refreshed.expires_in * 1000
    ).toISOString();

    await supabase
      .from("google_tokens")
      .update({
        access_token: refreshed.access_token,
        token_expiry: newExpiry,
      })
      .eq("user_id", userId);

    return refreshed.access_token;
  } catch {
    // Refresh failed — token may have been revoked
    return null;
  }
}

// ── Create calendar event ──────────────────────────────────

interface CalendarEventInput {
  summary: string;
  description: string;
  startTime: string; // ISO 8601 UTC
  endTime: string; // ISO 8601 UTC
  attendeeEmail: string;
  hostTimezone: string;
}

export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEventInput
): Promise<string | null> {
  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startTime,
      timeZone: event.hostTimezone,
    },
    end: {
      dateTime: event.endTime,
      timeZone: event.hostTimezone,
    },
    attendees: [{ email: event.attendeeEmail }],
    reminders: {
      useDefault: true,
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.error("Failed to create calendar event:", await res.text());
    return null;
  }

  const data = await res.json();
  return data.id as string;
}

// ── Delete calendar event ──────────────────────────────────

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.ok || res.status === 404; // 404 means already deleted
}

// ── List calendar events (for busy-time checking) ─────────

export async function listCalendarEvents(
  accessToken: string,
  timeMin: string, // ISO 8601 UTC
  timeMax: string // ISO 8601 UTC
): Promise<Array<{ start: string; end: string }>> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    fields: "items(start,end,transparency)",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  const busyTimes: Array<{ start: string; end: string }> = [];

  for (const item of data.items || []) {
    // Skip events marked as "free" (transparent)
    if (item.transparency === "transparent") continue;

    const start = item.start?.dateTime || item.start?.date;
    const end = item.end?.dateTime || item.end?.date;

    if (start && end) {
      busyTimes.push({ start, end });
    }
  }

  return busyTimes;
}

// ── Revoke token ───────────────────────────────────────────

export async function revokeToken(token: string): Promise<boolean> {
  const res = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${token}`,
    { method: "POST" }
  );
  return res.ok;
}
