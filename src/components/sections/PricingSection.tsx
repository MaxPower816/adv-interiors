"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/utils";
import type { SiteContent } from "@/types";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PricingSection({ pricing }: { pricing: SiteContent["pricing"] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeType = pricing.objectTypes[activeIndex] ?? pricing.objectTypes[0];

  return (
    <section
      id="pricing"
      className={`section bg-cover bg-center ${pricing.backgroundImage ? "" : "image-surface"}`}
      style={pricing.backgroundImage ? { backgroundImage: `url(${pricing.backgroundImage})` } : undefined}
    >
      <div className="absolute inset-0 bg-[#050505]/60" />
      <div className="container relative">
        <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} text={`${activeType?.note ?? ""} Минимальная стоимость проекта — ${activeType?.min ?? ""}.`} />
        <div className="mt-8 flex flex-wrap gap-2">
          {pricing.objectTypes.map((item, index) => (
            <button key={item.key || item.label} className={`min-h-11 border px-4 text-sm ${activeIndex === index ? "bg-[#e7e3e0] text-[#080706]" : "border-[#e7e3e0]/20"}`} onClick={() => setActiveIndex(index)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-px overflow-hidden border border-[#e7e3e0]/15 bg-[#e7e3e0]/15 md:grid-cols-4">
          {pricing.plans.map((plan) => (
            <article key={plan.id} className="bg-[#080706]/80 p-6 backdrop-blur">
              <h3 className="serif text-4xl">{plan.title}</h3>
              <p className="mt-5 text-xl">{plan.price}</p>
              <p className="mt-2 text-sm text-[#a69c96]">{plan.duration}</p>
              <ul className="mt-6 grid gap-3 text-sm leading-6 text-[#cbc9c8]">
                {plan.features.map((feature) => <li key={feature}>— {feature}</li>)}
              </ul>
              <Button className="mt-8 w-full" onClick={() => {
                trackEvent("price_select", { plan: plan.title });
                window.dispatchEvent(new CustomEvent("pricing:selected", { detail: plan.title }));
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Выбрать тариф
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
