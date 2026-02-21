import { useEffect } from "react";
import Hero from "@/components/Hero";
import LegacySection from "@/components/LegacySection";
import WhoWeHelp from "@/components/WhoWeHelp";
import ServicesSection from "@/components/ServicesSection";
import BookShowcase from "@/components/BookShowcase";
import InsightsPodcast from "@/components/InsightsPodcast";
import WebinarSection from "@/components/WebinarSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  useEffect(() => {
    document.title = "Rainstar Digital - Legal Marketing That Gets You More Cases";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Leading legal marketing since 1995. Expert SEO, content marketing, and digital strategies that help law firms attract high-value clients and grow their practice."
      );
    }
  }, []);

  return (
    <main>
      <Hero />
      <LegacySection />
      <WhoWeHelp />
      <ServicesSection />
      <BookShowcase />
      <InsightsPodcast />
      <WebinarSection />
      <WhyChooseUs />
      <CTASection />
      <Testimonials />
    </main>
  );
}
