const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseBaseUrl() {
  if (!SUPABASE_URL) {
    throw new Error("Supabase URL is not configured.");
  }

  return SUPABASE_URL
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
}

function getSupabaseRestUrl(path: string) {
  const baseUrl = getSupabaseBaseUrl();

  return `${baseUrl}/rest/v1/${path}`;
}

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseServiceRoleKey() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role key is not configured.");
  }

  return SUPABASE_SERVICE_ROLE_KEY;
}

type SupabaseRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export async function supabaseRequest<T>(path: string, init?: SupabaseRequestInit) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { cache, next, ...requestInit } = init ?? {};

  const response = await fetch(getSupabaseRestUrl(path), {
    ...requestInit,
    cache: cache ?? "no-store",
    next,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(requestInit.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
