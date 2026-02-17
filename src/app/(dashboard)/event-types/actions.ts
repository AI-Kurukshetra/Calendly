"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";

export async function createEventType(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const duration_minutes = parseInt(formData.get("duration_minutes") as string);
  const location_type = formData.get("location_type") as string;
  const color = formData.get("color") as string;

  if (!title || !duration_minutes || !location_type || !color) {
    return { error: "Please fill in all required fields" };
  }

  const slug = generateSlug(title);

  const { error } = await supabase.from("event_types").insert({
    user_id: user.id,
    title,
    slug,
    description,
    duration_minutes,
    location_type,
    color,
    is_active: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "An event type with this name already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/event-types");
  redirect("/event-types");
}

export async function updateEventType(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const duration_minutes = parseInt(formData.get("duration_minutes") as string);
  const location_type = formData.get("location_type") as string;
  const color = formData.get("color") as string;

  if (!title || !duration_minutes || !location_type || !color) {
    return { error: "Please fill in all required fields" };
  }

  const slug = generateSlug(title);

  const { error } = await supabase
    .from("event_types")
    .update({ title, slug, description, duration_minutes, location_type, color })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "An event type with this name already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/event-types");
  return { success: true };
}

export async function deleteEventType(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("event_types")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/event-types");
  return { success: true };
}

export async function toggleEventTypeActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("event_types")
    .update({ is_active })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/event-types");
  return { success: true };
}
