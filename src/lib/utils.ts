import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function stageProgress(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

export function trackEvent(name: string, payload?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("analytics:event", { detail: { name, payload } }));
}
