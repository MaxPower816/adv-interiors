import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminSiteContent, saveSiteContent } from "@/lib/cms";

const statSchema = z.object({
  value: z.number(),
  suffix: z.string().max(40),
  label: z.string().min(1).max(120),
});

const serviceSchema = z.object({
  title: z.string().min(1).max(160),
  text: z.string().min(1).max(500),
});

const processStepSchema = z.object({
  title: z.string().min(1).max(160),
  text: z.string().min(1).max(500),
});

const testimonialSchema = z.object({
  name: z.string().min(1).max(120),
  project: z.string().max(160),
  city: z.string().max(120),
  text: z.string().min(1).max(900),
});

const objectTypeSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  min: z.string().max(120),
  note: z.string().max(300),
});

const pricePlanSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  price: z.string().max(120),
  duration: z.string().max(120),
  features: z.array(z.string().min(1).max(220)).max(20),
});

const siteContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(160),
    title: z.string().min(1).max(240),
    subtitle: z.string().min(1).max(360),
    cta: z.string().min(1).max(120),
    finalCta: z.string().min(1).max(120),
  }),
  about: z.object({
    title: z.string().min(1).max(240),
    text: z.string().min(1).max(700),
    image: z.string().max(800),
    stats: z.array(statSchema).min(1).max(8),
  }),
  seo: z.object({
    title: z.string().min(1).max(180),
    description: z.string().min(1).max(320),
    keywords: z.array(z.string().min(1).max(80)).max(30),
    ogImage: z.string().max(800),
  }),
  services: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(220),
    text: z.string().max(400),
    items: z.array(serviceSchema).min(1).max(20),
  }),
  process: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(220),
    text: z.string().max(400),
    steps: z.array(processStepSchema).min(1).max(20),
  }),
  seoBlock: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(260),
    text: z.string().min(1).max(1400),
    items: z.array(z.string().min(1).max(260)).max(20),
  }),
  beforeAfter: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(260),
    beforeImage: z.string().max(800),
    afterImage: z.string().max(800),
  }),
  testimonials: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(220),
    items: z.array(testimonialSchema).min(1).max(30),
  }),
  pricing: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(220),
    backgroundImage: z.string().max(800),
    objectTypes: z.array(objectTypeSchema).min(1).max(10),
    plans: z.array(pricePlanSchema).min(1).max(12),
  }),
  faq: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(220),
    items: z.array(z.tuple([z.string().min(1).max(260), z.string().min(1).max(1000)])).max(30),
  }),
  contact: z.object({
    eyebrow: z.string().max(120),
    title: z.string().min(1).max(260),
    text: z.string().min(1).max(600),
    successTitle: z.string().min(1).max(160),
    successText: z.string().min(1).max(500),
  }),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, content: await getAdminSiteContent() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = await request.json();
  const result = siteContentSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  const content = await saveSiteContent(result.data);
  revalidatePath("/");
  return NextResponse.json({ ok: true, content });
}
