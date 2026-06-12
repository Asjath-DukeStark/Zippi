/**
 * AddressMapPicker.tsx
 * Full-screen map-based address picker (Leaflet + OpenStreetMap + Nominatim)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by Vite bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface AddressMapPickerProps {
  mode: 'address' | 'locker';
  onClose: () => void;
  onConfirm: (address: string, coords: { lat: number; lng: number }) => void;
}

// Colombo, Sri Lanka as default center
const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612];

// Rough "service area" polygon for Colombo (simplified bounding box)
const SERVICE_BOUNDS = L.latLngBounds(
  L.latLng(6.7, 79.7),
  L.latLng(7.1, 80.0)
);

export default function AddressMapPicker({ mode, onClose, onConfirm }: AddressMapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [locationName, setLocationName] = useState<string>('Locating…');
  const [locationSub, setLocationSub] = useState<string>('');
  const [isOutsideArea, setIsOutsideArea] = useState(false);
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [userLatLng, setUserLatLng] = useState<L.LatLng | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsFetchingName(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        setLocationName(parts.slice(0, 2).join(',').trim());
        setLocationSub(parts.slice(2, 5).join(',').trim());
      } else {
        setLocationName('Unknown location');
        setLocationSub('');
      }
    } catch {
      setLocationName('Unknown location');
      setLocationSub('');
    } finally {
      setIsFetchingName(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Attribution small
    L.control.attribution({ position: 'bottomleft', prefix: '© OpenStreetMap' }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;

    // Reverse geocode on move end
    const onMoveEnd = () => {
      const center = map.getCenter();
      const coords: [number, number] = [center.lat, center.lng];
      setCurrentCenter(coords);
      const inService = SERVICE_BOUNDS.contains(center);
      setIsOutsideArea(!inService);
      reverseGeocode(center.lat, center.lng);
    };

    map.on('moveend', onMoveEnd);
    // Initial reverse geocode
    reverseGeocode(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);

    return () => {
      map.off('moveend', onMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [reverseGeocode]);

  // Update distance when user location or center changes
  useEffect(() => {
    if (userLatLng && mapRef.current) {
      const center = mapRef.current.getCenter();
      const d = userLatLng.distanceTo(center) / 1000;
      setDistanceKm(Math.round(d));
    }
  }, [userLatLng, currentCenter]);

  const goToCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setUserLatLng(latlng);
        mapRef.current?.setView(latlng, 16);
      },
      () => {
        // fallback: stay at default
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    mapRef.current?.setView([lat, lng], 16);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(', '));
  };

  const handleConfirm = () => {
    const [lat, lng] = currentCenter;
    const fullAddress = locationSub ? `${locationName}, ${locationSub}` : locationName;
    onConfirm(fullAddress, { lat, lng });
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* ── Search Bar Overlay ── */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-4">
        <div className="bg-white rounded-2xl shadow-lg flex items-center gap-2 px-3 py-3">
          <button
            onClick={onClose}
            className="text-[#1A1A1A] p-1 hover:bg-gray-100 rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search for your building, area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-[14px] text-[#1A1A1A] placeholder:text-gray-400 outline-none font-medium bg-transparent"
          />
          <button
            onClick={handleSearch}
            className="text-gray-400 hover:text-[#1A1A1A] p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl mt-1 overflow-hidden border border-gray-100">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => selectSearchResult(r)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-[12px] text-[#374151] font-medium line-clamp-1">
                  {r.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div ref={mapContainerRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

      {/* ── Center Pin (fixed on screen center) ── */}
      <div
        className="absolute left-1/2 z-10 pointer-events-none"
        style={{ top: '50%', transform: 'translate(-50%, -100%)' }}
      >
        {/* Tooltip */}
        {!isOutsideArea && !isFetchingName && (
          <div className="mb-1 bg-white rounded-xl shadow-lg px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] whitespace-nowrap text-center">
            Your order will be delivered here
          </div>
        )}
        {isOutsideArea && (
          <div className="mb-1 bg-white/90 border border-red-200 rounded-xl shadow-lg px-3 py-1.5 text-[12px] font-semibold text-red-500 whitespace-nowrap text-center">
            Outside our service area :(
          </div>
        )}

        {/* Pin SVG */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          {/* Pin tail */}
          <div className="w-1 h-4 bg-[#1A1A1A] rounded-b-full" />
          {/* Pulse ring */}
          <div className="absolute top-0 w-10 h-10 rounded-full bg-blue-400/30 animate-ping" />
        </div>
      </div>

      {/* ── Current Location button ── */}
      <div className="absolute z-10" style={{ bottom: 'calc(180px + 16px)', left: '50%', transform: 'translateX(-50%)' }}>
        <button
          onClick={goToCurrentLocation}
          className="bg-white rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2 text-[13px] font-bold text-[#1A1A1A] border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Current location
        </button>
      </div>

      {/* ── Bottom Panel ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6">
        {isOutsideArea ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-[15px] text-[#1A1A1A]">Sorry, we're not here yet</p>
                <p className="text-[12px] text-gray-500 mt-0.5">Try searching for a different location</p>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-[#2563EB] text-white font-extrabold text-[15px] py-4 rounded-2xl hover:bg-blue-700 transition-colors"
            >
              Search for your location
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[15px] text-[#1A1A1A] truncate">
                  {isFetchingName ? 'Finding location…' : locationName}
                </p>
                {locationSub && (
                  <p className="text-[12px] text-gray-500 truncate mt-0.5">{locationSub}</p>
                )}
                {distanceKm !== null && (
                  <p className="text-[11px] text-[#F59E0B] font-semibold mt-1">
                    📍 Pin is {distanceKm > 999 ? '999+' : distanceKm} km away from your current location
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isFetchingName || isOutsideArea}
              className="w-full bg-[#2563EB] text-white font-extrabold text-[15px] py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-60 mt-3"
            >
              {mode === 'locker' ? 'Add locker/pickup details' : 'Add address details'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
