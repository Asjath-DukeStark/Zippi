/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // "Deals" or "Brand"
  options: string[]; // List of options to show
  initialSelected: string[]; // Initially selected options
  onApply: (selected: string[]) => void;
  onClear: () => void;
}

export default function FilterBottomSheet({
  isOpen,
  onClose,
  title,
  options,
  initialSelected,
  onApply,
  onClear,
}: FilterBottomSheetProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle checking & unchecking options
  const handleToggleOption = (option: string) => {
    setSelected((prev) => {
      if (option === 'All') {
        return ['All'];
      }
      
      const filtered = prev.filter((o) => o !== 'All');
      if (filtered.includes(option)) {
        const next = filtered.filter((o) => o !== option);
        return next.length === 0 ? ['All'] : next;
      } else {
        return [...filtered, option];
      }
    });
  };

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end select-none font-sans" id={`filter-bottom-sheet-${title.toLowerCase()}`}>
      {/* Backdrop tap to close */}
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={onClose} />

      {/* Main bottom sheet panel wrapper */}
      <div className="bg-white rounded-t-[24px] max-h-[85%] flex flex-col relative px-5 pt-6 pb-5 w-full shadow-2xl animate-slide-up">
        
        {/* Absolute floating close button matching the screenshot */}
        <button
          onClick={onClose}
          className="absolute -top-7 right-4 w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center rounded-full shadow-md border border-gray-150 transition-transform active:scale-95 cursor-pointer z-50"
          id="filter-sheet-close-btn"
        >
          <X className="w-5 h-5 text-gray-500 stroke-[2.5]" />
        </button>

        {/* Title Header Section */}
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-[20px] font-extrabold text-[#1A1A1A] tracking-tight">{title}</h3>
          <button
            onClick={() => {
              setSelected(['All']);
              onClear();
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            id="filter-sheet-clear-btn"
          >
            Clear
          </button>
        </div>

        {/* Search Search Box Input */}
        <div className="relative flex items-center w-full h-[40px] mb-5">
          <div className="absolute left-3.5 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all"
            id="filter-sheet-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* CHECKLIST SCROLL-BAR AREA */}
        <div className="overflow-y-auto space-y-4 max-h-[300px] pr-1 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-450 font-medium">
              No matching options found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isChecked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center justify-between py-1 cursor-pointer group select-none"
                  id={`filter-opt-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span className={`text-[13.5px] font-semibold text-gray-800 group-hover:text-black transition-colors ${isChecked ? 'font-bold text-black' : ''}`}>
                    {opt}
                  </span>
                  
                  {/* Native resembling checklist checkbox box */}
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleOption(opt)}
                      className="peer h-4.5 w-4.5 cursor-pointer appearance-none rounded-sm border border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
                    />
                    <div className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 flex items-center justify-center">
                      <svg className="h-3 w-3 stroke-white fill-none stroke-[3]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* BOTTOM REDIRECT/APPLY BUTTON */}
        <div className="pt-5 border-t border-gray-100 mt-4">
          <button
            onClick={() => {
              onApply(selected);
              onClose();
            }}
            className="w-full h-[46px] bg-[#1565C0] hover:bg-[#0D47A1] active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md"
            id="filter-sheet-apply-btn"
          >
            APPLY
          </button>
        </div>

      </div>
    </div>
  );
}
