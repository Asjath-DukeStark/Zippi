/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { Star, Shield, Radio, CheckCircle, Navigation, Award, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HomeScreen: React.FC = () => {
  const {
    status,
    setStatus,
    earningsToday,
    ordersCompleted,
    rating,
    isSimulatingDrive,
    progressSimulatedRide,
    activeOrder,
  } = useRiderStore();

  // Handle automatic drive simulation intervals if active order is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeOrder && isSimulatingDrive) {
      interval = setInterval(() => {
        progressSimulatedRide();
      }, 3000); // Progress driving coordinates calculation
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeOrder, isSimulatingDrive, progressSimulatedRide]);

  const toggleStatus = () => {
    const nextStatus = status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setStatus(nextStatus);
  };

  // Render stars matching numerical rating (e.g., 4.85 out of 5)
  const renderStars = (score: number) => {
    const stars = [];
    const fullStarsCount = Math.floor(score);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStarsCount) {
        stars.push(<Star key={i} size={15} fill="#F5C518" stroke="#F5C518" className="inline-block" />);
      } else {
        stars.push(<Star key={i} size={15} stroke="#D1D5DB" className="inline-block text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col justify-between w-full h-full bg-gray-50 p-5 font-sans"
    >
      {/* Top Welcome Title Grid */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Deliverer Hub</span>
          <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">RIDER DASHBOARD</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <Shield size={12} className="text-amber-500" />
          <span className="text-[10px] font-bold text-gray-600 font-mono">SECURE</span>
        </div>
      </div>

      {/* Very large center of screen Status Toggle */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {status === 'ONLINE' ? (
            <motion.div
              key="online"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Massive green circle toggle button */}
              <button
                onClick={toggleStatus}
                id="status-toggle-online"
                className="w-48 h-48 bg-emerald-600 hover:bg-emerald-700 rounded-full flex flex-col items-center justify-center shadow-2xl relative select-none cursor-pointer outline-none transition-all border-4 border-white"
              >
                {/* Simulated radar rings */}
                <span className="absolute inset-0 rounded-full bg-emerald-600 opacity-20 animate-ping"></span>
                <span className="absolute -inset-2 rounded-full bg-emerald-500 opacity-10 animate-pulse"></span>
                
                <Radio size={48} className="text-white animate-pulse" />
                <span className="text-2xl font-black text-white tracking-widest mt-2">ONLINE</span>
                <span className="text-[9px] text-emerald-100 uppercase tracking-widest mt-1 font-mono">GPS broadcasting...</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="offline"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Massive grey offline circle toggle button */}
              <button
                onClick={toggleStatus}
                id="status-toggle-offline"
                className="w-48 h-48 bg-gray-400 hover:bg-gray-500 rounded-full flex flex-col items-center justify-center shadow-lg relative select-none cursor-pointer outline-none transition-all border-4 border-white"
              >
                <div className="w-4 h-4 rounded-full bg-white opacity-40 mb-1"></div>
                <span className="text-2xl font-black text-white tracking-widest">OFFLINE</span>
                <span className="text-[9px] text-gray-100 uppercase tracking-widest mt-1 font-mono">GO ONLINE TO EARN</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic micro-alert showing GPS state */}
        <div className="mt-5 text-center">
          {status === 'ONLINE' ? (
            <div className="inline-flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-full text-[11px] text-emerald-700 font-mono border border-emerald-100 font-semibold shadow-sm">
              <Navigation size={10} className="animate-bounce" />
              <span>Pinging location every 5s</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-mono italic">
              Status current: Disconnected from match system.
            </p>
          )}
        </div>
      </div>

      {/* Bottom KPI Dashboard Cards Grid */}
      <div className="grid grid-cols-2 gap-4 pb-2">
        {/* Earnings Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center space-x-1">
            <Award size={12} className="text-amber-500 mr-1" />
            <span>Earnings Today</span>
          </span>
          <div className="mt-2.5">
            <div className="text-sm font-mono font-extrabold text-amber-600">LKR</div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight -mt-1 leading-none">
              {earningsToday.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Order Stats Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center space-x-1">
            <CheckCircle size={12} className="text-emerald-500 mr-1" />
            <span>Completed</span>
          </span>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-4xl font-black text-[#1A1A1A] tracking-tight leading-none">
              {ordersCompleted}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-gray-500">Rider rating</span>
              <div className="flex items-center space-x-0.5 mt-0.5">
                {renderStars(rating)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rider Status Instructions Banner */}
      {status === 'ONLINE' && !activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl text-center text-amber-800 text-[11px] font-medium leading-relaxed"
        >
          ⏱ Waiting for delivery tasks... You can trigger a mock order request anytime using the{' '}
          <strong className="underline">Order Assignment Trigger</strong> in the left pane controls!
        </motion.div>
      )}
    </motion.div>
  );
};
