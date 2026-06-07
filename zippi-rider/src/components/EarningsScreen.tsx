/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRiderStore } from '../store/useRiderStore';
import { EarningsRecord } from '../types';
import { INITIAL_EARNINGS } from '../data/mockData';
import { Calendar, CircleDollarSign, Compass, Receipt, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabRange = 'Today' | 'This Week' | 'This Month';

export const EarningsScreen: React.FC = () => {
  const { earningsToday } = useRiderStore();
  const [activeRange, setActiveRange] = useState<TabRange>('Today');
  const [earningsList, setEarningsList] = useState<EarningsRecord[]>(INITIAL_EARNINGS);

  // Synchronize local storage lists dynamically on mounting or range change
  useEffect(() => {
    const currentListStr = localStorage.getItem('zippi_earnings');
    if (currentListStr) {
      try {
        setEarningsList(JSON.parse(currentListStr));
      } catch (e) {
        setEarningsList(INITIAL_EARNINGS);
      }
    } else {
      localStorage.setItem('zippi_earnings', JSON.stringify(INITIAL_EARNINGS));
    }
  }, [earningsToday]);

  // Filters listings according to selected range
  const filteredList = earningsList.filter((item) => {
    if (activeRange === 'Today') {
      return item.date === 'Today';
    } else if (activeRange === 'This Week') {
      return item.date === 'Today' || item.date === 'This Week';
    } else {
      return true; // "This Month" includes everything
    }
  });

  // Calculate cumulative earnings dynamically for selected tab
  const totalAmount = filteredList.reduce((acc, item) => acc + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col justify-stretch w-full h-full bg-gray-50 p-5 font-sans overflow-y-auto"
    >
      {/* Page Title header */}
      <div className="flex flex-col mb-4">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Financial Auditor</span>
        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">Rider Payout Log</h2>
      </div>

      {/* Today / This Week / This Month segmented controls */}
      <div className="grid grid-cols-3 bg-gray-200/60 p-1 rounded-2xl border border-gray-200 shadow-inner mb-5">
        {(['Today', 'This Week', 'This Month'] as TabRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={`py-2 text-[11px] font-black uppercase tracking-wide rounded-xl transition-all duration-200 cursor-pointer ${
              activeRange === range
                ? 'bg-white text-[#1a1a1a] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Aggregate Big Payout Graphic display (Yellow accent) */}
      <div className="bg-[#1A1A1A] text-white p-6 rounded-[24px] shadow-lg border-b-4 border-[#F5C518] relative overflow-hidden mb-6 flex flex-col justify-between">
        {/* Abstract glowing graphics */}
        <div className="absolute right-0 top-0 w-28 h-28 bg-[#F5C518] opacity-[0.06] rounded-full blur-2xl transform translate-x-4 -translate-y-4"></div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase font-mono tracking-widest font-bold flex items-center space-x-1.5">
            <CircleDollarSign size={13} className="text-[#F5C518]" />
            <span>ACCUMULATED REVENUE</span>
          </span>
          <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded font-mono font-semibold uppercase">{activeRange}</span>
        </div>

        <div className="mt-4 flex items-baseline space-x-1.5">
          <span className="text-[#F5C518] text-base font-black font-mono">LKR</span>
          <span className="text-4xl font-black text-[#F5C518] tracking-tight">{totalAmount.toLocaleString()}</span>
        </div>

        <div className="mt-3.5 border-t border-white/5 pt-3.5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>Trips completed</span>
          <span className="font-bold text-white">{filteredList.length} deliveries</span>
        </div>
      </div>

      {/* Per-order chronological listing layout */}
      <div className="flex-1 flex flex-col min-h-[160px] overflow-hidden">
        <div className="flex items-center justify-between mb-3.5 pl-1">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center space-x-1">
            <Receipt size={12} />
            <span>TRANSACTION HISTORY</span>
          </h3>
          <span className="text-[10px] font-mono text-gray-400">{filteredList.length} items</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredList.length > 0 ? (
            <div className="space-y-2.5 overflow-y-auto max-h-[180px] pr-1 flex-1">
              {filteredList.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm hover:border-gray-300 transition-colors flex items-center justify-between space-x-3.5"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                        {record.id}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono font-medium">{record.time}</span>
                    </div>
                    
                    <p className="text-xs font-semibold text-gray-800 leading-snug truncate">
                      {record.address}
                    </p>
                  </div>

                  {/* Cash display */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs font-mono font-bold text-gray-400 leading-none">LKR</span>
                    <span className="text-sm font-black text-emerald-700 mt-1 flex items-center">
                      +{record.amount}
                      <ArrowUpRight size={12} className="inline mr-0.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-gray-150">
              <Calendar size={32} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-400 font-mono">No delivery payments matching this range yet.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
