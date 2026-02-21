import {
  UserCheck,
  Briefcase,
  Accessibility,
  MapPin,
  Shield,
  DollarSign,
  Home,
  Scale,
} from "lucide-react";

export default function WhoWeHelp() {
  const practiceAreas = [
    { icon: UserCheck, name: "Personal Injury" },
    { icon: Briefcase, name: "Employment Law" },
    { icon: Accessibility, name: "Social Security Disability" },
    { icon: MapPin, name: "Immigration" },
    { icon: Shield, name: "Criminal Defense" },
    { icon: DollarSign, name: "Bankruptcy" },
    { icon: Home, name: "Estate & Probate" },
    { icon: Scale, name: "General Legal" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
            Who We Help
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            We specialize in digital marketing for law firms across various
            practice areas, delivering targeted strategies that drive results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceAreas.map((area, index) => {
            const IconComponent = area.icon;
            return (
              <div
                key={area.name}
                className="glass-morphism rounded-2xl p-6 text-center hover:bg-white/80 transform hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`practice-area-${area.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              >
                <IconComponent className="w-8 h-8 text-accent mb-4 mx-auto" />
                <h3 className="font-semibold text-lg text-neutral">{area.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
