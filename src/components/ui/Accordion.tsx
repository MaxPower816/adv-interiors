"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-[#e7e3e0]/15">
      {items.map(([question, answer], index) => (
        <div key={question} className="border-b border-[#e7e3e0]/15">
          <button
            className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left text-lg text-[#e7e3e0]"
            aria-expanded={open === index}
            onClick={() => setOpen(open === index ? -1 : index)}
          >
            <span>{question}</span>
            <ChevronDown className={cn("h-5 w-5 shrink-0 transition", open === index && "rotate-180")} aria-hidden />
          </button>
          <div className={cn("grid transition-all duration-300", open === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <p className="overflow-hidden pb-5 leading-7 text-[#cbc9c8]">{answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
