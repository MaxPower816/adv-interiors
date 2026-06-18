import Script from "next/script";
import type { Metadata } from "next";
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
import { VisualStyleProvider } from "@/components/ui/VisualStyleProvider";
import { siteConfig } from "@/config/site";
import { getPublishedProjects, getSiteContent } from "@/lib/cms";
import { absoluteUrl } from "@/lib/url";
import { isBlockEnabled } from "@/lib/visual-style";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = content.seo.title;
  const description = content.seo.description;
  const image = absoluteUrl(content.seo.ogImage || "/images/interior-placeholder.svg");

  return {
    title,
    description,
    keywords: content.seo.keywords,
    alternates: { canonical: siteConfig.url },
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: "website",
      locale: "ru_RU",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Home() {
  const [content, publishedProjects] = await Promise.all([getSiteContent(), getPublishedProjects()]);
  const blocks = content.visual.blocks;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map(([question, answer]) => ({
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
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Портфолио ADV INTERIORS",
    itemListElement: publishedProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/projects/${project.slug}`),
      name: project.title,
      image: absoluteUrl(project.cover),
    })),
  };

  return (
    <>
      <Header />
      <VisualStyleProvider visual={content.visual} />
      <main id="main">
        {isBlockEnabled(blocks.hero) ? <HeroSection hero={content.hero} visualStyle={blocks.hero} /> : null}
        {isBlockEnabled(blocks.portfolio) ? <PortfolioSection visualStyle={blocks.portfolio} /> : null}
        {isBlockEnabled(blocks.about) ? <AboutSection about={content.about} visualStyle={blocks.about} /> : null}
        {isBlockEnabled(blocks.services) ? <ServicesSection services={content.services} visualStyle={blocks.services} /> : null}
        {isBlockEnabled(blocks.process) ? <ProcessSection process={content.process} visualStyle={blocks.process} /> : null}
        {isBlockEnabled(blocks.seoBlock) ? <SEOTextSection content={content.seoBlock} visualStyle={blocks.seoBlock} /> : null}
        {isBlockEnabled(blocks.beforeAfter) ? <BeforeAfterSection beforeAfter={content.beforeAfter} visualStyle={blocks.beforeAfter} /> : null}
        {isBlockEnabled(blocks.testimonials) ? <TestimonialsSection testimonials={content.testimonials} visualStyle={blocks.testimonials} /> : null}
        {isBlockEnabled(blocks.pricing) ? <PricingSection pricing={content.pricing} visualStyle={blocks.pricing} /> : null}
        {isBlockEnabled(blocks.faq) ? <FAQSection faq={content.faq} visualStyle={blocks.faq} /> : null}
        {isBlockEnabled(blocks.contact) ? <ContactSection contact={content.contact} pricingPlans={content.pricing.plans} visualStyle={blocks.contact} /> : null}
      </main>
      <Footer />
      <a href="#contact" className="fixed bottom-5 right-5 z-50 hidden border border-[#e7e3e0]/25 bg-[#080706]/75 px-4 py-3 text-xs uppercase tracking-[0.16em] backdrop-blur md:block">
        Связаться
      </a>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Script id="portfolio-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }} />
    </>
  );
}
