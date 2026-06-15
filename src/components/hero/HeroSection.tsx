"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { SceneFallback } from "./SceneFallback";

const RoomExperience = dynamic(() => import("./RoomExperience").then((mod) => mod.RoomExperience), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export function HeroSection() {
  return (
    <Suspense fallback={<SceneFallback />}>
      <RoomExperience />
    </Suspense>
  );
}
