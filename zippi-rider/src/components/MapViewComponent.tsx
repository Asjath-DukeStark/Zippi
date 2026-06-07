/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { LatLng, Order, DeliveryStep } from '../types';
import { Compass, Navigation, MapPin, Store, User } from 'lucide-react';

interface MapViewProps {
  currentLocation: LatLng;
  activeOrder: Order | null;
  orderStep: DeliveryStep;
  rideProgress: number; // 0 to 100
}

export const MapViewComponent: React.FC<MapViewProps> = ({
  currentLocation,
  activeOrder,
  orderStep,
  rideProgress,
}) => {
  // We simulate a localized grid projection from latitude/longitude to SVG space
  // Colombo region range: Latitude [6.86, 6.94], Longitude [79.84, 79.89]
  const coastlineSvgPath = useMemo(() => {
    // Elegant wavy coastline for Colombo (West coast is on the left side)
    return "M 20 0 Q 30 150, 15 300 T 25 600 T 15 900 L 0 900 L 0 0 Z";
  }, []);

  const gridLines = useMemo(() => {
    const lines = [];
    // Roads simulation
    // Horizontal main avenues
    lines.push({ d: "M 0 150 Q 200 130 500 120", label: "Galle Face Centre Rd", strokeWidth: 4, isMain: true });
    lines.push({ d: "M 0 450 Q 250 480 500 500", strokeWidth: 6, label: "Galle Road (A2)", isMain: true });
    lines.push({ d: "M 0 300 C 150 280, 300 350, 500 330", strokeWidth: 3, label: "Dharmapala Mawatha" });
    lines.push({ d: "M 0 720 L 500 700", strokeWidth: 4, label: "Havelock Road" });
    
    // Vertical interconnecting streets
    lines.push({ d: "M 120 0 L 100 900", strokeWidth: 5, label: "R. A. De Mel Mawatha", isMain: true });
    lines.push({ d: "M 250 0 C 240 300, 290 600, 270 900", strokeWidth: 4, label: "Union Place" });
    lines.push({ d: "M 380 0 L 410 900", strokeWidth: 3, label: "Borella Cross Road" });
    lines.push({ d: "M 460 0 C 440 400, 480 600, 450 900", strokeWidth: 3, label: "Horton Place" });

    // Little blocks lines
    lines.push({ d: "M 100 150 L 250 150", strokeWidth: 1.5 });
    lines.push({ d: "M 100 220 L 380 220", strokeWidth: 1.5 });
    lines.push({ d: "M 270 450 L 460 450", strokeWidth: 1.5 });
    lines.push({ d: "M 120 600 L 270 600", strokeWidth: 1.5 });
    lines.push({ d: "M 120 780 L 410 780", strokeWidth: 1.5 });

    return lines;
  }, []);

  // Map landmarks
  const landmarks = [
    { x: 45, y: 100, name: "Galle Face Green" },
    { x: 320, y: 260, name: "Viharamahadevi Park" },
    { x: 190, y: 190, name: "Beira Lake" },
    { x: 310, y: 550, name: "Independence Square" },
  ];

  // Helper projection to map Colombo bounds to 400x500 local pixel dimensions
  const getCoordinates = (latLng: LatLng) => {
    // Colombo Bounds used for clean interpolation:
    const minLat = 6.8650;
    const maxLat = 6.9350;
    const minLng = 79.8400;
    const maxLng = 79.8850;

    const latPercent = (latLng.latitude - minLat) / (maxLat - minLat);
    const lngPercent = (latLng.longitude - minLng) / (maxLng - minLng);

    // Invert Y direction since SVG 0,0 is top-left while Latitude increases upwards
    const x = Math.max(10, Math.min(390, lngPercent * 400));
    const y = Math.max(10, Math.min(490, (1 - latPercent) * 500));

    return { x, y };
  };

  // Coordinates of dynamic nodes
  const riderPos = getCoordinates(currentLocation);
  
  const storePos = useMemo(() => {
    if (activeOrder) return getCoordinates(activeOrder.storeLocation);
    return { x: 140, y: 180 }; // Default sample
  }, [activeOrder]);

  const customerPos = useMemo(() => {
    if (activeOrder) return getCoordinates(activeOrder.customerLocation);
    return { x: 280, y: 350 }; // Default sample
  }, [activeOrder]);

  // Handle building route line paths
  const routePoints = useMemo(() => {
    if (!activeOrder) return "";
    
    const start = orderStep === 'PICKUP' 
      ? getCoordinates({ latitude: 6.9271, longitude: 79.8612 }) // starting from base hub
      : storePos; // starting from store
      
    const end = orderStep === 'PICKUP' ? storePos : customerPos;

    // Build curved pathway simulating street navigation instead of flat diagonal line
    const midX = (start.x + end.x) / 2 + (Math.sin((start.y + end.y) * 0.1) * 30);
    const midY = (start.y + end.y) / 2 + (Math.cos((start.x + end.x) * 0.1) * 20);

    return `M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`;
  }, [activeOrder, orderStep, storePos, customerPos]);

  return (
    <div className="relative w-full h-full bg-[#f4f3f0] overflow-hidden select-none">
      {/* Dynamic Coastline & Land Grid Background */}
      <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
        <defs>
          <radialGradient id="oceanGlow" cx="0%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#e8f3fc" />
            <stop offset="100%" stopColor="#d1e6f7" />
          </radialGradient>
          <pattern id="streetTexture" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" />
            <circle cx="2" cy="2" r="1.5" fill="#e4e2dd" opacity="0.6" />
          </pattern>
        </defs>

        {/* Ocean body */}
        <rect width="400" height="500" fill="url(#oceanGlow)" />
        
        {/* Sri Lanka Landmass */}
        <rect width="400" height="500" x="20" fill="#fcfbf7" />
        <rect width="400" height="500" x="20" fill="url(#streetTexture)" opacity="0.6" />
        <path d={coastlineSvgPath} fill="#f4f3f0" stroke="#dfded7" strokeWidth="2" />

        {/* Parks & Lakes */}
        {/* Beira Lake */}
        <ellipse cx="190" cy="190" rx="45" ry="18" fill="#d0e2e9" stroke="#b9d6e1" strokeWidth="1" />
        {/* Viharamahadevi Park */}
        <rect x="290" y="235" rx="5" ry="5" width="60" height="45" fill="#e1efdf" stroke="#cadfc4" strokeWidth="1" />
        <text x="320" y="260" fontSize="7" fill="#6e916a" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Viharamahadevi Park</text>
        <text x="190" y="193" fontSize="7" fill="#4d717f" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Beira Lake</text>

        {/* Dynamic Road Grids */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <path
              d={line.d}
              fill="none"
              stroke={line.isMain ? "#ffffff" : "#ebebe3"}
              strokeWidth={line.strokeWidth || 2}
              strokeLinecap="round"
            />
            <path
              d={line.d}
              fill="none"
              stroke="#e0dfd5"
              strokeWidth={(line.strokeWidth || 2) - 1.5}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Landmark labels */}
        {landmarks.filter(l => l.name !== "Viharamahadevi Park" && l.name !== "Beira Lake").map((m, idx) => (
          <g key={idx}>
            <circle cx={m.x} cy={m.y} r="2" fill="#bfbeba" />
            <text
              x={m.x + 5}
              y={m.y + 3}
              fontSize="6.5"
              fill="#8e8d89"
              fontFamily="sans-serif"
              fontWeight="500"
            >
              {m.name}
            </text>
          </g>
        ))}

        {/* Route Navigation Polylines */}
        {activeOrder && (
          <>
            {/* Pulsing route underline backglow */}
            <path
              d={routePoints}
              fill="none"
              stroke="#F5C518"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
              className="animate-pulse"
            />
            {/* Core directional route path */}
            <path
              d={routePoints}
              fill="none"
              stroke="#F5C518"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
            />
          </>
        )}
      </svg>

      {/* Coastline overlay text */}
      <div className="absolute top-12 left-1 text-[9px] text-[#4d717f] font-mono tracking-widest transform -rotate-90 origin-left opacity-60">
        INDIAN OCEAN (COLOMBO HARBOUR)
      </div>

      {/* Floating Pins & Drivers rendered as HTML absolute tags on top of coordinate project */}
      {activeOrder && (
        <>
          {/* Store Pin (Always Yellow in pickup, standard when dropoff) */}
          {orderStep === 'PICKUP' ? (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-bounce"
              style={{ left: `${storePos.x}%`, top: `${storePos.y}%` }}
            >
              <div className="bg-[#F5C518] text-[#1A1A1A] p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <Store size={18} strokeWidth={2.5} />
              </div>
              <div className="bg-white px-2 py-0.5 rounded text-[9px] font-bold mt-1 shadow border border-gray-200 uppercase tracking-wider text-[#1A1A1A]">
                PICKUP STORE
              </div>
              <div className="w-2.5 h-2.5 bg-[#F5C518] transform rotate-45 -mt-2.5 border-r border-b border-white"></div>
            </div>
          ) : (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 opacity-70"
              style={{ left: `${storePos.x}%`, top: `${storePos.y}%` }}
            >
              <div className="bg-gray-700 text-white p-1 rounded-full shadow border border-white">
                <Store size={12} />
              </div>
            </div>
          )}

          {/* Customer Pin (Highlighted green when status is DROPOFF) */}
          {orderStep === 'DROPOFF' ? (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-bounce"
              style={{ left: `${customerPos.x}%`, top: `${customerPos.y}%` }}
            >
              <div className="bg-[#2E7D32] text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="bg-white px-2 py-0.5 rounded text-[9px] font-bold mt-1 shadow border border-gray-200 uppercase tracking-wider text-[#2E7D32]">
                CUSTOMER
              </div>
              <div className="w-2.5 h-2.5 bg-[#2E7D32] transform rotate-45 -mt-2.5 border-r border-b border-white"></div>
            </div>
          ) : (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 opacity-70"
              style={{ left: `${customerPos.x}%`, top: `${customerPos.y}%` }}
            >
              <div className="bg-gray-700 text-white p-1 rounded-full shadow border border-white">
                <MapPin size={12} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Live Driver Location Pointer */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-30"
        style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%` }}
      >
        {/* Pulsating live radar halo */}
        <div className="absolute -inset-4 bg-yellow-400 opacity-25 rounded-full animate-ping"></div>
        <div className="absolute -inset-2 bg-yellow-400 opacity-40 rounded-full animate-pulse"></div>

        {/* Delivery Bike Icon Badge */}
        <div className="relative bg-[#1A1A1A] text-[#F5C518] p-2 rounded-full shadow-xl border-2 border-[#F5C518] flex items-center justify-center transform hover:scale-110 cursor-pointer">
          <Navigation size={18} className="transform rotate-45" />
        </div>

        {/* Small identification tag */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] text-[#F5C518] px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wide shadow whitespace-nowrap">
          Z-RIDER (GPS)
        </div>
      </div>

      {/* Floating Compass Indicator */}
      <div className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow-md border border-gray-200/50 flex items-center justify-center text-gray-700">
        <Compass size={16} className="animate-spin-slow text-gray-500" />
      </div>

      {/* Simulated Live Satellite Navigation Stats Badge */}
      <div className="absolute bottom-4 left-4 right-4 bg-[#1a1a1all]/90 backdrop-blur-md bg-[#1a1a1a] text-white p-2.5 rounded-xl flex items-center justify-between shadow-lg text-[11px] font-mono border border-white/10 z-15">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse"></span>
          <span>SAT DATA (WP-2026)</span>
        </div>
        {activeOrder ? (
          <div>
            PROG: {Math.round(rideProgress)}% | {orderStep}
          </div>
        ) : (
          <div>ONLINE - RECV GPS</div>
        )}
      </div>
    </div>
  );
};
