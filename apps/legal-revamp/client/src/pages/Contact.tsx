import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Calendar, Clock, Users, CheckCircle } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    practiceArea: "",
    currentWebsite: "",
    budget: "",
    services: [] as string[],
    message: "",
    preferredContact: "",
    timeline: ""
  });

  useEffect(() => {
    document.title = "Contact Rainstar Digital | Schedule Your Free Legal Marketing Consultation";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Schedule a free consultation with legal marketing experts. Contact John McDougall and the Rainstar Digital team to grow your law firm's online presence."
      );
    }
  }, []);

  const submitContactForm = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll be in touch within 24 hours to schedule your free consultation.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        practiceArea: "",
        currentWebsite: "",
        budget: "",
        services: [] as string[],
        message: "",
        preferredContact: "",
        timeline: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error Sending Message",
        description: "Please try again or call us directly at (978) 750-8000.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    submitContactForm.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const practiceAreas = [
    "Personal Injury",
    "Employment Law", 
    "Criminal Defense",
    "Family Law",
    "Corporate Law",
    "Real Estate",
    "Immigration",
    "Bankruptcy",
    "Estate Planning",
    "Other"
  ];

  const services = [
    "SEO (Search Engine Optimization)",
    "Google Ads / PPC",
    "Social Media Marketing",
    "Web Design & Development",
    "Content Marketing",
    "Local SEO",
    "Reputation Management",
    "Marketing Consulting",
    "Complete Marketing Audit"
  ];

  const budgetRanges = [
    "Under $2,500/month",
    "$2,500 - $5,000/month",
    "$5,000 - $10,000/month",
    "$10,000 - $20,000/month",
    "$20,000+/month",
    "Project-based pricing",
    "Need consultation on budget"
  ];

  return (
    <main className="pt-24">
      {/* Contact Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
              Start Your <span className="text-accent">Legal Marketing</span> Journey
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Schedule a free consultation with John McDougall and discover how proven digital marketing strategies can grow your law firm. 
              No sales pressure, just honest advice from 30+ years of experience.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-accent mb-2">4</div>
              <div className="text-secondary">Google HQ Invites</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-accent mb-2">2</div>
              <div className="text-secondary">Published Books</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-accent mb-2">30+</div>
              <div className="text-secondary">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-primary/5">
                <CardHeader>
                  <CardTitle className="font-display text-3xl font-bold text-neutral">
                    Schedule Your Free Consultation
                  </CardTitle>
                  <p className="text-secondary">
                    Tell us about your law firm and marketing goals. We'll provide personalized recommendations in our consultation.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-neutral font-semibold">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Your full name"
                          className="mt-2"
                          data-testid="contact-name-input"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-neutral font-semibold">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your@email.com"
                          className="mt-2"
                          data-testid="contact-email-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="text-neutral font-semibold">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                          className="mt-2"
                          data-testid="contact-phone-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-neutral font-semibold">Law Firm Name</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Your law firm name"
                          className="mt-2"
                          data-testid="contact-company-input"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="practiceArea" className="text-neutral font-semibold">Primary Practice Area</Label>
                        <Select onValueChange={(value) => handleInputChange("practiceArea", value)}>
                          <SelectTrigger className="mt-2" data-testid="contact-practice-area-select">
                            <SelectValue placeholder="Select practice area" />
                          </SelectTrigger>
                          <SelectContent>
                            {practiceAreas.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currentWebsite" className="text-neutral font-semibold">Current Website</Label>
                        <Input
                          id="currentWebsite"
                          value={formData.currentWebsite}
                          onChange={(e) => handleInputChange("currentWebsite", e.target.value)}
                          placeholder="https://yourfirm.com"
                          className="mt-2"
                          data-testid="contact-website-input"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="budget" className="text-neutral font-semibold">Marketing Budget</Label>
                        <Select onValueChange={(value) => handleInputChange("budget", value)}>
                          <SelectTrigger className="mt-2" data-testid="contact-budget-select">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetRanges.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeline" className="text-neutral font-semibold">Timeline to Start</Label>
                        <Select onValueChange={(value) => handleInputChange("timeline", value)}>
                          <SelectTrigger className="mt-2" data-testid="contact-timeline-select">
                            <SelectValue placeholder="When would you like to start?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="within-month">Within 1 month</SelectItem>
                            <SelectItem value="1-3-months">1-3 months</SelectItem>
                            <SelectItem value="3-6-months">3-6 months</SelectItem>
                            <SelectItem value="exploring">Just exploring options</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-neutral font-semibold">Services of Interest</Label>
                      <div className="grid md:grid-cols-2 gap-3 mt-2">
                        {services.map((service) => (
                          <label key={service} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded border-primary text-accent focus:ring-accent"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    services: [...prev.services, service]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    services: prev.services.filter(s => s !== service)
                                  }));
                                }
                              }}
                              data-testid={`contact-service-${service.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <span className="text-sm text-secondary">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredContact" className="text-neutral font-semibold">Preferred Contact Method</Label>
                      <Select onValueChange={(value) => handleInputChange("preferredContact", value)}>
                        <SelectTrigger className="mt-2" data-testid="contact-preferred-method-select">
                          <SelectValue placeholder="How should we contact you?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="either">Either Email or Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-neutral font-semibold">Tell Us About Your Goals *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="What are your main marketing challenges? What goals would you like to achieve? Any specific questions for our consultation?"
                        rows={5}
                        className="mt-2"
                        data-testid="contact-message-textarea"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitContactForm.isPending}
                      className="w-full bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      data-testid="contact-submit-button"
                    >
                      {submitContactForm.isPending ? "Sending..." : "Schedule Free Consultation"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-secondary/5">
                <CardHeader>
                  <CardTitle className="font-display text-2xl font-bold text-neutral">
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral mb-1">Phone</h4>
                      <a 
                        href="tel:(978)750-8000" 
                        className="text-secondary hover:text-accent transition-colors"
                        data-testid="contact-info-phone"
                      >
                        (978) 750-8000
                      </a>
                      <p className="text-sm text-secondary mt-1">Mon-Fri, 9 AM - 6 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral mb-1">Email</h4>
                      <a 
                        href="mailto:john@rainstardigital.com" 
                        className="text-secondary hover:text-accent transition-colors"
                        data-testid="contact-info-email"
                      >
                        john@rainstardigital.com
                      </a>
                      <p className="text-sm text-secondary mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral mb-1">Location</h4>
                      <p className="text-secondary">Massachusetts, USA</p>
                      <p className="text-sm text-secondary mt-1">Serving law firms nationwide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-accent/5">
                <CardHeader>
                  <CardTitle className="font-display text-2xl font-bold text-neutral">
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-neutral">45-Minute Strategy Session</h5>
                      <p className="text-sm text-secondary">Comprehensive analysis of your current marketing and growth opportunities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-neutral">Custom Recommendations</h5>
                      <p className="text-sm text-secondary">Personalized action plan based on your practice area and goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-neutral">Direct Access to Experts</h5>
                      <p className="text-sm text-secondary">Speak directly with John McDougall and senior team members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Premier Partner Badge */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-accent/10 to-secondary/10">
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🏆</span>
                  </div>
                  <h4 className="font-semibold text-neutral mb-2">Google Premier Partner</h4>
                  <p className="text-sm text-secondary">
                    Invited to Google headquarters 4 consecutive years for exceptional performance
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral mb-6">
              Frequently Asked <span className="text-accent">Questions</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How quickly can we see results from legal marketing?",
                answer: "SEO typically shows significant improvements in 3-6 months, while Google Ads can generate leads immediately. We provide monthly reports to track progress and adjust strategies based on performance data."
              },
              {
                question: "Do you work with solo practitioners or just large firms?",
                answer: "We work with law firms of all sizes, from solo practitioners to large regional firms. Our strategies are customized based on your practice size, budget, and growth goals."
              },
              {
                question: "Are your marketing strategies compliant with legal advertising rules?",
                answer: "Absolutely. We stay current with state bar regulations and ensure all marketing materials and strategies comply with legal advertising requirements. Compliance is built into every campaign we create."
              },
              {
                question: "What makes Rainstar Digital different from other marketing agencies?",
                answer: "We specialize exclusively in legal marketing with 30+ years of experience. As a Google Premier Partner, we have direct access to the latest tools and insights. You work directly with John McDougall and senior team members, not junior staff."
              },
              {
                question: "Do you require long-term contracts?",
                answer: "No, we don't believe in locking clients into long-term contracts. We prefer to earn your business month by month through proven results and exceptional service. You can cancel anytime with 30 days notice."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`faq-${index}`}
              >
                <h3 className="font-semibold text-neutral mb-3">{faq.question}</h3>
                <p className="text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
