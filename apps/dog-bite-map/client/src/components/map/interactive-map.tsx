import { useEffect, useRef, useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { northShoreTowns } from "@/data/towns";
import { TownData } from "@/types/town";

interface InteractiveMapProps {
  onTownSelect: (town: TownData) => void;
  selectedTown: TownData | null;
}

// Map provider options
type MapProvider = 'leaflet' | 'svg';

declare global {
  interface Window {
    L: any;
  }
}

export default function InteractiveMap({ onTownSelect, selectedTown }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapProvider, setMapProvider] = useState<MapProvider>('leaflet');
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredTown, setHoveredTown] = useState<string | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    loadLeafletMaps();
  }, []);



  const loadLeafletMaps = () => {
    if (!window.L) {
      // Load Leaflet CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      // Load Leaflet JS
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.onload = () => {
        setMapProvider('leaflet');
        initializeLeafletMap();
      };
      leafletScript.onerror = () => {
        setMapError('Failed to load Leaflet. Using SVG map...');
        setMapProvider('svg');
      };
      document.head.appendChild(leafletScript);
    } else {
      setMapProvider('leaflet');
      initializeLeafletMap();
    }
  };



  const initializeLeafletMap = () => {
    if (!mapContainer.current || !window.L) return;

    try {
      // Make sure any existing map is removed first
      if (map.current) {
        map.current.remove();
      }
      
      map.current = window.L.map(mapContainer.current, {
        center: [42.65, -70.95],
        zoom: 10,
        minZoom: 8,
        maxZoom: 16,
        zoomControl: false, // Disable default zoom controls to use custom ones
        attributionControl: true,
        tap: true, // Enable tap events for mobile
        touchZoom: true // Enable touch zoom for mobile
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.current);

      setMapLoaded(true);
      addLeafletMarkers();
      
      // Fit bounds to show all North Shore towns
      setTimeout(() => {
        if (map.current && window.L) {
          const group = new window.L.featureGroup();
          Object.values(northShoreTowns).forEach(town => {
            // town.center is [lng, lat], Leaflet needs [lat, lng]
            const marker = window.L.marker([town.center[1], town.center[0]]);
            group.addLayer(marker);
          });
          map.current.fitBounds(group.getBounds(), { padding: [30, 30] });
        }
      }, 100);
    } catch (error) {
      setMapError('Leaflet initialization failed. Using SVG map...');
      setMapProvider('svg');
    }
  };



  const addLeafletMarkers = () => {
    if (!map.current || !window.L) return;

    markers.current.forEach(marker => map.current.removeLayer(marker));
    markers.current = [];

    Object.values(northShoreTowns).forEach(town => {
      const marker = window.L.circleMarker([town.center[1], town.center[0]], {
        radius: 8,
        fillColor: selectedTown?.id === town.id ? '#F4D35E' : '#0D3B66',
        color: '#ffffff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
      }).addTo(map.current);

      // Add floating tooltip that shows on hover
      marker.bindTooltip(town.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -15],
        className: 'town-tooltip',
        opacity: 0.9
      });

      marker.bindPopup(`
        <div>
          <strong>${town.name}</strong><br>
          <small>Click for dog bite laws</small>
        </div>
      `);

      marker.on('click', () => {
        onTownSelect(town);
        map.current.setView([town.center[1], town.center[0]], 12);
      });

      // Add hover effects
      marker.on('mouseover', () => {
        marker.setStyle({
          radius: 10,
          fillColor: selectedTown?.id === town.id ? '#F4D35E' : '#1e40af'
        });
      });

      marker.on('mouseout', () => {
        marker.setStyle({
          radius: 8,
          fillColor: selectedTown?.id === town.id ? '#F4D35E' : '#0D3B66'
        });
      });

      markers.current.push(marker);
    });
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!map.current || mapProvider !== 'leaflet') return;

    if (direction === 'in') map.current.zoomIn();
    else if (direction === 'out') map.current.zoomOut();
    else map.current.setView([42.55, -70.9], 10);
  };

  // Update markers when selected town changes
  useEffect(() => {
    if (selectedTown && mapLoaded && mapProvider === 'leaflet') {
      addLeafletMarkers();
    }
  }, [selectedTown, mapLoaded, mapProvider]);

  // Handle map resize for mobile
  useEffect(() => {
    if (map.current && mapProvider === 'leaflet' && window.L) {
      setTimeout(() => {
        map.current.invalidateSize();
      }, 100);
    }
  }, [mapLoaded, mapProvider]);

  // SVG fallback map
  const townPositions: Record<string, { x: number; y: number }> = {
    'Salem': { x: 62, y: 58 },
    'Beverly': { x: 58, y: 45 },
    'Lynn': { x: 68, y: 70 },
    'Peabody': { x: 55, y: 55 },
    'Danvers': { x: 52, y: 42 },
    'Marblehead': { x: 70, y: 62 },
    'Swampscott': { x: 72, y: 68 },
    'Nahant': { x: 75, y: 78 },
    'Saugus': { x: 62, y: 75 },
    'Revere': { x: 68, y: 82 },
    'Melrose': { x: 45, y: 72 },
    'Wakefield': { x: 38, y: 62 },
    'Reading': { x: 35, y: 55 },
    'Lynnfield': { x: 42, y: 48 },
    'Middleton': { x: 48, y: 38 },
    'Topsfield': { x: 52, y: 25 },
    'Wenham': { x: 58, y: 32 },
    'Hamilton': { x: 65, y: 28 },
    'Ipswich': { x: 68, y: 15 },
    'Essex': { x: 75, y: 22 }
  };

  const handleTownClick = (townId: string) => {
    const town = northShoreTowns[townId];
    if (town) {
      onTownSelect(town);
    }
  };

  if (mapProvider === 'svg') {
    return (
      <div className="relative w-full h-full bg-blue-50" data-testid="map-container">
        {mapError && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md text-sm z-20">
            <div className="font-semibold mb-1">Map Loading Error</div>
            <div className="text-xs leading-relaxed">
              Leaflet map failed to load. Using simplified map view.
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-3xl">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ minHeight: '400px' }}>
              <rect x="0" y="0" width="100" height="100" fill="#e3f2fd" />
              <polygon
                points="15,95 25,90 35,85 45,80 55,75 65,70 75,65 85,60 95,55 98,45 95,35 88,25 80,15 70,8 58,5 45,8 32,15 22,25 15,35 12,45 15,55 18,65 20,75 18,85"
                fill="#f5f5f5"
                stroke="#ddd"
                strokeWidth="0.5"
              />
              <polygon
                points="75,65 85,60 95,55 98,45 95,35 88,25 80,15 85,10 95,8 100,0 100,100 90,100 85,95 80,90 75,85"
                fill="#bbdefb"
              />
              {Object.entries(townPositions).map(([townId, position]) => {
                const town = northShoreTowns[townId];
                if (!town) return null;
                
                const isSelected = selectedTown?.id === townId;
                const isHovered = hoveredTown === townId;
                
                return (
                  <g key={townId}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isSelected ? "2.5" : isHovered ? "2" : "1.5"}
                      fill={isSelected ? "#F4D35E" : "#0D3B66"}
                      stroke="white"
                      strokeWidth="0.5"
                      className="cursor-pointer transition-all duration-200 hover:fill-yellow-400"
                      onClick={() => handleTownClick(townId)}
                      onMouseEnter={() => setHoveredTown(townId)}
                      onMouseLeave={() => setHoveredTown(null)}
                      data-testid={`marker-${townId.toLowerCase()}`}
                    />
                    {(isSelected || isHovered) && (
                      <text
                        x={position.x}
                        y={position.y - 3}
                        textAnchor="middle"
                        fontSize="2.5"
                        fill="#0D3B66"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {town.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4" data-testid="map-legend">
              <h3 className="text-sm font-semibold text-legal-blue mb-2">North Shore Massachusetts</h3>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-legal-blue border border-white"></div>
                <span className="text-xs text-gray-600">Town</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-legal-gold border border-white"></div>
                <span className="text-xs text-gray-600">Selected</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Click any town for dog bite laws</p>
            </div>


          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full z-0" data-testid="map-container">
      {mapError && (
        <div className="absolute top-20 md:top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-md text-xs z-10">
          <div className="font-semibold">Note: Google Maps API needs setup</div>
          <div className="mt-1">Currently using OpenStreetMap</div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0 w-full h-full z-0" data-testid="map" />
      
      {/* Map Controls - Left side on mobile, right side on desktop */}
      {mapProvider === 'leaflet' && (
        <div className="absolute top-4 left-4 md:left-auto md:right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col space-y-2 z-10" data-testid="map-controls">
          <button 
            onClick={() => handleZoom('in')}
            className="p-2 hover:bg-gray-100 rounded transition-colors" 
            title="Zoom in"
            data-testid="button-zoom-in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleZoom('out')}
            className="p-2 hover:bg-gray-100 rounded transition-colors" 
            title="Zoom out"
            data-testid="button-zoom-out"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleZoom('reset')}
            className="p-2 hover:bg-gray-100 rounded transition-colors" 
            title="Reset view"
            data-testid="button-reset-view"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Map provider indicator */}
      <div className="absolute bottom-4 right-4 bg-white rounded-md px-2 py-1 text-xs text-gray-500 shadow-sm">
        {mapProvider === 'leaflet' && 'OpenStreetMap'}
        {mapProvider === 'svg' && 'Static Map'}
      </div>
    </div>
  );
}
