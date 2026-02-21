import { Facebook, Twitter, Linkedin } from "lucide-react";
import LegalPopup from "@/components/legal/legal-popup";

export default function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4">Satterley & Kelley PLLC</div>
            <p className="text-blue-200 mb-4">
              Trusted Kentucky mesothelioma attorneys helping asbestos exposure victims for over 20 years. 
              You do not have to stand alone.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/Satterley-Kelley-PLLC-544048072297787/" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/SatterleyKelley" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/22290178/" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Practice Areas</h4>
            <ul className="space-y-2 text-blue-200">
              <li><a href="https://www.satterleylaw.com/asbestos-mesothelioma/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Asbestos & Mesothelioma</a></li>
              <li><a href="https://www.satterleylaw.com/personal-injury/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Personal Injury</a></li>
              <li><a href="https://www.satterleylaw.com/personal-injury/car-accidents/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Car Accidents</a></li>
              <li><a href="https://www.satterleylaw.com/personal-injury/wrongful-death/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Wrongful Death</a></li>
              <li><a href="https://www.satterleylaw.com/personal-injury/railroad-worker-accidents-and-fela/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Railroad Injuries</a></li>
              <li><a href="https://www.satterleylaw.com/asbestos-mesothelioma/toxic-torts/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Toxic Torts</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-blue-200">
              <li><a href="https://www.satterleylaw.com/about/" className="hover:text-white" target="_blank" rel="noopener noreferrer">About Our Firm</a></li>
              <li><a href="https://www.satterleylaw.com/verdicts-settlements/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Verdicts & Settlements</a></li>
              <li><a href="https://www.satterleylaw.com/attorney/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Our Attorneys</a></li>
              <li><a href="https://www.satterleylaw.com/contact/" className="hover:text-white" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
              <li><a href="tel:855-385-9532" className="hover:text-white">855-385-9532</a></li>
              <li className="text-sm">8700 Westport Road, Suite 202<br/>Louisville, KY 40242</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
          <p>&copy; 2025 Satterley & Kelley PLLC • All Rights Reserved</p>
          <div className="mt-2 space-x-4">
            <LegalPopup type="disclaimer">
              <button className="hover:text-white">Disclaimer</button>
            </LegalPopup>
            <span>|</span>
            <LegalPopup type="privacy">
              <button className="hover:text-white">Privacy Policy</button>
            </LegalPopup>
            <span>|</span>
            <a href="#" className="hover:text-white">Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
