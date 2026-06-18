"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cameraPath } from "@/config/camera-path";
import { trackEvent } from "@/lib/utils";
import { accentStyle, sectionStyle, textStyle, titleStyle } from "@/lib/visual-style";
import type { SiteContent, SiteVisualBlockStyle } from "@/types";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StyledText } from "@/components/ui/StyledText";
import { RoomCanvas } from "./RoomCanvas";
import { SceneFallback } from "./SceneFallback";
import { StageText } from "./StageText";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_LOCK_MS = 950;
const SNAP_EDGE_THRESHOLD = 0.025;

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function RoomExperience({ hero, visualStyle }: { hero: SiteContent["hero"]; visualStyle?: SiteVisualBlockStyle }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollLockRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [webgl, setWebgl] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setWebgl(hasWebGL());
      setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
      });
    }, sectionRef);
    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;

    const snapPoints = Array.from(new Set(cameraPath.map((item) => item.progress)))
      .filter((item) => item >= 0 && item <= 1)
      .sort((a, b) => a - b);

    const unlock = () => {
      window.setTimeout(() => {
        scrollLockRef.current = false;
      }, SCROLL_LOCK_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (document.body.classList.contains("camera-studio-active")) return;

      const section = sectionRef.current;
      const lenis = lenisRef.current;
      if (!section || !lenis || snapPoints.length < 2) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollRange = section.offsetHeight - window.innerHeight;
      const sectionBottom = sectionTop + scrollRange;
      const currentY = window.scrollY;
      const isInsideScene = currentY >= sectionTop - 2 && currentY <= sectionBottom + 2;

      if (!isInsideScene || scrollRange <= 0) return;

      const currentProgress = Math.min(1, Math.max(0, (currentY - sectionTop) / scrollRange));
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      const atStart = currentProgress <= SNAP_EDGE_THRESHOLD;
      const atEnd = currentProgress >= 1 - SNAP_EDGE_THRESHOLD;

      if ((direction < 0 && atStart) || (direction > 0 && atEnd)) {
        return;
      }

      event.preventDefault();

      if (scrollLockRef.current) return;
      scrollLockRef.current = true;

      const targetProgress = direction > 0
        ? snapPoints.find((point) => point > currentProgress + SNAP_EDGE_THRESHOLD) ?? 1
        : [...snapPoints].reverse().find((point) => point < currentProgress - SNAP_EDGE_THRESHOLD) ?? 0;

      lenis.scrollTo(sectionTop + targetProgress * scrollRange, {
        duration: 1.05,
        easing: (value) => 1 - Math.pow(1 - value, 3),
      });
      unlock();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative min-h-[620vh] bg-[#080706] max-md:min-h-[420vh]" style={sectionStyle(visualStyle)} aria-label="Преображение интерьера">
      <div className="sticky top-0 h-screen overflow-hidden">
        {webgl && !reduced ? <RoomCanvas progress={progress} /> : <SceneFallback />}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(28,23,20,.62),transparent_45%,rgba(28,23,20,.25))]" />
        <div className="pointer-events-none absolute inset-0 flex items-center px-5 md:px-10">
          {progress < 0.08 ? (
            <div className="max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#a69c96]" style={accentStyle(visualStyle)}>{hero.eyebrow}</p>
              <h1 className="serif whitespace-pre-line text-[clamp(3.3rem,9vw,8rem)] font-medium leading-[0.9]" style={titleStyle(visualStyle)}>
                <StyledText text={hero.title} visualStyle={visualStyle} />
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#cbc9c8]" style={textStyle(visualStyle)}>
                <StyledText text={hero.subtitle} visualStyle={visualStyle} />
              </p>
              <MagneticButton className="pointer-events-auto mt-9" onClick={() => {
                trackEvent("hero_cta_click");
                sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
              }}>
                {hero.cta}
              </MagneticButton>
            </div>
          ) : (
            <StageText progress={progress} finalCta={hero.finalCta} visualStyle={visualStyle} />
          )}
        </div>
        <div className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#cbc9c8]">
          <span>scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
