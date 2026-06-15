"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const PRELOADER_DURATION_MS = 2650;
const softEase = [0.22, 1, 0.36, 1] as const;

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("preloader-open");
    const timer = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("preloader-open");
    }, PRELOADER_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("preloader-open");
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-label="ADV INTERIORS"
          className="fixed inset-0 z-[120] grid place-items-center bg-[#080706]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)", transition: { duration: 1.05, ease: softEase } }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(166,156,150,.18),transparent_28rem)]" />
          <motion.div
            className="relative text-center"
            initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)", transition: { duration: 0.9, ease: softEase } }}
            transition={{ duration: 1.15, ease: softEase }}
          >
            <motion.p
              className="serif text-[clamp(5rem,18vw,15rem)] font-medium leading-[0.78] text-[#e7e3e0]"
              initial={{ scale: 0.94, letterSpacing: "0.08em" }}
              animate={{ scale: 1, letterSpacing: "0em" }}
              transition={{ duration: 1.75, ease: softEase }}
            >
              ADV
            </motion.p>
            <motion.p
              className="mt-5 text-xs font-semibold uppercase tracking-[0.58em] text-[#cbc9c8] md:text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.95, ease: softEase }}
            >
              INTERIORS
            </motion.p>
          </motion.div>
          <motion.div
            className="absolute bottom-10 h-px w-40 overflow-hidden bg-[#e7e3e0]/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            transition={{ delay: 0.65, duration: 0.65 }}
          >
            <motion.div
              className="h-full bg-[#e7e3e0]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.65, ease: [0.65, 0, 0.35, 1], repeat: 1, repeatDelay: 0.15 }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
