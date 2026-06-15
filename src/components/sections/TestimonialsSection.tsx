"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { testimonials } from "@/content/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const item = testimonials[index];

  return (
    <section className="section bg-[#11100f]">
      <div className="container">
        <SectionHeading eyebrow="Voices" title="Отзывы клиентов" />
        <div className="mt-12 border-y border-[#e7e3e0]/15 py-10">
          <blockquote className="serif max-w-4xl text-4xl leading-tight md:text-6xl">“{item.text}”</blockquote>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <p className="text-[#cbc9c8]">{item.name} · {item.project} · {item.city}</p>
            <div className="flex gap-2">
              <button aria-label="Предыдущий отзыв" className="min-h-11 min-w-11 border border-[#e7e3e0]/20" onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)}><ArrowLeft className="mx-auto h-5 w-5" /></button>
              <button aria-label="Следующий отзыв" className="min-h-11 min-w-11 border border-[#e7e3e0]/20" onClick={() => setIndex((index + 1) % testimonials.length)}><ArrowRight className="mx-auto h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
