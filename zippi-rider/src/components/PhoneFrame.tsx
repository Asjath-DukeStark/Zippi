/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { TabType } from '../types';
import {
  Smartphone,
  Wifi,
  Signal,
  Battery,
  Send,
  Milestone,
  RefreshCw,
  Clock,
  Play,
  Pause,
  Compass,
  AlertTriangle,
  MapPin,
  Bike,
  Coins,
  User,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const {
    status,
    activeOrder,
    orderRequest,
    isSimulatingDrive,
    rideProgress,
    activeTab,
    setActiveTab,
    assignRandomOrder,
    progressSimulatedRide,
    startSimulatedDrive,
    stopSimulatedDrive,
    earningsToday,
    ordersCompleted,
    isLoggedIn,
    orderStep,
  } = useRiderStore();

  const [simTime, setSimTime] = useState('10:23');
  const [batteryLevel, setBatteryLevel] = useState(94);

  // Keep a simulated clock status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setSimTime(`${hours}:${mins} ${ampm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Simulates slow battery drain over hours
  useEffect(() => {
    const drain = setInterval(() => {
      setBatteryLevel((prev) => (prev > 10 ? prev - 1 : 99));
    }, 180000);
    return () => clearInterval(drain);
  }, []);

  // Fast manual drive trigger
  const handleFastStep = () => {
    if (activeOrder && isSimulatingDrive) {
      progressSimulatedRide();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 lg:bg-slate-900 text-slate-800 lg:text-gray-100 p-0 lg:p-5 flex flex-col lg:flex-row items-center justify-center lg:space-x-8 space-y-6 lg:space-y-0 selection:bg-amber-400 selection:text-slate-900">
      
      {/* Simulation Command Panel (Visible only on desktop) */}
      <div className="hidden lg:flex w-full max-w-sm bg-slate-800/80 border border-slate-700 p-5 rounded-3xl shadow-xl flex-col space-y-5 backdrop-blur text-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs uppercase tracking-wider">
            <Milestone size={14} />
            <span>Zippi Simulator Console</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-1">DISPATCH CONTROL</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            As a dispatcher, simulate client and merchant requests in real-time to audit the rider's screen flows.
          </p>
        </div>

        {/* Dispatch Action Panel */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-855 space-y-3">
          <span className="text-[10px] text-slate-500 font-mono block tracking-wider uppercase">Administrative Triggers</span>
          
          <button
            onClick={assignRandomOrder}
            disabled={status !== 'ONLINE' || activeOrder !== null || orderRequest !== null}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              status === 'ONLINE' && !activeOrder && !orderRequest
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-lg hover:shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={14} />
            <span>Assign Random Client Job</span>
          </button>

          {status !== 'ONLINE' && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[10px] flex items-start space-x-2 leading-relaxed">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>Rider must toggle status to ONLINE inside the phone screen to receive client match-making.</span>
            </div>
          )}
        </div>

        {/* GPS Driving Cruise progress simulation card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-855 space-y-3">
          <span className="text-[10px] text-slate-500 font-mono block tracking-wider uppercase">Auto-Drive Cruise</span>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">GPS Simulation Status</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              isSimulatingDrive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {isSimulatingDrive ? 'ROUTING RUNNING' : 'STOPPED'}
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className={`h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500`}
              style={{ width: `${activeOrder ? rideProgress : 0}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleFastStep}
              disabled={!activeOrder || !isSimulatingDrive || rideProgress >= 100}
              className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1 border ${
                activeOrder && isSimulatingDrive && rideProgress < 100
                  ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-amber-400 cursor-pointer'
                  : 'bg-slate-900 border-transparent text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={11} className="animate-spin-slow" />
              <span>Step Odometer</span>
            </button>

            {isSimulatingDrive ? (
              <button
                onClick={stopSimulatedDrive}
                disabled={!activeOrder}
                className="py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 cursor-pointer transition-all flex items-center justify-center space-x-1"
              >
                <Pause size={11} />
                <span>Pause Cruise</span>
              </button>
            ) : (
              <button
                onClick={startSimulatedDrive}
                disabled={!activeOrder}
                className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1 border ${
                  activeOrder
                    ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-900/40 text-emerald-400 cursor-pointer'
                    : 'bg-slate-900 border-transparent text-slate-600 cursor-not-allowed'
                }`}
              >
                <Play size={11} />
                <span>Start Cruise</span>
              </button>
            )}
          </div>
        </div>

        {/* Simulation metrics ledger */}
        <div className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-700 pt-3.5 font-mono">
          <div className="flex justify-between">
            <span>Rider Registered Status:</span>
            <span className={status === 'ONLINE' ? 'text-emerald-500 font-bold' : 'text-gray-400'}>{status}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Deliveries:</span>
            <span className={activeOrder ? 'text-amber-500 font-bold' : 'text-slate-500'}>
              {activeOrder ? `Step: ${orderStep}` : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Earnings Today:</span>
            <span className="text-white">LKR {earningsToday?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Primary Smartphone Mockup chassis */}
      <div className="relative w-full h-screen lg:w-[390px] lg:h-[780px] bg-white lg:bg-slate-950 rounded-none lg:rounded-[52px] p-0 lg:p-3.5 shadow-none lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-0 lg:border-4 lg:border-slate-800 lg:ring-0 lg:ring-1 lg:ring-slate-700 flex flex-col shrink-0 select-none">
        
        {/* Notch / Dynamic Island (Only on desktop) */}
        <div className="hidden lg:flex absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 items-center justify-between px-4 ring-1 ring-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
          {/* Active order sound pulsator blinking LED */}
          {orderRequest ? (
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-sky-950/40"></div>
          )}
        </div>

        {/* Status Bar (Only on desktop) */}
        <div className="hidden lg:flex h-9 px-6 items-center justify-between text-xs font-semibold select-none z-40 bg-transparent text-[#1A1A1A] w-full pt-1.5 shrink-0 select-none">
          {/* Sim Time */}
          <div className="font-mono text-[11px] font-bold tracking-tight text-slate-350 select-none">
            {simTime}
          </div>
          
          {/* Signal Icons */}
          <div className="flex items-center space-x-1.5 text-slate-350 select-none">
            <Signal size={13} strokeWidth={2.5} />
            <span className="text-[10px] font-mono leading-none tracking-widest font-black">5G</span>
            <Wifi size={13} strokeWidth={2.5} />
            <div className="flex items-center space-x-0.5">
              <span className="text-[9px] font-mono font-bold leading-none">{batteryLevel}%</span>
              <Battery size={15} strokeWidth={2.5} className="transform rotate-0" />
            </div>
          </div>
        </div>

        {/* Inner Phone screen content */}
        <div className="flex-1 w-full bg-slate-205 rounded-none lg:rounded-[40px] overflow-hidden flex flex-col relative border-0 lg:border lg:border-black/10 shadow-none lg:shadow-inner bg-gray-50">
          
          {/* Screen Content Outlet */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* Bottom Native Slide/Navigation Tabs (Sticky ONLY if rider is logged in!) */}
          {isLoggedIn && (
            <div className="h-[76px] bg-white border-t border-gray-150 flex items-center justify-around px-2 z-40 relative pt-1.5 pb-2.5 shadow-lg shrink-0">
              {/* Home Tab */}
              <button
                onClick={() => setActiveTab('home')}
                id="tab-home"
                className={`flex flex-col items-center justify-center space-y-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'text-[#F5C518]'
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Home</span>
              </button>

              {/* Active Order Tab */}
              <button
                onClick={() => setActiveTab('active_order')}
                id="tab-active"
                className={`flex flex-col items-center justify-center space-y-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === 'active_order'
                    ? 'text-[#F5C518]'
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                <Bike size={20} strokeWidth={activeTab === 'active_order' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Deliver</span>
                
                {/* Active pulse dot on tabs */}
                {activeOrder && (
                  <span className="absolute top-0 right-3.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Earnings Tab */}
              <button
                onClick={() => setActiveTab('earnings')}
                id="tab-earnings"
                className={`flex flex-col items-center justify-center space-y-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'earnings'
                    ? 'text-[#F5C518]'
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                <Coins size={20} strokeWidth={activeTab === 'earnings' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Earnings</span>
              </button>

              {/* Profile Tab */}
              <button
                onClick={() => setActiveTab('profile')}
                id="tab-profile"
                className={`flex flex-col items-center justify-center space-y-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-[#F5C518]'
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Profile</span>
              </button>
            </div>
          )}

          {/* iOS / Android home touch navigation line indicator */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full z-45 opacity-60"></div>
        </div>
      </div>
    </div>
  );
};
