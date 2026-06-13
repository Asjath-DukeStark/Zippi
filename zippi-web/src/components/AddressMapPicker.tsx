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
  boundary?: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  };
  onClose: () => void;
  onConfirm: (address: string, coords: { lat: number; lng: number }) => void;
}

export default function AddressMapPicker({ mode, boundary, onClose, onConfirm }: AddressMapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic bounds calculation (defaults to Akkaraipattu if not supplied)
  const swLat = boundary?.swLat ?? 7.15;
  const swLng = boundary?.swLng ?? 81.75;
  const neLat = boundary?.neLat ?? 7.30;
  const neLng = boundary?.neLng ?? 81.95;

  const SERVICE_BOUNDS = L.latLngBounds(
    L.latLng(swLat, swLng),
    L.latLng(neLat, neLng)
  );

  const centerLat = (swLat + neLat) / 2;
  const centerLng = (swLng + neLng) / 2;
  const defaultCenter: [number, number] = [centerLat, centerLng];

  const defaultAreaName = swLng > 81 ? 'Akkaraipattu' : 'Colombo';

  const [locationName, setLocationName] = useState<string>('Locating…');
  const [locationSub, setLocationSub] = useState<string>('');
  const [isOutsideArea, setIsOutsideArea] = useState(false);
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(defaultCenter);
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
      center: defaultCenter,
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
    reverseGeocode(defaultCenter[0], defaultCenter[1]);

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
      <div className="absolute top-4 left-4 right-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-3xl shadow-lg flex items-center gap-2.5 px-4 py-3.5 border border-gray-100/50">
          <button
            onClick={onClose}
            className="text-[#1A1A1A] p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search for your building, area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-[14px] text-[#1A1A1A] placeholder:text-gray-400 outline-none font-semibold bg-transparent"
          />
          <button
            onClick={handleSearch}
            className="text-gray-500 hover:text-[#1A1A1A] p-1.5 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl mt-1.5 overflow-hidden border border-gray-100 max-h-[200px] overflow-y-auto">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => selectSearchResult(r)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-[12px] text-[#374151] font-bold line-clamp-1">
                  {r.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div ref={mapContainerRef} className="flex-1 w-full" style={{ minHeight: 0, position: 'relative', zIndex: 1 }} />

      {/* ── Center Pin (fixed on screen center) ── */}
      <div
        className="absolute left-1/2 pointer-events-none flex flex-col items-center"
        style={{ top: '50%', transform: 'translate(-50%, -100%)', zIndex: 9999 }}
      >
        {/* Tooltip speech bubble */}
        {!isOutsideArea && !isFetchingName && (
          <div className="mb-2 flex flex-col items-center animate-fade-in filter drop-shadow-sm">
            <div className="bg-white rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-[#1A1A1A] whitespace-nowrap text-center shadow-md border border-gray-50">
              Your order will be delivered here
            </div>
            {/* Triangle tail */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white -mt-[1px]"></div>
          </div>
        )}
        {isOutsideArea && (
          <div className="mb-2 flex flex-col items-center animate-fade-in filter drop-shadow-sm">
            <div className="bg-white border border-red-100 rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-red-500 whitespace-nowrap text-center shadow-md">
              Outside our service area :(
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white -mt-[1px]"></div>
          </div>
        )}

        {/* Pin SVG (Black teardrop with white border and white circle inside) */}
        <div className="relative flex items-center justify-center">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" className="filter drop-shadow-md">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="12" cy="9" r="3.5" fill="#FFFFFF"/>
          </svg>
          {/* Subtle pulse effect at the tip base */}
          <div className="absolute bottom-0 w-3 h-3 rounded-full bg-black/20 animate-ping -z-10" />
        </div>
      </div>

      {/* ── Current Location button ── */}
      <div className="absolute" style={{ bottom: '212px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
        <button
          onClick={goToCurrentLocation}
          className="bg-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 text-[13px] font-extrabold text-[#1A1A1A] border border-gray-100/30 hover:shadow-xl active:scale-95 transition-all cursor-pointer animate-fade-in"
        >
          {/* Solid tilted navigation arrow icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#1A1A1A]">
            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
          </svg>
          Current location
        </button>
      </div>

      {/* ── Bottom Panel (Floating Card) ── */}
      <div className="absolute bottom-5 left-4 right-4 bg-white rounded-[28px] shadow-2xl p-5 border border-gray-100" style={{ zIndex: 9999 }}>
        {isOutsideArea ? (
          <div className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="font-extrabold text-[15px] text-[#1A1A1A]">Sorry, we're not here yet</p>
                <p className="text-[12px] text-gray-500 mt-1">Try searching for a different location in {defaultAreaName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSearchQuery(defaultAreaName);
                handleSearch();
              }}
              className="w-full bg-[#2563EB] text-white font-extrabold text-[15px] py-4 rounded-[18px] hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Search for {defaultAreaName}
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              {/* Location Marker Icon (Black circle with white map-pin) */}
              <div className="w-11 h-11 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[16px] text-[#1A1A1A] truncate leading-tight">
                  {isFetchingName ? 'Finding location…' : locationName}
                </p>
                {locationSub && (
                  <p className="text-[13px] text-gray-500 truncate mt-1 leading-snug">
                    {locationSub}
                  </p>
                )}
                {distanceKm !== null && (
                  <p className="text-[10px] text-[#F59E0B] font-extrabold mt-1.5 uppercase tracking-wider flex items-center gap-1">
                    <span>📍</span> Pin is {distanceKm > 999 ? '999+' : distanceKm} km away
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isFetchingName || isOutsideArea}
              className="w-full bg-[#2563EB] text-white font-extrabold text-[15px] py-4 rounded-[18px] hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer tracking-wide"
            >
              {mode === 'locker' ? 'Add pickup details' : 'Add address details'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
