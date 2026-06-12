/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 select-none" id="zippi-logo">
      {/* Yellow Brand Tile with Circular Speed "Z" Logo */}
      <div className="bg-brand-yellow font-extrabold text-brand-charcoal text-xl px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95 transition-transform">
        <div className="relative w-7 h-7 bg-brand-charcoal rounded-full flex items-center justify-center overflow-hidden">
          {/* Animated/speed-motion lines */}
          <span className="absolute left-1 top-2.5 w-1.5 h-0.5 bg-brand-yellow rounded-full animate-pulse"></span>
          <span className="absolute right-1 top-4 w-2 h-0.5 bg-brand-yellow rounded-full"></span>
          <span className="absolute left-2.5 top-1.5 w-2 h-0.5 bg-brand-yellow rounded-full"></span>
          {/* Main fast "Z" letter */}
          <span className="font-black text-brand-yellow text-[13px] tracking-wide relative z-10">Z</span>
        </div>
        <span className="font-extrabold tracking-tight text-lg">zippi</span>
      </div>
      
      {/* Subdued Slogan */}
      <div className="hidden min-[370px]:flex flex-col text-[10px] leading-tight justify-start pt-0.5">
        <span className="font-bold text-brand-charcoal tracking-wide uppercase">GROCERY</span>
        <span className="font-medium text-brand-gray text-[9px]">Colombo Fresh</span>
      </div>
    </div>
  );
}
