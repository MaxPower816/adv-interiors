"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types";
import { trackEvent } from "@/lib/utils";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="group relative h-[72vh] min-h-[520px] w-[82vw] shrink-0 overflow-hidden border border-[#e7e3e0]/12 md:w-[46vw]">
      <Image src={project.cover} alt={project.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-[#050505]/20" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#a69c96]">{String(index + 1).padStart(2, "0")} / {project.city} / {project.area}</p>
        <h3 className="serif mt-3 text-5xl leading-none">{project.title}</h3>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#cbc9c8]">{project.description}</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center border border-[#e7e3e0]/25 px-4 text-xs uppercase tracking-[0.16em]"
          href={`/projects/${project.slug}`}
          onClick={() => trackEvent("portfolio_open", { slug: project.slug })}
        >
          Открыть проект
        </Link>
      </div>
    </article>
  );
}
