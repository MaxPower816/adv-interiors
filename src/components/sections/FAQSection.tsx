import { faq } from "@/content/faq";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQSection() {
  return (
    <section className="section bg-[#080706]">
      <div className="container grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <SectionHeading eyebrow="FAQ" title="Частые вопросы" />
        <Accordion items={faq} />
      </div>
    </section>
  );
}
