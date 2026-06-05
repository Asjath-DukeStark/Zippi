/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Check, 
  Clock, 
  X, 
  Send 
} from 'lucide-react';
import { Order } from '../types';
import ZippiProductImage from './ZippiProductImage';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

export default function OrderTracking({ order, onClose }: OrderTrackingProps) {
  // Items list collapse toggle
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  
  // Interactive Rider Live Chat simulation states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'rider'; text: string; time: string }[]>([
    { sender: 'rider', text: 'Hi! I am Kasun. I am loading your 8 packed grocery bags at the Zippi Hub now and will head out shortly!', time: '11:01 AM' }
  ]);
  const [isRiderTyping, setIsRiderTyping] = useState(false);
  
  // Dynamic map marker animation percent (0% to 100% of route)
  const [animPercent, setAnimPercent] = useState(35); // Start mid-route to show action instantly
  
  // Ref for the Leaflet Map container and instance
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const vanMarkerRef = useRef<any>(null);

  // Derive coordinates for store and home based on the active tracking address
  const routeCoordinates = useMemo(() => {
    const isWtc = order.address.details.toLowerCase().includes('world trade') || 
                  order.address.details.toLowerCase().includes('office');
    const isKohuwala = order.address.details.toLowerCase().includes('kohuwala') || 
                       order.address.details.toLowerCase().includes('dutugemunu');
    
    // Zippi Hub (Colombo Fort) coordinates
    const storeLatLng: [number, number] = [6.9360, 79.8425]; 
    
    let homeLatLng: [number, number] = [6.9110, 79.8510]; // default Kollupitiya/Galle Road
    
    if (isWtc) {
      homeLatLng = [6.9330, 79.8430]; // WTC
    } else if (isKohuwala) {
      homeLatLng = [6.8685, 79.8732]; // Kohuwala / Dutugemunu
    }

    // construct a styled multi-turn route matching street layouts
    const path: [number, number][] = [];
    path.push(storeLatLng);
    
    if (isKohuwala) {
      // route from Fort down to Kohuwala via T.B. Jayah Mawatha & Galle Road
      path.push([6.9250, 79.8520]); // Union Place
      path.push([6.9080, 79.8580]); // Jawatta
      path.push([6.8850, 79.8655]); // Havelock town
      path.push([6.8685, 79.8732]); // Kohuwala destination
    } else if (isWtc) {
      // very short route inside Fort area
      path.push([6.9345, 79.8415]);
      path.push([6.9330, 79.8430]);
    } else {
      // standard Galle Road route
      path.push([6.9280, 79.8440]); // Galle Face Area
      path.push([6.9180, 79.8480]); // Kollupitiya
      path.push([6.9110, 79.8510]); // Destination
    }

    return {
      store: storeLatLng,
      home: homeLatLng,
      path
    };
  }, [order.address]);

  // Linear Interpolation helper
  const getInterpolatedPoint = (path: [number, number][], percent: number) => {
    if (path.length === 0) return [6.9271, 79.8612];
    if (path.length === 1) return path[0];
    if (percent <= 0) return path[0];
    if (percent >= 100) return path[path.length - 1];

    const totalPoints = path.length;
    const segmentLength = 100 / (totalPoints - 1);
    const segmentIndex = Math.min(Math.floor(percent / segmentLength), totalPoints - 2);
    const segmentPercent = (percent % segmentLength) / segmentLength;

    const startPt = path[segmentIndex];
    const endPt = path[segmentIndex + 1];

    const lat = startPt[0] + (endPt[0] - startPt[0]) * segmentPercent;
    const lng = startPt[1] + (endPt[1] - startPt[1]) * segmentPercent;
    return [lat, lng];
  };

  // 1. Map initialization and marker generation
  useEffect(() => {
    let active = true;
    let localMap: any = null;

    const initMap = () => {
      if (!active) return;
      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('zippi-leaflet-map-overlay');
      if (!container) return;

      // Initialize map object
      localMap = L.map(container, {
        zoomControl: false,
        attributionControl: false
      }).setView(routeCoordinates.store, 14);

      mapInstanceRef.current = localMap;

      // Add CartoDB light tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(localMap);

      // Create route dashed lines
      L.polyline(routeCoordinates.path, {
        color: '#FCA311',
        weight: 5,
        opacity: 0.9,
        dashArray: '4, 8'
      }).addTo(localMap);

      // Create Blue Home Circle Pin
      const homeIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-blue-500/25 rounded-full animate-pulse"></div>
            <div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg text-[18px]">
              🏠
            </div>
          </div>
        `,
        className: 'custom-home-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker(routeCoordinates.home, { icon: homeIcon }).addTo(localMap);

      // Create Yellow Delivery Van Pulsing Pin
      const currentPos = getInterpolatedPoint(routeCoordinates.path, animPercent);
      const vanIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-[#FCA311]/40 rounded-full animate-ping"></div>
            <div class="w-9 h-9 rounded-full bg-[#FCA311] border-2 border-white flex items-center justify-center shadow-lg text-[18px] z-10 transition-transform hover:scale-110">
              🚚
            </div>
          </div>
        `,
        className: 'custom-van-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      vanMarkerRef.current = L.marker(currentPos, { icon: vanIcon }).addTo(localMap);

      // Fit bounds nicely to encompass both markers
      const bounds = L.latLngBounds([routeCoordinates.store, routeCoordinates.home]);
      localMap.fitBounds(bounds, { padding: [40, 40] });
    };

    // Load leaf styling & script CDN if non-existent
    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      active = false;
      if (localMap) {
        localMap.remove();
      }
    };
  }, [routeCoordinates]);

  // 2. Continuous slow movement simulation along route (1% increase every 400ms, loops 15% to 95%)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPercent((prev) => {
        const next = prev + 1;
        if (next > 92) return 15; // Loop back so van animated route represents continuous travel
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Update van marker coordinates dynamically when animPercent fluctuates
  useEffect(() => {
    if (vanMarkerRef.current && (window as any).L) {
      const newPos = getInterpolatedPoint(routeCoordinates.path, animPercent);
      vanMarkerRef.current.setLatLng(newPos);
    }
  }, [animPercent, routeCoordinates]);

  // Parse time stamps for status logs
  const orderTimeDetails = useMemo(() => {
    const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const formatDateStr = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };

    // Add minutes to represent step timestamps
    const placedTime = new Date(orderDate);
    const packedTime = new Date(orderDate.getTime() + 15 * 60 * 1000);
    const outTime = new Date(orderDate.getTime() + 30 * 60 * 1000);

    const dayStr = formatDateStr(orderDate);

    return {
      placed: `${dayStr}, ${formatTime(placedTime)}`,
      packed: `${dayStr}, ${formatTime(packedTime)}`,
      outOfDelivery: `${dayStr}, ${formatTime(outTime)}`
    };
  }, [order.timestamp]);

  // Handle preset bubble send clicks
  const handleSendPreset = (text: string) => {
    const newMsg = { sender: 'user' as const, text, time: '11:03 AM' };
    setChatHistory((prev) => [...prev, newMsg]);
    setIsRiderTyping(true);

    // Kasun P responder matching text context
    setTimeout(() => {
      let reply = "Got it! I will call you as soon as I arrive at your location. Drive safely!";
      if (text.toLowerCase().includes('gate')) {
        reply = "Understood! I will leave the grocery packs with the gate security guard as requested. Thank you!";
      } else if (text.toLowerCase().includes('location')) {
        reply = "I am passing the Union Place signal light right now. Just about 10 minutes away from Kohuwala!";
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: 'rider', text: reply, time: '11:04 AM' }
      ]);
      setIsRiderTyping(false);
    }, 1800);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    const newMsg = { sender: 'user' as const, text: userText, time: '11:05 AM' };
    setChatHistory((prev) => [...prev, newMsg]);
    setChatMessage('');
    setIsRiderTyping(true);

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'rider', text: "Sure thing! Received. I am driving now but will deliver your packed order in 25 mins. 👍", time: '11:06 AM' }
      ]);
      setIsRiderTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto" id="order-tracking-modal">
      <div className="bg-[#F8F9FA] w-full max-w-[500px] h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-up border border-gray-100">
        
        {/* ── HEADER ── */}
        <div className="bg-white px-4 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-brand-charcoal transition-colors cursor-pointer"
              id="tracking-back-arrow"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h2 className="font-extrabold text-[16px] text-brand-charcoal tracking-tight">Track Order</h2>
              <span className="text-[11px] text-gray-500 font-mono block tracking-wide mt-0.5" id="tracking-order-id">
                {order.id}
              </span>
            </div>
          </div>
          
          <span className="bg-emerald-50 text-emerald-700 font-black px-2.5 py-1 rounded-md text-[10px] uppercase font-sans animate-pulse">
            Live updates
          </span>
        </div>

        {/* VIEWPORT CONTROLLER SCROLLER */}
        <div className="flex-grow overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'thin' }}>
          
          {/* ── MAP SECTION (260px) ── */}
          <div className="relative w-full h-[260px] bg-slate-100 border-b border-gray-250 shrink-0" id="map-section-leaflet-box">
            <div id="zippi-leaflet-map-overlay" className="w-full h-full z-10" />
            
            {/* Compass / Location tracker mini-floater hud */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-gray-200 text-right z-20 select-none">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-400 block">Zippi Track GPS</span>
              <span className="text-[10px] font-black text-brand-charcoal">Accuracy: ~5m Sri Lanka</span>
            </div>
          </div>

          {/* ── ETA BANNER (Pulsing Yellow card) ── */}
          <div className="p-3 bg-brand-yellow border-y border-[#E08F00]/25 shadow-xs shrink-0 select-none animate-pulse">
            <h3 className="font-black text-brand-charcoal text-[13px] sm:text-sm tracking-tight text-center">
              ⏳ Arriving in approximately 25 minutes
            </h3>
          </div>

          <div className="p-4 space-y-4 flex-grow">
            
            {/* ── RIDER INFO CARD ── */}
            <div className="bg-white rounded-2xl border border-gray-200/95 p-4 flex items-center justify-between shadow-3xs" id="rider-info-card-box">
              {/* Left & Center */}
              <div className="flex items-center gap-3">
                {/* Rider Initials Circle */}
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-extrabold text-[#1A1A1A] text-[16px] shrink-0 uppercase select-none relative font-sans">
                  KP
                  {/* tiny green online light */}
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>

                {/* Rider Names */}
                <div className="text-left">
                  <h4 className="font-extrabold text-[14.5px] text-brand-charcoal text-left">Kasun P.</h4>
                  <div className="flex items-center gap-1 mt-0.5 font-sans">
                    <span className="text-[10.5px] font-bold text-[#FCA311]">⭐ 4.9</span>
                    <span className="text-[10px] text-gray-400 font-semibold">• Gold Courier</span>
                  </div>
                </div>
              </div>

              {/* Right Button Icon toggles */}
              <div className="flex items-center gap-2">
                {/* Call trigger */}
                <button 
                  onClick={() => alert('📞 Calling rider Kasun P. on mobile via VoIP secure relay [+94 77 987 6543]...')}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors cursor-pointer shadow-3xs active:scale-90"
                  title="Call Kasun"
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* Chat triggers */}
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-brand-blue transition-colors cursor-pointer shadow-3xs active:scale-90 relative"
                  title="Chat with Kasun"
                >
                  <MessageSquare className="w-4 h-4 text-brand-blue" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8.5px] font-black flex items-center justify-center">
                    1
                  </span>
                </button>
              </div>
            </div>

            {/* ── STATUS TIMELINE (Pulsing vertical nodes) ── */}
            <div className="bg-white rounded-2xl border border-gray-200/95 p-4 shadow-3xs text-left" id="tracking-timeline-box">
              <h3 className="font-black text-xs text-brand-charcoal uppercase tracking-wider mb-4 border-b border-gray-55 pb-2.5">
                Delivery Timeline
              </h3>

              <div className="relative pl-7 space-y-6">
                
                {/* VERTICAL CONNECTING STRIPS */}
                <div className="absolute top-3.5 bottom-3.5 left-[13px] w-0.5">
                  {/* Segment 1: Placed to Packed (Solid Green) */}
                  <div className="absolute top-0 h-[33%] w-full bg-emerald-500 rounded-full"></div>
                  
                  {/* Segment 2: Packed to Dispatched (Solid Green) */}
                  <div className="absolute top-[33%] h-[33%] w-full bg-emerald-500 rounded-full"></div>
                  
                  {/* Segment 3: Dispatched to Delivered (Pulsing Yellow active) */}
                  <div className="absolute top-[66%] h-[34%] w-full bg-[#fca311] rounded-full animate-pulse"></div>
                </div>

                {/* STEP 1: ORDER PLACED */}
                <div className="relative flex gap-3 text-left">
                  {/* Node icon */}
                  <div className="absolute -left-[24px] w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs z-10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-brand-charcoal leading-tight">Order Placed</h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 font-sans">
                      {orderTimeDetails.placed}
                    </p>
                  </div>
                </div>

                {/* STEP 2: PACKED */}
                <div className="relative flex gap-3 text-left">
                  {/* Node icon */}
                  <div className="absolute -left-[24px] w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs z-10 animate-scale-up">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-brand-charcoal leading-tight">Being Packed</h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 font-sans">
                      {orderTimeDetails.packed}
                    </p>
                  </div>
                </div>

                {/* STEP 3: DISPATCHED / OUT FOR DELIVERY (Active Pulsing) */}
                <div className="relative flex gap-3 text-left">
                  {/* Node icon */}
                  <div className="absolute -left-[24px] w-6 h-6 rounded-full bg-[#FFFBEA] border-2 border-[#FCA311] flex items-center justify-center shadow-sm z-10">
                    {/* Pulsing core dot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] animate-ping"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] absolute"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-tight">
                      <h4 className="font-black text-[13px] text-brand-charcoal">Out for Delivery</h4>
                      <span className="bg-[#FFFBEA] text-amber-700 font-black border border-[#FCA311]/30 text-[8.5px] tracking-wider uppercase px-1.5 rounded-sm">
                        CURRENT STEP
                      </span>
                    </div>
                    <p className="text-[11px] text-[#E08F00] font-black mt-0.5 font-sans">
                      {orderTimeDetails.outOfDelivery} — Driver is routing near Galle Road
                    </p>
                  </div>
                </div>

                {/* STEP 4: DELIVERED (Gray Empty Circle) */}
                <div className="relative flex gap-3 text-left">
                  {/* Node icon */}
                  <div className="absolute -left-[24px] w-6 h-6 rounded-full bg-gray-50 border-2 border-gray-300 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-gray-400 leading-tight font-sans">Delivered</h4>
                    <p className="text-[11px] text-gray-400 font-bold mt-0.5 font-sans">
                      Expected 11:30–12:00 PM
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── ITEMS SUMMARY ── */}
            <div className="bg-white rounded-2xl border border-gray-200/95 overflow-hidden shadow-3xs" id="items-summary-accordion">
              {/* Header Banner */}
              <div 
                onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 select-none border-b border-gray-100"
              >
                <div>
                  <h4 className="font-black text-[13.5px] text-emerald-800 tracking-tight flex items-center gap-1">
                    <span>Your order</span> 
                    <span className="font-medium text-gray-400">•</span>
                    <span>{order.items.length} items — all packed ✓</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Click to view items list</p>
                </div>
                <div>
                  {isItemsExpanded ? (
                    <ChevronUp className="w-4.5 h-4.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-gray-400 animate-bounce" />
                  )}
                </div>
              </div>

              {/* Expandable Table Content */}
              {isItemsExpanded && (
                <div className="p-4 bg-gray-50/50 divide-y divide-gray-100 max-h-[220px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {order.items.map((it, idx) => (
                    <div key={`track-item-${idx}`} className="py-3 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <ZippiProductImage 
                          image={it.product.image} 
                          name={it.product.name}
                          category={it.product.category}
                          className="w-10 h-10 shrink-0"
                          imageClassName="w-10 h-10 object-contain rounded-lg bg-white border border-gray-100 shrink-0 select-none"
                          fallbackSize="xs"
                        />
                        <div className="min-w-0 text-left">
                          <h4 className="font-extrabold text-xs text-brand-charcoal truncate">{it.product.name}</h4>
                          <span className="text-[10px] text-gray-400 block tracking-tight font-medium">
                            {it.product.unit} • LKR {it.product.price}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-black text-brand-charcoal block">Qty {it.quantity}</span>
                        <span className="text-[10.5px] font-bold text-emerald-600 font-mono">Packed ✓</span>
                      </div>
                    </div>
                  ))}

                  {/* Pricing brief */}
                  <div className="pt-3 border-t border-gray-200 mt-1 flex justify-between items-center text-xs text-brand-charcoal">
                    <span className="text-gray-400 font-extrabold">Final Paid Checkout:</span>
                    <span className="font-extrabold">LKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── INTERACTIVE CHAT DRAWER PANEL OVERLAY ── */}
        {isChatOpen && (
          <div className="absolute inset-0 bg-[#F4F5F7] z-50 flex flex-col animate-slide-up" id="rider-chat-layer">
            
            {/* Chat header */}
            <div className="bg-white px-4 py-3 border-b border-gray-150 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 border flex items-center justify-center font-black text-[14.5px] text-brand-charcoal shrink-0">
                  KP
                </div>
                <div className="text-left">
                  <h3 className="font-black text-sm text-brand-charcoal">Kasun P. (Rider)</h3>
                  <span className="text-[10.5px] text-emerald-500 font-bold block animate-pulse">● Online & Driving</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat list viewport */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3.5" style={{ scrollbarWidth: 'thin' }}>
              
              {/* Disclaimer */}
              <p className="text-[9.5px] text-gray-400 font-semibold text-center uppercase tracking-wide bg-gray-100 py-1.5 rounded-lg select-none">
                🔒 Zippi Secure Colombo Delivery Relay Chat
              </p>

              {chatHistory.map((msg, index) => (
                <div 
                  key={`chat-msg-${index}`}
                  className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs font-semibold select-all leading-normal text-left ${
                    msg.sender === 'user' 
                      ? 'bg-brand-blue text-white rounded-tr-none' 
                      : 'bg-white text-brand-charcoal border border-gray-200/90 rounded-tl-none shadow-3xs'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9.5px] text-gray-400 mt-1 font-mono font-medium block">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isRiderTyping && (
                <div className="mr-auto items-start flex flex-col">
                  <div className="bg-white p-3 border border-gray-150 rounded-2xl rounded-tl-none shadow-3xs flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-350 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold mt-1 font-mono block">Kasun is typing...</span>
                </div>
              )}
            </div>

            {/* Chat Preset bubbles panel */}
            <div className="bg-white p-3 border-t border-gray-150 space-y-2 shrink-0">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block text-left">Quick replies:</span>
              
              <div className="flex flex-wrap gap-2 text-left" id="preset-chat-bubbles">
                <button 
                  onClick={() => handleSendPreset("Please leave it at the gate.")}
                  className="bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-[10.5px] font-bold text-gray-600 px-3 py-1.5 rounded-full cursor-pointer shadow-3xs select-none"
                >
                  📍 Leave at gate.
                </button>
                <button 
                  onClick={() => handleSendPreset("Call me when you arrive.")}
                  className="bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-[10.5px] font-bold text-gray-600 px-3 py-1.5 rounded-full cursor-pointer shadow-3xs select-none"
                >
                  📞 Call when here.
                </button>
                <button 
                  onClick={() => handleSendPreset("What's your current location?")}
                  className="bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-[10.5px] font-bold text-gray-600 px-3 py-1.5 rounded-full cursor-pointer shadow-3xs select-none"
                >
                  🗺️ Where are you?
                </button>
              </div>
            </div>

            {/* Input Form typing bar */}
            <form onSubmit={handleSendCustomMessage} className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2.5 shrink-0">
              <input 
                type="text" 
                placeholder="Type a message to rider Kasun..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow p-2.5 bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-semibold focus:outline-none"
              />
              <button 
                type="submit"
                className="w-10 h-10 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer active:scale-90"
              >
                <Send className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
