import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lead, LeadStatus } from "@/types";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

type CreateLeadInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "status" | "managerNote">;
type LeadPatch = {
  status?: LeadStatus;
  managerNote?: string;
  nextAction?: string;
  nextActionAt?: string;
  potentialValue?: string;
  lostReason?: string;
};

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  object_type: string;
  area: string;
  city: string;
  budget: string;
  service: string;
  start_date: string;
  comment: string | null;
  manager_note: string | null;
  source: string | null;
  utm: Record<string, string> | null;
  activity_trail: Lead["activityTrail"] | null;
  next_action: string | null;
  next_action_at: string | null;
  potential_value: string | null;
  lost_reason: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

async function ensureStorage() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readLeadsFile() {
  try {
    const file = await readFile(LEADS_FILE, "utf8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    return [];
  }
}

async function writeLeadsFile(leads: Lead[]) {
  await ensureStorage();
  await writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    name: row.name,
    phone: row.phone,
    email: row.email,
    objectType: row.object_type,
    area: row.area,
    city: row.city,
    budget: row.budget,
    service: row.service,
    startDate: row.start_date,
    comment: row.comment ?? undefined,
    managerNote: row.manager_note ?? undefined,
    source: row.source ?? undefined,
    utm: row.utm ?? undefined,
    activityTrail: row.activity_trail ?? undefined,
    nextAction: row.next_action ?? undefined,
    nextActionAt: row.next_action_at ?? undefined,
    potentialValue: row.potential_value ?? undefined,
    lostReason: row.lost_reason ?? undefined,
  };
}

function leadInputToRow(input: CreateLeadInput) {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    object_type: input.objectType,
    area: input.area,
    city: input.city,
    budget: input.budget,
    service: input.service,
    start_date: input.startDate,
    comment: input.comment ?? null,
    source: input.source ?? null,
    utm: input.utm ?? null,
    activity_trail: input.activityTrail ?? null,
    status: "new" satisfies LeadStatus,
    manager_note: "",
    next_action: input.nextAction ?? "Связаться с клиентом",
  };
}

function leadPatchToRow(patch: LeadPatch) {
  return {
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.managerNote !== undefined ? { manager_note: patch.managerNote } : {}),
    ...(patch.nextAction !== undefined ? { next_action: patch.nextAction } : {}),
    ...(patch.nextActionAt !== undefined ? { next_action_at: patch.nextActionAt || null } : {}),
    ...(patch.potentialValue !== undefined ? { potential_value: patch.potentialValue } : {}),
    ...(patch.lostReason !== undefined ? { lost_reason: patch.lostReason } : {}),
    updated_at: new Date().toISOString(),
  };
}

export async function getLeads() {
  if (hasSupabaseConfig()) {
    const rows = await supabaseRequest<LeadRow[]>("leads?select=*&order=created_at.desc");
    return rows.map(rowToLead);
  }

  const leads = await readLeadsFile();
  return leads.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createLead(input: CreateLeadInput) {
  if (hasSupabaseConfig()) {
    const rows = await supabaseRequest<LeadRow[]>("leads", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(leadInputToRow(input)),
    });

    return rowToLead(rows[0]);
  }

  if (process.env.VERCEL) {
    throw new Error("Supabase environment variables are not available in this Vercel deployment.");
  }

  const leads = await readLeadsFile();
  const now = new Date().toISOString();
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now,
    managerNote: "",
    nextAction: "Связаться с клиентом",
  };

  await writeLeadsFile([lead, ...leads]);
  return lead;
}

export async function updateLead(id: string, patch: LeadPatch) {
  if (hasSupabaseConfig()) {
    const rows = await supabaseRequest<LeadRow[]>(`leads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(leadPatchToRow(patch)),
    });

    return rows[0] ? rowToLead(rows[0]) : null;
  }

  if (process.env.VERCEL) {
    throw new Error("Supabase environment variables are not available in this Vercel deployment.");
  }

  const leads = await readLeadsFile();
  let updatedLead: Lead | null = null;
  const updatedLeads = leads.map((lead) => {
    if (lead.id !== id) return lead;

    updatedLead = {
      ...lead,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return updatedLead;
  });

  if (!updatedLead) return null;

  await writeLeadsFile(updatedLeads);
  return updatedLead;
}
