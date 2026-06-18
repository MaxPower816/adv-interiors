import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminSiteContent, saveSiteContent } from "@/lib/cms";

const statSchema = z.object({
  value: z.number(),
  suffix: z.string().max(40),
  label: z.string().min(1).max(120),
});

const siteContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(160),
    title: z.string().min(1).max(240),
    subtitle: z.string().min(1).max(360),
    cta: z.string().min(1).max(120),
    finalCta: z.string().min(1).max(120),
  }),
  about: z.object({
    title: z.string().min(1).max(240),
    text: z.string().min(1).max(700),
    stats: z.array(statSchema).min(1).max(8),
  }),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, content: await getAdminSiteContent() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = await request.json();
  const result = siteContentSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  const content = await saveSiteContent(result.data);
  return NextResponse.json({ ok: true, content });
}
