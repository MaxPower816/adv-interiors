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
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <HeroSection />
        <PortfolioSection />
        <AboutSection />
        <ServicesSection />
        <ProcessSection />
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
    </>
  );
}
