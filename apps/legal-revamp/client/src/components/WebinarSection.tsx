import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, GraduationCap, MessageSquare, Users } from "lucide-react";

export default function WebinarSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Webinar Image */}
          <div className="animate-slide-up">
            <img
              src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Legal marketing webinar presentation"
              className="rounded-3xl shadow-2xl w-full h-auto"
              data-testid="webinar-image"
            />
          </div>

          {/* Webinar Content */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
              Join Our Next <span className="text-accent">Webinar</span>
            </h2>

            <p className="text-lg text-secondary mb-8 leading-relaxed">
              Rainstar Digital takes a unique approach to professional learning.
              Our Webinars, often done in collaboration with partners like The
              National Law Review, Social Law Library, and Mass Lawyers Weekly,
              spotlight actionable insights on digital marketing trends, ethical
              advertising guidelines, and innovative growth tactics.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral mb-2">Save Time</h4>
                  <p className="text-secondary">
                    Gain practical SEO and content strategies without cutting into
                    billable hours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral mb-2">Learn from Experts</h4>
                  <p className="text-secondary">
                    Learn from seasoned experts, including John McDougall and guest
                    speakers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral mb-2">Interactive Q&A</h4>
                  <p className="text-secondary">
                    Engage in live Q&A to troubleshoot real-world challenges
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming webinar card */}
            <div
              className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl p-6 mb-8"
              data-testid="webinar-upcoming"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-neutral">Next Webinar</h4>
                  <p className="text-secondary">Legal SEO Strategies for 2024</p>
                </div>
                <div className="text-right">
                  <div className="text-accent font-semibold">March 25</div>
                  <div className="text-sm text-secondary">2:00 PM EST</div>
                </div>
              </div>
              <p className="text-sm text-secondary mb-4">
                Learn the latest Google algorithm updates and how they affect legal
                websites.
              </p>
              <div className="flex items-center text-xs text-secondary">
                <Users className="w-4 h-4 mr-2" />
                <span>Limited seats available</span>
              </div>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              data-testid="webinar-register-button"
            >
              <Link href="/speaking?type=webinars">
                Register Now <Calendar className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
