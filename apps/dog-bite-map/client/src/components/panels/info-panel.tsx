import { useState } from "react";
import { X, Map, Phone, FileText } from "lucide-react";
import { TownData } from "@/types/town";
import BiteReportForm from "@/components/forms/bite-report-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InfoPanelProps {
  selectedTown: TownData | null;
  onClose: () => void;
}

export default function InfoPanel({ selectedTown, onClose }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState("laws");

  const showConsultationForm = () => {
    setActiveTab("consultation");
    // Scroll to top of panel when switching to consultation form
    const panel = document.querySelector('[data-testid="info-panel"]');
    if (panel) {
      panel.scrollTop = 0;
    }
  };

  return (
    <div className="hidden md:flex md:w-96 bg-white border-l border-gray-200 flex-col shadow-lg h-full overflow-hidden z-50 relative" data-testid="info-panel">
      {/* Panel Header */}
      <div className="p-6 border-b border-gray-200 bg-legal-blue text-white">
        <h1 className="text-xl font-bold mb-2">North Shore Dog Bite Law</h1>
        <p className="text-blue-100 text-sm">Click on any town to view local laws and emergency contacts</p>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {!selectedTown ? (
          /* Welcome Content */
          <div data-testid="welcome-content">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-legal-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-legal-blue" />
              </div>
              <h2 className="text-lg font-semibold text-legal-blue mb-2">Massachusetts Dog Bite Laws</h2>
              <p className="text-gray-600 text-sm">Comprehensive legal guidance for 20 North Shore communities</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Massachusetts Strict Liability</h3>
                <p className="text-red-700 text-sm">
                  Dog owners are strictly liable for damages when their dog bites someone in a public place 
                  or lawfully in a private place, regardless of prior knowledge of the dog's viciousness.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Special Protection for Children</h3>
                <p className="text-blue-700 text-sm">
                  Children under 7 years old are presumed not to have provoked a dog attack and receive 
                  additional legal protections under Massachusetts law.
                </p>
              </div>
            </div>

            <div className="bg-legal-gold bg-opacity-10 border border-legal-gold rounded-lg p-4 text-center">
              <h3 className="font-semibold text-legal-blue mb-2">Need Legal Help?</h3>
              <p className="text-gray-700 text-sm mb-4">
                Our experienced dog bite attorneys have recovered over $450,000 for bite victims.
              </p>
              <button 
                className="w-full bg-legal-gold text-legal-blue font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                data-testid="button-schedule-consultation"
              >
                Schedule Free Consultation
              </button>
            </div>
          </div>
        ) : (
          /* Town Content */
          <div data-testid="town-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-legal-blue" data-testid="text-town-name">
                {selectedTown.name}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                data-testid="button-close-town"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Town Information Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="laws" data-testid="tab-laws">
                  <FileText className="w-4 h-4 mr-1" />
                  Local Laws
                </TabsTrigger>
                <TabsTrigger value="contacts" data-testid="tab-contacts">
                  <Phone className="w-4 h-4 mr-1" />
                  Emergency
                </TabsTrigger>
                <TabsTrigger value="consultation" data-testid="tab-consultation">
                  Legal Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value="laws" className="space-y-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Leash Laws</h3>
                  <p className="text-gray-600 text-sm">
                    Dogs must be leashed in public areas. Violation fines range from $50-$200.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Licensing Requirements</h3>
                  <p className="text-gray-600 text-sm">
                    Annual dog licensing required. Contact town clerk for current fees and requirements.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Vaccination Requirements</h3>
                  <p className="text-gray-600 text-sm">
                    Current rabies vaccination required for all dogs over 6 months old.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📋 Required Reporting</h3>
                  <p className="text-blue-700 text-sm">
                    <strong>Massachusetts law requires all dog bites to be reported immediately to local authorities.</strong> 
                    Contact your town's Animal Control Officer or Police Department below. This is separate from any legal consultation.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Emergency (911)</h3>
                  <p className="text-red-700 text-sm">For immediate medical emergencies</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Animal Control Officer</h3>
                  <p className="text-gray-600 text-sm">{selectedTown.animalControl.name}</p>
                  <p className="text-gray-600 text-sm">{selectedTown.animalControl.phone}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Police Non-Emergency</h3>
                  <p className="text-gray-600 text-sm">{selectedTown.police.phone}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Town Clerk</h3>
                  <p className="text-gray-600 text-sm">{selectedTown.clerk.phone}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">24/7 Veterinary Emergency</h3>
                  <p className="text-gray-600 text-sm">
                    North Shore Animal Emergency<br />
                    (978) 555-0999
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="consultation" className="mt-4 max-h-full overflow-hidden">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-yellow-800 mb-2">⚠️ Important Legal Notice</div>
                  <p className="text-yellow-700 text-xs leading-relaxed">
                    <strong>This form is for requesting a free legal consultation only.</strong> 
                    Submitting this form does not fulfill your legal obligation to report a dog bite to local authorities. 
                    You must report directly to your town's animal control officer or police department (see Emergency tab above).
                  </p>
                </div>
                <div className="max-h-fit">
                  <BiteReportForm selectedTown={selectedTown} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={showConsultationForm}
          className="w-full bg-legal-gold text-legal-blue font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          data-testid="button-consultation"
        >
          Get Free Legal Consultation
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Free consultation • No fees unless we win
        </p>
      </div>
    </div>
  );
}
