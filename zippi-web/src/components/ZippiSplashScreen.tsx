import React, { useState, useEffect } from 'react';

interface ZippiSplashScreenProps {
  onComplete: () => void;
}

export default function ZippiSplashScreen({ onComplete }: ZippiSplashScreenProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Initial auto-redirect trigger
    console.log("Redirect timer started for 3.5s");
    const timer = setTimeout(() => {
      console.log("Navigate to Home screen");
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [animationKey, onComplete]);

  const handleReplay = () => {
    // Force complete state reset by incrementing key
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div 
      key={animationKey}
      className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center font-sans overflow-hidden select-none"
      id="zippi-splash-screen"
    >
      {/* Plus Jakarta Sans fonts link injected into head dynamically */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
        
        .splash-font-jakarta {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* STEP 1 — LOGO ICON (starts at 0.3s) */
        .logo-box-anim {
          width: 64px;
          height: 64px;
          background-color: #F5C518;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.6);
          box-shadow: 0 4px 12px rgba(245, 197, 24, 0.15);
          animation: logoIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.3s;
        }

        /* STEP 2 — "Zippi" WORDMARK (starts at 0.9s) */
        .wordmark-container-anim {
          display: inline-flex;
          align-items: center;
          opacity: 0;
          transform: translateY(20px);
          animation: nameIn 0.8s ease-out forwards;
          animation-delay: 0.9s;
        }

        /* STEP 3 — SRI LANKA FLAG SWEEP (starts at 1.0s) */
        .flag-sweep-group-anim {
          animation: flagSweep 1.8s ease-in-out infinite;
          animation-delay: 1.0s;
          transform: translateX(-110%);
        }

        /* STEP 4 & 5 — SLOGANS (starts at 1.7s & 1.9s) */
        .slogan-left-anim {
          background-color: #1A1A1A;
          color: #F5C518;
          padding: 10px 26px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transform: translateX(-70px);
          animation: tagFromLeft 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
          animation-delay: 1.7s;
        }

        .slogan-right-anim {
          background-color: #F5C518;
          color: #1A1A1A;
          padding: 10px 26px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transform: translateX(70px);
          animation: tagFromRight 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
          animation-delay: 1.9s;
        }

        /* STEP 6 — BOTTOM TAGLINE (starts at 2.2s) */
        .tagline-anim {
          font-size: 13px;
          color: #888888;
          font-weight: 500;
          margin-top: 48px;
          opacity: 0;
          text-align: center;
          animation: fadeUp 0.7s ease forwards;
          animation-delay: 2.2s;
        }

        /* REDIRECT LOADING INDICATOR (starts at 3.0s) */
        .loader-container-anim {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          align-items: center;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 3.0s;
        }

        .dot-pulse {
          width: 6px;
          height: 6px;
          background-color: #F5C518;
          border-radius: 50%;
          animation: pulseDot 1.2s infinite ease-in-out;
        }

        /* ═════════ KEYFRAMES ═════════ */
        @keyframes logoIn {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes nameIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flagSweep {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(110%);
          }
        }

        @keyframes tagFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-70px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes tagFromRight {
          0% {
            opacity: 0;
            transform: translateX(70px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>

      {/* TOP ACTIONS - Replay and Skip */}
      <div className="absolute top-6 right-6 flex items-center gap-2.5 z-[1000]">
        <button 
          onClick={handleReplay}
          className="bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 border-none outline-none rounded-full px-4 py-1.5 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all select-none"
          id="splash-replay-btn"
        >
          <span className="text-sm">↺</span> Replay
        </button>
        <button 
          onClick={onComplete}
          className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-gray-900 border-none outline-none rounded-full px-4 py-1.5 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-all select-none"
          id="splash-skip-btn"
        >
          Skip ➔
        </button>
      </div>

      {/* CENTER INTRO GRAPHICS */}
      <div className="flex flex-col items-center justify-center splash-font-jakarta z-10">
        
        {/* LOGO AND WORDMARK ROW */}
        <div className="flex items-center justify-center gap-4">
          
          {/* STEP 1 — LOGO ICON */}
          <div className="logo-box-anim overflow-hidden">
            <img src="/logo.jpg" className="w-full h-full object-cover" alt="Zippi Logo" />
          </div>

          {/* STEP 2 — "Zippi" WORDMARK with SVG clipPath Sri Lanka Flag decoration */}
          <div className="wordmark-container-anim">
            <svg className="w-[210px] h-[80px]" viewBox="0 0 210 80">
              <defs>
                {/* Clipped precisely to the letters of the custom typography */}
                <clipPath id="textClip">
                  <text x="5" y="62" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="72" letterSpacing="-2px">Zippi</text>
                </clipPath>
              </defs>
              
              {/* Render clipped visual workspace group */}
              <g clipPath="url(#textClip)">
                {/* Default background outline of textual letters (#1A1A1A) */}
                <rect x="0" y="0" width="100%" height="100%" fill="#1A1A1A" />
                
                {/* STEP 3 — Sri Lanka flag overlay that sweeps left-to-right */}
                <g className="flag-sweep-group-anim">
                  <svg x="0" y="0" width="240" height="80" viewBox="0 0 240 80">
                    {/* Maroon Base Background */}
                    <rect x="0" y="0" width="240" height="80" fill="#8D153A" />
                    
                    {/* Gold/yellow internal border frame */}
                    <rect x="4" y="4" width="232" height="72" fill="none" stroke="#F5A800" strokeWidth="4" />
                    
                    {/* Yellow vertical dividing separator column line */}
                    <line x1="75" y1="4" x2="75" y2="76" stroke="#F5A800" strokeWidth="4" />
                    
                    {/* Green stripe panel at left */}
                    <rect x="14" y="8" width="26" height="64" fill="#1B7A3E" />
                    
                    {/* Orange stripe panel next to green */}
                    <rect x="44" y="8" width="26" height="64" fill="#E07B39" />
                    
                    {/* Main Maroon portion background (starts after separating line) */}
                    <rect x="77" y="6" width="157" height="68" fill="#8D153A" />
                    
                    {/* Center: Golden Lion symbol built with ellipses and path sword details */}
                    <circle cx="155" cy="40" r="10" fill="#F5A800" />
                    <ellipse cx="145" cy="45" rx="15" ry="9" fill="#F5A800" />
                    <path d="M 152 28 L 157 28 M 155 25 L 155 35 M 130 45 Q 125 35 132 25" fill="none" stroke="#F5A800" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* 4 corners: small green bo-leaf ellipses */}
                    <ellipse cx="87" cy="18" rx="4" ry="6" fill="#1B7A3E" />
                    <ellipse cx="223" cy="18" rx="4" ry="6" fill="#1B7A3E" />
                    <ellipse cx="87" cy="62" rx="4" ry="6" fill="#1B7A3E" />
                    <ellipse cx="223" cy="62" rx="4" ry="6" fill="#1B7A3E" />
                  </svg>
                </g>
              </g>
            </svg>
          </div>

        </div>

        {/* SLOGANS ROW */}
        <div className="flex flex-col items-center gap-2 mt-[36px]">
          {/* STEP 4 — FIRST SLOGAN */}
          <div className="slogan-left-anim">Our Pride Our AKP</div>
          
          {/* STEP 5 — SECOND SLOGAN */}
          <div className="slogan-right-anim">Naange Irukkom Ongelukku</div>
        </div>

        {/* STEP 6 — BOTTOM TAGLINE */}
        <div className="tagline-anim">Experience the real fast in Zippi</div>

      </div>

      {/* AUTO REDIRECT LOADING INDICATOR (starts at 3.0s) */}
      <div className="loader-container-anim">
        <div className="dot-pulse"></div>
        <div className="dot-pulse" style={{ animationDelay: '0.15s' }}></div>
        <div className="dot-pulse" style={{ animationDelay: '0.30s' }}></div>
      </div>
    </div>
  );
}
