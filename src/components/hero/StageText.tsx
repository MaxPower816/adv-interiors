"use client";

import { ArrowUpRight } from "lucide-react";
import { roomStages } from "@/config/room-stages";
import { cn } from "@/lib/utils";
import { accentStyle, textStyle, titleStyle } from "@/lib/visual-style";
import type { SiteVisualBlockStyle } from "@/types";
import { StyledText } from "@/components/ui/StyledText";

export function StageText({ progress, finalCta, visualStyle }: { progress: number; finalCta: string; visualStyle?: SiteVisualBlockStyle }) {
  const stage = roomStages.find((item) => progress >= item.start && progress <= item.end) ?? roomStages[roomStages.length - 1];

  return (
    <div className={cn("max-w-[650px] transition duration-500", stage.side === "right" && "ml-auto text-right")}>
      <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#a69c96]" style={accentStyle(visualStyle)}>{stage.label}</p>
      <h2 className="serif text-[clamp(2.6rem,6vw,6rem)] font-medium leading-[0.92] text-[#e7e3e0]" style={titleStyle(visualStyle)}>
        <StyledText text={stage.text} visualStyle={visualStyle} />
      </h2>
      {stage.subtext ? <p className="mt-6 text-lg leading-8 text-[#cbc9c8]" style={textStyle(visualStyle)}><StyledText text={stage.subtext} visualStyle={visualStyle} /></p> : null}
      {progress > 0.88 ? (
        <a
          href="#portfolio"
          className={cn(
            "group pointer-events-auto mt-8 inline-flex min-h-11 items-center justify-center gap-3 border border-[#e7e3e0]/22 bg-[#080706]/62 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#e7e3e0] backdrop-blur-md transition duration-300",
            "hover:border-[#e7e3e0]/42 hover:bg-[#e7e3e0]/10",
            stage.side === "right" && "ml-auto",
          )}
        >
          {finalCta}
          <ArrowUpRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      ) : null}
    </div>
  );
}
