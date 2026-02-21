import { Eye, TrendingUp, ClipboardCheck, Lightbulb, AlertTriangle, Smartphone } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: "Live SERP Preview",
      description: "See exactly how your page appears in Google search results on both desktop and mobile devices",
      bgColor: "bg-blue-100"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Character Analysis",
      description: "Real-time character counting with optimal length recommendations for titles and descriptions",
      bgColor: "bg-green-100"
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-purple-600" />,
      title: "SEO Audit",
      description: "Comprehensive audit checking for missing tags, duplicates, and optimization opportunities",
      bgColor: "bg-purple-100"
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-600" />,
      title: "Smart Recommendations",
      description: "Actionable suggestions to improve your meta tags and search engine visibility",
      bgColor: "bg-yellow-100"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: "Issue Detection",
      description: "Automatically identify common SEO problems like missing or duplicate meta tags",
      bgColor: "bg-red-100"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-teal-600" />,
      title: "Mobile Optimized",
      description: "Separate mobile preview to ensure your content looks great on all devices",
      bgColor: "bg-teal-100"
    }
  ];

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Complete SEO Meta Tag Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to optimize your search engine presence
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-card rounded-lg border border-border p-6 shadow-sm text-center"
            data-testid={`feature-${index}`}
          >
            <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
