import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project ? `${project.title} — ADV INTERIORS` : "Проект" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];

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
              <p>Концепция строится вокруг повседневных сценариев, света и спокойной материальности. Планировка поддерживает приватность и мягкую коммуникацию между зонами.</p>
              <p>Материалы: натуральный шпон, камень, тактильный текстиль, теплый металл и матовые поверхности.</p>
              <p>Результат: интерьер выглядит собранным, но не перегруженным, и сохраняет запас для жизни клиента.</p>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <ProjectGallery project={project} />
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
              <Link href={`/projects/${nextProject.slug}`} className="serif text-4xl">Следующий проект: {nextProject.title}</Link>
              <Link className="inline-flex min-h-11 items-center justify-center border border-[#e7e3e0]/40 bg-[#e7e3e0] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#080706]" href="/#contact">
                Хочу похожий проект
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
