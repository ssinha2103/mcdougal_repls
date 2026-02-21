import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-navy">Satterley & Kelley</div>
            <div className="hidden sm:block ml-2 text-sm text-legal-gray">PLLC</div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('map')} 
              className="text-legal-gray hover:text-navy transition-colors"
            >
              Exposure Sites
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-legal-gray hover:text-navy transition-colors"
            >
              About
            </button>
            <Link href="/results">
              <button className="text-legal-gray hover:text-navy transition-colors">
                Our Results
              </button>
            </Link>
            <Link href="/appellate-decisions">
              <button className="text-legal-gray hover:text-navy transition-colors">
                Case Law
              </button>
            </Link>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-legal-gray hover:text-navy transition-colors"
            >
              Contact
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-sm text-legal-gray">Free Consultation</div>
              <a 
                href="tel:855-385-9532" 
                className="text-lg font-bold text-legal-red hover:text-red-700 transition-colors"
              >
                855-385-9532
              </a>
            </div>
            
            {/* Mobile phone button */}
            <a 
              href="tel:855-385-9532" 
              className="md:hidden bg-legal-red text-white px-3 py-2 rounded text-sm font-semibold"
            >
              Call
            </a>
            

            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-legal-gray" />
              ) : (
                <Menu className="h-6 w-6 text-legal-gray" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => scrollToSection('map')} 
                className="block px-3 py-2 text-legal-gray hover:text-navy transition-colors"
              >
                Exposure Sites
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block px-3 py-2 text-legal-gray hover:text-navy transition-colors"
              >
                About
              </button>
              <Link href="/results">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-legal-gray hover:text-navy transition-colors"
                >
                  Our Results
                </button>
              </Link>
              <Link href="/appellate-decisions">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-legal-gray hover:text-navy transition-colors"
                >
                  Case Law
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block px-3 py-2 text-legal-gray hover:text-navy transition-colors"
              >
                Contact
              </button>
              <a 
                href="tel:855-385-9532" 
                className="block px-3 py-2 text-legal-red font-semibold"
              >
                Call: 855-385-9532
              </a>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
