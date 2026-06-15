import Image from "next/image";
import type { Project } from "@/types";

export function ProjectGallery({ project }: { project: Project }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {project.images.map((image, index) => (
        <div key={image} className="relative aspect-[4/3] overflow-hidden border border-[#e7e3e0]/12">
          <Image src={image} alt={`${project.title}, изображение ${index + 1}`} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
