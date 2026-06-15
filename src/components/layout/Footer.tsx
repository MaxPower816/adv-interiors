"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { socials } from "@/config/socials";
import { legalContent } from "@/content/legal";
import { trackEvent } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

type LegalKey = keyof typeof legalContent;

export function Footer() {
  const [modal, setModal] = useState<LegalKey | null>(null);

  return (
    <footer className="border-t border-[#e7e3e0]/15 px-5 py-12 md:px-10">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em]">{siteConfig.name}</p>
          <p className="mt-5 max-w-sm leading-7 text-[#cbc9c8]">Премиальные жилые и коммерческие интерьеры: от первой идеи до последнего предмета декора.</p>
        </div>
        <div className="grid gap-3 text-sm text-[#cbc9c8]">
          <a href={`tel:${siteConfig.phone.replaceAll(" ", "")}`} onClick={() => trackEvent("phone_click")}>{siteConfig.phone}</a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <span>{siteConfig.city}</span>
          <span>{siteConfig.hours}</span>
          <div className="flex flex-wrap gap-3 pt-2">
            {socials.map((social) => (
              <a key={social.label} href={social.href} onClick={() => social.event && trackEvent(social.event)}>{social.label}</a>
            ))}
          </div>
        </div>
        <div className="grid gap-3 text-sm text-[#cbc9c8]">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          {Object.keys(legalContent).map((key) => (
            <button key={key} className="text-left" onClick={() => setModal(key as LegalKey)}>{legalContent[key as LegalKey].title}</button>
          ))}
          <button className="mt-2 inline-flex items-center gap-2 text-left" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp className="h-4 w-4" /> Наверх
          </button>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1180px] text-xs text-[#a69c96]">© 2026 {siteConfig.name}. Тексты и контакты являются заглушками.</div>
      <Modal open={modal !== null} title={modal ? legalContent[modal].title : ""} onClose={() => setModal(null)}>
        <p>{modal ? legalContent[modal].body : ""}</p>
      </Modal>
    </footer>
  );
}
