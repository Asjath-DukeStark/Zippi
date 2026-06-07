/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { MapViewComponent } from './MapViewComponent';
import { Phone, Navigation, CheckCircle2, User, ChevronRight, X, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ActiveDeliveryDropoff: React.FC = () => {
  const { activeOrder, orderStep, rideProgress, markAsDelivered, currentLocation } = useRiderStore();
  const [showCallDialer, setShowCallDialer] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 p-6 text-center">
        <p className="text-gray-400 font-mono text-sm leading-relaxed">No active delivery in progress.</p>
      </div>
    );
  }

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeOrder.customerLocation.latitude},${activeOrder.customerLocation.longitude}`;
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

  const executeCall = () => {
    setShowCallDialer(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-100 overflow-hidden select-none">
      
      {/* Dynamic Simulated Dialer Overlay Popup */}
      <AnimatePresence>
        {showCallDialer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white"
          >
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white animate-wiggle mb-6 shadow-xl shadow-emerald-700/55 border-4 border-white/20">
              <Phone size={36} fill="#ffffff" />
            </div>
            
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">Rider Calling Channel</span>
            <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{activeOrder.customerName}</h3>
            <p className="text-lg text-gray-300 font-mono mt-0.5">{activeOrder.customerPhone || '+94 77 123 4567'}</p>
            
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-4"></div>
            <p className="text-xs text-gray-400 mt-1 font-mono italic animate-pulse">Connecting secured voice line (Colombo proxy)...</p>

            <button
              onClick={() => setShowCallDialer(false)}
              className="mt-12 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white px-6 py-3.5 rounded-full font-bold flex items-center space-x-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <X size={15} />
              <span>TERMINATE CALL</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigating direction loading overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <div className="w-16 h-16 bg-[#2E7D32] rounded-full flex items-center justify-center text-white animate-bounce mb-4 shadow-lg shadow-emerald-400/45">
              <Navigation size={32} className="transform rotate-45" />
            </div>
            <h3 className="text-xl font-bold">Initiating Customer Pathing...</h3>
            <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed max-w-xs">
              Directing GPS layout coordinates to drop area: {activeOrder.customerAddress}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map visual takes full-screen backdrop */}
      <div className="flex-1 relative">
        <MapViewComponent
          currentLocation={currentLocation}
          activeOrder={activeOrder}
          orderStep={orderStep}
          rideProgress={rideProgress}
        />

        {/* Dynamic driving text bar overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-200/50 flex items-center justify-between z-10 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 tracking-widest font-mono font-bold leading-none">NEXT STEP</p>
              <p className="text-sm font-black text-gray-800 mt-0.5 tracking-tight">
                {rideProgress < 100 ? (
                  <span>Reach customer house ({Math.max(0.1, (activeOrder.distance * (1 - rideProgress/100))).toFixed(1)} km left)</span>
                ) : (
                  <span className="text-emerald-700">Arrived at Delivery Point!</span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Actionable dropoff customer sheet */}
      <div className="bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] p-6 border-t border-gray-100 flex flex-col space-y-4 z-20">
        
        {/* Status indicator bar in header */}
        <div className="flex items-baseline justify-between">
          <span className="text-[#2E7D32] text-[11px] font-black tracking-widest uppercase font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            DELIVER TO CUSTOMER
          </span>
          <div className="text-xs text-gray-400 font-medium">
            Order: <span className="font-mono font-bold text-gray-700">{activeOrder.id}</span>
          </div>
        </div>

        {/* Customer Detail Name, phone and interactive CALL trigger */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-150">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-gray-900 tracking-tight leading-snug">{activeOrder.customerName}</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wide">Client Recipient</p>
            <p className="text-xs text-gray-600 mt-2 font-semibold truncate leading-relaxed">
              🏠 {activeOrder.customerAddress}
            </p>
          </div>
          
          {/* Dedicated call-recipient button */}
          <button
            onClick={executeCall}
            id="call-customer-btn"
            className="ml-3 px-3.5 py-3.5 bg-white border-2 border-emerald-200 hover:border-emerald-600 rounded-xl text-emerald-700 hover:text-emerald-800 active:bg-emerald-50 shadow-sm transition-all flex items-center justify-center cursor-pointer font-bold space-x-1"
          >
            <Phone size={15} fill="#2E7D32" />
            <span className="text-[11px] font-black uppercase font-sans">CALL</span>
          </button>
        </div>

        {/* Navigation Action & Complete Delivery (Green Full-Width exactly 56px) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Navigate Google Maps shortcut button */}
          <button
            onClick={handleNavigate}
            id="navigate-dropoff-btn"
            className="h-[56px] col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border border-gray-200 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Navigation size={18} className="transform rotate-45 text-emerald-600" />
            <span className="text-xs uppercase tracking-wide font-black">NAV</span>
          </button>

          {/* Mark as delivered - Green Full Width (56px) */}
          <button
            onClick={markAsDelivered}
            id="mark-delivered-btn"
            className="h-[56px] col-span-2 bg-[#2E7D32] hover:bg-[#256428] text-white font-black rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-800/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={18} />
            <span className="text-xs uppercase tracking-wider">MARK AS DELIVERED ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
