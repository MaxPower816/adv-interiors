"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BeforeAfterSection() {
  const [value, setValue] = useState(52);

  return (
    <section className="section bg-[#0b0a09]">
      <div className="container">
        <SectionHeading eyebrow="Before / After" title={"От пустого пространства\nдо продуманного сценария жизни."} />
        <div className="relative mt-12 aspect-[16/9] overflow-hidden border border-[#e7e3e0]/12" onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setValue(Math.round(((event.clientX - rect.left) / rect.width) * 100));
        }}>
          <div className="absolute inset-0 bg-[#69635d]" />
          <div className="absolute inset-0 image-surface" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }} />
          <input aria-label="Сравнить до и после" className="absolute inset-x-6 bottom-6 z-10 w-[calc(100%-48px)]" type="range" min={5} max={95} value={value} onChange={(e) => setValue(Number(e.target.value))} />
          <div className="absolute bottom-0 top-0 w-px bg-[#e7e3e0]" style={{ left: `${value}%` }} />
        </div>
      </div>
    </section>
  );
}
