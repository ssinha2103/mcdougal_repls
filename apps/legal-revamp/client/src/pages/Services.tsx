import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, ArrowRight, Search, MousePointer, Share2, Monitor, TrendingUp, Mail, Users } from "lucide-react";

export default function Services() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const serviceParam = params.get('service');

  useEffect(() => {
    document.title = "Digital Marketing Services for Law Firms | Rainstar Digital";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Comprehensive digital marketing services for law firms: SEO, Google Ads, social media, web design, and more. Proven strategies that drive results."
      );
    }
  }, []);

  const services = [
    {
      id: "seo",
      icon: Search,
      title: "SEO (Search Engine Optimization)",
      subtitle: "Dominate Google Search Results",
      description: "Our award-winning SEO strategies help law firms rank higher in search results, attract high-intent prospects, and establish authority in their practice areas.",
      features: [
        "Technical SEO Audits & Optimization",
        "Local SEO for Legal Practices",
        "Content Strategy & Creation",
        "Link Building & Authority Development",
        "Competitive Analysis & Monitoring",
        "Google Algorithm Update Management"
      ],
      benefits: [
        "Increased organic search visibility",
        "Higher quality leads and inquiries",
        "Long-term sustainable growth",
        "Improved brand credibility and trust"
      ],
      process: [
        "Comprehensive SEO audit of your current website",
        "Keyword research and competitive analysis",
        "Technical optimization and site improvements",
        "Content creation and optimization strategy",
        "Local SEO setup and management",
        "Ongoing monitoring and reporting"
      ]
    },
    {
      id: "google-ads",
      icon: MousePointer,
      title: "Google Ads / PPC",
      subtitle: "Google Premier Partner Results",
      description: "As a Google Premier Partner invited to Google headquarters 4 consecutive years, we deliver exceptional paid advertising results that maximize your ROI.",
      features: [
        "Strategic Campaign Development",
        "Advanced Keyword Targeting",
        "Ad Copy Creation & Testing",
        "Landing Page Optimization",
        "Bid Management & Budget Control",
        "Conversion Tracking & Analytics"
      ],
      benefits: [
        "Immediate visibility in search results",
        "Precise targeting of ideal clients",
        "Measurable ROI and performance tracking",
        "Google compliance and best practices"
      ],
      process: [
        "Account setup and campaign structure",
        "Keyword research and ad group creation",
        "Compelling ad copy development",
        "Landing page optimization",
        "Campaign launch and monitoring",
        "Continuous optimization and reporting"
      ]
    },
    {
      id: "social-media",
      icon: Share2,
      title: "Social Media Marketing",
      subtitle: "Build Authority & Engage Prospects",
      description: "Establish thought leadership and maintain consistent brand presence across LinkedIn, Facebook, Twitter, and other relevant platforms for legal professionals.",
      features: [
        "LinkedIn Thought Leadership",
        "Content Calendar Planning",
        "Engagement Management",
        "Social Media Advertising",
        "Reputation Monitoring",
        "Crisis Communication Support"
      ],
      benefits: [
        "Enhanced brand visibility and recognition",
        "Improved client engagement and relationships",
        "Thought leadership positioning",
        "Referral generation and networking"
      ],
      process: [
        "Social media audit and strategy development",
        "Content calendar creation and approval",
        "Regular posting and engagement",
        "Performance monitoring and analytics",
        "Strategy refinement and optimization",
        "Monthly reporting and insights"
      ]
    },
    {
      id: "web-design",
      icon: Monitor,
      title: "Web Design & Development",
      subtitle: "Conversion-Focused Legal Websites",
      description: "Beautiful, functional websites designed specifically for law firms that convert visitors into clients while maintaining ADA compliance and mobile optimization.",
      features: [
        "Mobile-First Responsive Design",
        "ADA Compliance & Accessibility",
        "Speed Optimization",
        "SEO-Friendly Architecture",
        "Content Management Systems",
        "Security & SSL Implementation"
      ],
      benefits: [
        "Professional brand representation",
        "Improved user experience and engagement",
        "Higher conversion rates",
        "Search engine friendly structure"
      ],
      process: [
        "Discovery session and requirements gathering",
        "Design mockups and approval process",
        "Development and functionality integration",
        "Content migration and optimization",
        "Testing and quality assurance",
        "Launch and ongoing maintenance"
      ]
    },
    {
      id: "cro",
      icon: TrendingUp,
      title: "Conversion Rate Optimization",
      subtitle: "Turn Visitors Into Clients",
      description: "Systematic optimization of your website and marketing funnels to increase the percentage of visitors who become qualified leads and clients.",
      features: [
        "Website Performance Analysis",
        "A/B Testing & Experimentation",
        "User Experience Optimization",
        "Call-to-Action Enhancement",
        "Form Optimization",
        "Heat Mapping & User Behavior Analysis"
      ],
      benefits: [
        "Increased lead generation from existing traffic",
        "Better return on marketing investment",
        "Improved user experience",
        "Data-driven decision making"
      ],
      process: [
        "Conversion audit and baseline establishment",
        "Hypothesis development and testing plan",
        "Implementation of optimization tests",
        "Data collection and analysis",
        "Winning variation implementation",
        "Continuous improvement cycle"
      ]
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Marketing",
      subtitle: "Nurture Leads & Stay Connected",
      description: "Strategic email campaigns that nurture prospects, maintain client relationships, and position your firm as the go-to legal authority in your practice areas.",
      features: [
        "Email Campaign Strategy",
        "Newsletter Design & Content",
        "Automated Drip Campaigns",
        "Lead Nurturing Sequences",
        "Segmentation & Personalization",
        "Performance Analytics"
      ],
      benefits: [
        "Improved client retention and referrals",
        "Consistent brand visibility",
        "Lead nurturing and conversion",
        "Cost-effective communication channel"
      ],
      process: [
        "Email strategy development",
        "List segmentation and setup",
        "Campaign design and content creation",
        "Automation setup and testing",
        "Campaign deployment and monitoring",
        "Performance analysis and optimization"
      ]
    },
    {
      id: "consulting",
      icon: Users,
      title: "Marketing Consulting",
      subtitle: "Strategic Guidance & Training",
      description: "Direct access to John McDougall's expertise through strategic consulting sessions, training programs, and ongoing marketing guidance for your legal practice.",
      features: [
        "Strategic Marketing Planning",
        "Team Training & Education",
        "Marketing Audit & Assessment",
        "Growth Strategy Development",
        "Performance Review & Optimization",
        "Custom Solution Development"
      ],
      benefits: [
        "Expert strategic guidance",
        "Customized solutions for your practice",
        "Enhanced internal marketing capabilities",
        "Objective external perspective"
      ],
      process: [
        "Initial consultation and assessment",
        "Strategic planning session",
        "Custom strategy development",
        "Implementation roadmap creation",
        "Ongoing support and guidance",
        "Results monitoring and refinement"
      ]
    }
  ];

  const selectedService = serviceParam ? services.find(s => s.id === serviceParam) : null;

  return (
    <main className="pt-24">
      {/* Services Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
              Digital Marketing <span className="text-accent">Services</span>
              <br />
              for Law Firms
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Comprehensive marketing solutions designed specifically for legal professionals. 
              From SEO to social media, we help law firms grow their practice and attract high-value clients.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={`group bg-gradient-to-br from-white to-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up ${
                    selectedService?.id === service.id ? 'ring-2 ring-accent' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`service-card-${service.id}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-white text-2xl" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral mb-2">
                    {service.title}
                  </h3>
                  <p className="text-accent font-semibold mb-4">{service.subtitle}</p>
                  <p className="text-secondary mb-6 leading-relaxed">{service.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-accent group-hover:text-white transition-all duration-300"
                    data-testid={`service-learn-more-${service.id}`}
                  >
                    <Link href={`/services?service=${service.id}`}>
                      Learn More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Service Detail */}
      {selectedService && (
        <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-gradient-to-r from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <selectedService.icon className="text-white text-3xl" />
                </div>
                <h2 className="font-display text-4xl font-bold text-neutral mb-4">
                  {selectedService.title}
                </h2>
                <p className="text-xl text-accent font-semibold mb-6">{selectedService.subtitle}</p>
                <p className="text-lg text-secondary leading-relaxed">{selectedService.description}</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-12">
                {/* Features */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
                  <h3 className="font-display text-2xl font-bold text-neutral mb-6">What's Included</h3>
                  <ul className="space-y-3">
                    {selectedService.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                        <span className="text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
                  <h3 className="font-display text-2xl font-bold text-neutral mb-6">Key Benefits</h3>
                  <ul className="space-y-3">
                    {selectedService.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                        <span className="text-secondary">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
                  <h3 className="font-display text-2xl font-bold text-neutral mb-6">Our Process</h3>
                  <ol className="space-y-3">
                    {selectedService.process.map((step, index) => (
                      <li key={step} className="flex items-start">
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <span className="text-white text-sm font-semibold">{index + 1}</span>
                        </div>
                        <span className="text-secondary">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="text-center mt-16">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  data-testid={`service-contact-${selectedService.id}`}
                >
                  <Link href="/contact">
                    Get Started with {selectedService.title}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to Grow Your Practice?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how our proven digital marketing strategies can help your law firm attract more clients and increase revenue.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-accent hover:bg-primary hover:text-white shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            data-testid="services-cta-button"
          >
            <Link href="/contact">
              Schedule Your Free Consultation
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
