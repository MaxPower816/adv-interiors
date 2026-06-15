import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getActivityEvents } from "@/lib/activity";
import { getLeads, updateLead } from "@/lib/crm";

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "contact", "brief-scheduled", "brief-done", "proposal", "thinking", "contract", "refused", "closed", "in-progress", "waiting"]).optional(),
  managerNote: z.string().max(3000).optional(),
  nextAction: z.string().max(500).optional(),
  nextActionAt: z.string().max(80).optional(),
  potentialValue: z.string().max(120).optional(),
  lostReason: z.string().max(500).optional(),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, activity: await getActivityEvents(), leads: await getLeads() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = await request.json();
  const result = updateSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  const { id, ...patch } = result.data;
  const lead = await updateLead(id, patch);

  if (!lead) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}
