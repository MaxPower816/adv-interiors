import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#a69c96]">{eyebrow}</p> : null}
      <h2 className="serif whitespace-pre-line text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.94] text-[#e7e3e0]">{title}</h2>
      {text ? <p className="mt-6 max-w-2xl text-base leading-8 text-[#cbc9c8] md:text-lg">{text}</p> : null}
    </div>
  );
}
