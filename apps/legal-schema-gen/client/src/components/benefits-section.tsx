import { Search, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Search,
      title: "Improve Local SEO",
      description: "Stand out in search results with rich snippets showing your practice areas, location, and ratings. Help potential clients find you faster.",
    },
    {
      icon: CheckCircle,
      title: "100% Accurate Markup",
      description: "Generate Schema.org compliant JSON-LD markup that follows Google's structured data guidelines perfectly, every time.",
    },
    {
      icon: Clock,
      title: "Save Hours of Work",
      description: "No coding required. What would take hours to write manually is generated in seconds with our intuitive form interface.",
    },
  ];

  return (
    <div className="border-t bg-muted/20">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Why Use Schema Markup?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Structured data helps search engines understand your law firm better, leading to enhanced visibility and more qualified leads.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6 hover-elevate">
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
