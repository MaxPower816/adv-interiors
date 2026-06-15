"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn, trackEvent } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { PageProgress } from "./PageProgress";

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastY && y > 220);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <PageProgress />
      <header className={cn("fixed left-0 right-0 top-0 z-[65] transition duration-500", hidden && "-translate-y-full", scrolled && "bg-[#080706]/62 shadow-2xl backdrop-blur-xl")}>
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#" className="text-xs font-semibold uppercase tracking-[0.28em]">{siteConfig.name}</a>
          <nav className="hidden items-center gap-7 text-sm text-[#cbc9c8] md:flex">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#e7e3e0]">{item.label}</a>
            ))}
            <a
              href="#contact"
              className="border border-[#e7e3e0]/25 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#e7e3e0] hover:text-[#080706]"
              onClick={() => trackEvent("hero_cta_click")}
            >
              Обсудить проект
            </a>
          </nav>
          <button className="min-h-11 min-w-11 border border-[#e7e3e0]/20 md:hidden" aria-label="Открыть меню" onClick={() => setMenuOpen(true)}>
            <Menu className="mx-auto h-5 w-5" />
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
