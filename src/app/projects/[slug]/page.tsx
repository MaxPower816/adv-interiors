import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { siteConfig } from "@/config/site";
import { projects } from "@/content/projects";
import { getProjectBySlug, getPublishedProjects } from "@/lib/cms";

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Проект" };
  }

  const title = project.seoTitle || `${project.title}: дизайн интерьера ${project.type.toLowerCase()} ${project.area}`;
  const description = project.seoDescription || `${project.description} Проект ${project.type.toLowerCase()} ${project.area}, ${project.city}: ${project.works.join(", ")}.`;
  const url = `${siteConfig.url}/projects/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "article",
      locale: "ru_RU",
      images: [{ url: project.cover, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.cover],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const publishedProjects = await getPublishedProjects();
  const projectIndex = publishedProjects.findIndex((item) => item.slug === project.slug);
  const nextProject = publishedProjects[(projectIndex + 1) % publishedProjects.length] ?? publishedProjects[0] ?? project;
  const challenge = project.challenge || "Концепция строится вокруг повседневных сценариев, света и спокойной материальности.";
  const solution = project.solution || "Планировка поддерживает приватность и мягкую коммуникацию между зонами.";
  const materials = project.materials || "Материалы: натуральный шпон, камень, тактильный текстиль, теплый металл и матовые поверхности.";
  const result = project.result || "Результат: интерьер выглядит собранным, но не перегруженным, и сохраняет запас для жизни клиента.";
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${siteConfig.url}/projects/${project.slug}`,
    image: `${siteConfig.url}${project.cover}`,
    creator: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: `Дизайн интерьера: ${project.type}, ${project.area}, ${project.city}`,
    keywords: project.works.join(", "),
  };

  return (
    <>
      <Header />
      <main className="bg-[#080706] pt-24">
        <section className="section">
          <div className="container">
            <Link href="/#portfolio" className="text-sm text-[#cbc9c8]">← Все проекты</Link>
            <div className="mt-8 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#a69c96]">{project.city} / {project.area} / {project.year}</p>
                <h1 className="serif mt-4 text-[clamp(4rem,10vw,9rem)] leading-none">{project.title}</h1>
              </div>
              <p className="text-lg leading-8 text-[#cbc9c8]">{project.description}</p>
            </div>
            <div className="relative mt-12 aspect-[16/9] overflow-hidden border border-[#e7e3e0]/12">
              <Image src={project.cover} alt={project.title} fill className="object-cover" priority />
            </div>
          </div>
        </section>
        <section className="section bg-[#0b0a09]">
          <div className="container grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="serif text-5xl">Задача и решение</h2>
              <ul className="mt-8 grid gap-3 text-[#cbc9c8]">{project.works.map((work) => <li key={work}>— {work}</li>)}</ul>
            </div>
            <div className="grid gap-6 text-[#cbc9c8]">
              <p>{challenge}</p>
              <p>{solution}</p>
              <p>{materials}</p>
              <p>{result}</p>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <ProjectGallery project={project} />
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
              <Link href={`/projects/${nextProject.slug}`} className="serif text-4xl">Следующий проект: {nextProject.title}</Link>
              <Link className="inline-flex min-h-11 items-center justify-center border border-[#e7e3e0]/22 bg-[#080706]/62 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#e7e3e0] backdrop-blur-md transition duration-300 hover:border-[#e7e3e0]/42 hover:bg-[#e7e3e0]/10" href="/#contact">
                Хочу похожий проект
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Script id={`project-schema-${project.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }} />
    </>
  );
}
