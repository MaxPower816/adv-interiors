import { cn } from "@/lib/utils";
import { accentStyle, textStyle, titleStyle } from "@/lib/visual-style";
import type { SiteVisualBlockStyle } from "@/types";
import { StyledText } from "./StyledText";

export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
  visualStyle,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
  visualStyle?: SiteVisualBlockStyle;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#a69c96]" style={accentStyle(visualStyle)}>{eyebrow}</p> : null}
      <h2 className="serif whitespace-pre-line text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.94] text-[#e7e3e0]" style={titleStyle(visualStyle)}>
        <StyledText text={title} visualStyle={visualStyle} />
      </h2>
      {text ? (
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#cbc9c8] md:text-lg" style={textStyle(visualStyle)}>
          <StyledText text={text} visualStyle={visualStyle} />
        </p>
      ) : null}
    </div>
  );
}
