import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Analytics } from "@/components/ui/Analytics";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { Preloader } from "@/components/ui/Preloader";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        name: siteConfig.name,
        url: siteConfig.url,
        telephone: siteConfig.phone,
        areaServed: "Россия",
        address: { "@type": "PostalAddress", addressLocality: siteConfig.city },
      },
      { "@type": "Person", name: siteConfig.designerName, jobTitle: "Interior designer" },
      { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    ],
  };

  return (
    <html lang="ru">
      <body className="sans">
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#e7e3e0] focus:px-4 focus:py-3 focus:text-[#080706]" href="#main">
          Перейти к содержимому
        </a>
        <Preloader />
        {children}
        <Analytics />
        <CookieBanner />
        <CustomCursor />
        <GrainOverlay />
        <Script id="schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
