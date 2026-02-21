import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Handshake, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-accent to-secondary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center animate-fade-in">
          <h2 className="font-display text-4xl lg:text-6xl font-bold text-white mb-6">
            Partner with{" "}
            <span className="text-primary">Rainstar Digital</span> Today!
          </h2>
          <p className="text-xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed">
            Your legal practice deserves more than cookie-cutter online
            marketing—it needs a creative partner who understands the nuances of
            the legal landscape. Whether you're an emerging boutique or an
            established regional heavyweight, Rainstar Digital can help you clarify
            your message, extend your reach, and secure more cases.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-accent hover:bg-primary hover:text-white shadow-2xl transform hover:-translate-y-2 transition-all duration-300 px-10 py-5 text-lg font-bold"
              data-testid="cta-partnership-button"
            >
              <Link href="/contact">
                <Handshake className="w-5 h-5 mr-3" />
                Start Your Partnership
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/20 backdrop-blur-lg border-2 border-white text-white hover:bg-white hover:text-accent transition-all duration-300 px-10 py-5 text-lg font-bold"
              data-testid="cta-phone-button"
            >
              <a href="tel:(978)750-8000">
                <Phone className="w-5 h-5 mr-3" />
                Call (978) 750-8000
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
