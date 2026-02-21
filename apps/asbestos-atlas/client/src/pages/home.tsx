import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "@/components/sections/hero";
import StatsBanner from "@/components/sections/stats-banner";
import AsbestosMap from "@/components/map/asbestos-map";
import FeaturedSites from "@/components/sections/featured-sites";
import About from "@/components/sections/about";
import ContactForm from "@/components/contact/contact-form";
import DisclaimerBanner from "@/components/legal/disclaimer-banner";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <StatsBanner />
      
      {/* Map Section */}
      <section id="map" className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 sm:mb-4">
              Featured Kentucky Asbestos Exposure Sites
            </h2>
            <p className="text-base sm:text-lg text-legal-gray max-w-3xl mx-auto leading-relaxed">
              This interactive map shows confirmed asbestos exposure sites across Kentucky, 
              including EPA Superfund sites and ATSDR priority locations where workers and residents 
              may have been exposed to dangerous asbestos fibers.
            </p>
          </div>
          <AsbestosMap />
        </div>
      </section>

      <FeaturedSites />
      <About />
      
      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 sm:mb-4">
              Get The Legal Representation You Deserve
            </h2>
            <p className="text-base sm:text-lg text-legal-gray">Free initial consultation - no upfront costs</p>
          </div>
          <ContactForm />
        </div>
      </section>
      
      <Footer />
      <DisclaimerBanner />
    </div>
  );
}
