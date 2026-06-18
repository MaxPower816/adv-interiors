import type { Metadata, Viewport } from "next";
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
  title: {
    default: `${siteConfig.title} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  category: "interior design",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080706",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        areaServed: siteConfig.serviceArea.map((area) => ({ "@type": "AdministrativeArea", name: area })),
        address: { "@type": "PostalAddress", addressLocality: siteConfig.city },
        priceRange: "$$",
        openingHours: "Mo-Fr 10:00-19:00",
        serviceType: [
          "Дизайн интерьера под ключ",
          "Дизайн-проект квартиры",
          "Дизайн-проект дома",
          "Комплектация интерьера",
          "Авторское сопровождение ремонта",
        ],
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        inLanguage: "ru-RU",
      },
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
