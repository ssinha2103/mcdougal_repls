import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import InteractiveMap from "@/components/map/interactive-map";
import InfoPanel from "@/components/panels/info-panel";
import MobileOverlay from "@/components/panels/mobile-overlay";
import { TownData } from "@/types/town";
import { northShoreTowns } from "@/data/towns";
import { Search, X } from "lucide-react";

export default function Home() {
  const [selectedTown, setSelectedTown] = useState<TownData | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter towns based on search query
  const filteredTowns = useMemo(() => {
    if (!searchQuery.trim()) return Object.values(northShoreTowns);
    return Object.values(northShoreTowns).filter(town =>
      town.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTownSelect = (town: TownData) => {
    setSelectedTown(town);
    if (isMobile) {
      setShowMobilePanel(true);
    }
  };

  const handleCloseMobile = () => {
    setShowMobilePanel(false);
  };

  const handleClosePanel = () => {
    setSelectedTown(null);
    setShowMobilePanel(false);
  };

  const handleSearchSelect = (town: TownData) => {
    setSelectedTown(town);
    setSearchQuery("");
    setShowSearch(false);
    if (isMobile) {
      setShowMobilePanel(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Responsive for Mobile and Desktop */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-[1000] relative" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="https://www.helpinginjured.com/" className="text-legal-blue font-bold text-base sm:text-xl" data-testid="link-logo">
                <span className="hidden sm:inline">Mazow | McCullough, P.C.</span>
                <span className="sm:hidden">Mazow | McCullough</span>
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="hidden md:inline text-gray-600 font-medium">Dog Bite Law Interactive Map</span>
              <span className="md:hidden text-gray-600 text-sm">Dog Bite Map</span>
            </div>
            
            {/* Search Bar - Responsive */}
            <div className="flex items-center">
              <div className="relative">
                {!showSearch ? (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 text-gray-600 hover:text-legal-blue transition-colors"
                    data-testid="button-open-search"
                    title="Search towns"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search towns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-legal-blue focus:border-transparent text-sm sm:text-base"
                      data-testid="input-town-search"
                      autoFocus
                    />
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-clear-search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Search Results Dropdown */}
                    {searchQuery && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-xl z-[9999] max-h-60 overflow-y-auto border-t-0">
                        {filteredTowns.length > 0 ? (
                          filteredTowns.map((town) => (
                            <button
                              key={town.id}
                              onClick={() => handleSearchSelect(town)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              data-testid={`search-result-${town.id}`}
                            >
                              <div className="font-medium text-legal-blue">{town.name}</div>
                              <div className="text-xs text-gray-500">
                                Animal Control: {town.animalControl.name || 'Contact Available'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No towns found matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <a 
                  href="https://www.helpinginjured.com/severe-injury/dog-bite-attorney/" 
                  className="text-gray-700 hover:text-legal-blue transition-colors"
                  data-testid="link-dog-bite-attorney"
                >
                  Dog Bite Attorney
                </a>
                <a 
                  href="https://www.helpinginjured.com/case-results/" 
                  className="text-gray-700 hover:text-legal-blue transition-colors"
                  data-testid="link-case-results"
                >
                  Case Results
                </a>
                <a 
                  href="https://www.helpinginjured.com/contact/" 
                  className="bg-legal-gold text-legal-blue px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
                  data-testid="button-free-consultation"
                >
                  Schedule Free Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative h-full z-0">
          <InteractiveMap 
            onTownSelect={handleTownSelect}
            selectedTown={selectedTown}
          />
          
          {/* Mobile Quick Access Panel */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white rounded-lg shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-legal-blue">North Shore Towns</h3>
                <span className="text-xs text-gray-500">{Object.keys(northShoreTowns).length} towns</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Tap any marker on the map or use the search icon above to find a specific town's dog bite laws
              </p>
              {selectedTown && (
                <button
                  onClick={() => setShowMobilePanel(true)}
                  className="w-full bg-legal-blue text-white py-2 px-4 rounded-md text-sm font-medium"
                  data-testid="button-view-selected"
                >
                  View {selectedTown.name} Info →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Info Panel */}
        {!isMobile && (
          <InfoPanel 
            selectedTown={selectedTown}
            onClose={handleClosePanel}
          />
        )}

        {/* Mobile Overlay */}
        {isMobile && (
          <MobileOverlay
            selectedTown={selectedTown}
            isOpen={showMobilePanel}
            onClose={handleCloseMobile}
          />
        )}
      </main>
    </div>
  );
}
