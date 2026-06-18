"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { SiteContent, SiteVisualBlockStyle } from "@/types";
import { SceneFallback } from "./SceneFallback";

const RoomExperience = dynamic(() => import("./RoomExperience").then((mod) => mod.RoomExperience), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export function HeroSection({ hero, visualStyle }: { hero: SiteContent["hero"]; visualStyle?: SiteVisualBlockStyle }) {
  return (
    <Suspense fallback={<SceneFallback />}>
      <RoomExperience hero={hero} visualStyle={visualStyle} />
    </Suspense>
  );
}
