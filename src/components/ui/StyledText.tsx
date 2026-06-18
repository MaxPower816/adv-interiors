import type { CSSProperties, ReactNode } from "react";
import type { SiteVisualBlockStyle } from "@/types";

function highlightStyle(style?: SiteVisualBlockStyle): CSSProperties | undefined {
  const result: CSSProperties = {};
  if (style?.highlightColor) result.color = style.highlightColor;
  if (style?.highlightBackground) {
    result.backgroundColor = style.highlightBackground;
    result.boxDecorationBreak = "clone";
    result.WebkitBoxDecorationBreak = "clone";
    result.padding = "0 0.12em";
  }
  return Object.keys(result).length ? result : undefined;
}

export function StyledText({ text, visualStyle }: { text: string; visualStyle?: SiteVisualBlockStyle }) {
  const parts: ReactNode[] = [];
  const pattern = /\[\[([^|\]]+)(?:\|([^|\]]*))?(?:\|([^|\]]*))?\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <span
        key={`${match.index}-${match[1]}`}
        style={{
          ...highlightStyle(visualStyle),
          ...(match[2] ? { color: match[2] } : {}),
          ...(match[3] ? { backgroundColor: match[3], padding: "0 0.12em" } : {}),
        }}
      >
        {match[1]}
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
