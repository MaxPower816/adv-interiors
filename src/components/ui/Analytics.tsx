"use client";

import { useEffect } from "react";

type AnalyticsPayload = {
  name: string;
  payload?: Record<string, string | number | boolean>;
};

const TRAIL_KEY = "adv_activity_trail";
const UTM_KEY = "adv_utm";
const MAX_TRAIL_ITEMS = 24;

function readTrail() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAIL_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberEvent(detail: AnalyticsPayload, path: string) {
  const trail = readTrail();
  const item = {
    name: detail.name,
    path,
    payload: detail.payload,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(TRAIL_KEY, JSON.stringify([item, ...trail].slice(0, MAX_TRAIL_ITEMS)));
}

function rememberUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].reduce<Record<string, string>>((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});

  if (Object.keys(utm).length > 0) {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

export function Analytics() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    rememberUtm();

    const sendEvent = (detail: AnalyticsPayload) => {
      const path = `${window.location.pathname}${window.location.hash}`;
      rememberEvent(detail, path);
      const body = JSON.stringify({
        name: detail.name,
        path,
        referrer: document.referrer || undefined,
        payload: detail.payload,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/activity", new Blob([body], { type: "application/json" }));
        return;
      }

      void fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    };

    const trackPageView = () => {
      sendEvent({ name: "page_view", payload: { title: document.title } });
    };

    const handler = (event: Event) => sendEvent((event as CustomEvent<AnalyticsPayload>).detail);

    window.addEventListener("analytics:event", handler);
    window.addEventListener("hashchange", trackPageView);
    trackPageView();

    return () => {
      window.removeEventListener("analytics:event", handler);
      window.removeEventListener("hashchange", trackPageView);
    };
  }, []);

  return null;
}
