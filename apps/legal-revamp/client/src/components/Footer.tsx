import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiLinkedin, SiX, SiFacebook, SiYoutube } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-neutral to-accent text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <img
              src="https://rainstardigital.com/wp-content/uploads/2025/03/cropped-Logo-1.png"
              alt="Rainstar Digital"
              className="h-12 w-auto mb-6 filter brightness-0 invert"
              data-testid="footer-logo"
            />
            <p className="text-white/80 mb-6 leading-relaxed">
              Leading the field of website marketing for Law Firms since 1995. We
              help legal professionals achieve sustainable growth through proven
              digital marketing strategies.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                data-testid="footer-linkedin-link"
              >
                <SiLinkedin className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                data-testid="footer-twitter-link"
              >
                <SiX className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                data-testid="footer-facebook-link"
              >
                <SiFacebook className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                data-testid="footer-youtube-link"
              >
                <SiYoutube className="text-white w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-xl font-bold mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services?service=seo"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-seo-link"
                >
                  SEO
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=google-ads"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-google-ads-link"
                >
                  Google Ads / PPC
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=social-media"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-social-media-link"
                >
                  Social Media
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=web-design"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-web-design-link"
                >
                  Web Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=cro"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-cro-link"
                >
                  Conversion Rate Optimization
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=email"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-email-link"
                >
                  Email Marketing
                </Link>
              </li>
              <li>
                <Link
                  href="/services?service=consulting"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-consulting-link"
                >
                  Consulting
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-xl font-bold mb-6">Get In Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                <a
                  href="mailto:john@rainstardigital.com"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-email"
                >
                  john@rainstardigital.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <a
                  href="tel:(978)750-8000"
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="footer-phone"
                >
                  (978) 750-8000
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1" />
                <span className="text-white/80" data-testid="footer-address">
                  Massachusetts, USA
                  <br />
                  Serving Law Firms Nationwide
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                asChild
                variant="outline"
                className="bg-white/20 backdrop-blur-lg border-white/30 text-white hover:bg-white hover:text-accent transition-all duration-300"
                data-testid="footer-consultation-button"
              >
                <Link href="/contact">
                  Schedule Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <hr className="border-white/20 my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 mb-4 md:mb-0" data-testid="footer-copyright">
            &copy; 2024 Rainstar Digital. All rights reserved. | Leading Legal
            Marketing Since 1995
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white transition-colors"
              data-testid="footer-privacy-link"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-white transition-colors"
              data-testid="footer-terms-link"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
