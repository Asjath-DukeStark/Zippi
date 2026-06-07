/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { MapViewComponent } from './MapViewComponent';
import { Copy, Navigation, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ActiveDeliveryPickup: React.FC = () => {
  const { activeOrder, orderStep, rideProgress, markAsPickedUp, currentLocation } = useRiderStore();
  const [copied, setCopied] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 p-6 text-center">
        <p className="text-gray-400 font-mono text-sm leading-relaxed">No delivery task is currently assigned.</p>
      </div>
    );
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(activeOrder.storeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.log('Failed to write to clipboard');
    }
  };

  const handleNavigate = () => {
    // Opens Google Maps routing in external window
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeOrder.storeLocation.latitude},${activeOrder.storeLocation.longitude}`;
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn('Navigation opened:', url);
      }
    }, 1500);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-100 overflow-hidden select-none">
      {/* Dynamic Navulating Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <div className="w-16 h-16 bg-[#F5C518] rounded-full flex items-center justify-center text-[#1A1A1A] animate-bounce mb-4 shadow-lg shadow-amber-400/40">
              <Navigation size={32} className="transform rotate-45" />
            </div>
            <h3 className="text-xl font-bold">Synchronizing Satellite Routes...</h3>
            <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed max-w-xs">
              Launching external Google Maps with target location: {activeOrder.storeAddress}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Segment takes up full height, with floating card overlays */}
      <div className="flex-1 relative">
        <MapViewComponent
          currentLocation={currentLocation}
          activeOrder={activeOrder}
          orderStep={orderStep}
          rideProgress={rideProgress}
        />

        {/* Floating Driving Instructions Bar */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-200/50 flex items-center justify-between z-10 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Navigation size={18} className="transform rotate-45" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold leading-none">NEXT STEP</p>
              <p className="text-sm font-black text-gray-800 mt-0.5 tracking-tight">
                {rideProgress < 100 ? (
                  <span>Drive to restaurant ({Math.max(0.1, (activeOrder.distance * (1 - rideProgress/100))).toFixed(1)} km left)</span>
                ) : (
                  <span className="text-emerald-700">Arrived at Merchant Spot!</span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Actionable bottom sheet */}
      <div className="bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] p-6 border-t border-gray-100 flex flex-col space-y-4 z-20">
        
        {/* Title status info */}
        <div className="flex items-baseline justify-between">
          <span className="text-[#cda20c] text-[11px] font-black tracking-widest uppercase font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            GO TO PICKUP
          </span>
          <div className="text-xs text-gray-400 font-medium">
            Order ID: <span className="font-mono font-bold text-gray-700">{activeOrder.id}</span>
          </div>
        </div>

        {/* Store Detail Area */}
        <div className="flex items-start justify-between bg-gray-50 p-3 rounded-2xl border border-gray-150">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-gray-900 tracking-tight leading-snug">{activeOrder.storeName}</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wide">Food Outlet Store</p>
            <p className="text-xs text-gray-500 mt-1.5 leading-snug font-medium truncate pr-2">
              {activeOrder.storeAddress}
            </p>
          </div>
          
          {/* Copy Address Button */}
          <button
            onClick={handleCopy}
            id="copy-pickup-addr-btn"
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 active:bg-gray-100 shadow-sm transition-all focus:outline-none flex items-center justify-center cursor-pointer"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Navigation Action & Primary Hand-off Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Navigate Icon Button on bottom */}
          <button
            onClick={handleNavigate}
            id="navigate-pickup-btn"
            className="h-[56px] col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border border-gray-200 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Navigation size={18} className="transform rotate-45 text-amber-500" />
            <span className="text-xs uppercase tracking-wide font-black">NAV</span>
          </button>

          {/* Mark as Picked up Core Action (56px, full-width grid equivalent space, yellow) */}
          <button
            onClick={markAsPickedUp}
            id="mark-pickedup-btn"
            className="h-[56px] col-span-2 bg-[#F5C518] hover:bg-[#e2b40d] text-[#1A1A1A] font-black rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/10 cursor-pointer transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={18} />
            <span className="text-xs uppercase tracking-wider">MARK AS PICKED UP ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
