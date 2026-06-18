"use client";

import { motion } from "framer-motion";
import { sectionStyle, textStyle, titleStyle } from "@/lib/visual-style";
import type { SiteContent, SiteVisualBlockStyle } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutSection({ about, visualStyle }: { about: SiteContent["about"]; visualStyle?: SiteVisualBlockStyle }) {
  return (
    <section className="section bg-[#080706]" style={sectionStyle(visualStyle)}>
      <div className="container grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div
          className={`aspect-[4/5] border border-[#e7e3e0]/12 bg-cover bg-center ${about.image ? "" : "image-surface"}`}
          style={about.image ? { backgroundImage: `url(${about.image})` } : undefined}
          aria-label="Фотография дизайнера"
        />
        <div>
          <SectionHeading eyebrow="Philosophy" title={about.title} text={about.text} visualStyle={visualStyle} />
          <div className="mt-10 grid grid-cols-2 gap-px bg-[#e7e3e0]/12">
            {about.stats.map((stat) => (
              <div key={stat.label} className="bg-[#080706] p-5">
                <motion.div className="serif text-4xl" style={titleStyle(visualStyle)} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  {stat.value.toLocaleString("ru-RU")}{stat.suffix}
                </motion.div>
                <p className="mt-2 text-sm text-[#cbc9c8]" style={textStyle(visualStyle)}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
