import type { SiteContent } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProcessSection({ process }: { process: SiteContent["process"] }) {
  return (
    <section id="process" className="section bg-[#080706]">
      <div className="container">
        <SectionHeading eyebrow={process.eyebrow} title={process.title} text={process.text} />
        <div className="relative mt-14 grid gap-0 border-l border-[#e7e3e0]/18 pl-7">
          {process.steps.map((step, index) => (
            <div key={`${step.title}-${index}`} className="relative grid gap-4 border-b border-[#e7e3e0]/12 py-6 md:grid-cols-[120px_1fr_0.8fr]">
              <span className="absolute -left-[34px] top-8 h-3 w-3 rounded-full bg-[#e7e3e0]" />
              <span className="text-sm text-[#a69c96]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="serif text-3xl">{step.title}</h3>
              <p className="leading-7 text-[#cbc9c8]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
