
import React, { useEffect, useRef } from 'react';
import { Hospital } from '@/lib/mock-data';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HospitalMapProps {
  hospitals: Hospital[];
  center?: [number, number];
  onHospitalClick?: (hospitalId: number) => void;
}

export function HospitalMap({ hospitals, center = [40.4173, -82.9071], onHospitalClick }: HospitalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(center, 7);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    } else {
        mapInstanceRef.current.setView(center, 7);
    }

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const markers: L.Marker[] = [];
    hospitals.forEach((h, index) => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${h.quality.isBirthingFriendly ? '#b8860b' : '#1e3a5f'}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; font-weight: bold; color: white; font-size: 12px;">
          ${index + 1}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const popupContent = `
        <div style="min-width: 200px;">
          <b style="font-size: 14px; color: #1e3a5f;">${h.name}</b>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${h.address}, ${h.city}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>${h.distance} miles</strong> away</p>
          ${h.quality.isBirthingFriendly ? '<span style="background: #f0e68c; color: #8b7355; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Birthing Friendly</span>' : ''}
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            <a href="/hospital/${h.id}" style="color: #1e3a5f; text-decoration: none; font-weight: bold; font-size: 12px;">View Details →</a>
          </div>
        </div>
      `;

      const marker = L.marker([h.lat, h.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(mapInstanceRef.current!);
      
      marker.on('click', () => {
        if (onHospitalClick) {
          onHospitalClick(h.id);
        }
      });

      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
    };
  }, [hospitals, center, onHospitalClick]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-lg shadow-inner bg-slate-50" style={{ minHeight: '100%' }} data-testid="hospital-map" />;
}
