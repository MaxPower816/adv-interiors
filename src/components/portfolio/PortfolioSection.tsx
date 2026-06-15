import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioTrack } from "./PortfolioTrack";

export function PortfolioSection() {
  return (
    <section id="portfolio" className="section bg-[#0b0a09]">
      <div className="container">
        <SectionHeading
          eyebrow="Portfolio"
          title={"Пространства, которые\nуже стали чьей-то жизнью."}
          text="Избранные проекты жилых и общественных интерьеров."
        />
        <PortfolioTrack />
      </div>
    </section>
  );
}
