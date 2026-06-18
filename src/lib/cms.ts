import type { Project } from "@/types";
import { projects as fallbackProjects } from "@/content/projects";
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
  works: string[];
  cover: string;
  images: string[];
  layout: string;
  characteristics: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
};

export type ProjectPatch = Omit<Project, "id"> & {
  id?: string;
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

export async function getPublishedProjects() {
  if (!hasSupabaseConfig()) return fallbackProjects;

  try {
    const rows = await supabaseRequest<CmsProjectRow[]>("cms_projects?select=*&published=eq.true&order=sort_order.asc,created_at.desc");
    return rows.length ? rows.map(rowToProject) : fallbackProjects;
  } catch (error) {
    console.error("[cms projects fallback]", error);
    return fallbackProjects;
  }
}

export async function getAdminProjects() {
  if (!hasSupabaseConfig()) return fallbackProjects;

  const rows = await supabaseRequest<CmsProjectRow[]>("cms_projects?select=*&order=sort_order.asc,created_at.desc");
  return rows.length ? rows.map(rowToProject) : fallbackProjects;
}

export async function getProjectBySlug(slug: string) {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
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
