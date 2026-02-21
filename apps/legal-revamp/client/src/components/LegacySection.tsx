import { Link } from "wouter";
import { Award, Handshake, History, Bot } from "lucide-react";

export default function LegacySection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
            A Legacy of <span className="text-accent">Legal Marketing Success</span>,
            <br />
            A Future of{" "}
            <span className="text-gradient">Innovation</span>
          </h2>
          <p className="text-xl text-secondary leading-relaxed">
            With a proven track record in legal marketing, Rainstar Digital
            continues to set the standard for success—delivering strategies that
            stand the test of time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Achievement Card 1 */}
          <div
            className="group bg-gradient-to-br from-white to-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
            data-testid="legacy-card-seo"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="text-white text-2xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral mb-4">
              Award-Winning SEO & Content
            </h3>
            <p className="text-secondary mb-4">
              We literally wrote the book on legal SEO, equipping firms with best
              practices to attract high-value clients.
            </p>
            <Link
              href="/services?service=seo"
              className="text-accent font-semibold hover:text-secondary transition-colors"
              data-testid="legacy-seo-link"
            >
              Learn More →
            </Link>
          </div>

          {/* Achievement Card 2 */}
          <div
            className="group bg-gradient-to-br from-white to-secondary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
            data-testid="legacy-card-webinars"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Handshake className="text-white text-2xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral mb-4">
              Trusted Webinar Partners
            </h3>
            <p className="text-secondary mb-4">
              Our insights are featured by The National Law Review, Social Law
              Library, and Mass Lawyers Weekly.
            </p>
            <Link
              href="/speaking?type=webinars"
              className="text-accent font-semibold hover:text-secondary transition-colors"
              data-testid="legacy-webinars-link"
            >
              Learn More →
            </Link>
          </div>

          {/* Achievement Card 3 */}
          <div
            className="group bg-gradient-to-br from-white to-accent/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
            data-testid="legacy-card-experience"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-accent to-neutral rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <History className="text-white text-2xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral mb-4">
              Decades of Experience
            </h3>
            <p className="text-secondary mb-4">
              Since 1995, Founder John McDougall has helped firms boost search
              rankings, credibility, and authority.
            </p>
            <Link
              href="/about"
              className="text-accent font-semibold hover:text-secondary transition-colors"
              data-testid="legacy-about-link"
            >
              Learn More →
            </Link>
          </div>

          {/* Achievement Card 4 */}
          <div
            className="group bg-gradient-to-br from-white to-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
            data-testid="legacy-card-ai"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Bot className="text-white text-2xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral mb-4">
              Google-Approved AI Strategies
            </h3>
            <p className="text-secondary mb-4">
              We use AI to scale quality not shortcuts staying aligned with
              Google's guidelines to protect your firm's reputation.
            </p>
            <Link
              href="/services?service=google-ads"
              className="text-accent font-semibold hover:text-secondary transition-colors"
              data-testid="legacy-ai-link"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
