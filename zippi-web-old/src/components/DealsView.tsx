/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data';
import ProductCard from './ProductCard';
import FilterBottomSheet from './FilterBottomSheet';
import { ZippiCategoryImage } from './ZippiProductImage';

const DEALS_OPTIONS = [
  "Grand Lifestyle Sale",
  "Mega Deal 📣",
  "Eid Deal 🌙",
  "Deal"
];

const BRANDS_OPTIONS = [
  "Sebamed",
  "Aveeno",
  "Cool & Cool",
  "HUGGIES",
  "Pampers",
  "BabyJoy",
  "Mustela",
  "Rubies",
  "Generic",
  "Sage Square",
  "Kotmale",
  "Pelwatte",
  "Araliya",
  "Dilmah",
  "Harischandra"
];

interface DealsViewProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveOne: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenCart: () => void;
  setBrowsingCategory: (catId: string | null) => void;
  products?: Product[];
}

const LOCAL_BRANDS = ['All', 'Kotmale', 'Pelwatte', 'Araliya', 'Dilmah'];

const SHORTCUT_CATEGORIES = [
  { id: 'grocery', name: 'Grocery', emoji: '🍎', image: '/category-veggies.png', active: true, desc: 'Shop Deals' },
  { id: 'mobiles', name: 'Mobiles', emoji: '📱', image: '/category-mobiles.png', active: false, desc: 'Coming Soon' },
  { id: 'beauty', name: 'Beauty', emoji: '💅', image: '/category-beauty.png', active: false, desc: 'Coming Soon' },
  { id: 'womens', name: "Women's", emoji: '👗', image: '/category-womens.png', active: false, desc: 'Coming Soon' }
];

