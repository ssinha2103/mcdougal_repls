import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Award,
  Building2,
  Calendar,
  ExternalLink,
  Users,
  TrendingUp,
  Target,
  BookOpen
} from "lucide-react";
// McDougall Interactive official logo from their website
const mcdougallLogo = "https://mcdia.wpenginepowered.com/wp-content/uploads/2019/10/McDougall-Interactive-LOGO-transparent-300x103.png";

export default function Contact() {
  return (
    <div className="min-h-screen liquid-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 liquid-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact McDougall Interactive
          </h1>
        </div>

        {/* Agency Introduction */}
        <Card className="glass-card rounded-3xl border-0 shadow-2xl mb-8" style={{ background: 'var(--liquid-gradient-1)' }}>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                    <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Award-Winning Digital Marketing Agency
                    </h2>
                    <Badge variant="default" className="bg-blue-600 text-white px-3 py-1 mt-1">
                      Since 1995
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                  For over 27 years, McDougall Interactive has been helping companies like yours grow through 
                  strategic SEO, content marketing, and comprehensive digital solutions. Our track record speaks for itself.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Multi-Billion $ Clients
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    Harvard Speakers
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                    Award-Winning
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 glass-card rounded-2xl">
                  <div className="text-2xl font-bold text-blue-600">27+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Years Experience</div>
                </div>
                <div className="text-center p-4 glass-card rounded-2xl">
                  <div className="text-2xl font-bold text-green-600">$15M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Client Sales Generated</div>
                </div>
                <div className="text-center p-4 glass-card rounded-2xl">
                  <div className="text-2xl font-bold text-purple-600">1,454%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Best SEO Results</div>
                </div>
                <div className="text-center p-4 glass-card rounded-2xl">
                  <div className="text-2xl font-bold text-orange-600">200+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Companies Served</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-2)' }}>
              <CardHeader className="pb-6 rounded-t-3xl px-8 py-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' }}>
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Get Expert Digital Marketing Consultation
                  </span>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ready to implement professional SEO strategies? Let's discuss how we can help grow your business.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        className="glass-card border-white/20 bg-white/10 dark:bg-black/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700 dark:text-gray-200 font-medium">
                        Company Name
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your Company"
                        className="glass-card border-white/20 bg-white/10 dark:bg-black/10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="glass-card border-white/20 bg-white/10 dark:bg-black/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200 font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="glass-card border-white/20 bg-white/10 dark:bg-black/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-700 dark:text-gray-200 font-medium">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="glass-card border-white/20 bg-white/10 dark:bg-black/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-gray-700 dark:text-gray-200 font-medium">
                      Primary Interest
                    </Label>
                    <select 
                      id="service" 
                      className="w-full p-3 glass-card border-white/20 bg-white/10 dark:bg-black/10 rounded-lg text-gray-900 dark:text-white"
                    >
                      <option value="">Select a service...</option>
                      <option value="seo">SEO Services</option>
                      <option value="content">Content Marketing</option>
                      <option value="ppc">Paid Search (PPC)</option>
                      <option value="social">Social Media Marketing</option>
                      <option value="web-design">Web Design & Development</option>
                      <option value="strategy">Digital Marketing Strategy</option>
                      <option value="consultation">Free Strategy Session</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 dark:text-gray-200 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your digital marketing goals and challenges..."
                      className="glass-card border-white/20 bg-white/10 dark:bg-black/10 min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full liquid-button text-lg py-6">
                      Send Message & Request Consultation
                    </Button>
                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-3">
                      We typically respond within 2 business hours
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-3)' }}>
              <CardHeader className="pb-4 rounded-t-3xl px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Get in Touch
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass-card bg-blue-100 dark:bg-blue-900/30">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Website</div>
                      <a 
                        href="https://www.mcdougallinteractive.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        mcdougallinteractive.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass-card bg-green-100 dark:bg-green-900/30">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Email</div>
                      <a 
                        href="mailto:info@mcdougallinteractive.com" 
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm"
                      >
                        info@mcdougallinteractive.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass-card bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Free Consultation</div>
                      <a 
                        href="https://www.mcdougallinteractive.com/services/free-strategy-session/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm flex items-center gap-1"
                      >
                        Book 15-Min Session
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Overview */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-4)' }}>
              <CardHeader className="pb-4 rounded-t-3xl px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Our Services
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">SEO & Organic Search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span className="text-gray-900 dark:text-white">Content Marketing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-900 dark:text-white">Social Media Marketing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-900 dark:text-white">Web Design & Development</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <a 
                    href="https://www.mcdougallinteractive.com/services/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full liquid-button-secondary text-sm">
                      View All Services
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* More Tools */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-2)' }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 rounded-2xl glass-card mx-auto w-fit mb-3" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))' }}>
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">More Tools & Resources</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Explore our comprehensive collection of digital marketing tools, guides, and resources.
                  </p>
                  <Button 
                    className="w-full liquid-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Redirecting to McDougall Interactive resources...');
                      window.location.href = 'https://www.mcdougallinteractive.com/resources/';
                    }}
                  >
                    Explore All Tools
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="glass-card rounded-3xl border-0 shadow-2xl" style={{ background: 'var(--liquid-gradient-1)' }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 rounded-2xl glass-card mx-auto w-fit mb-3" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Proven Results</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    See how we've helped companies achieve remarkable growth through strategic digital marketing.
                  </p>
                  <a 
                    href="https://www.mcdougallinteractive.com/work/case-studies/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full liquid-button-secondary">
                      View Case Studies
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-background border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <img 
                  src={mcdougallLogo} 
                  alt="McDougall Interactive" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © 2025 McDougall Interactive. AI SEO PageScore - Advanced competitive analysis tool.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="https://www.mcdougallinteractive.com/about/about-us/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                About Us
              </a>
              <Link href="/">
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">Analysis Tool</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.mcdougallinteractive.com/resources/', '_blank', 'noopener,noreferrer');
                }}
                className="text-sm text-muted-foreground hover:text-primary bg-transparent border-none cursor-pointer"
              >
                More Tools
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}