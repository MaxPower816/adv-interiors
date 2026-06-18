import type { SiteVisualSettings } from "@/types";

function escapeCssUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed || (!trimmed.startsWith("/") && !trimmed.startsWith("https://") && !trimmed.startsWith("http://"))) return "";
  return trimmed.replace(/["\\]/g, "");
}

export function VisualStyleProvider({ visual }: { visual: SiteVisualSettings }) {
  const headingUrl = escapeCssUrl(visual.headingFontUrl);
  const bodyUrl = escapeCssUrl(visual.bodyFontUrl);
  const css = [
    headingUrl ? `@font-face{font-family:"ADV Custom Heading";src:url("${headingUrl}");font-display:swap;font-style:normal;font-weight:400 900;}` : "",
    bodyUrl ? `@font-face{font-family:"ADV Custom Body";src:url("${bodyUrl}");font-display:swap;font-style:normal;font-weight:300 900;}` : "",
    headingUrl ? `:root{--font-heading:"ADV Custom Heading","Benzin","Cormorant Garamond",serif;}` : "",
    bodyUrl ? `:root{--font-sans:"ADV Custom Body","Manrope","Inter",sans-serif;}` : "",
  ].join("\n");

  if (!css.trim()) return null;

  return <style id="adv-visual-fonts" dangerouslySetInnerHTML={{ __html: css }} />;
}
