import type { SiteContent } from "@/types";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQSection({ faq }: { faq: SiteContent["faq"] }) {
  return (
    <section className="section bg-[#080706]">
      <div className="container grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} />
        <Accordion items={faq.items} />
      </div>
    </section>
  );
}
