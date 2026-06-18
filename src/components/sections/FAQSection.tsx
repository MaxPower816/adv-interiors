import { sectionStyle } from "@/lib/visual-style";
import type { SiteContent, SiteVisualBlockStyle } from "@/types";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQSection({ faq, visualStyle }: { faq: SiteContent["faq"]; visualStyle?: SiteVisualBlockStyle }) {
  return (
    <section className="section bg-[#080706]" style={sectionStyle(visualStyle)}>
      <div className="container grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} visualStyle={visualStyle} />
        <Accordion items={faq.items} visualStyle={visualStyle} />
      </div>
    </section>
  );
}
