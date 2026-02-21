import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, Phone, Mail, ChevronDown } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-background/90 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-6">
        {/* Top Contact Bar */}
        <div className="hidden md:flex justify-end py-2 text-sm text-secondary border-b border-primary/20">
          <div className="flex items-center space-x-6">
            <a
              href="mailto:john@rainstardigital.com"
              className="flex items-center hover:text-accent transition-colors"
              data-testid="header-email-link"
            >
              <Mail className="w-4 h-4 mr-2" />
              john@rainstardigital.com
            </a>
            <a
              href="tel:(978)750-8000"
              className="flex items-center hover:text-accent transition-colors"
              data-testid="header-phone-link"
            >
              <Phone className="w-4 h-4 mr-2" />
              (978) 750-8000
            </a>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" data-testid="header-logo-link">
              <div className="flex flex-col items-start">
                {/* Curved line */}
                <div className="relative mb-1">
                  <svg width="180" height="12" viewBox="0 0 180 12" className="text-neutral">
                    <path
                      d="M5 10 Q90 0 175 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="opacity-60"
                    />
                    <circle cx="10" cy="9" r="1.5" fill="currentColor" className="opacity-80" />
                  </svg>
                </div>
                {/* Main logo text */}
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-neutral tracking-tight">Rainstar</span>
                  <span className="text-2xl font-bold text-neutral tracking-tight">Digital</span>
                </div>
                {/* Subtitle */}
                <div className="text-xs font-medium text-secondary tracking-[0.2em] uppercase mt-1">
                  Legal Marketing
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link
                    href="/about"
                    className="text-neutral hover:text-accent transition-colors font-medium px-3 py-2"
                    data-testid="nav-about-link"
                  >
                    About
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-neutral hover:text-accent transition-colors font-medium"
                    data-testid="nav-services-trigger"
                  >
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 space-y-2">
                      <Link
                        href="/services?service=seo"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-seo-link"
                      >
                        SEO
                      </Link>
                      <Link
                        href="/services?service=google-ads"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-google-ads-link"
                      >
                        Google Ads / PPC
                      </Link>
                      <Link
                        href="/services?service=social-media"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-social-media-link"
                      >
                        Social Media
                      </Link>
                      <Link
                        href="/services?service=web-design"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-web-design-link"
                      >
                        Web Design
                      </Link>
                      <Link
                        href="/services?service=cro"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-cro-link"
                      >
                        Conversion Rate Optimization
                      </Link>
                      <Link
                        href="/services?service=email"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-email-link"
                      >
                        Email Marketing
                      </Link>
                      <Link
                        href="/services?service=consulting"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-consulting-link"
                      >
                        Consulting
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-neutral hover:text-accent transition-colors font-medium"
                    data-testid="nav-speaking-trigger"
                  >
                    Speaking
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-4 space-y-2">
                      <Link
                        href="/speaking?type=webinars"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-webinars-link"
                      >
                        Webinars
                      </Link>
                      <Link
                        href="/speaking?type=podcasts"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-podcasts-link"
                      >
                        Podcasts
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    href="/blog"
                    className="text-neutral hover:text-accent transition-colors font-medium px-3 py-2"
                    data-testid="nav-blog-link"
                  >
                    Blog
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-neutral hover:text-accent transition-colors font-medium"
                    data-testid="nav-resources-trigger"
                  >
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-72 p-4 space-y-2">
                      <Link
                        href="/resources?type=downloads"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-downloads-link"
                      >
                        Free Downloads
                      </Link>
                      <Link
                        href="/resources?type=checklist"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-checklist-link"
                      >
                        The Big Dog Authority Marketing Checklist
                      </Link>
                      <Link
                        href="/resources?type=cylinders"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-cylinders-link"
                      >
                        Web Marketing on All Cylinders
                      </Link>
                      <Link
                        href="/resources?type=content-seo"
                        className="block py-2 px-4 text-neutral hover:text-accent hover:bg-primary/10 rounded-lg transition-all"
                        data-testid="nav-content-seo-link"
                      >
                        Content Marketing and SEO for Law Firms
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button
              asChild
              className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              data-testid="header-contact-button"
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                data-testid="mobile-menu-trigger"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 flex flex-col">
              <SheetHeader className="flex-shrink-0">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access all pages and services from Rainstar Digital</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8 overflow-y-auto flex-1 pr-2 mobile-nav-scroll">
                <SheetClose asChild>
                  <Link
                    href="/about"
                    className="text-neutral hover:text-accent transition-colors font-medium py-2"
                    data-testid="mobile-nav-about-link"
                  >
                    About
                  </Link>
                </SheetClose>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex items-center justify-between w-full text-neutral hover:text-accent transition-colors font-medium py-2"
                    data-testid="mobile-nav-services-toggle"
                  >
                    <span>Services</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileServicesOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="pl-4 space-y-2 animate-slide-down">
                      <SheetClose asChild>
                        <Link
                          href="/services?service=seo"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-seo-link"
                        >
                          SEO
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/services?service=google-ads"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-google-ads-link"
                        >
                          Google Ads / PPC
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/services?service=social-media"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-social-media-link"
                        >
                          Social Media
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/services?service=web-design"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-web-design-link"
                        >
                          Web Design
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
                
                <SheetClose asChild>
                  <Link
                    href="/speaking"
                    className="text-neutral hover:text-accent transition-colors font-medium py-2"
                    data-testid="mobile-nav-speaking-link"
                  >
                    Speaking
                  </Link>
                </SheetClose>
                
                <SheetClose asChild>
                  <Link
                    href="/blog"
                    className="text-neutral hover:text-accent transition-colors font-medium py-2"
                    data-testid="mobile-nav-blog-link"
                  >
                    Blog
                  </Link>
                </SheetClose>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                    className="flex items-center justify-between w-full text-neutral hover:text-accent transition-colors font-medium py-2"
                    data-testid="mobile-nav-resources-toggle"
                  >
                    <span>Resources</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileResourcesOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {mobileResourcesOpen && (
                    <div className="pl-4 space-y-2 animate-slide-down">
                      <SheetClose asChild>
                        <Link
                          href="/resources?type=webinars"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-webinars-link"
                        >
                          Webinars
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/resources?type=downloadables"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-downloadables-link"
                        >
                          Downloads
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/resources?type=podcasts"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-podcasts-link"
                        >
                          Insights Podcast
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/resources?type=cylinders"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-cylinders-link"
                        >
                          Web Marketing on All Cylinders
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/resources?type=content-seo"
                          className="block text-neutral hover:text-accent transition-colors py-1"
                          data-testid="mobile-nav-content-seo-link"
                        >
                          Content Marketing and SEO for Law Firms
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
                
                <SheetClose asChild>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-accent to-secondary text-white mt-4"
                    data-testid="mobile-nav-contact-button"
                  >
                    <Link href="/contact">Contact</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
