import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AsbestosSite } from "@shared/schema";

interface SiteDetailsModalProps {
  site: AsbestosSite | null;
  onClose: () => void;
}

export default function SiteDetailsModal({ site, onClose }: SiteDetailsModalProps) {
  if (!site) return null;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Cleaned Up":
        return "text-green-600";
      case "Under Cleanup":
        return "text-yellow-600";
      case "Partially Cleaned":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const getSiteTypeLabel = (siteType: string) => {
    const typeLabels: { [key: string]: string } = {
      superfund: "EPA Superfund Site",
      vermiculite: "Vermiculite Processing",
      factory: "Manufacturing/Factory",
      mine: "Mining Operations",
      shipyard: "Shipyard/Naval",
      construction: "Construction Site"
    };
    return typeLabels[siteType] || siteType;
  };

  return (
    <Dialog open={!!site} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy pr-8">
            {site.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-navy">Location:</strong> {site.city}, {site.state}
            </div>
            <div>
              <strong className="text-navy">Site Type:</strong> {getSiteTypeLabel(site.siteType)}
            </div>
            <div>
              <strong className="text-navy">Exposure Period:</strong> {site.exposurePeriod}
            </div>
            <div>
              <strong className="text-navy">Current Status:</strong>{" "}
              <span className={getStatusColor(site.status)}>{site.status}</span>
            </div>
            <div className="col-span-2">
              <strong className="text-navy">Agency Source:</strong> {site.agencySource}
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-navy mb-2">Site Description</h5>
            <p className="text-legal-gray leading-relaxed">{site.description}</p>
          </div>
          
          <div>
            <h5 className="font-semibold text-navy mb-2">Health Risks</h5>
            <p className="text-legal-gray leading-relaxed">
              Workers and residents at this location may have been exposed to dangerous asbestos fibers, 
              which can cause mesothelioma, lung cancer, asbestosis, and other serious diseases decades 
              after exposure. Even brief exposure to asbestos can be dangerous.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold text-navy mb-2">Common Exposure Scenarios</h5>
            <ul className="text-legal-gray space-y-1">
              <li>• Workers in manufacturing, mining, or processing operations</li>
              <li>• Construction workers and maintenance personnel</li>
              <li>• Family members exposed through contaminated work clothes</li>
              <li>• Residents living near contaminated sites</li>
              <li>• Military personnel at naval shipyards or facilities</li>
            </ul>
          </div>
          
          {/* Contact CTA */}
          <div className="p-4 bg-legal-red bg-opacity-10 rounded-lg border border-legal-red border-opacity-20">
            <h4 className="font-semibold text-legal-red mb-2">Were You Exposed at This Site?</h4>
            <p className="text-sm text-legal-gray mb-4">
              If you or a loved one worked at or lived near this location, you may be entitled to compensation. 
              Our experienced mesothelioma attorneys have helped thousands of asbestos exposure victims recover 
              millions in compensation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="tel:855-385-9532" 
                className="inline-block bg-legal-red hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors text-center"
              >
                Free Consultation: 855-385-9532
              </a>
              <button 
                onClick={() => {
                  // Scroll to contact form
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                    onClose();
                  }
                }}
                className="border border-navy text-navy hover:bg-navy hover:text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Contact Form
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
