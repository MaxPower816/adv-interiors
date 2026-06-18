import type { Project, SiteContent } from "@/types";
import { projects as fallbackProjects } from "@/content/projects";
import { aboutContent, heroCopy } from "@/content/site-content";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

type CmsProjectRow = {
  id: string;
  published: boolean;
  sort_order: number;
  slug: string;
  title: string;
  city: string;
  area: string;
  year: string;
  type: string;
  description: string;
  challenge: string | null;
  solution: string | null;
  materials: string | null;
  result: string | null;
  works: string[];
  cover: string;
  images: string[];
  layout: string;
  characteristics: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
};

type CmsContentBlockRow = {
  id: string;
  payload: SiteContent;
};

export type ProjectPatch = Omit<Project, "id"> & {
  id?: string;
};

export const defaultSiteContent: SiteContent = {
  hero: heroCopy,
  about: aboutContent,
};

function rowToProject(row: CmsProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    city: row.city,
    area: row.area,
    year: row.year,
    type: row.type,
    description: row.description,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    materials: row.materials ?? undefined,
    result: row.result ?? undefined,
    works: Array.isArray(row.works) ? row.works : [],
    cover: row.cover || "/images/interior-placeholder.svg",
    images: Array.isArray(row.images) ? row.images : [],
    layout: row.layout || "/images/plan-placeholder.svg",
    characteristics: row.characteristics ?? {},
    published: row.published,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
  };
}

function projectToRow(project: ProjectPatch) {
  return {
    published: project.published ?? true,
    sort_order: project.sortOrder ?? 0,
    slug: project.slug,
    title: project.title,
    city: project.city,
    area: project.area,
    year: project.year,
    type: project.type,
    description: project.description,
    challenge: project.challenge ?? null,
    solution: project.solution ?? null,
    materials: project.materials ?? null,
    result: project.result ?? null,
    works: project.works,
    cover: project.cover,
    images: project.images,
    layout: project.layout,
    characteristics: project.characteristics,
    seo_title: project.seoTitle ?? null,
    seo_description: project.seoDescription ?? null,
    updated_at: new Date().toISOString(),
  };
}

function withFallbackProjects(projects: Project[]) {
  const cmsSlugs = new Set(projects.map((project) => project.slug));
  const missingFallbackProjects = fallbackProjects
    .filter((project) => !cmsSlugs.has(project.slug))
    .map((project, index) => ({
      ...project,
      published: project.published ?? true,
      sortOrder: project.sortOrder ?? projects.length + index,
    }));

  return [...projects, ...missingFallbackProjects];
}

export async function getPublishedProjects() {
  if (!hasSupabaseConfig()) return fallbackProjects;

  try {
    const rows = await supabaseRequest<CmsProjectRow[]>("cms_projects?select=*&published=eq.true&order=sort_order.asc,created_at.desc", {
      cache: "force-cache",
      next: { revalidate: 60 },
    });
    return rows.length ? rows.map(rowToProject) : fallbackProjects;
  } catch (error) {
    console.error("[cms projects fallback]", error);
    return fallbackProjects;
  }
}

export async function getAdminProjects() {
  if (!hasSupabaseConfig()) return fallbackProjects;

  try {
    const rows = await supabaseRequest<CmsProjectRow[]>("cms_projects?select=*&order=sort_order.asc,created_at.desc");
    return withFallbackProjects(rows.map(rowToProject));
  } catch (error) {
    console.error("[cms admin projects fallback]", error);
    return fallbackProjects;
  }
}

export async function getProjectBySlug(slug: string) {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getSiteContent() {
  if (!hasSupabaseConfig()) return defaultSiteContent;

  try {
    const rows = await supabaseRequest<CmsContentBlockRow[]>("cms_content_blocks?id=eq.site&select=id,payload", {
      cache: "force-cache",
      next: { revalidate: 60 },
    });
    return rows[0]?.payload ?? defaultSiteContent;
  } catch (error) {
    console.error("[cms site content fallback]", error);
    return defaultSiteContent;
  }
}

export async function getAdminSiteContent() {
  if (!hasSupabaseConfig()) return defaultSiteContent;

  try {
    const rows = await supabaseRequest<CmsContentBlockRow[]>("cms_content_blocks?id=eq.site&select=id,payload");
    return rows[0]?.payload ?? defaultSiteContent;
  } catch (error) {
    console.error("[cms admin content fallback]", error);
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is required for CMS content editing.");
  }

  const rows = await supabaseRequest<CmsContentBlockRow[]>("cms_content_blocks?id=eq.site", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      payload: content,
      updated_at: new Date().toISOString(),
    }),
  });

  if (rows[0]) return rows[0].payload;

  const insertedRows = await supabaseRequest<CmsContentBlockRow[]>("cms_content_blocks", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      id: "site",
      payload: content,
    }),
  });

  return insertedRows[0].payload;
}

export async function saveProject(project: ProjectPatch) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is required for CMS project editing.");
  }

  if (project.id) {
    const rows = await supabaseRequest<CmsProjectRow[]>(`cms_projects?id=eq.${encodeURIComponent(project.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(projectToRow(project)),
    });

    return rowToProject(rows[0]);
  }

  const rows = await supabaseRequest<CmsProjectRow[]>("cms_projects", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(projectToRow(project)),
  });

  return rowToProject(rows[0]);
}

export async function deleteProject(id: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is required for CMS project editing.");
  }

  await supabaseRequest(`cms_projects?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
