import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/crm";

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  objectType: z.string().min(1),
  area: z.string().min(1),
  city: z.string().min(2),
  budget: z.string().min(1),
  service: z.string().min(1),
  startDate: z.string().min(1),
  comment: z.string().optional(),
  agreement: z.boolean(),
  website: z.string().max(0),
  source: z.string().max(120).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  activityTrail: z.array(z.object({
    name: z.string().min(1).max(80),
    path: z.string().min(1).max(400),
    createdAt: z.string().min(1),
    payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  })).max(30).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const result = contactSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  if (result.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { agreement, website, ...leadData } = result.data;
  let lead;

  try {
    lead = await createLead(leadData);
  } catch (error) {
    console.error("[contact lead error]", error);
    const details = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      {
        ok: false,
        message: `Заявка не сохранена. Ошибка базы: ${details.slice(0, 180)}`,
      },
      { status: 500 },
    );
  }

  console.info("[contact lead]", {
    id: lead.id,
    ...leadData,
    agreement,
    website,
    integrations: {
      telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      email: Boolean(process.env.SMTP_HOST),
      crm: Boolean(process.env.CRM_WEBHOOK_URL),
    },
  });

  return NextResponse.json({ ok: true });
}
