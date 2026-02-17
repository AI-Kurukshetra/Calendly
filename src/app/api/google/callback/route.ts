import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/google/calendar";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user ID
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL("/settings?google=denied", appUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?google=error", appUrl)
    );
  }

  // Verify the user is authenticated and matches state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
    return NextResponse.redirect(
      new URL("/settings?google=error", appUrl)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);
    const tokenExpiry = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    // Use service role to upsert tokens (bypasses RLS)
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await serviceClient
      .from("google_tokens")
      .upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokenExpiry,
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("Failed to store Google tokens:", dbError);
      return NextResponse.redirect(
        new URL("/settings?google=error", appUrl)
      );
    }

    return NextResponse.redirect(
      new URL("/settings?google=connected", appUrl)
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?google=error", appUrl)
    );
  }
}
