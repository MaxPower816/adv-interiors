"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVisible(localStorage.getItem("cookie-consent") === null);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const save = (value: string) => {
    localStorage.setItem("cookie-consent", value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[85] mx-auto max-w-4xl border border-[#e7e3e0]/15 bg-[#080706]/90 p-4 shadow-2xl backdrop-blur md:flex md:items-center md:justify-between md:gap-6">
      <p className="text-sm leading-6 text-[#cbc9c8]">
        Мы используем необходимые cookie и готовим настройки аналитики. Тексты персональных данных требуют юридической проверки.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
        <button className="min-h-11 border border-[#e7e3e0]/20 px-4 text-sm" onClick={() => save("necessary")}>Только необходимые</button>
        <button className="min-h-11 border border-[#e7e3e0]/20 px-4 text-sm" onClick={() => save("settings")}>Настроить</button>
        <button className="min-h-11 bg-[#e7e3e0] px-4 text-sm text-[#080706]" onClick={() => save("all")}>Принять</button>
      </div>
    </div>
  );
}
