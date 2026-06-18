import { NextResponse } from "next/server";
import { hasSupabaseConfig, supabaseRequest } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET() {
  let supabaseLeadsRead = false;
  let supabaseError = "";

  if (hasSupabaseConfig()) {
    try {
      await supabaseRequest("leads?select=id&limit=1");
      supabaseLeadsRead = true;
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : "Unknown Supabase error";
    }
  }

  return NextResponse.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseReady: hasSupabaseConfig(),
    supabaseLeadsRead,
    supabaseError,
  });
}
