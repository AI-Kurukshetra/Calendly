import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  console.error("Make sure your .env.local file has these variables set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Demo user definitions
const users = [
  {
    email: "priya@example.com",
    password: "password123",
    full_name: "Priya Sharma",
    username: "priya-sharma",
  },
  {
    email: "rahul@example.com",
    password: "password123",
    full_name: "Rahul Patel",
    username: "rahul-patel",
  },
  {
    email: "ananya@example.com",
    password: "password123",
    full_name: "Ananya Gupta",
    username: "ananya-gupta",
  },
];

// Event types per user
const eventTypesMap: Record<
  string,
  Array<{
    title: string;
    slug: string;
    description: string;
    duration_minutes: number;
    location_type: string;
    color: string;
  }>
> = {
  "priya-sharma": [
    {
      title: "30 Min Consultation",
      slug: "30-min-consultation",
      description:
        "A quick 30-minute consultation to discuss your needs and how I can help.",
      duration_minutes: 30,
      location_type: "google_meet",
      color: "#6366f1",
    },
    {
      title: "Quick Call",
      slug: "quick-call",
      description: "A brief 15-minute phone call for quick questions.",
      duration_minutes: 15,
      location_type: "phone",
      color: "#f59e0b",
    },
  ],
  "rahul-patel": [
    {
      title: "Strategy Session",
      slug: "strategy-session",
      description:
        "A comprehensive 60-minute strategy session to plan your next moves.",
      duration_minutes: 60,
      location_type: "zoom",
      color: "#10b981",
    },
    {
      title: "Quick Sync",
      slug: "quick-sync",
      description: "A fast 15-minute sync call to align on priorities.",
      duration_minutes: 15,
      location_type: "phone",
      color: "#3b82f6",
    },
    {
      title: "Team Review",
      slug: "team-review",
      description:
        "45-minute team review meeting to discuss progress and blockers.",
      duration_minutes: 45,
      location_type: "google_meet",
      color: "#ef4444",
    },
  ],
  "ananya-gupta": [
    {
      title: "Design Review",
      slug: "design-review",
      description:
        "45-minute design review session to go over mockups and prototypes.",
      duration_minutes: 45,
      location_type: "google_meet",
      color: "#8b5cf6",
    },
    {
      title: "Coffee Chat",
      slug: "coffee-chat",
      description:
        "A casual 30-minute in-person coffee chat to get to know each other.",
      duration_minutes: 30,
      location_type: "in_person",
      color: "#f97316",
    },
  ],
};

// Guest names and emails for bookings
const guests = [
  { name: "Arjun Mehta", email: "arjun.mehta@example.com" },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com" },
  { name: "Vikram Singh", email: "vikram.singh@example.com" },
  { name: "Meera Nair", email: "meera.nair@example.com" },
  { name: "Karan Joshi", email: "karan.joshi@example.com" },
  { name: "Riya Chopra", email: "riya.chopra@example.com" },
  { name: "Aditya Kumar", email: "aditya.kumar@example.com" },
  { name: "Pooja Verma", email: "pooja.verma@example.com" },
  { name: "Nikhil Rao", email: "nikhil.rao@example.com" },
  { name: "Divya Iyer", email: "divya.iyer@example.com" },
];

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function makeTimestamptz(dateStr: string, time: string): string {
  // Creates a UTC timestamp from a date string and time in IST (Asia/Kolkata, UTC+5:30)
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(`${dateStr}T00:00:00Z`);
  // Subtract 5:30 to convert IST to UTC
  date.setUTCHours(hours - 5, minutes - 30, 0, 0);
  return date.toISOString();
}

async function seed() {
  console.log("Starting Calslot seed...\n");

  // Step 1: Create auth users (the trigger auto-creates profiles)
  const userIds: Record<string, string> = {};

  for (const user of users) {
    console.log(`Creating user: ${user.full_name} (${user.email})`);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email === user.email
    );

    if (existing) {
      console.log(`  User already exists, skipping creation.`);
      userIds[user.username] = existing.id;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        username: user.username,
      },
    });

    if (error) {
      console.error(`  Error creating user: ${error.message}`);
      continue;
    }

    userIds[user.username] = data.user.id;
    console.log(`  Created with ID: ${data.user.id}`);
  }

  // Step 2: Update profiles with bio
  const bios: Record<string, string> = {
    "priya-sharma":
      "Product consultant helping startups build better products. 5+ years of experience in SaaS.",
    "rahul-patel":
      "Business strategist and startup advisor. Passionate about scaling early-stage companies.",
    "ananya-gupta":
      "Senior UX designer crafting intuitive digital experiences. Design systems enthusiast.",
  };

  for (const [username, bio] of Object.entries(bios)) {
    if (!userIds[username]) continue;
    await supabase
      .from("profiles")
      .update({ bio })
      .eq("id", userIds[username]);
    console.log(`Updated bio for ${username}`);
  }

  // Step 3: Create event types
  const eventTypeIds: Record<string, string[]> = {};

  for (const [username, eventTypes] of Object.entries(eventTypesMap)) {
    const userId = userIds[username];
    if (!userId) continue;

    eventTypeIds[username] = [];

    for (const et of eventTypes) {
      const { data, error } = await supabase
        .from("event_types")
        .upsert(
          { ...et, user_id: userId },
          { onConflict: "user_id,slug" }
        )
        .select("id")
        .single();

      if (error) {
        console.error(
          `  Error creating event type "${et.title}": ${error.message}`
        );
        continue;
      }

      eventTypeIds[username].push(data.id);
      console.log(`Created event type: ${et.title} for ${username}`);
    }
  }

  // Step 4: Create availability (supports multiple ranges per day)
  for (const [username, userId] of Object.entries(userIds)) {
    // Delete existing availability first
    await supabase.from("availability").delete().eq("user_id", userId);

    const availabilityRows: Array<{
      user_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }> = [];

    if (username === "priya-sharma") {
      // Demo multi-range: split schedule with lunch break
      for (let day = 0; day <= 6; day++) {
        if (day >= 1 && day <= 5) {
          // Morning: 9:00-12:00
          availabilityRows.push({
            user_id: userId,
            day_of_week: day,
            start_time: "09:00",
            end_time: "12:00",
            is_available: true,
          });
          // Afternoon: 13:00-17:00
          availabilityRows.push({
            user_id: userId,
            day_of_week: day,
            start_time: "13:00",
            end_time: "17:00",
            is_available: true,
          });
        } else {
          availabilityRows.push({
            user_id: userId,
            day_of_week: day,
            start_time: "09:00",
            end_time: "17:00",
            is_available: false,
          });
        }
      }
    } else {
      // Single range: 9-5 Mon-Fri
      for (let day = 0; day <= 6; day++) {
        availabilityRows.push({
          user_id: userId,
          day_of_week: day,
          start_time: "09:00",
          end_time: "17:00",
          is_available: day >= 1 && day <= 5,
        });
      }
    }

    const { error } = await supabase
      .from("availability")
      .insert(availabilityRows);

    if (error) {
      console.error(
        `Error creating availability for ${username}: ${error.message}`
      );
    } else {
      const rangeCount = availabilityRows.filter((r) => r.is_available).length;
      console.log(
        `Created availability for ${username} (${rangeCount} ranges)`
      );
    }
  }

  // Step 5: Create bookings
  console.log("\nCreating bookings...");

  // Helper to find next weekday offset from today
  function findNextWeekday(startOffset: number): number {
    for (let i = startOffset; i < startOffset + 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) return i;
    }
    return startOffset;
  }

  const bookings = [
    // 8 confirmed (future dates)
    {
      username: "priya-sharma",
      etIndex: 0,
      guest: guests[0],
      dateOffset: findNextWeekday(1),
      time: "09:00",
      status: "confirmed",
      notes: "Want to discuss product roadmap",
    },
    {
      username: "priya-sharma",
      etIndex: 0,
      guest: guests[1],
      dateOffset: findNextWeekday(2),
      time: "10:00",
      status: "confirmed",
      notes: null,
    },
    {
      username: "priya-sharma",
      etIndex: 1,
      guest: guests[2],
      dateOffset: findNextWeekday(3),
      time: "14:00",
      status: "confirmed",
      notes: "Quick question about pricing",
    },
    {
      username: "rahul-patel",
      etIndex: 0,
      guest: guests[3],
      dateOffset: findNextWeekday(1),
      time: "11:00",
      status: "confirmed",
      notes: "Need help with go-to-market strategy",
    },
    {
      username: "rahul-patel",
      etIndex: 1,
      guest: guests[4],
      dateOffset: findNextWeekday(2),
      time: "15:00",
      status: "confirmed",
      notes: null,
    },
    {
      username: "rahul-patel",
      etIndex: 2,
      guest: guests[5],
      dateOffset: findNextWeekday(4),
      time: "09:00",
      status: "confirmed",
      notes: "Sprint review for Q1",
    },
    {
      username: "ananya-gupta",
      etIndex: 0,
      guest: guests[6],
      dateOffset: findNextWeekday(1),
      time: "10:00",
      status: "confirmed",
      notes: "Review new dashboard mockups",
    },
    {
      username: "ananya-gupta",
      etIndex: 1,
      guest: guests[7],
      dateOffset: findNextWeekday(3),
      time: "14:00",
      status: "confirmed",
      notes: "Would love to chat about design trends",
    },
    // 5 completed (past dates)
    {
      username: "priya-sharma",
      etIndex: 0,
      guest: guests[8],
      dateOffset: -3,
      time: "09:00",
      status: "completed",
      notes: "Discussed SaaS metrics",
    },
    {
      username: "priya-sharma",
      etIndex: 0,
      guest: guests[9],
      dateOffset: -5,
      time: "11:00",
      status: "completed",
      notes: null,
    },
    {
      username: "rahul-patel",
      etIndex: 0,
      guest: guests[0],
      dateOffset: -2,
      time: "10:00",
      status: "completed",
      notes: "Great session on fundraising",
    },
    {
      username: "rahul-patel",
      etIndex: 1,
      guest: guests[1],
      dateOffset: -7,
      time: "16:00",
      status: "completed",
      notes: null,
    },
    {
      username: "ananya-gupta",
      etIndex: 0,
      guest: guests[2],
      dateOffset: -4,
      time: "13:00",
      status: "completed",
      notes: "Reviewed mobile app designs",
    },
    // 5 cancelled (mix of past and future)
    {
      username: "priya-sharma",
      etIndex: 1,
      guest: guests[3],
      dateOffset: -1,
      time: "15:00",
      status: "cancelled",
      notes: "Had a conflict",
    },
    {
      username: "rahul-patel",
      etIndex: 2,
      guest: guests[4],
      dateOffset: findNextWeekday(5),
      time: "09:00",
      status: "cancelled",
      notes: "Rescheduling to next week",
    },
    {
      username: "ananya-gupta",
      etIndex: 1,
      guest: guests[5],
      dateOffset: -6,
      time: "14:00",
      status: "cancelled",
      notes: null,
    },
    {
      username: "priya-sharma",
      etIndex: 0,
      guest: guests[6],
      dateOffset: findNextWeekday(6),
      time: "10:00",
      status: "cancelled",
      notes: "No longer needed",
    },
    {
      username: "ananya-gupta",
      etIndex: 0,
      guest: guests[7],
      dateOffset: -8,
      time: "11:00",
      status: "cancelled",
      notes: null,
    },
  ];

  for (const b of bookings) {
    const userId = userIds[b.username];
    const etIds = eventTypeIds[b.username];
    if (!userId || !etIds || !etIds[b.etIndex]) continue;

    const eventTypeId = etIds[b.etIndex];
    const eventType = eventTypesMap[b.username][b.etIndex];
    const dateStr = getDateOffset(b.dateOffset);

    const [hours, minutes] = b.time.split(":").map(Number);
    const endHours = hours + Math.floor((minutes + eventType.duration_minutes) / 60);
    const endMinutes = (minutes + eventType.duration_minutes) % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;

    const { error } = await supabase.from("bookings").insert({
      event_type_id: eventTypeId,
      host_id: userId,
      guest_name: b.guest.name,
      guest_email: b.guest.email,
      booking_date: dateStr,
      start_time: makeTimestamptz(dateStr, b.time),
      end_time: makeTimestamptz(dateStr, endTime),
      status: b.status,
      notes: b.notes,
    });

    if (error) {
      console.error(
        `Error creating booking for ${b.guest.name}: ${error.message}`
      );
    } else {
      console.log(
        `Created booking: ${b.guest.name} with ${b.username} on ${dateStr} at ${b.time} (${b.status})`
      );
    }
  }

  console.log("\nSeed completed!");
}

seed().catch(console.error);
