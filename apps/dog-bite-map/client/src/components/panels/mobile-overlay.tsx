import { useState } from "react";
import { X, Phone, FileText } from "lucide-react";
import { TownData } from "@/types/town";
import BiteReportForm from "@/components/forms/bite-report-form";

interface MobileOverlayProps {
  selectedTown: TownData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileOverlay({ selectedTown, isOpen, onClose }: MobileOverlayProps) {
  const [activeView, setActiveView] = useState<"contacts" | "consultation">("contacts");

  if (!selectedTown || !isOpen) return null;

  return (
    <div 
      className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[2000]"
      data-testid="mobile-overlay"
      onClick={onClose}
    >
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '75vh', maxHeight: '75vh' }}
        data-testid="mobile-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-2"></div>
        
        {/* Panel Header */}
        <div className="px-4 pb-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-legal-blue" data-testid="text-mobile-town-name">
              {selectedTown.name}
            </h3>
            <p className="text-xs text-gray-500">Massachusetts Dog Bite Laws</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-close-mobile-panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveView("contacts")}
            className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center ${
              activeView === "contacts" 
                ? 'text-legal-blue border-b-2 border-legal-blue bg-blue-50' 
                : 'text-gray-500'
            }`}
            data-testid="button-mobile-contacts"
          >
            <Phone className="w-3 h-3 mr-1" />
            Laws & Contacts
          </button>
          <button
            onClick={() => setActiveView("consultation")}
            className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center ${
              activeView === "consultation" 
                ? 'text-legal-blue border-b-2 border-legal-blue bg-blue-50' 
                : 'text-gray-500'
            }`}
            data-testid="button-mobile-consultation"
          >
            <FileText className="w-3 h-3 mr-1" />
            Legal Help
          </button>
        </div>

        {/* Panel Content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-3">
            {activeView === "contacts" ? (
              <div className="space-y-3">
                {/* Dog Bite Laws Section */}
                <div>
                  <h4 className="text-base font-semibold text-legal-blue mb-2">Local Laws</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-800 text-sm mb-1">Leash Laws</h5>
                      <p className="text-xs text-gray-600">
                        Dogs must be leashed in public areas. Violation fines range from $50-$200.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-800 text-sm mb-1">Licensing Requirements</h5>
                      <p className="text-xs text-gray-600">
                        Annual dog licensing required. Contact town clerk for current fees and requirements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div>
                  <h4 className="text-base font-semibold text-legal-blue mb-2">Emergency Contacts</h4>
                  
                  <div className="space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-800 text-sm">Emergency</span>
                        <a 
                          href="tel:911" 
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                          data-testid="button-call-911"
                        >
                          Call 911
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-blue-800 text-sm block">Animal Control</span>
                          <span className="text-xs text-blue-600">Non-emergency</span>
                        </div>
                        <a 
                          href="tel:978-555-0100" 
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                          data-testid="button-call-animal-control"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800 text-sm">Police (Non-Emergency)</span>
                        <a 
                          href="tel:978-555-0200" 
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                          data-testid="button-call-police"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Reporting Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-blue-800 text-sm mb-1">📋 Required Reporting</h4>
                  <p className="text-blue-700 text-xs">
                    <strong>Massachusetts law requires all dog bites to be reported immediately to local authorities.</strong> 
                    Use the contact numbers above. Legal consultation is separate.
                  </p>
                </div>

                {/* Legal Consultation Button */}
                <div className="mt-4 mb-4">
                  <button 
                    onClick={() => setActiveView("consultation")}
                    className="w-full bg-legal-gold text-legal-blue py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-400 transition-colors"
                    data-testid="button-consultation"
                  >
                    Get Free Legal Consultation
                  </button>
                  <p className="text-center text-gray-500 text-sm mt-2">
                    Free consultation • No fees unless we win
                  </p>
                </div>
              </div>
            ) : activeView === "consultation" ? (
              <div className="h-fit">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="font-semibold text-yellow-800 text-sm mb-1">⚠️ Important Legal Notice</div>
                  <p className="text-yellow-700 text-xs leading-relaxed">
                    <strong>This form is for requesting a free legal consultation only.</strong> 
                    Submitting this form does not fulfill your legal obligation to report a dog bite to local authorities. 
                    You must report directly to your town's animal control officer or police department.
                  </p>
                </div>
                <BiteReportForm selectedTown={selectedTown} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
