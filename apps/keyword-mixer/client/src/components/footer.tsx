import logoImage from "@assets/image_1753914581684.png";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <a 
                href="https://www.mcdougallinteractive.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src={logoImage} 
                  alt="McDougall Interactive - Search + Social + Content"
                  className="h-12 w-auto rounded-md hover:opacity-90 transition-opacity"
                />
              </a>
              <div>
                <p className="text-gray-400 text-sm">Award-Winning Digital Marketing Agency</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              27 years of successful content marketing, SEO, and digital strategy. 
              We help businesses attract their best customers and grow their brands.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.mcdougallinteractive.com/services/free-strategy-session/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Your 15 Min Consult
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/services/seo/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  SEO Services
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/services/paid-search/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Paid Search
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/services/social/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Social Media
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/services/seo-web-design-dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Web Design
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/services/blogs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Content Marketing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/about/about-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/work/case-studies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Case Studies
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/work/testimonials/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mcdougallinteractive.com/contact/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="https://talkmarketing.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Talk Marketing Academy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 McDougall Interactive. Digital Marketing Since 1995. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Keyword Combiner Tool</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">Powered by McDougall Interactive</span>
          </div>
        </div>
      </div>
    </footer>
  );
}