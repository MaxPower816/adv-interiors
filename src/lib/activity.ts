import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActivityEvent } from "@/types";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

type CreateActivityInput = Omit<ActivityEvent, "id" | "createdAt">;
type ActivityRow = {
  id: string;
  created_at: string;
  name: string;
  path: string;
  referrer: string | null;
  payload: Record<string, string | number | boolean> | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");
const MAX_EVENTS = 500;

async function ensureStorage() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readActivityFile() {
  try {
    const file = await readFile(ACTIVITY_FILE, "utf8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

async function writeActivityFile(events: ActivityEvent[]) {
  if (process.env.VERCEL) {
    return;
  }

  await ensureStorage();
  await writeFile(ACTIVITY_FILE, `${JSON.stringify(events.slice(0, MAX_EVENTS), null, 2)}\n`, "utf8");
}

function rowToActivity(row: ActivityRow): ActivityEvent {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    path: row.path,
    referrer: row.referrer ?? undefined,
    payload: row.payload ?? undefined,
  };
}

export async function getActivityEvents() {
  if (hasSupabaseConfig()) {
    const rows = await supabaseRequest<ActivityRow[]>("activity_events?select=*&order=created_at.desc&limit=500");
    return rows.map(rowToActivity);
  }

  const events = await readActivityFile();
  return events.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createActivityEvent(input: CreateActivityInput) {
  if (hasSupabaseConfig()) {
    const rows = await supabaseRequest<ActivityRow[]>("activity_events", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: input.name,
        path: input.path,
        referrer: input.referrer ?? null,
        payload: input.payload ?? null,
      }),
    });

    return rowToActivity(rows[0]);
  }

  if (process.env.VERCEL) {
    return {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
  }

  const events = await readActivityFile();
  const event: ActivityEvent = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await writeActivityFile([event, ...events]);
  return event;
}
