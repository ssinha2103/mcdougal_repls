import { Eye, Crown, Scale, Settings } from "lucide-react";

export default function WhyChooseUs() {
  const differentiators = [
    {
      icon: Eye,
      title: "Transparent Pricing, No Lock-In",
      description:
        "You'll never be in the dark about where your budget is going or how your campaigns are performing. If you ever decide to leave, we will help offboard you with your new agency. We don't believe in trapping clients and only want to work with you if you are happy. We value long-term relationships built on trust, not contracts.",
      gradient: "from-accent to-secondary",
    },
    {
      icon: Crown,
      title: "A Proven Leader",
      description:
        "With John McDougall at the helm, we bring over 30 years of digital marketing expertise combined with cutting-edge strategies that keep law firms ahead. When you work with Rainstar Digital, you work directly with John McDougall and his right-hand man, John Maher—no handoffs to junior staff, no bait-and-switch.",
      gradient: "from-secondary to-primary",
    },
    {
      icon: Scale,
      title: "Legal Marketing Focus",
      description:
        "We understand the unique challenges law firms face—from navigating strict advertising rules to competing in high-cost, high-stakes markets. Our deep industry knowledge allows us to craft marketing strategies that comply with legal standards while standing out in crowded digital spaces.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Settings,
      title: "Holistic Approach",
      description:
        "We don't just chase clicks or rankings—we build systems that work together. Our strategies combine SEO, targeted content, website design, and social media to create a seamless online experience for potential clients. Every element is aligned to strengthen conversations.",
      gradient: "from-accent to-neutral",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
            Why <span className="text-accent">Rainstar Digital</span>?
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            We're not just another marketing agency. We're your strategic partner
            in legal marketing success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {differentiators.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="group glass-morphism rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up bg-white/80 backdrop-blur-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`differentiator-${item.title.toLowerCase().replace(/ /g, '-').replace(/,/g, '')}`}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="text-white text-3xl" />
                </div>
                <h3 className="font-display text-2xl font-bold text-neutral mb-4">
                  {item.title}
                </h3>
                <p className="text-secondary leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
