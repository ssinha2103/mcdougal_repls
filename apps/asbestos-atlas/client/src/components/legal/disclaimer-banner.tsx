import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import LegalPopup from "./legal-popup";

export default function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('disclaimerBannerDismissed');
    if (!dismissed) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('disclaimerBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-navy text-white p-2 sm:p-4 shadow-lg z-50 border-t-4 border-legal-red">
      <div className="max-w-6xl mx-auto flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm leading-tight">
            <strong className="block sm:inline">Attorney Advertising:</strong>
            <span className="hidden sm:inline"> This website contains attorney advertising. Past results do not guarantee future outcomes. Please read our </span>
            <span className="block sm:hidden"> Please read our </span>
            <LegalPopup type="disclaimer">
              <button className="text-yellow-300 hover:text-yellow-100 underline">
                disclaimer
              </button>
            </LegalPopup>
            {" "}and{" "}
            <LegalPopup type="privacy">
              <button className="text-yellow-300 hover:text-yellow-100 underline">
                privacy policy
              </button>
            </LegalPopup>
            .
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-white hover:text-gray-300 flex-shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}