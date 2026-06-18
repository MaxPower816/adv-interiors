import { NextResponse } from "next/server";
import { getSupabaseBaseUrl, hasSupabaseConfig, supabaseRequest } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET() {
  let supabaseLeadsRead = false;
  let supabaseError = "";
  let supabaseHost = "";

  if (hasSupabaseConfig()) {
    try {
      supabaseHost = new URL(getSupabaseBaseUrl()).host;
      await supabaseRequest("leads?select=id&limit=1");
      supabaseLeadsRead = true;
    } catch (error) {
      if (error instanceof Error) {
        supabaseError = `${error.name}: ${error.message}`;
        if (error.cause) {
          supabaseError += `; cause: ${String(error.cause)}`;
        }
      } else {
        supabaseError = "Unknown Supabase error";
      }
    }
  }

  return NextResponse.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseReady: hasSupabaseConfig(),
    supabaseLeadsRead,
    supabaseHost,
    supabaseError,
  });
}
