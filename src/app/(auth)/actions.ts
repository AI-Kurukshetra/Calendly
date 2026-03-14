"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("full_name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullName || !username || !email || !password) {
    return { error: "All fields are required." };
  }

  // Validate username format
  if (!/^[a-z0-9-]+$/.test(username)) {
    return {
      error:
        "Username can only contain lowercase letters, numbers, and hyphens.",
    };
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }

  // Check if username is already taken
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existingProfile) {
    return { error: "This username is already taken." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, session will be null
  // Redirect to a page telling the user to check their email
  if (!data.session) {
    redirect("/signup/confirm-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
