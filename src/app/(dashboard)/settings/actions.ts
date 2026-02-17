"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  full_name: string;
  bio: string | null;
  timezone: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!data.full_name.trim()) {
    return { error: "Full name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name.trim(),
      bio: data.bio?.trim() || null,
      timezone: data.timezone,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
