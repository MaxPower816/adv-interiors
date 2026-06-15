import { processSteps } from "@/content/site-content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProcessSection() {
  return (
    <section id="process" className="section bg-[#080706]">
      <div className="container">
        <SectionHeading eyebrow="Process" title="Путь от брифа до пространства" text="Каждый этап фиксирует решения и снижает неопределенность ремонта." />
        <div className="relative mt-14 grid gap-0 border-l border-[#e7e3e0]/18 pl-7">
          {processSteps.map((step, index) => (
            <div key={step} className="relative grid gap-4 border-b border-[#e7e3e0]/12 py-6 md:grid-cols-[120px_1fr_0.8fr]">
              <span className="absolute -left-[34px] top-8 h-3 w-3 rounded-full bg-[#e7e3e0]" />
              <span className="text-sm text-[#a69c96]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="serif text-3xl">{step}</h3>
              <p className="leading-7 text-[#cbc9c8]">Мягкая синхронизация задач, визуальных решений и технических ограничений.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
