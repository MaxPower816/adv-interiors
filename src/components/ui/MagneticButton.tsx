"use client";

import { useRef } from "react";
import { Button } from "./Button";
import type { ComponentProps } from "react";

export function MagneticButton(props: ComponentProps<typeof Button>) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <Button
      ref={ref}
      onMouseMove={(event) => {
        const button = ref.current;
        if (!button || matchMedia("(pointer: coarse)").matches) return;
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.08}px, ${(event.clientY - rect.top - rect.height / 2) * 0.08}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      {...props}
    />
  );
}
