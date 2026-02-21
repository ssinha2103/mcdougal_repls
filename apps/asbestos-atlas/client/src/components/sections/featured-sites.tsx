import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Building, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function FeaturedSites() {
  const [selectedSite, setSelectedSite] = useState<any>(null);
  
  const { data: featuredSites = [], isLoading } = useQuery({
    queryKey: ['/api/featured-sites'],
    queryFn: async () => {
      const response = await fetch('/api/featured-sites');
      if (!response.ok) throw new Error('Failed to fetch featured sites');
      return response.json();
    }
  });



  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Kentucky Asbestos Exposure Sites</h2>
            <p className="text-legal-gray text-lg max-w-3xl mx-auto">
              Loading documented Kentucky asbestos exposure locations from Satterley & Kelley PLLC case files...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-lg legal-shadow animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Nuclear Facility":
        return "bg-red-600 text-white";
      case "Manufacturing": 
        return "bg-blue-600 text-white";
      case "Industrial":
        return "bg-green-600 text-white";
      case "Power Plant":
        return "bg-yellow-600 text-white";
      case "Chemical":
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Kentucky Asbestos Exposure Sites</h2>
          <p className="text-lg text-legal-gray">Documented Kentucky locations from Satterley & Kelley PLLC legal case files where significant asbestos exposure occurred</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSites.map((site: any, index: number) => (
            <div key={index} className="bg-white rounded-lg legal-shadow overflow-hidden">
              <img 
                src={site.image} 
                alt={`${site.name} asbestos exposure site`}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-navy">{site.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(site.type)}`}>
                    {site.type}
                  </span>
                </div>
                <p className="text-legal-gray mb-4">{site.description}</p>
                <div className="text-sm text-legal-gray mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Exposure Period:</span>
                    <span className="font-medium">{site.exposurePeriod}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Site Type:</span>
                    <span className="font-medium">{site.siteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${getStatusColor(site.status)}`}>{site.status}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedSite(site)}
                  className="w-full bg-navy hover:bg-blue-900 text-white py-2 px-4 rounded font-medium transition-colors"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Site Details Modal */}
      <Dialog open={!!selectedSite} onOpenChange={() => setSelectedSite(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy">
              {selectedSite?.name}
            </DialogTitle>
            <DialogDescription className="text-legal-gray">
              Kentucky asbestos exposure site information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedSite && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-medium rounded ${getTypeColor(selectedSite.type)}`}>
                  {selectedSite.type}
                </span>
                <div className="flex items-center gap-2">
                  {selectedSite.status === "Cleaned Up" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : selectedSite.status === "Under Cleanup" ? (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${getStatusColor(selectedSite.status)}`}>
                    {selectedSite.status}
                  </span>
                </div>
              </div>

              <img 
                src={selectedSite.image} 
                alt={`${selectedSite.name} asbestos exposure site`}
                className="w-full h-48 object-cover rounded-lg"
              />

              <div className="prose prose-lg max-w-none">
                <p className="text-legal-gray leading-relaxed">
                  {selectedSite.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-navy" />
                    <span className="font-semibold text-navy">Exposure Period</span>
                  </div>
                  <p className="text-legal-gray">{selectedSite.exposurePeriod}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-navy" />
                    <span className="font-semibold text-navy">Site Type</span>
                  </div>
                  <p className="text-legal-gray">{selectedSite.siteType}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-navy" />
                    <span className="font-semibold text-navy">Location</span>
                  </div>
                  <p className="text-legal-gray">{selectedSite.name}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-navy mb-2">Were You Exposed?</h4>
                <p className="text-legal-gray mb-4">
                  If you lived, worked, or were otherwise present at this location during the exposure period, 
                  you may be entitled to compensation for asbestos-related health issues.
                </p>
                <Button 
                  className="bg-legal-red hover:bg-red-700 text-white"
                  onClick={() => window.location.href = '/#contact'}
                >
                  Contact Our Legal Team
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
