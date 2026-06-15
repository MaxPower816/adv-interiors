import { NextResponse } from "next/server";
import { z } from "zod";
import { createActivityEvent } from "@/lib/activity";

const activitySchema = z.object({
  name: z.string().min(1).max(80),
  path: z.string().min(1).max(400),
  referrer: z.string().max(400).optional(),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const result = activitySchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (result.data.path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  await createActivityEvent(result.data);
  return NextResponse.json({ ok: true });
}
