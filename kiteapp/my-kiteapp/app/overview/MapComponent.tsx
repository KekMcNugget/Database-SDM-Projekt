"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Spot {
  id: number;
  name: string;
  region: string;
  windrichtung: string;
  windgeschwindigkeit: number;
  temperatur: number;
  qualität: string;
  lat: number;
  lng: number;
  beschreibung: string;
}

interface MapComponentProps {
  spots: Spot[];
  onSpotClick: (spotId: number) => void;
  selectedSpots: number[];
  focusSpotId?: number | null;
}

export default function MapComponent({ spots, onSpotClick, selectedSpots, focusSpotId }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Map initialisieren
    const map = L.map(mapContainerRef.current).setView([51.1657, 10.4515], 5);
    mapRef.current = map;

    // Tile Layer hinzufügen
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Alte Marker entfernen
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (spots.length === 0) return;

    // Custom Icon Funktion mit Wind-Pfeil
    const createCustomIcon = (quality: string, windSpeed: number) => {
      const color = quality === "gut" ? "#22c55e" : quality === "mittel" ? "#eab308" : "#ef4444";
      return L.divIcon({
        className: "custom-icon",
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              top: 4px;
              left: 4px;
            ">
              <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                <path d="M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H2v-2h9.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 8 15.5 8H2v2h13.5c1.93 0 3.5-1.57 3.5-3.5zm-.5 4.5H2v2h16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5v2c1.93 0 3.5-1.57 3.5-3.5S20.43 11 18.5 11z"/>
              </svg>
            </div>
            <div style="
              position: absolute;
              top: 0;
              right: 0;
              background: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: bold;
              color: ${color};
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            ">${windSpeed}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
    };

    // Neue Marker hinzufügen
    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createCustomIcon(spot.qualität, spot.windgeschwindigkeit),
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `
          <div style="padding: 10px; min-width: 220px;">
            <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 4px;">${spot.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">${spot.region}</p>
            <div style="font-size: 14px; line-height: 1.8;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">🌬️</span>
                <span><strong>Wind:</strong> ${spot.windgeschwindigkeit} km/h (${spot.windrichtung})</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">🌡️</span>
                <span><strong>Temperatur:</strong> ${spot.temperatur}°C</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">📊</span>
                <span><strong>Qualität:</strong> <span style="font-weight: 600; color: ${
                  spot.qualität === "gut" ? "#16a34a" : spot.qualität === "mittel" ? "#ca8a04" : "#dc2626"
                }">${spot.qualität}</span></span>
              </div>
              <div style="padding-top: 10px; border-top: 1px solid #e5e7eb; margin-top: 10px; color: #374151; font-size: 13px;">
                ${spot.beschreibung}
              </div>
            </div>
          </div>
        `
        )
        .on("click", () => {
          onSpotClick(spot.id);
        });

      markersRef.current.set(spot.id, marker);
    });

    // Map an Spots anpassen
    if (spots.length > 0) {
      const bounds = L.latLngBounds(spots.map((spot) => [spot.lat, spot.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [spots, onSpotClick]);

  // Separater Effekt für Zoom zu ausgewähltem Spot
  useEffect(() => {
    if (!mapRef.current || focusSpotId === null || focusSpotId === undefined) return;

    const spot = spots.find(s => s.id === focusSpotId);
    const marker = markersRef.current.get(focusSpotId);
    
    if (spot && marker) {
      // Zoom zur Position
      mapRef.current.setView([spot.lat, spot.lng], 10, {
        animate: true,
        duration: 1
      });
      
      // Öffne Popup nach kurzer Verzögerung
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [focusSpotId, spots]);

  return (
    <div className="h-[600px] rounded-lg overflow-hidden relative">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Legende */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-[1000]">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Legende:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span className="text-xs">Gut (&gt;20 km/h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
            <span className="text-xs">Mittel (15-20 km/h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span className="text-xs">Schlecht (&lt;15 km/h)</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Zahl im Badge = Windgeschwindigkeit</p>
        </div>
      </div>
    </div>
  );
}
