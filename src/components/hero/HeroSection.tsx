"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { SiteContent } from "@/types";
import { SceneFallback } from "./SceneFallback";

const RoomExperience = dynamic(() => import("./RoomExperience").then((mod) => mod.RoomExperience), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export function HeroSection({ hero }: { hero: SiteContent["hero"] }) {
  return (
    <Suspense fallback={<SceneFallback />}>
      <RoomExperience hero={hero} />
    </Suspense>
  );
}
