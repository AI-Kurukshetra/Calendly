import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revokeToken } from "@/lib/google/calendar";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use service role to access tokens
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: token } = await serviceClient
    .from("google_tokens")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (token) {
    // Revoke the token with Google (best-effort)
    await revokeToken(token.access_token).catch(() => {});

    // Delete from database
    await serviceClient
      .from("google_tokens")
      .delete()
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
