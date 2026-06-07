/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { Clock, MapPin, Navigation, ShoppingBag, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OrderRequestPopup: React.FC = () => {
  const { orderRequest, countdown, tickCountdown, acceptOrder, declineOrder } = useRiderStore();

  // Tick the countdown every second while there's an active request
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (orderRequest) {
      timer = setInterval(() => {
        tickCountdown();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderRequest, tickCountdown]);

  if (!orderRequest) return null;

  // Compute SVG circular countdown calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / 10) * circumference;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
        {/* Soft dismiss-backdrop click is disabled for safety; rider must explicitly decline or accept */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="bg-white rounded-t-[32px] p-6 shadow-2xl flex flex-col space-y-6 max-h-[92%] overflow-y-auto"
        >
          {/* Header of Request Bottom Sheet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Zap size={15} className="text-[#F5C518] fill-[#F5C518]" />
              <span className="text-[11px] font-black tracking-wider uppercase text-amber-900 font-mono">
                NEW JOB RUSH
              </span>
            </div>
            {/* Animated countdown ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="4.5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="#F5C518"
                  strokeWidth="4.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute font-mono font-black text-lg text-[#1A1A1A]">
                {countdown}s
              </div>
            </div>
          </div>

          {/* Large Price Payout and Distance Display */}
          <div className="bg-[#1A1A1A] p-5 rounded-2xl flex items-center justify-between text-white">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase font-mono tracking-widest">Guaranteed Payout</span>
              <span className="text-3xl font-black text-[#F5C518] tracking-tight">
                LKR {orderRequest.payout}
              </span>
            </div>
            <div className="flex flex-col items-end border-l border-white/10 pl-5">
              <span className="text-gray-400 text-[10px] uppercase font-mono tracking-widest">Job Distance</span>
              <span className="text-xl font-bold tracking-tight text-white mt-1">
                {orderRequest.distance} km
              </span>
            </div>
          </div>

          {/* Delivery Route Addresses */}
          <div className="space-y-4">
            {/* Pickup Node */}
            <div className="flex items-start space-x-3.5">
              <div className="bg-amber-100 p-2.5 rounded-full flex items-center justify-center text-amber-700 mt-1">
                <ShoppingBag size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">
                  A. PICKUP STORE
                </span>
                <h4 className="text-sm font-black text-gray-800 tracking-tight truncate mt-0.5">
                  {orderRequest.storeName}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-medium">
                  {orderRequest.storeAddress}
                </p>
              </div>
            </div>

            {/* Connecting dot track line */}
            <div className="w-[3px] h-6 bg-dashed bg-gray-200 ml-[18px] border-l-2 border-dashed border-gray-300"></div>

            {/* Drop Node */}
            <div className="flex items-start space-x-3.5">
              <div className="bg-emerald-100 p-2.5 rounded-full flex items-center justify-center text-emerald-700 mt-1">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">
                  B. DROPOFF CUSTOMER
                </span>
                <p className="text-xs text-gray-800 mt-0.5 font-bold leading-relaxed">
                  {orderRequest.customerAddress}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Deliver to: {orderRequest.customerName}
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout - Action Decline | Accept Buttons (Exactly 56px Tall) */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Decline Button - Gray */}
            <button
              onClick={declineOrder}
              id="decline-btn"
              className="h-[56px] bg-gray-100 hover:bg-gray-250 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl flex items-center justify-center text-sm uppercase tracking-wide border border-gray-200 cursor-pointer active:scale-95 transition-all"
            >
              DECLINE
            </button>

            {/* Accept Button - Yellow */}
            <button
              onClick={acceptOrder}
              id="accept-btn"
              className="h-[56px] bg-[#F5C518] hover:bg-[#e2b40d] text-[#1A1A1A] font-black rounded-2xl flex items-center justify-center text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
            >
              ACCEPT JUMP
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
