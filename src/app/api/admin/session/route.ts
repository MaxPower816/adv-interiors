import { NextResponse } from "next/server";
import { z } from "zod";
import { clearAdminSession, getAdminPassword, isAdminAuthenticated, setAdminSession } from "@/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = loginSchema.safeParse(payload);

  if (!result.success || result.data.password !== getAdminPassword()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
