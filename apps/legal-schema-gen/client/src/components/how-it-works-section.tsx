import { Edit3, Zap, Copy, Rocket } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Edit3,
      number: "1",
      title: "Fill the Form",
      description: "Enter your law firm's details, practice areas, and attorney information.",
    },
    {
      icon: Zap,
      number: "2",
      title: "Generate Schema",
      description: "Watch as your schema markup is created in real-time as you type.",
    },
    {
      icon: Copy,
      number: "3",
      title: "Copy the Code",
      description: "Copy the generated JSON-LD markup in your preferred format.",
    },
    {
      icon: Rocket,
      number: "4",
      title: "Boost Your SEO",
      description: "Add it to your website and start ranking better in local searches.",
    },
  ];

  return (
    <div className="border-t">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Four simple steps to professional schema markup
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 -z-10 hidden md:block">
                  {index < steps.length - 1 && (
                    <div className="w-48 h-0.5 bg-border absolute left-8" />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                    {step.number}
                  </div>
                  <h3 className="font-semibold tracking-tight mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
