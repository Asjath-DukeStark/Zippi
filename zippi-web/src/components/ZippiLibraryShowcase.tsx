/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  ZippiHeader, 
  ZippiSearchBar, 
  ZippiBottomNav, 
  ZippiProductCardGrocery, 
  ZippiCategoryCard, 
  ZippiAppSwitcherTile, 
  ZippiFilterChip, 
  ZippiSectionHeader, 
  ZippiCashbackChip, 
  ZippiBlueActionButton, 
  ZippiYellowActionButton, 
  ZippiStepper 
} from './ZippiLibrary';

interface ZippiLibraryShowcaseProps {
  onClose: () => void;
}

export default function ZippiLibraryShowcase({ onClose }: ZippiLibraryShowcaseProps) {
  // --- 1. Header Props States ---
  const [headerIsHome, setHeaderIsHome] = useState(true);
  const [headerCartCount, setHeaderCartCount] = useState(3);

  // --- 2. Search Props States ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- 3. Bottom Nav Props States ---
  const [bottomNavTab, setBottomNavTab] = useState<'home' | 'categories' | 'deals' | 'account' | 'cart'>('home');

  // --- 4. Product Card States ---
  const [productQty, setProductQty] = useState(0);

  // --- 5. App Switcher States ---
  const [activeSwitcher, setActiveSwitcher] = useState('grocery');

  // --- 6. Filter Chips States ---
  const [chip1Active, setChip1Active] = useState(true);
  const [chip2Active, setChip2Active] = useState(false);
  const [chip3Active, setChip3Active] = useState(false);

  // --- 7. Primary Action Button (Blue) ---
  const [isBlueLoading, setIsBlueLoading] = useState(false);

  // --- 8. Standalone Stepper State ---
  const [stepperQty, setStepperQty] = useState(1);

  // Trigger simulate loader on blue action button
  const triggerBlueLoader = () => {
    setIsBlueLoading(true);
    setTimeout(() => {
      setIsBlueLoading(false);
      alert('Primary Action Complete! Simulated callback completed successfully.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 select-none overflow-y-auto" id="zippi-library-modal-overlay">
      <div className="bg-white w-full max-w-2xl h-[92vh] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-150 animate-scale-up" id="zippi-showcase-panel">
        
        {/* DESIGN SYSTEM MODAL HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 to-zinc-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5C518] text-[#1A1A1A] flex items-center justify-center font-black text-lg shadow-sm">
              Z
            </div>
            <div className="text-left">
              <h2 className="font-extrabold text-[15.5px] tracking-tight flex items-center gap-1.5">
                <span>Zippi Component Library</span>
                <span className="bg-blue-600 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded">v1.0.4 SPEC</span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-medium">100% compliant with white/light theme requirements</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="Close Showcase"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPONENT STREAM (SCROLLABLE VIEWPORT) */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-8" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Welcome disclaimer block */}
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex gap-3 text-left">
            <Sparkles className="w-5 h-5 text-amber-605 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-[#1a1a1a] text-xs uppercase tracking-wide">Zippi Design Guide Rules</h4>
              <p className="text-[11px] text-amber-900 leading-normal mt-1 font-medium font-sans">
                These elements are designed strictly with high contrast text, white or light gray foundations, vibrant Zippi yellow accents (<code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">#F5C518</code>), and royal brand blue accents (<code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">#1565C0</code>) for critical triggers.
              </p>
            </div>
          </div>

          {/* GRID OF 12 COMPONENTS */}
          <div className="space-y-8">
            
            {/* 1. HEADER COMPONENT */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">01. Dynamic Header Component</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Props: showBack, title, isHome, cartCount</span>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-lg mb-2">
                <label className="text-[10.5px] font-bold text-gray-600 flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={headerIsHome} 
                    onChange={(e) => setHeaderIsHome(e.target.checked)} 
                    className="rounded text-[#1565C0]" 
                  />
                  <span>Toggle Home Style (Yellow Accents)</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-bold text-gray-600">Simulate Cart Count:</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={headerCartCount} 
                    onChange={(e) => setHeaderCartCount(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-12 p-0.5 text-center text-xs font-black border border-gray-200 rounded" 
                  />
                </div>
              </div>

              {/* LIVE DEMO RENDERING */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                <ZippiHeader 
                  showBack={!headerIsHome}
                  title="Track Order"
                  isHome={headerIsHome}
                  showSearch={true}
                  showCart={true}
                  cartCount={headerCartCount}
                  addressLabel="My Penthouse Office"
                  addressDetails="World Trade Center West, Colombo"
                  onBack={() => alert('Back arrow trigger callback.')}
                  onAddressClick={() => alert('Address dropdown click callback.')}
                  onCartClick={() => alert('Cart basket icon click callback.')}
                />
              </div>
            </section>

            {/* 2. SEARCH BAR COMPONENT */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">02. Search Bar Component</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Pill shape, blue ring focus, 44px height</span>
              </div>

              <div className="space-y-2">
                <ZippiSearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onCameraClick={() => alert('Simulated OCR Camera Scan Initiated 📸')}
                  placeholder="Ask for high-quality groceries..."
                />
                
                {searchQuery && (
                  <p className="text-[10.5px] text-[#1565C0] font-black bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-sans">
                    💡 Live Input: &quot;{searchQuery}&quot; (Filters matched dynamically)
                  </p>
                )}
              </div>
            </section>

            {/* 3. BOTTOM NAV COMPONENT */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">03. Bottom Navigation Component</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Props: activeTab, cartCount (5 tabs, indicators)</span>
              </div>

              <p className="text-[10.5px] text-gray-500 font-semibold mb-2">
                Interactive: Click on any navigation item below to toggling tabs. Observe the active <b className="text-[#1565C0]">3px blue top bar</b>.
              </p>

              {/* LIVE DEMO RENDERING */}
              <div className="border border-gray-250 rounded-lg overflow-hidden shadow-2xs">
                <div className="h-8 bg-gray-50 text-center flex items-center justify-center border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Client View: {bottomNavTab}</span>
                </div>
                
                <ZippiBottomNav 
                  activeTab={bottomNavTab}
                  onTabChange={setBottomNavTab}
                  cartCount={headerCartCount}
                />
              </div>
            </section>

            {/* 4. PRODUCT CARD — GROCERY */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">04. Grocery Product Card</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">12px radius, Express tag, Red sale pill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ZippiProductCardGrocery 
                  image="https://images.unsplash.com/photo-1528825871115-3581a5387919?w=150&auto=format&fit=crop&q=80"
                  name="Fresh Sourced Cavendish Bananas (Sri Lanka)"
                  weight="1 kg pack"
                  price={420}
                  originalPrice={580}
                  discount="-27%"
                  isFastDelivery={true}
                  qty={productQty}
                  onAdd={() => setProductQty((p) => p + 1)}
                  onRemove={() => setProductQty((p) => Math.max(0, p - 1))}
                  onViewDetails={() => alert('View banana specs detail modal popup.')}
                />

                <div className="flex flex-col justify-center space-y-2 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  <h5 className="font-extrabold text-[12px] text-brand-charcoal">Reactive Card Specs:</h5>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    Cart quantity counter: <span className="font-mono bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded">{productQty}</span>
                  </p>
                  <p className="text-[10.5px] text-gray-400 leading-normal">
                    The card displays a customizable yellow add button that seamlessly swaps to a robust, user-friendly stepper with trash capability at index 1.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. CATEGORY CARD */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">05. Sourcing Category Card</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Light bg, image + label, Optional sale badge</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <ZippiCategoryCard 
                  image="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150&auto=format&fit=crop&q=80"
                  name="Veggies"
                  hasSale={true}
                  onClick={() => alert('Veggies category clicked.')}
                />
                <ZippiCategoryCard 
                  image="https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=150&auto=format&fit=crop&q=80"
                  name="Dairy & Eggs"
                  onClick={() => alert('Dairy clicked.')}
                />
                <ZippiCategoryCard 
                  image="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=80"
                  name="Beverages"
                  onClick={() => alert('Beverages clicked.')}
                />
                <ZippiCategoryCard 
                  image="https://images.unsplash.com/photo-1511125341079-05a909dd6802?w=150&auto=format&fit=crop&q=80"
                  name="Snacks 🍿"
                  onClick={() => alert('SnacksClicked.')}
                />
              </div>
            </section>

            {/* 6. APP SWITCHER TILE */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">06. App Switcher Tiles</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">80x80px size, 16px radius, Yellow active bg</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <ZippiAppSwitcherTile 
                  icon="🥦"
                  label="Zippi Mart"
                  isActive={activeSwitcher === 'grocery'}
                  onClick={() => setActiveSwitcher('grocery')}
                />
                <ZippiAppSwitcherTile 
                  icon="🍔"
                  label="Zippi Food"
                  isActive={activeSwitcher === 'food'}
                  onClick={() => setActiveSwitcher('food')}
                />
                <ZippiAppSwitcherTile 
                  icon="🛵"
                  label="Zippi Ride"
                  isActive={activeSwitcher === 'ride'}
                  onClick={() => setActiveSwitcher('ride')}
                />
                <ZippiAppSwitcherTile 
                  icon="📦"
                  label="Zippi Send"
                  isActive={activeSwitcher === 'send'}
                  onClick={() => setActiveSwitcher('send')}
                />
              </div>
            </section>

            {/* 7. FILTER CHIP */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">07. Pill Filter Chips</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Yellow active state, dropdown icon support</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <ZippiFilterChip 
                  label="Fastest ⚡"
                  isActive={chip1Active}
                  onClick={() => setChip1Active(!chip1Active)}
                />
                <ZippiFilterChip 
                  label="Brands Sourced"
                  isActive={chip2Active}
                  hasDropdown={true}
                  onClick={() => setChip2Active(!chip2Active)}
                />
                <ZippiFilterChip 
                  label="Organic Certified"
                  isActive={chip3Active}
                  onClick={() => setChip3Active(!chip3Active)}
                />
              </div>
            </section>

            {/* 8. SECTION HEADER */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">08. Section Divider Header</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">18px bold layout with View All → tag</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <ZippiSectionHeader 
                  title="Flash Deals of Sri Lanka"
                  viewAllLink="/deals"
                  onViewAllClick={() => alert('Router callback triggered for View All.')}
                />
              </div>
            </section>

            {/* 9. CASHBACK CHIP */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">09. Cashback Chip Capsule</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Dashed yellow borders, soft yellow background</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <ZippiCashbackChip label="LKR 150 Cashback" />
                <ZippiCashbackChip label="Double Points" />
                <ZippiCashbackChip label="Zippi VIP Save" />
              </div>
            </section>

            {/* 10. ACTION BUTTONS (PRIMARY BLUE & SECONDARY YELLOW CTAs) */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-4.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">10 &amp; 11. Action Button Pairings</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Props: label, Loading triggers, color guidelines</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* BLUE PRIMARY BUTTON */}
                <div className="space-y-2 text-left">
                  <h5 className="font-extrabold text-[12px] text-gray-600">Blue Action button (Primary CTA - #1565C0)</h5>
                  <ZippiBlueActionButton 
                    label="Place Order Now" 
                    onClick={triggerBlueLoader}
                    isLoading={isBlueLoading}
                  />
                  <span className="text-[10px] text-gray-400 block">Height: 52px, Pill radius.</span>
                </div>

                {/* YELLOW SECONDARY BUTTON */}
                <div className="space-y-2 text-left">
                  <h5 className="font-extrabold text-[12px] text-gray-600">Yellow Action Button (Secondary CTA - #F5C518)</h5>
                  <ZippiYellowActionButton 
                    label="Add to Sourcing Cart" 
                    onClick={() => alert('Secondary Action Button callback successful.')}
                  />
                  <span className="text-[10px] text-gray-400 block">Color code: #F5C518, High-contrast text.</span>
                </div>

              </div>
            </section>

            {/* 12. COMPACT STEPPER [🗑️][QTY][+] */}
            <section className="bg-white p-4.5 rounded-xl border border-gray-200 text-left space-y-3 shadow-3xs font-sans">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black text-[#1565C0] tracking-wider uppercase">12. Zippi Custom Stepper</span>
                <span className="text-[10px] text-gray-400 font-medium font-mono">Replaces minus icon with trash-can at qty: 1</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="max-w-[170px]">
                  <ZippiStepper 
                    qty={stepperQty}
                    onAdd={() => setStepperQty((c) => c + 1)}
                    onRemove={() => setStepperQty((c) => Math.max(0, c - 1))}
                  />
                </div>

                <div className="text-left bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs font-semibold">
                  {stepperQty === 0 ? (
                    <span className="text-rose-600 font-black">Quantity reached 0. Reflected as empty card.</span>
                  ) : (
                    <span className="text-emerald-700 font-black">Quantity is packed: {stepperQty} items.</span>
                  )}
                  {stepperQty === 1 && (
                    <p className="text-[10.5px] text-gray-400 font-normal mt-1 leading-snug">
                      Notice: Trashbin icon replaces minus sign for precise cart scrubbing triggers.
                    </p>
                  )}
                </div>
              </div>
            </section>

          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-gray-100 border-t border-gray-200 px-5 py-3.5 flex items-center justify-between font-sans shrink-0">
          <span className="text-[10.5px] text-gray-500 font-black tracking-tight flex items-center gap-1.5 font-mono select-none">
            🟢 BUILD STABLE (All tests compiled green)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-charcoal text-white hover:bg-neutral-800 text-[11px] font-black uppercase rounded-lg shadow-3xs cursor-pointer select-none transition-colors"
          >
            Close Spec
          </button>
        </div>

      </div>
    </div>
  );
}
