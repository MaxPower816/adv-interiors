import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseReady: hasSupabaseConfig(),
  });
}
