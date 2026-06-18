import { siteConfig } from "@/config/site";

export function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return siteConfig.url;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, siteConfig.url).toString();
}
