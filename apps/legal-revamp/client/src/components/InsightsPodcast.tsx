import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, Mic, Play } from "lucide-react";

export default function InsightsPodcast() {
  return (
    <section className="py-20 bg-gradient-to-br from-light-bg to-primary/10">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Legal Marketing Insights */}
          <div className="animate-slide-up">
            <div className="bg-gradient-to-br from-accent/5 to-secondary/10 rounded-3xl p-8">
              <h2 className="font-display text-4xl font-bold text-neutral mb-6">
                <span className="text-accent">Legal Marketing Insights</span>
                <br />
                That Drive Growth
              </h2>

              <p className="text-lg text-secondary mb-8 leading-relaxed">
                At Rainstar Digital, we believe in data-driven, practical solutions
                that align with your firm's unique goals. Through our books, blog
                posts, case studies, and industry analysis, we offer strategic
                guidance to help you win more clients and beat your competitors.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3"></div>
                  <p className="text-secondary">
                    How to handle Google Algorithm shifts for legal websites
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3"></div>
                  <p className="text-secondary">
                    Local SEO tactics to attract high-intent clients
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3"></div>
                  <p className="text-secondary">
                    Ensuring a high ROI on your pay-per-click (PPC) advertising campaigns
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3"></div>
                  <p className="text-secondary">
                    Establishing meaningful online reputations that lead to referrals
                  </p>
                </div>
              </div>

              <p className="text-secondary mb-6">
                Check our blog for timely tips and deep-dive articles that come
                directly from our decades of hands-on experience.
              </p>

              <Button
                asChild
                className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                data-testid="insights-blog-button"
              >
                <Link href="/blog">
                  Discover More <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Podcast Section */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mr-4">
                  <Mic className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-neutral">
                    Legal Marketing Review
                  </h3>
                  <p className="text-secondary">Podcast Series</p>
                </div>
              </div>

              <h2 className="font-display text-3xl font-bold text-neutral mb-6">
                Introducing Our Podcast
              </h2>

              <p className="text-lg text-secondary mb-8 leading-relaxed">
                We host the Legal Marketing Review podcast—where John McDougall and
                his guests discuss cutting-edge strategies, compliance pitfalls, and
                the latest trends in digital marketing for attorneys. Learn from
                lawyers and marketing staff from law firms, sharing proven tactics
                and actionable tips based on real experiences.
              </p>

              {/* Featured podcast episode card */}
              <div
                className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 mb-8"
                data-testid="podcast-featured-episode"
              >
                <div className="flex items-center mb-4">
                  <Play className="w-8 h-8 text-accent mr-4" />
                  <div>
                    <h4 className="font-semibold text-neutral">Latest Episode</h4>
                    <p className="text-sm text-secondary">
                      AI and Legal Marketing Ethics
                    </p>
                  </div>
                </div>
                <p className="text-sm text-secondary">
                  Exploring how law firms can leverage AI tools while maintaining
                  ethical standards and Google compliance.
                </p>
              </div>

              <Button
                asChild
                className="bg-gradient-to-r from-secondary to-accent text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full"
                data-testid="podcast-listen-button"
              >
                <Link href="/speaking?type=podcasts">
                  Listen Now <Headphones className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
