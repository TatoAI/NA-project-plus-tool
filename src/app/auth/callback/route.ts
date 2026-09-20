import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email-confirmation link lands here; exchange the code for a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Could not confirm your email.")}`);
}
