import Script from "next/script";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/hero/HeroSection";
import { PortfolioSection } from "@/components/portfolio/PortfolioSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { SEOTextSection } from "@/components/sections/SEOTextSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { siteConfig } from "@/config/site";
import { faq } from "@/content/faq";

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: siteConfig.url,
      },
    ],
  };

  return (
    <>
      <Header />
      <main id="main">
        <HeroSection />
        <PortfolioSection />
        <AboutSection />
        <ServicesSection />
        <ProcessSection />
        <SEOTextSection />
        <BeforeAfterSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <a href="#contact" className="fixed bottom-5 right-5 z-50 hidden border border-[#e7e3e0]/25 bg-[#080706]/75 px-4 py-3 text-xs uppercase tracking-[0.16em] backdrop-blur md:block">
        Связаться
      </a>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
