import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActivityEvent } from "@/types";

type CreateActivityInput = Omit<ActivityEvent, "id" | "createdAt">;

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
  await ensureStorage();
  await writeFile(ACTIVITY_FILE, `${JSON.stringify(events.slice(0, MAX_EVENTS), null, 2)}\n`, "utf8");
}

export async function getActivityEvents() {
  const events = await readActivityFile();
  return events.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createActivityEvent(input: CreateActivityInput) {
  const events = await readActivityFile();
  const event: ActivityEvent = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await writeActivityFile([event, ...events]);
  return event;
}