export default function DealsView({
  cart,
  onAddToCart,
  onRemoveOne,
  onViewDetails,
  wishlist,
  onToggleWishlist,
  onOpenCart,
  setBrowsingCategory,
  products,
}: DealsViewProps) {
  // Filters State
  const [dealSearchQuery, setDealSearchQuery] = useState('');
  const [fastDeliveryFilter, setFastDeliveryFilter] = useState(false);
  const [dealsFilterType, setDealsFilterType] = useState<'all' | 'high' | 'super'>('all');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Sorting State
  const [dealsSortBy, setDealsSortBy] = useState<'discount-desc' | 'price-asc' | 'price-desc' | 'rating'>('discount-desc');

  // Dropdown / sheet UI states
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isDealsDropdownOpen, setIsDealsDropdownOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New bottom sheet filter states to support advanced selections
  const [activeFilterSheet, setActiveFilterSheet] = useState<'deals' | 'brand' | null>(null);
  const [selectedDealsList, setSelectedDealsList] = useState<string[]>(['All']);
  const [selectedBrandsList, setSelectedBrandsList] = useState<string[]>(['All']);

  // Trigger Toast function
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Derive products on sale (i.e. those with discountPercent or onSale indicator)
  const dealsProductsRaw = useMemo(() => {
    const allProducts = products || PRODUCTS;
    return allProducts.filter(p => p.discountPercent && p.discountPercent > 0);
  }, [products]);

  // Filter and Sort execution
  const filteredAndSortedDeals = useMemo(() => {
    let items = [...dealsProductsRaw];

    // 1. Search Query filtering
    if (dealSearchQuery.trim()) {
      const q = dealSearchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // 2. Fast Delivery (lightning badge / popular items)
    if (fastDeliveryFilter) {
      items = items.filter(p => p.popular);
    }

    // 3. Deals specific tiers
    if (selectedDealsList && !selectedDealsList.includes('All') && selectedDealsList.length > 0) {
      items = items.filter(p => {
        return selectedDealsList.some(dealType => {
          if (dealType === 'Grand Lifestyle Sale') return p.originalPrice ? (p.originalPrice - p.price >= 150) : false;
          if (dealType === 'Mega Deal 📣') return p.discountPercent ? (p.discountPercent >= 15) : false;
          if (dealType === 'Eid Deal 🌙') return p.discountPercent ? (p.discountPercent >= 20) : false;
          if (dealType === 'Deal') return p.discountPercent ? (p.discountPercent > 0) : false;
          return false;
        });
      });
    } else {
      if (dealsFilterType === 'high') {
        items = items.filter(p => p.discountPercent && p.discountPercent >= 15);
      } else if (dealsFilterType === 'super') {
        items = items.filter(p => p.discountPercent && p.discountPercent >= 20);
      }
    }

    // 4. Brand Filtering
    if (selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0) {
      items = items.filter(p => {
        return selectedBrandsList.some(brand => 
          p.name.toLowerCase().includes(brand.toLowerCase())
        );
      });
    } else if (selectedBrand !== 'All') {
      items = items.filter(p => p.name.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    // 5. Sorted results
    if (dealsSortBy === 'discount-desc') {
      items.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (dealsSortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (dealsSortBy === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (dealsSortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  }, [dealsProductsRaw, dealSearchQuery, fastDeliveryFilter, dealsFilterType, selectedBrand, dealsSortBy, selectedDealsList, selectedBrandsList]);

  const cartTotalQty = useMemo(() => {
    return cart.reduce((acc, i) => acc + i.quantity, 0);
  }, [cart]);

  return (
    <div className="flex-grow flex flex-col bg-white overflow-hidden relative select-none" id="deals-viewport-container">
      
      {/* ── SEARCH BAR (Fixed top of deals view) ── */}
      <div className="px-4 py-3 bg-white border-b border-gray-150 flex items-center gap-3 sticky top-0 z-30" id="deals-top-search-bar">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search all active grocery deals..."
            value={dealSearchQuery}
            onChange={(e) => setDealSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F5] text-xs font-semibold pl-9 pr-8 py-2 rounded-xl border border-transparent placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
            id="deals-search-input"
          />
          {dealSearchQuery && (
            <button
              onClick={() => setDealSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mini Shopping Bag drawer shortcut if items exist */}
        {cartTotalQty > 0 && (
          <button 
            onClick={onOpenCart}
            className="p-1.5 bg-yellow-50 border border-yellow-200 text-[#1A1A1A] rounded-full relative cursor-pointer active:scale-95 transition-all"
            title="Open Basket"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
              {cartTotalQty}
            </span>
          </button>
        )}
      </div>

      {/* ── FILTER CHIPS RAIL ── */}
      <div className="px-4 pt-3.5 pb-4 bg-white border-b border-gray-100 flex items-center gap-2.5 overflow-x-auto scrollbar-none sticky top-[48px] z-20" id="deals-filter-rail">
        
        {/* Fast Delivery chip toggler */}
        <button
          onClick={() => setFastDeliveryFilter(prev => !prev)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shrink-0 border select-none ${
            fastDeliveryFilter 
              ? 'bg-[#FFF9C4] border-[#F5C518] text-[#827717] font-black' 
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="deals-filter-fast-delivery"
        >
          <span>⚡ Fast Delivery</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Deals discount strength selector */}
        <button
          onClick={() => {
            setActiveFilterSheet('deals');
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border shrink-0 select-none ${
            (selectedDealsList && selectedDealsList.length > 0 && !selectedDealsList.includes('All')) || dealsFilterType !== 'all' 
              ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold' 
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="deals-discount-level-filter"
        >
          <span>🏷️ Deals {selectedDealsList && !selectedDealsList.includes('All') && selectedDealsList.length > 0 ? `(${selectedDealsList.length})` : dealsFilterType !== 'all' ? `: ${dealsFilterType === 'high' ? '15%+' : '20%+'}` : ''}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Brand Selector */}
        <button
          onClick={() => {
            setActiveFilterSheet('brand');
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border shrink-0 select-none ${
            (selectedBrandsList && selectedBrandsList.length > 0 && !selectedBrandsList.includes('All')) || selectedBrand !== 'All' 
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold' 
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="deals-brand-filter"
        >
          <span>🏢 Brand {selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0 ? `(${selectedBrandsList.length})` : selectedBrand !== 'All' ? `: ${selectedBrand}` : ''}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

      </div>

      {/* ── SCROLL FEED AREA ── */}
      <div className="flex-grow overflow-y-auto space-y-4 p-4 pb-24 bg-gray-50/50" id="deals-scrolling-content-feed">
        
        {/* ── PROMOTIONAL BANNERS: 2 stacked full-width banner cards ── */}
        <div className="space-y-3" id="deals-promotional-banners-stack">
          
          {/* Banner 1: Green bg — 'GROCERY SAVER WEEK · Up to 70% off' */}
          <div 
            className="rounded-2xl overflow-hidden shadow-md flex items-center justify-between relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4.5 min-h-[140px]"
            id="saver-week-banner"
          >
            {/* Left Portion of Banner 1 */}
            <div className="space-y-2 max-w-[55%] z-10 select-none">
              <span className="bg-emerald-900/50 text-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Limited Time Offer
              </span>
              <h2 className="text-[17px] font-black leading-tight tracking-tight text-white uppercase font-sans">
                GROCERY SAVER WEEK
              </h2>
              <p className="text-[11px] text-teal-100 font-bold leading-normal">
                Enjoy massive price cuts & get up to 70% off agricultural imports!
              </p>

              {/* Dashed promo codes on left */}
              <div className="flex gap-1.5 pt-1">
                <span className="bg-emerald-800/60 border border-dashed border-teal-300 text-teal-100 text-[9px] font-extrabold px-2 py-1 rounded">
                  Code: GROC70
                </span>
                <span className="bg-emerald-805/65 border border-dashed border-teal-300 text-teal-100 text-[9px] font-extrabold px-2 py-1 rounded">
                  Code: ZIP20
                </span>
              </div>
            </div>

            {/* Right Portion: Cool decorative elements/product images */}
            <div className="absolute right-2 top-2 bottom-2 w-[40%] flex items-center justify-end overflow-hidden select-none pointer-events-none opacity-90">
              <ZippiCategoryImage 
                image="/category-veggies.png" 
                name="fresh veggies" 
                id="veggies"
                imageClassName="w-[90%] h-full object-cover rounded-xl shadow-md rotate-2 scale-105"
                emojiClassName="text-3xl"
              />
            </div>
          </div>

          {/* Banner 2: Ad banner (brand promotion) */}
          <div 
            onClick={() => {
              setSelectedBrand('Pelwatte');
              triggerToast("🏢 Filtering deals for premium Pelwatte local dairy products!");
            }}
            className="rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-[#FFFDE7] to-[#FFF9C4] border border-[#F5C518]/40 p-4.5 flex items-center justify-between relative min-h-[100px] cursor-pointer hover:border-[#F5C518] transition-all"
            id="brand-ad-promo-banner"
          >
            {/* Left content describing the deal */}
            <div className="space-y-1 max-w-[65%] z-10">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#FFE082] text-[#827717] text-[8.5px] font-black px-1.5 py-0.5 rounded">AD BRAND SPOTLIGHT</span>
                <span className="text-[10px] text-amber-800 font-extrabold">Pelwatte Sri Lanka</span>
              </div>
              <h3 className="text-sm font-black text-brand-charcoal uppercase tracking-wider">
                PURE Dairy Sensation 🥛
              </h3>
              <p className="text-[11px] text-gray-500 leading-snug">
                Buy any 2 Pelwatte pasteurized salted butter bricks to win LKR 300 discount direct on checkout!
              </p>
            </div>

            {/* Right side representation details */}
            <div className="w-[30%] h-14 flex items-center justify-center p-1 bg-white/70 backdrop-blur-xs rounded-xl shadow-xs border border-amber-250">
              <ZippiCategoryImage 
                image="/category-dairy.png" 
                name="Pelwatte milk"
                id="dairy"
                imageClassName="max-h-12 max-w-full object-contain"
                emojiClassName="text-2xl"
              />
            </div>
          </div>

        </div>

        {/* ── CATEGORY SHORTCUTS (4-column horizontal scroll) ── */}
        <div className="space-y-2.5" id="shortcuts-rail">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Quick Shortcuts</span>
            <span className="text-[10px] text-brand-blue font-bold tracking-tight">Scroll for options ➔</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none" id="shortcuts-cards-scroll">
            {SHORTCUT_CATEGORIES.map((sc) => (
              <div
                key={sc.id}
                onClick={() => {
                  if (sc.active) {
                    setBrowsingCategory('grocery'); // navigate to grocery
                  } else {
                    triggerToast(`📦 ${sc.name} deals are coming soon! Stay tuned.`);
                  }
                }}
                className={`relative rounded-2xl flex flex-col justify-between p-3 shrink-0 h-[120px] w-[95px] border transition-all ${
                  sc.active 
                    ? 'bg-white border-[#F5C518] shadow-xs active:scale-95 cursor-pointer hover:border-yellow-400' 
                    : 'bg-gray-100/55 border-gray-150 opacity-65 cursor-not-allowed select-none'
                }`}
                id={`deals-shortcut-${sc.id}`}
              >
                {/* Coming soon sticker */}
                {!sc.active && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[7.5px] font-black px-1 py-0.5 rounded uppercase tracking-widest leading-none shadow-xs text-center scale-90 whitespace-nowrap">
                    Soon
                  </span>
                )}

                {/* Main image representing category */}
                <div className="w-full h-[60%] flex items-center justify-center overflow-hidden">
                  <ZippiCategoryImage
                    image={sc.image}
                    name={sc.name}
                    id={sc.id}
                    imageClassName={`max-h-12 max-w-full object-contain rounded-lg ${sc.active ? '' : 'grayscale opacity-60'}`}
                    emojiClassName="text-2xl"
                  />
                </div>

                <div className="text-center mt-1">
                  <p className="text-[11.5px] font-bold text-brand-charcoal leading-none">{sc.name}</p>
                  <p className={`text-[8.5px] mt-0.5 font-bold ${sc.active ? 'text-brand-blue' : 'text-gray-400'}`}>
                    {sc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRODUCT GRID (2 columns) ── */}
        <div className="space-y-3" id="deals-grid-segment">
          
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs text-brand-charcoal font-black uppercase tracking-wider flex items-center gap-1">
              <span>Mega Price Cuts</span>
              <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                {filteredAndSortedDeals.length} Items Locked
              </span>
            </h3>

            {/* Clear Filters Indicator */}
            {(selectedBrand !== 'All' || dealsFilterType !== 'all' || fastDeliveryFilter || dealSearchQuery) && (
              <button
                onClick={() => {
                  setSelectedBrand('All');
                  setDealsFilterType('all');
                  setFastDeliveryFilter(false);
                  setDealSearchQuery('');
                  setDealsSortBy('discount-desc');
                }}
                className="text-[10px] text-red-500 font-extrabold border-b border-dashed border-red-500 hover:text-red-700 uppercase"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredAndSortedDeals.length === 0 ? (
            /* Empty Sourcing deals placeholder */
            <div className="py-12 bg-white rounded-2xl border border-gray-150 text-center p-6 flex flex-col items-center">
              <span className="text-3xl">🏜️</span>
              <h4 className="text-xs font-bold text-[#1A1A1A] mt-2">No matching deals found</h4>
              <p className="text-[11px] text-gray-400 max-w-[210px] mx-auto mt-1 leading-snug">
                Try widening your budget, typing different keywords, or selecting another distributor brand.
              </p>
            </div>
          ) : (
            /* Main 2-column grid */
            <div className="grid grid-cols-2 gap-3" id="deals-catalog-grid">
              {filteredAndSortedDeals.map((product) => {
                const qty = cart.find(i => i.product.id === product.id)?.quantity || 0;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQty={qty}
                    onAddToCart={() => onAddToCart(product)}
                    onRemoveOne={() => onRemoveOne(product)}
                    onViewDetails={() => onViewDetails(product)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={() => onToggleWishlist(product.id)}
                  />
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* ── SORT + FILTER FLOATING BOTTOM ACTION PILL ── */}
      <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-center pointer-events-none z-35" id="deals-bottom-floating-control">
        <button
          onClick={() => setIsSortOpen(true)}
          className="pointer-events-auto bg-[#1A1A1A] hover:bg-[#2B2B2B] active:scale-95 transition-all text-white text-xs font-black py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 select-none tracking-wide cursor-pointer"
          id="deals-floating-sort-btn"
        >
          <span>Sort ↑↓ &amp; Filter ▽</span>
        </button>
      </div>

      {/* ── SORT SHEET BOTTOM DRAWER OVERLAY ── */}
      {isSortOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs flex justify-center items-end z-50 p-0" id="deals-sort-panel-overlay">
          {/* Main sheets */}
          <div className="bg-white w-full max-w-[430px] rounded-t-2xl shadow-2xl overflow-hidden p-4 space-y-4 animate-slide-up select-none">
            
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-150">
              <span className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">⚡ Sort & Arrange Grocery Deals</span>
              <button 
                onClick={() => setIsSortOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-650 rounded-full hover:bg-gray-100"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Selection row options */}
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setDealsSortBy('discount-desc');
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  dealsSortBy === 'discount-desc' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Discount Size: High to Low</span>
                {dealsSortBy === 'discount-desc' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setDealsSortBy('price-asc');
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  dealsSortBy === 'price-asc' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Price: Low to High</span>
                {dealsSortBy === 'price-asc' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setDealsSortBy('price-desc');
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  dealsSortBy === 'price-desc' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Price: High to Low</span>
                {dealsSortBy === 'price-desc' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setDealsSortBy('rating');
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  dealsSortBy === 'rating' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Customer Rating</span>
                {dealsSortBy === 'rating' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>
            </div>

            {/* Footer buttons within sort panel */}
            <div className="flex gap-2.5 pt-1.5">
              <button
                onClick={() => {
                  setSelectedBrand('All');
                  setDealsFilterType('all');
                  setFastDeliveryFilter(false);
                  setDealSearchQuery('');
                  setDealsSortBy('discount-desc');
                  setIsSortOpen(false);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsSortOpen(false)}
                className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#2B2B2B] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#1A1A1A]"
              >
                Apply Deals Sorted
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── TOAST MESSAGE FLOATER ── */}
      {toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/95 text-white text-[11px] font-bold py-2.5 px-4 rounded-full shadow-2xl z-50 flex items-center gap-1.5 border border-white/10 animate-fade-in pointer-events-none whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bottom Sheet for Deals */}
      <FilterBottomSheet
        isOpen={activeFilterSheet === 'deals'}
        onClose={() => setActiveFilterSheet(null)}
        title="Deals"
        options={DEALS_OPTIONS}
        initialSelected={selectedDealsList}
        onApply={(selected) => setSelectedDealsList(selected)}
        onClear={() => {
          setSelectedDealsList(['All']);
          setDealsFilterType('all');
        }}
      />

      {/* Filter Bottom Sheet for Brand */}
      <FilterBottomSheet
        isOpen={activeFilterSheet === 'brand'}
        onClose={() => setActiveFilterSheet(null)}
        title="Brand"
        options={BRANDS_OPTIONS}
        initialSelected={selectedBrandsList}
        onApply={(selected) => setSelectedBrandsList(selected)}
        onClear={() => {
          setSelectedBrandsList(['All']);
          setSelectedBrand('All');
        }}
      />

    </div>
  );
}
