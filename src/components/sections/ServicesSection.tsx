"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/utils";
import type { SiteContent } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ServicesSection({ services }: { services: SiteContent["services"] }) {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="section bg-[#11100f]">
      <div className="container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} text={services.text} />
        <div className="mt-12 border-t border-[#e7e3e0]/15">
          {services.items.map((service, index) => (
            <button
              key={service.title}
              className="group grid w-full gap-4 border-b border-[#e7e3e0]/15 py-6 text-left transition hover:pl-3 md:grid-cols-[90px_1fr_1fr]"
              onMouseEnter={() => setActive(index)}
              onClick={() => {
                setActive(index);
                trackEvent("service_open", { service: service.title });
              }}
            >
              <span className="text-sm text-[#a69c96]">{String(index + 1).padStart(2, "0")}</span>
              <span className="serif text-4xl md:text-5xl">{service.title}</span>
              <span className="self-center leading-7 text-[#cbc9c8]">{active === index ? service.text : ""}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
