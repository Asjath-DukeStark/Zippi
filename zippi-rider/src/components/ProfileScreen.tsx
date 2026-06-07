/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { LogOut, Star, Truck, UserCheck, ShieldCheck, Mail, Phone, Bike } from 'lucide-react';
import { motion } from 'motion/react';

export const ProfileScreen: React.FC = () => {
  const {
    riderName,
    riderPhone,
    riderVehicle,
    rating,
    ordersCompleted,
    logout,
  } = useRiderStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col justify-between w-full h-full bg-gray-50 p-5 font-sans overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Profile header */}
        <div className="flex flex-col">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Rider Dossier</span>
          <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">My Profile</h2>
        </div>

        {/* Identity Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          {/* Avatar Icon */}
          <div className="w-14 h-14 bg-[#F5C518] rounded-full flex items-center justify-center font-black font-mono text-xl text-[#1A1A1A] shrink-0 border-2 border-white shadow shadow-amber-300">
            {riderName.split(' ').map(n=>n[0]).join('')}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-base font-black text-gray-900 tracking-tight leading-none truncate">
                {riderName}
              </h3>
              <UserCheck size={14} className="text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-wider">Zippi Platinum Tier</p>
          </div>
        </div>

        {/* Vehicle & Credentials List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          
          {/* Phone row */}
          <div className="p-4 flex items-center space-x-3.5">
            <div className="p-2 bg-gray-55 bg-gray-100 rounded-xl text-gray-500">
              <Phone size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Contact Number</p>
              <p className="text-xs font-bold text-gray-700 font-mono mt-0.5">{riderPhone}</p>
            </div>
          </div>

          {/* Vehicle row */}
          <div className="p-4 flex items-center space-x-3.5">
            <div className="p-2 bg-gray-55 bg-gray-100 rounded-xl text-gray-500">
              <Bike size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Registered Vehicle</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{riderVehicle}</p>
            </div>
          </div>

          {/* Logistics Agency */}
          <div className="p-4 flex items-center space-x-3.5">
            <div className="p-2 bg-gray-55 bg-gray-100 rounded-xl text-gray-500">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Logistics Division</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Colombo Central Grid (WP-01)</p>
            </div>
          </div>
        </div>

        {/* Quick Statistics Block */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">RIDER RATING</span>
            <div className="mt-1 flex items-center justify-center space-x-1.5">
              <Star size={16} fill="#F5C518" stroke="#F5C518" />
              <span className="text-lg font-black text-gray-800 font-mono">{rating}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">COMPLETED TRIPS</span>
            <div className="mt-1 flex items-center justify-center space-x-1.5">
              <Truck size={16} className="text-[#F5C518]" />
              <span className="text-lg font-black text-gray-800 font-mono">1,242</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-4 pb-2">
        <button
          onClick={logout}
          id="logout-btn"
          className="w-full h-12 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-[0.98] text-red-650 text-red-600 text-xs uppercase tracking-wider font-bold rounded-xl border border-red-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>LOG OUT SECURELY</span>
        </button>
      </div>
    </motion.div>
  );
};
