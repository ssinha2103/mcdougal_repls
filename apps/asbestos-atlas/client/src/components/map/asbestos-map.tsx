import { useEffect, useRef, useState, useMemo } from "react";
import { Search, Filter, MapPin, Building, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SiteDetailsModal from "./site-details-modal";
import { AsbestosSite } from "@shared/schema";
import { asbestosSitesData } from "@/data/asbestos-sites";

// Leaflet imports - using dynamic import to avoid SSR issues
declare global {
  interface Window {
    L: any;
  }
}

export default function AsbestosMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [selectedSite, setSelectedSite] = useState<AsbestosSite | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{
    site: AsbestosSite;
    x: number;
    y: number;
  } | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    siteType: "",
    exposurePeriod: "",
  });

  // Enhanced search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSiteForSearch, setSelectedSiteForSearch] = useState<AsbestosSite | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Create autocomplete suggestions - only for Kentucky sites
  const searchSuggestions = useMemo(() => {
    if (!searchValue || searchValue.length < 2) return [];
    
    const suggestions = asbestosSitesData.filter(site => {
      // Only include Kentucky sites in suggestions
      if (site.state !== 'Kentucky') return false;
      
      const searchLower = searchValue.toLowerCase();
      return (
        site.name.toLowerCase().includes(searchLower) ||
        site.city.toLowerCase().includes(searchLower) ||
        site.siteType.toLowerCase().includes(searchLower)
      );
    }).slice(0, 8); // Limit to 8 suggestions
    
    return suggestions;
  }, [searchValue]);

  // Local data filtering - focus only on Kentucky sites
  const sites = useMemo(() => {
    return asbestosSitesData.filter(site => {
      // Only show Kentucky sites
      if (site.state !== 'Kentucky') return false;
      
      const matchesSearch = !filters.search || 
        site.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        site.city.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesSiteType = !filters.siteType || site.siteType === filters.siteType;
      const matchesExposurePeriod = !filters.exposurePeriod || 
        site.exposurePeriod.includes(filters.exposurePeriod);
      
      return matchesSearch && matchesSiteType && matchesExposurePeriod;
    });
  }, [filters]);

  const isLoading = false;
  const error = null;

  // Regional insights function
  const getRegionalInsight = (state: string) => {
    const insights: Record<string, string> = {
      'Kentucky': 'Kentucky has significant asbestos exposure history from major industrial operations including the Paducah Gaseous Diffusion Plant, Ford Louisville Assembly, GE Appliance Park, TVA power plants, steel mills, chemical manufacturers, and tobacco processing facilities. Workers across multiple industries faced extensive exposure from the 1920s through 1990s.'
    };
    return insights[state] || 'Kentucky has documented asbestos exposure sites from industrial, power generation, manufacturing, and chemical processing activities spanning decades.';
  };

  const getSiteColor = (siteType: string) => {
    switch (siteType) {
      case 'chemical':
        return '#dc2626'; // red - Chemical Plants
      case 'industrial':
        return '#3b82f6'; // blue - Steel & Industrial
      case 'power_plant':
        return '#eab308'; // yellow - Power Plants
      case 'manufacturing':
        return '#22c55e'; // green - Manufacturing
      case 'refinery':
        return '#f97316'; // orange - Oil Refineries
      case 'automotive':
        return '#8b5cf6'; // purple - Automotive
      case 'transportation':
        return '#06b6d4'; // cyan - Transportation
      case 'nuclear':
        return '#ef4444'; // red - Nuclear
      case 'commercial':
        return '#64748b'; // slate - Commercial
      default:
        return '#6b7280'; // gray
    }
  };

  // Function to load markers
  const loadMarkers = () => {
    console.log('Loading markers - Sites data:', sites.length, 'items');
    console.log('Map instance:', !!mapInstanceRef.current);
    console.log('Leaflet loaded:', !!window.L);

    if (!mapInstanceRef.current || !window.L || !sites.length) {
      console.log('Cannot add markers - missing dependencies');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    console.log('Adding', sites.length, 'markers to map');

    // Add new markers with enhanced hover functionality
    sites.forEach((site, index) => {
      try {
        const lat = parseFloat(site.latitude);
        const lng = parseFloat(site.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for site ${site.name}:`, site.latitude, site.longitude);
          return;
        }

        const color = getSiteColor(site.siteType);
        
        // Create enhanced marker with hover effects
        const marker = window.L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Enhanced hover functionality with custom tooltip
        marker.on('mouseover', function(this: any, e: any) {
          // Clear any existing timeouts
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          if (showTimeout) {
            clearTimeout(showTimeout);
            setShowTimeout(null);
          }

          // Enlarge marker on hover
          this.setStyle({
            radius: 15,
            weight: 4,
            fillOpacity: 1
          });
          
          // Get mouse position relative to the page
          const containerPoint = mapInstanceRef.current.latLngToContainerPoint(e.latlng);
          const mapContainer = mapRef.current;
          
          if (mapContainer) {
            const mapRect = mapContainer.getBoundingClientRect();
            const x = mapRect.left + containerPoint.x;
            const y = mapRect.top + containerPoint.y;
            
            // Set 1-second delay before showing tooltip
            const timeout = setTimeout(() => {
              setHoverTooltip({
                site,
                x: x - 140, // Center the 280px tooltip
                y: y - 180   // Position above the marker
              });
            }, 1000); // 1 second delay
            
            setShowTimeout(timeout);
          }
        });

        marker.on('mouseout', function(this: any, _e: any) {
          // Reset marker size
          this.setStyle({
            radius: 10,
            weight: 3,
            fillOpacity: 0.8
          });
          
          // Cancel the show timeout if user moves away before 2 seconds
          if (showTimeout) {
            clearTimeout(showTimeout);
            setShowTimeout(null);
          }
        });

        // Click popup with detailed information
        const clickContent = `
          <div class="p-4">
            <h4 class="font-bold text-navy mb-3">${site.name}</h4>
            <div class="space-y-2 mb-4">
              <div><strong>Location:</strong> ${site.city}, ${site.state}</div>
              <div><strong>Type:</strong> ${site.siteType}</div>
              <div><strong>Exposure Period:</strong> ${site.exposurePeriod}</div>
              <div><strong>Status:</strong> ${site.status}</div>
              <div><strong>Source:</strong> ${site.agencySource}</div>
            </div>
            <p class="text-sm mb-4">${site.description}</p>
            <div class="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
              <p class="text-sm font-medium text-yellow-800">Legal Consultation Available</p>
              <p class="text-xs text-yellow-700 mt-1">
                If you were exposed at this site, contact us for a free case evaluation to determine your legal options.
              </p>
            </div>
            <button onclick="window.scrollToContact()" class="w-full bg-legal-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
              Get Free Legal Consultation
            </button>
          </div>
        `;

        marker.on('click', function(this: any, _e: any) {
          this.bindPopup(clickContent, {
            closeButton: true,
            maxWidth: 400,
            className: 'detailed-site-popup'
          }).openPopup();
        });

        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
        
        console.log(`Added enhanced marker ${index + 1} for ${site.name} at [${lat}, ${lng}]`);
      } catch (error) {
        console.error(`Error adding marker for ${site.name}:`, error);
      }
    });

    console.log('Successfully added', markersRef.current.length, 'enhanced markers');

    // Fit map view to show all markers while maintaining Kentucky focus
    if (markersRef.current.length > 0 && mapInstanceRef.current) {
      const group = new window.L.featureGroup(markersRef.current);
      const bounds = group.getBounds();
      
      // Ensure the bounds include all of Kentucky with padding
      const kentuckyBounds = window.L.latLngBounds(
        window.L.latLng(36.0, -89.5), // Southwest Kentucky
        window.L.latLng(39.0, -82.0)  // Northeast Kentucky
      );
      
      // Extend bounds to include both markers and Kentucky boundaries
      bounds.extend(kentuckyBounds);
      
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 8 // Prevent zooming in too close
      });
    }

    // Global functions for popup actions
    (window as any).openSiteModal = (siteId: string) => {
      const site = sites.find(s => s.id === siteId);
      if (site) {
        setSelectedSite(site);
      }
    };

    (window as any).scrollToContact = () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
    } else {
      // Load Leaflet dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Leaflet');
      };
      document.head.appendChild(script);
    }

    function initializeMap() {
      if (window.L && mapRef.current && !mapInstanceRef.current) {
        try {
          // Initialize the map centered specifically on Kentucky
          mapInstanceRef.current = window.L.map(mapRef.current, {
            center: [37.8393, -84.2700], // Center of Kentucky
            zoom: 7, // Slightly wider zoom to ensure all Kentucky sites are visible
            minZoom: 6.5, // Prevent zooming out too far - slightly less restrictive
            zoomControl: true,
            scrollWheelZoom: true,
            maxBounds: [[35.8, -89.8], [39.2, -81.8]], // Tighter bounds focused on Kentucky coverage area
            maxBoundsViscosity: 1.0 // Stronger resistance to panning outside bounds
          });

          // Add tile layer
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(mapInstanceRef.current);

          console.log('Map initialized successfully');
          
          // Trigger markers loading immediately after map is ready
          setTimeout(() => {
            loadMarkers();
          }, 100);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Cleanup timeouts
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, []);

  // Update markers when sites data changes
  useEffect(() => {
    loadMarkers();
  }, [sites]);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" values back to empty strings for the API
    const filterValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      siteType: "",
      exposurePeriod: "",
    });
    setSearchValue("");
    setSelectedSiteForSearch(null);
  };

  // Function to focus on a selected site
  const focusOnSite = (site: AsbestosSite) => {
    if (!mapInstanceRef.current) return;
    
    const lat = parseFloat(site.latitude);
    const lng = parseFloat(site.longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.setView([lat, lng], 12, { animate: true });
      
      // Find and highlight the marker
      const targetMarker = markersRef.current.find(marker => {
        const markerLatLng = marker.getLatLng();
        return Math.abs(markerLatLng.lat - lat) < 0.001 && Math.abs(markerLatLng.lng - lng) < 0.001;
      });
      
      if (targetMarker) {
        // Temporarily highlight the marker
        const originalStyle = {
          radius: targetMarker.options.radius,
          weight: targetMarker.options.weight,
          fillOpacity: targetMarker.options.fillOpacity
        };
        
        targetMarker.setStyle({
          radius: 20,
          weight: 6,
          fillOpacity: 1
        });
        
        // Reset after 3 seconds
        setTimeout(() => {
          targetMarker.setStyle(originalStyle);
        }, 3000);
        
        // Open popup
        targetMarker.openPopup();
      }
    }
  };

  const handleSearchSelect = (site: AsbestosSite) => {
    setSelectedSiteForSearch(site);
    setSearchValue(site.name);
    setSearchOpen(false);
    focusOnSite(site);
  };

  // Click outside handler to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load asbestos exposure sites</p>
        <p className="text-legal-gray">Please try refreshing the page or contact us at 855-385-9532</p>
      </div>
    );
  }

  return (
    <>
      {/* Premium Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-navy mr-2 sm:mr-3" />
            <h3 className="text-lg sm:text-xl font-semibold text-navy">Search Featured Kentucky Exposure Sites</h3>
          </div>
          
          <div className="relative" ref={searchContainerRef}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search company, location, or site type..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setSearchOpen(e.target.value.length >= 2);
                  }}
                  onFocus={() => {
                    if (searchValue.length >= 2) {
                      setSearchOpen(true);
                    }
                  }}
                  className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-navy focus:ring-0 rounded-lg bg-gray-50 focus:bg-white transition-all"
                />
                {searchValue && (
                  <button
                    onClick={() => {
                      setSearchValue("");
                      setSelectedSiteForSearch(null);
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
              
              {selectedSiteForSearch && (
                <Button
                  onClick={() => focusOnSite(selectedSiteForSearch)}
                  className="h-12 sm:h-14 px-4 sm:px-6 bg-navy hover:bg-blue-900 text-white font-medium rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">View on Map</span>
                  <span className="sm:hidden">View</span>
                </Button>
              )}
            </div>
            
            {/* Search Suggestions Dropdown */}
            {searchOpen && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                    Exposure Sites
                  </div>
                  {searchSuggestions.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleSearchSelect(site)}
                      className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors text-left rounded-md"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getSiteColor(site.siteType) }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {site.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {site.city}, {site.state} • {site.siteType}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {site.exposurePeriod}
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {searchOpen && searchValue.length >= 2 && searchSuggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6 text-center text-gray-500">
                No exposure sites found matching "{searchValue}"
              </div>
            )}
            
            {/* Selected Site Display */}
            {selectedSiteForSearch && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-navy">{selectedSiteForSearch.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSiteForSearch.city}, {selectedSiteForSearch.state} • {selectedSiteForSearch.siteType}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{selectedSiteForSearch.exposurePeriod}</p>
                  </div>
                  <Building className="h-5 w-5 text-blue-600 mt-1" />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Quick searches:</span>
            {['Ford', 'GE', 'Chemical', 'Railroad', 'Paducah'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchValue(term);
                  setSearchOpen(true);
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-navy mr-2" />
                <h3 className="text-sm sm:text-base font-semibold text-navy">Filter Sites</h3>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Search Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-legal-gray mb-2">
                    Search Sites
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-legal-gray" />
                    <Input
                      type="text"
                      placeholder="Site name or location..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Site Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-legal-gray mb-2">
                    Site Type
                  </label>
                  <Select value={filters.siteType || "all"} onValueChange={(value) => handleFilterChange("siteType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="chemical">Chemical Plants</SelectItem>
                      <SelectItem value="industrial">Steel & Industrial</SelectItem>
                      <SelectItem value="power_plant">Power Plants</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="refinery">Oil Refineries</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="transportation">Railroad & Transportation</SelectItem>
                      <SelectItem value="nuclear">Nuclear Facilities</SelectItem>
                      <SelectItem value="commercial">Commercial Buildings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Exposure Period Filter */}
                <div>
                  <label className="block text-sm font-medium text-legal-gray mb-2">
                    Exposure Period
                  </label>
                  <Select value={filters.exposurePeriod || "all"} onValueChange={(value) => handleFilterChange("exposurePeriod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Periods</SelectItem>
                      <SelectItem value="1920">1920s-1940s</SelectItem>
                      <SelectItem value="1940">1940s-1960s</SelectItem>
                      <SelectItem value="1950">1950s-1970s</SelectItem>
                      <SelectItem value="1960">1960s-1980s</SelectItem>
                      <SelectItem value="1970">1970s-1990s</SelectItem>
                      <SelectItem value="1980">1980s-2000s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>

              {/* Site Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{sites.length}</div>
                  <div className="text-sm text-legal-gray">
                    {sites.length === 1 ? 'Site Found' : 'Sites Found'}
                  </div>
                  {isLoading && (
                    <div className="text-xs text-legal-gray mt-2">Loading...</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-lg">
            <div 
              ref={mapRef} 
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg shadow-lg bg-gray-100 overflow-hidden"
              style={{ minHeight: '350px', position: 'relative', contain: 'layout style paint' }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
                  <p className="text-legal-gray">Loading asbestos exposure sites...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Legend */}
          <div className="mt-3 sm:mt-4 bg-white p-3 sm:p-4 rounded-lg shadow">
            <h4 className="text-sm sm:text-base font-semibold text-navy mb-2 sm:mb-3">Site Types</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-600 mr-2"></div>
                <span>EPA Superfund</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 mr-2"></div>
                <span>Vermiculite</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Mining</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500 mr-2"></div>
                <span>Shipyards</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mr-2"></div>
                <span>Industrial</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 mr-2"></div>
                <span>Construction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Details Modal */}
      <SiteDetailsModal 
        site={selectedSite} 
        onClose={() => setSelectedSite(null)} 
      />

      {/* Custom Hover Tooltip */}
      {hoverTooltip && (
        <>
          {/* Invisible bridge to connect marker and tooltip */}
          <div
            className="fixed pointer-events-auto"
            style={{
              left: `${hoverTooltip.x - 100}px`,
              top: `${hoverTooltip.y}px`,
              width: '200px',
              height: '200px',
              zIndex: 9999,
            }}
            onMouseLeave={() => {
              // Hide tooltip when leaving the bridge area
              setHoverTooltip(null);
            }}
          />
          <div
            className="fixed z-[10000] pointer-events-auto"
            style={{
              left: `${Math.max(10, Math.min(hoverTooltip.x, window.innerWidth - 320))}px`,
              top: `${Math.max(10, hoverTooltip.y)}px`,
            }}
            onMouseEnter={() => {
              // Keep tooltip visible when hovering over it
            }}
            onMouseLeave={() => {
              // Hide tooltip when leaving tooltip
              setHoverTooltip(null);
            }}
          >
          <div className="bg-white border-2 border-navy rounded-lg shadow-2xl w-80 p-3">
            <h4 className="font-bold text-navy mb-2 text-sm">{hoverTooltip.site.name}</h4>
            <div className="text-xs mb-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span className="text-right">{hoverTooltip.site.city}, {hoverTooltip.site.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize text-right">{hoverTooltip.site.siteType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Period:</span>
                <span className="text-right">{hoverTooltip.site.exposurePeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="text-right">{hoverTooltip.site.status}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-2 rounded mb-2">
              <p className="text-xs font-medium text-blue-800 mb-1">Regional Impact:</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                {getRegionalInsight(hoverTooltip.site.state)}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mb-2">
              <p className="text-xs font-medium text-yellow-800">⚠️ May be entitled to compensation</p>
            </div>
            <button
              onClick={() => {
                // Navigate to contact form with pre-filled location
                window.location.href = `/contact?site=${encodeURIComponent(hoverTooltip.site.name)}&location=${encodeURIComponent(`${hoverTooltip.site.city}, ${hoverTooltip.site.state}`)}&type=${encodeURIComponent(hoverTooltip.site.siteType)}`;
              }}
              className="w-full bg-legal-red hover:bg-red-700 text-white text-xs py-2 px-3 rounded font-medium transition-colors pointer-events-auto"
            >
              Get Free Legal Consultation
            </button>
          </div>
        </div>
        </>
      )}
    </>
  );
}