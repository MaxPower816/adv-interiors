import type { CSSProperties } from "react";
import type { SiteVisualBlockKey, SiteVisualBlockStyle, SiteVisualSettings } from "@/types";

export const visualBlockLabels: Record<SiteVisualBlockKey, string> = {
  hero: "Главный экран",
  about: "О студии",
  services: "Услуги",
  process: "Процесс",
  seoBlock: "SEO-блок",
  beforeAfter: "До / после",
  testimonials: "Отзывы",
  pricing: "Прайс",
  faq: "FAQ",
  contact: "Контакты",
};

export const visualBlockKeys = Object.keys(visualBlockLabels) as SiteVisualBlockKey[];

export const defaultVisualBlockStyle: SiteVisualBlockStyle = {
  titleSize: "",
  textSize: "",
  titleColor: "",
  textColor: "",
  backgroundColor: "",
  accentColor: "",
  highlightColor: "",
  highlightBackground: "",
};

export const defaultVisualSettings: SiteVisualSettings = {
  headingFontUrl: "",
  bodyFontUrl: "",
  blocks: visualBlockKeys.reduce((acc, key) => {
    acc[key] = { ...defaultVisualBlockStyle };
    return acc;
  }, {} as Record<SiteVisualBlockKey, SiteVisualBlockStyle>),
};

export function normalizeVisualSettings(visual?: Partial<SiteVisualSettings>): SiteVisualSettings {
  return {
    ...defaultVisualSettings,
    ...visual,
    blocks: visualBlockKeys.reduce((acc, key) => {
      acc[key] = {
        ...defaultVisualBlockStyle,
        ...(visual?.blocks?.[key] ?? {}),
      };
      return acc;
    }, {} as Record<SiteVisualBlockKey, SiteVisualBlockStyle>),
  };
}

export function sectionStyle(style?: SiteVisualBlockStyle): CSSProperties | undefined {
  if (!style?.backgroundColor) return undefined;
  return { backgroundColor: style.backgroundColor };
}

export function titleStyle(style?: SiteVisualBlockStyle): CSSProperties | undefined {
  const result: CSSProperties = {};
  if (style?.titleSize) result.fontSize = style.titleSize;
  if (style?.titleColor) result.color = style.titleColor;
  return Object.keys(result).length ? result : undefined;
}

export function textStyle(style?: SiteVisualBlockStyle): CSSProperties | undefined {
  const result: CSSProperties = {};
  if (style?.textSize) result.fontSize = style.textSize;
  if (style?.textColor) result.color = style.textColor;
  return Object.keys(result).length ? result : undefined;
}

export function accentStyle(style?: SiteVisualBlockStyle): CSSProperties | undefined {
  if (!style?.accentColor) return undefined;
  return { color: style.accentColor };
}
