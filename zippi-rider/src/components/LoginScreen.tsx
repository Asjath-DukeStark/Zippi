/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { Lock, Phone, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginScreen: React.FC = () => {
  const login = useRiderStore(state => state.login);
  const [phone, setPhone] = useState('+94 77 982 4511'); // Beautiful default Colombo rider phone
  const [password, setPassword] = useState('zippi123'); // Preset password for straightforward UI testing
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    if (!password || password.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    login(phone, password).then(success => {
      if (!success) {
        setErrorMsg('Invalid phone or password combination.');
      }
    }).catch(() => {
      setErrorMsg('Failed to connect to login server.');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col justify-between w-full h-full bg-white px-6 py-8 font-sans text-[#1A1A1A]"
    >
      {/* Top Section with Zippi Logo */}
      <div className="flex flex-col items-center mt-8 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-[#F5C518] rounded-2xl shadow-md border-b-4 border-[#cda20c]">
          <Zap size={36} fill="#1A1A1A" stroke="#1A1A1A" className="text-[#1A1A1A] transform -skew-x-6" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-display font-black tracking-tight text-[#1A1A1A]">
            ZIPPI <span className="text-[#cda20c]">RIDER</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Express Delivery Network
          </p>
        </div>
      </div>

      {/* Input Form Fields */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Large Phone Field */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
            Rider Phone Number
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              id="rider-phone"
              placeholder="+94 XX XXX XXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMsg('');
              }}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
            Secure Rider PIN Code
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              id="rider-pin"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-gray-400 pl-1">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Secured with Knox Encryption Server</span>
        </div>
      </form>

      {/* Button fixed at bottom (exactly 56px size, Zippi Yellow) */}
      <div className="pb-4">
        <button
          onClick={handleSubmit}
          id="login-btn"
          className="w-full h-[56px] bg-[#F5C518] hover:bg-[#e2b40d] active:scale-[0.98] text-[#1A1A1A] text-lg font-bold rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all uppercase tracking-wide cursor-pointer"
        >
          LOG IN TO RIDE
        </button>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-mono">
          Zippi Logistics Private Ltd © 2026
        </p>
      </div>
    </motion.div>
  );
};
