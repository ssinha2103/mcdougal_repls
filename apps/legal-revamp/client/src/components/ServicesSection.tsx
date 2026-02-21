import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      id: "seo",
      title: "Expert-Led SEO Strategy & Execution",
      description:
        "We craft an entire organic search and social plan, from advanced technical audits to link-building and local SEO, positioning your firm for sustainable growth.",
      features: [
        "Advanced Technical SEO Audits",
        "Strategic Link Building Campaigns",
        "Local SEO for Legal Practices",
        "Competitive Analysis & Strategy",
      ],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      buttonColor: "from-accent to-secondary",
    },
    {
      id: "content",
      title: "Content Marketing & Thought Leadership",
      description:
        "High-value content is essential for establishing legal authority. Our proven frameworks—including blog posts, podcasts, YouTube optimization, and e-books—are backed by data, ensuring every word resonates with your target audience.",
      features: [
        "Legal Blog Content Strategy",
        "Podcast Production & Marketing",
        "YouTube Channel Optimization",
        "E-book & Guide Creation",
      ],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      buttonColor: "from-secondary to-primary",
      reverse: true,
    },
    {
      id: "social",
      title: "Social Media & Reputation Management",
      description:
        "From LinkedIn thought leadership to managing online reviews, Rainstar Digital helps you maintain a compelling, consistent brand presence across every channel.",
      features: [
        "LinkedIn Thought Leadership",
        "Online Review Management",
        "Brand Consistency Across Platforms",
        "Crisis Communication Support",
      ],
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      buttonColor: "from-accent to-secondary",
    },
    {
      id: "design",
      title: "Conversion-Focused Law Firm Web Design",
      description:
        "An attractive website is just the beginning. Our designs optimize the user experience and integrate with your marketing funnel so casual visitors become engaged prospects.",
      features: [
        "Conversion-Optimized Design",
        "Mobile-First Responsive Design",
        "Marketing Funnel Integration",
        "ADA Compliance & Accessibility",
      ],
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      buttonColor: "from-primary to-accent",
      reverse: true,
    },
    {
      id: "ads",
      title: "Paid Google Ads and Paid Social Ads",
      description:
        "Google has invited (and paid) for us to visit their headquarters four years in a row—a testament to the exceptional paid ad results we've delivered for law firm clients.",
      features: [
        "Google Ads Optimization",
        "Facebook & LinkedIn Advertising",
        "Legal Compliance & Ethics",
        "ROI Tracking & Reporting",
      ],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      buttonColor: "from-accent to-secondary",
      highlight: true,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
            Customized <span className="text-accent">SEO and Digital Marketing</span>
            <br />
            Services for Law Firms
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            From technical SEO audits to comprehensive content strategies, our
            services are designed to position your firm for sustainable growth.
          </p>
        </div>

        <div className="space-y-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`grid lg:grid-cols-2 gap-12 items-center animate-slide-up ${
                service.reverse ? "lg:flex-row-reverse" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`service-${service.id}`}
            >
              <div className={service.reverse ? "order-2 lg:order-1" : "order-2 lg:order-1"}>
                <h3 className="font-display text-3xl font-bold text-neutral mb-6">
                  {service.title}
                </h3>
                <p className="text-lg text-secondary mb-6 leading-relaxed">
                  {service.description}
                </p>

                {service.highlight && (
                  <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">🔍</div>
                      <span className="font-semibold text-neutral">Google Premier Partner</span>
                    </div>
                    <p className="text-secondary text-sm">
                      4 consecutive years invited to Google headquarters for exceptional performance
                    </p>
                  </div>
                )}

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-secondary"
                      data-testid={`service-feature-${feature.toLowerCase().replace(/ /g, '-')}`}
                    >
                      <CheckCircle className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`bg-gradient-to-r ${service.buttonColor} text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                  data-testid={`service-button-${service.id}`}
                >
                  <Link href={`/services?service=${service.id}`}>
                    Learn More <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className={service.reverse ? "order-1 lg:order-2" : "order-1 lg:order-2"}>
                <img
                  src={service.image}
                  alt={service.title}
                  className="rounded-2xl shadow-2xl w-full h-auto"
                  data-testid={`service-image-${service.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
