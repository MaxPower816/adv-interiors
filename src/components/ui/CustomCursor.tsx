"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const onMove = (event: PointerEvent) => setPos({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[95] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e7e3e0]/35 mix-blend-difference transition-transform duration-100 md:block"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden
    />
  );
}
