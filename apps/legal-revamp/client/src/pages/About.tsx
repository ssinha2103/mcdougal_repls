import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, CheckCircle, Award, Users } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "About Rainstar Digital - John McDougall & Legal Marketing Experts";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Meet John McDougall, founder of Rainstar Digital. 30+ years of legal marketing expertise, Google Premier Partner, and author of legal SEO strategies."
      );
    }
  }, []);

  return (
    <main className="pt-24">
      {/* About Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
                About <span className="text-accent">Us</span>
              </h1>
              <p className="text-xl text-secondary mb-8 leading-relaxed">
                My name is John McDougall, and I am the CEO of McDougall Interactive, publisher of The Legal Marketing Review and an authority on internet marketing for law firms.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-accent mr-3" />
                  <span className="text-lg">CEO of McDougall Interactive</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-accent mr-3" />
                  <span className="text-lg">Experts in SEO, SMO, and paid search</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-accent mr-3" />
                  <span className="text-lg">Millions in leads generated for firms</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-accent mr-3" />
                  <span className="text-lg">Legal content, link building, and video</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-accent mr-3" />
                  <span className="text-lg">Shift to real-time web-based growth</span>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                data-testid="about-consultation-button"
              >
                <Link href="/contact">
                  <Calendar className="w-5 h-5 mr-3" />
                  Schedule Consultation
                </Link>
              </Button>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
                alt="John McDougall, Founder of Rainstar Digital"
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="about-founder-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl font-bold text-neutral mb-8 text-center">
              Our Story: <span className="text-accent">Leading Legal Marketing Since 1995</span>
            </h2>
            
            <div className="prose prose-lg max-w-none text-secondary leading-relaxed space-y-6">
              <p>
                My father owned the sixth-largest ad agency in New England so advertising is in my blood. I switched from media planning to web marketing in 1995 and never looked back. I took a class on search engine optimization in 1996, so I am among the earliest adopters of SEO.
              </p>
              
              <p>
                After working with clients across industries—Philips Medical, MIT, Arrow Electronics, and more—I saw the greatest impact when we focused on one niche: law firms. We've helped generate tens of millions in legal leads, so I built this blog to share what works.
              </p>
              
              <p>
                My team of 12+ experts helps law firms craft complete marketing strategies using SEO, paid search, and social media. We focus on quality lead generation that drives real business growth.
              </p>
              
              <p>
                We specialize in legal content, link building, PR outreach, and video marketing. Our goal is to turn your web presence into a trusted, client-friendly brand—and help you grow beyond referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl font-bold text-neutral mb-12 text-center">
            Our <span className="text-accent">Achievements</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">30+</div>
              <div className="text-secondary">Years Experience</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">29+</div>
              <div className="text-secondary">Years Leading Legal Marketing</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-white text-2xl">🏆</div>
              </div>
              <div className="text-3xl font-bold text-accent mb-2">4</div>
              <div className="text-secondary">Google HQ Invitations</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-neutral rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-white text-2xl">📚</div>
              </div>
              <div className="text-3xl font-bold text-accent mb-2">2</div>
              <div className="text-secondary">Published Books</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral mb-6">
              Meet Our <span className="text-accent">Expert Team</span>
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              When you work with Rainstar Digital, you work directly with industry experts—no handoffs to junior staff.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
                alt="John McDougall"
                className="w-48 h-48 rounded-full mx-auto mb-6 shadow-xl"
                data-testid="team-john-mcdougall"
              />
              <h3 className="font-display text-2xl font-bold text-neutral mb-2">John McDougall</h3>
              <p className="text-accent font-semibold mb-4">Founder & CEO</p>
              <p className="text-secondary">
                30+ years of digital marketing expertise, Google Premier Partner, and recognized authority in legal SEO.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
                alt="John Maher"
                className="w-48 h-48 rounded-full mx-auto mb-6 shadow-xl"
                data-testid="team-john-maher"
              />
              <h3 className="font-display text-2xl font-bold text-neutral mb-2">John Maher</h3>
              <p className="text-accent font-semibold mb-4">Senior Digital Marketing Strategist</p>
              <p className="text-secondary">
                Strategic partner to John McDougall, specializing in comprehensive digital marketing campaigns for law firms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-accent to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to Work with the Experts?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the 500+ law firms who trust Rainstar Digital for their marketing success.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-accent hover:bg-primary hover:text-white shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            data-testid="about-cta-button"
          >
            <Link href="/contact">
              Start Your Partnership Today
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
