import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20 overflow-hidden pt-24">
      {/* Floating elements background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full animate-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-primary/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-secondary/15 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="text-gradient text-sm font-semibold tracking-wider uppercase mb-4">
              Real Results. No Guesswork.
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold text-neutral leading-tight mb-6">
              <span className="text-accent">RAINSTAR DIGITAL</span>
              <br />
              That Gets You
              <br />
              <span className="text-gradient">More Cases</span>
            </h1>

            <p className="text-xl text-secondary mb-8 leading-relaxed max-w-lg">
              We have led the field of website marketing for Law Firms since 1995.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                data-testid="hero-book-consultation"
              >
                <Link href="/contact">
                  <Calendar className="w-5 h-5 mr-3" />
                  Book Consultation
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                data-testid="hero-download-sample"
              >
                <a href="https://go2.mcdougallinteractive.com/content-marketing-and-seo-sample-chapter">
                  <Download className="w-5 h-5 mr-3" />
                  Download Sample Chapter
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 opacity-70">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="trust-years">30+</div>
                <div className="text-sm text-secondary">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="trust-firms">500+</div>
                <div className="text-sm text-secondary">Law Firms Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="trust-satisfaction">95%</div>
                <div className="text-sm text-secondary">Client Satisfaction</div>
              </div>
            </div>
          </div>

          <div
            className="relative animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Professional business meeting photo */}
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Professional legal marketing consultation"
              className="rounded-3xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
              data-testid="hero-image"
            />

            {/* Floating achievement card */}
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl animate-float">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🏆</span>
                </div>
                <div>
                  <div className="font-bold text-neutral" data-testid="hero-award-title">Award Winner</div>
                  <div className="text-sm text-secondary">Legal Marketing Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
