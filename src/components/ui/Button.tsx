"use client";

import { ArrowUpRight } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "solid" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, variant = "solid", className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-3 border px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition duration-300",
        variant === "solid"
          ? "border-[#e7e3e0]/40 bg-[#e7e3e0] text-[#080706] hover:bg-[#cbc9c8]"
          : "border-[#e7e3e0]/25 bg-transparent text-[#e7e3e0] hover:bg-[#e7e3e0]/10",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
});
