import type { MediaItem } from "@/types";
import { getSupabaseBaseUrl, getSupabaseServiceRoleKey, hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

const MEDIA_BUCKET = "site-media";

type CmsMediaRow = {
  id: string;
  created_at: string;
  title: string;
  url: string;
  alt: string;
  kind: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
};

function rowToMediaItem(row: CmsMediaRow): MediaItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    url: row.url,
    alt: row.alt,
    kind: row.kind,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
  };
}

function getPublicStorageUrl(path: string) {
  return `${getSupabaseBaseUrl()}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

function sanitizeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "jpg";
  const basename = name
    .replace(/\.[^.]+$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${basename || "image"}.${extension}`;
}

async function createMediaRecord(input: Omit<MediaItem, "id" | "createdAt">) {
  const rows = await supabaseRequest<CmsMediaRow[]>("cms_media", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      title: input.title,
      url: input.url,
      alt: input.alt,
      kind: input.kind,
      width: input.width ?? null,
      height: input.height ?? null,
      size_bytes: input.sizeBytes ?? null,
    }),
  });

  return rowToMediaItem(rows[0]);
}

export async function getMediaLibrary() {
  if (!hasSupabaseConfig()) return [];

  const rows = await supabaseRequest<CmsMediaRow[]>("cms_media?select=*&order=created_at.desc&limit=200");
  return rows.map(rowToMediaItem);
}

export async function uploadMediaFile(file: File, input: { title: string; alt: string }) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is required for media uploads.");
  }

  const fileName = sanitizeFileName(file.name);
  const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${fileName}`;
  const response = await fetch(`${getSupabaseBaseUrl()}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceRoleKey(),
      Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase storage upload failed: ${response.status} ${message}`);
  }

  return createMediaRecord({
    title: input.title || fileName,
    url: getPublicStorageUrl(path),
    alt: input.alt || input.title || fileName,
    kind: "image",
    sizeBytes: file.size,
  });
}

export async function deleteMediaItem(id: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is required for media editing.");
  }

  await supabaseRequest(`cms_media?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
