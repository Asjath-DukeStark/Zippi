import React, { useState, useEffect } from 'react';

export default function FlashDealsTimer({ endTimeStr }: { endTimeStr: string }) {
  const calculateRemaining = () => {
    const diff = Math.floor((new Date(endTimeStr).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  const [remaining, setRemaining] = useState(calculateRemaining);

  useEffect(() => {
    setRemaining(calculateRemaining());
  }, [endTimeStr]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimeStr]);

  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const hStr = String(hrs).padStart(2, '0');
  const mStr = String(mins).padStart(2, '0');
  const sStr = String(secs).padStart(2, '0');

  return (
    <div className="bg-[#F5C518] rounded-[12px] p-3 flex items-center justify-between text-left select-none w-full shadow-xs mb-3" id="flash-deals-header-timer">
      {/* Left side: Heading and tagline */}
      <div className="flex flex-col text-[#1A1A1A]">
        <span className="text-[15px] font-black tracking-tight leading-tight flex items-center gap-1 font-sans">
          ⚡ Flash Deals
        </span>
        <span className="text-[11px] opacity-80 font-bold mt-0.5 font-sans">
          Hurry! Ends in:
        </span>
      </div>

      {/* Right side: Timer boxes */}
      <div className="flex items-center">
        {/* Hours box */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1A1A1A] text-[#F5C518] w-11 h-11 rounded-[8px] font-mono text-[20px] font-bold flex items-center justify-center shadow-xs">
            {hStr}
          </div>
          <span className="text-[9px] text-[#1A1A1A] font-black mt-1 tracking-wider font-sans">HRS</span>
        </div>

        {/* Separator */}
        <div className="flex flex-col items-center justify-center h-11 px-1">
          <span className="text-[20px] font-black text-[#1A1A1A] leading-none select-none">:</span>
        </div>

        {/* Minutes box */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1A1A1A] text-[#F5C518] w-11 h-11 rounded-[8px] font-mono text-[20px] font-bold flex items-center justify-center shadow-xs">
            {mStr}
          </div>
          <span className="text-[9px] text-[#1A1A1A] font-black mt-1 tracking-wider font-sans">MIN</span>
        </div>

        {/* Separator */}
        <div className="flex flex-col items-center justify-center h-11 px-1">
          <span className="text-[20px] font-black text-[#1A1A1A] leading-none select-none">:</span>
        </div>

        {/* Seconds box */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1A1A1A] text-[#F5C518] w-11 h-11 rounded-[8px] font-mono text-[20px] font-bold flex items-center justify-center shadow-xs">
            {sStr}
          </div>
          <span className="text-[9px] text-[#1A1A1A] font-black mt-1 tracking-wider font-sans">SEC</span>
        </div>
      </div>
    </div>
  );
}
