"use client";

import { useEffect, useState } from "react";

export function PageProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="fixed left-0 top-0 z-[70] h-px bg-[#e7e3e0]" style={{ width: `${progress * 100}%` }} />;
}
