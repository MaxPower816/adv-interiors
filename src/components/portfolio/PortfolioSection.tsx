import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedProjects } from "@/lib/cms";
import { sectionStyle } from "@/lib/visual-style";
import type { SiteVisualBlockStyle } from "@/types";
import { PortfolioTrack } from "./PortfolioTrack";

export async function PortfolioSection({ visualStyle }: { visualStyle?: SiteVisualBlockStyle }) {
  const projects = await getPublishedProjects();

  return (
    <section id="portfolio" className="section bg-[#0b0a09]" style={sectionStyle(visualStyle)}>
      <div className="container">
        <SectionHeading
          eyebrow="Portfolio"
          title={"Пространства, которые\nуже стали чьей-то жизнью."}
          text="Избранные проекты жилых и общественных интерьеров."
          visualStyle={visualStyle}
        />
        <PortfolioTrack projects={projects} />
      </div>
    </section>
  );
}
