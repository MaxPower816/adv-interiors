"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { sectionStyle, textStyle, titleStyle } from "@/lib/visual-style";
import type { SiteContent, SiteVisualBlockStyle } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StyledText } from "@/components/ui/StyledText";

export function TestimonialsSection({ testimonials, visualStyle }: { testimonials: SiteContent["testimonials"]; visualStyle?: SiteVisualBlockStyle }) {
  const [index, setIndex] = useState(0);
  const item = testimonials.items[index] ?? testimonials.items[0];

  return (
    <section className="section bg-[#11100f]" style={sectionStyle(visualStyle)}>
      <div className="container">
        <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} visualStyle={visualStyle} />
        <div className="mt-12 border-y border-[#e7e3e0]/15 py-10">
          <blockquote className="serif max-w-4xl text-4xl leading-tight md:text-6xl" style={titleStyle(visualStyle)}>“<StyledText text={item.text} visualStyle={visualStyle} />”</blockquote>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <p className="text-[#cbc9c8]" style={textStyle(visualStyle)}>{item.name} · {item.project} · {item.city}</p>
            <div className="flex gap-2">
              <button aria-label="Предыдущий отзыв" className="min-h-11 min-w-11 border border-[#e7e3e0]/20" onClick={() => setIndex((index - 1 + testimonials.items.length) % testimonials.items.length)}><ArrowLeft className="mx-auto h-5 w-5" /></button>
              <button aria-label="Следующий отзыв" className="min-h-11 min-w-11 border border-[#e7e3e0]/20" onClick={() => setIndex((index + 1) % testimonials.items.length)}><ArrowRight className="mx-auto h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
