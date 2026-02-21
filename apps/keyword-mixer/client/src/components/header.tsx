import { Link } from "wouter";
import logoImage from "@assets/image_1753914581684.png";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 hidden">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* McDougall Interactive Logo */}
          <div className="flex items-center space-x-3">
            <a 
              href="https://www.mcdougallinteractive.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src={logoImage} 
                alt="McDougall Interactive - Search + Social + Content"
                className="h-10 w-auto rounded-md hover:opacity-90 transition-opacity"
              />
            </a>
            <div>
              <p className="text-sm text-gray-600">Digital Marketing Since 1995</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Keyword Combiner
            </Link>
            <a 
              href="https://www.mcdougallinteractive.com/services/seo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              SEO Services
            </a>
            <a 
              href="https://www.mcdougallinteractive.com/services/paid-search/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              PPC Services
            </a>
            <a 
              href="https://www.mcdougallinteractive.com/contact/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get In Touch
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}