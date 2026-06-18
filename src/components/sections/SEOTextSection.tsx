import type { SiteContent } from "@/types";

export function SEOTextSection({ content }: { content: SiteContent["seoBlock"] }) {
  return (
    <section className="section bg-[#0b0a09]">
      <div className="container grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#a69c96]">{content.eyebrow}</p>
          <h2 className="serif whitespace-pre-line text-[clamp(2.4rem,6vw,5.8rem)] font-medium leading-[0.94] text-[#e7e3e0]">{content.title}</h2>
        </div>
        <div className="text-[#cbc9c8]">
          <p className="text-base leading-8 md:text-lg">{content.text}</p>
          <ul className="mt-7 grid gap-3 text-sm leading-7 md:text-base">
            {content.items.map((item) => (
              <li key={item} className="border-t border-[#e7e3e0]/12 pt-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
