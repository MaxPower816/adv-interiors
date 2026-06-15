"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { navigation } from "@/config/navigation";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[75] bg-[#080706] p-6 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.28em]">ADV INTERIORS</span>
            <button aria-label="Закрыть меню" className="min-h-11 min-w-11 border border-[#e7e3e0]/20" onClick={onClose}>
              <X className="mx-auto h-5 w-5" />
            </button>
          </div>
          <nav className="mt-16 grid gap-7">
            {navigation.map((item) => (
              <a className="serif text-5xl" href={item.href} key={item.href} onClick={onClose}>
                {item.label}
              </a>
            ))}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
