import { projects } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

export function PortfolioTrack() {
  return (
    <div className="dark-scrollbar -mx-5 mt-12 flex gap-4 overflow-x-auto px-5 pb-6 md:-mx-16 md:px-16">
      {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
    </div>
  );
}
