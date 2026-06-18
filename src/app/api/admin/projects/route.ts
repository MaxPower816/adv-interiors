import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteProject, getAdminProjects, saveProject } from "@/lib/cms";

const projectSchema = z.object({
  id: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
  slug: z.string().min(1).max(140),
  title: z.string().min(1).max(180),
  city: z.string().max(120),
  area: z.string().max(80),
  year: z.string().max(20),
  type: z.string().max(120),
  description: z.string().max(1600),
  challenge: z.string().max(1600).optional(),
  solution: z.string().max(1600).optional(),
  materials: z.string().max(1600).optional(),
  result: z.string().max(1600).optional(),
  works: z.array(z.string().min(1).max(140)).max(30),
  cover: z.string().max(800),
  images: z.array(z.string().min(1).max(800)).max(40),
  layout: z.string().max(800),
  characteristics: z.record(z.string(), z.string()),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(300).optional(),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, projects: await getAdminProjects() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = await request.json();
  const result = projectSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  const project = await saveProject(result.data);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/projects/${project.slug}`);
  return NextResponse.json({ ok: true, project });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await request.json() as { id?: string };

  if (!id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await deleteProject(id);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
