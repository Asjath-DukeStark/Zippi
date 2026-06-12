/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, ShoppingBag, Share2, Plus, Minus, Trash2, X, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../types';
import { PRODUCTS, CATEGORIES } from '../data';
import ProductCard from './ProductCard';
import FilterBottomSheet from './FilterBottomSheet';

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

interface ProductListingViewProps {
  browsingCategory: string;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveOne: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenCart: () => void;
  products?: Product[];
}

const LOCAL_BRANDS = ['All', 'Kotmale', 'Pelwatte', 'Araliya', 'Dilmah', 'Harischandra'];

export default function ProductListingView({
  browsingCategory,
  onClose,
  cart,
  onAddToCart,
  onRemoveOne,
  onViewDetails,
  wishlist,
  onToggleWishlist,
  onOpenCart,
  products,
}: ProductListingViewProps) {
  // Filters State
  const [browseFastDelivery, setBrowseFastDelivery] = useState(true); // Default active (yellow)
  const [browseDealsOnly, setBrowseDealsOnly] = useState(false);
  const [browseBrand, setBrowseBrand] = useState('All');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // New bottom sheet filter states to support advanced selections
  const [activeFilterSheet, setActiveFilterSheet] = useState<'deals' | 'brand' | 'price' | null>(null);
  const [selectedDealsList, setSelectedDealsList] = useState<string[]>(['All']);
  const [selectedBrandsList, setSelectedBrandsList] = useState<string[]>(['All']);
  
  // Custom price filter threshold
  const [browseMaxPrice, setBrowseMaxPrice] = useState<number>(3000);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Sorting State
  const [browseSortBy, setBrowseSortBy] = useState<'none' | 'price-asc' | 'price-desc' | 'rating'>('none');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Search inside category
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [listingSearchQuery, setListingSearchQuery] = useState('');

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);

  // Success Toast Banner
  const [toastText, setToastText] = useState<string | null>(null);

  // Subcategory Selection State
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  // Check if browsingCategory is actually a subcategory and map back to parent if needed
  const categoryRoutingInfo = useMemo(() => {
    const matched = CATEGORIES.find(c => c.id === browsingCategory);
    const parentId = matched?.parentSlug || matched?.parent_slug;
    if (parentId) {
      return {
        parentId,
        subcategoryId: browsingCategory,
        isSubcategory: true
      };
    }
    return {
      parentId: browsingCategory,
      subcategoryId: 'all',
      isSubcategory: false
    };
  }, [browsingCategory]);

  // Update selectedSubcategory state when browsingCategory changes
  useEffect(() => {
    if (categoryRoutingInfo.isSubcategory) {
      setSelectedSubcategory(categoryRoutingInfo.subcategoryId);
    } else {
      setSelectedSubcategory('all');
    }
  }, [categoryRoutingInfo]);

  // Category identity meta
  const currentCategory = useMemo(() => {
    const parentId = categoryRoutingInfo.parentId;
    if (parentId === 'trending') {
      return {
        id: 'trending',
        name: 'Trending Now',
        icon: 'Flame'
      };
    }
    if (parentId === 'fresh') {
      return {
        id: 'fresh',
        name: 'Fresh Today',
        icon: 'Leaf'
      };
    }
    return CATEGORIES.find(c => c.id === parentId) || {
      id: parentId,
      name: 'Category',
      icon: 'Sparkles'
    };
  }, [categoryRoutingInfo.parentId]);

  // Find subcategories belonging to this parent category
  const subcategories = useMemo(() => {
    const parentId = categoryRoutingInfo.parentId;
    if (parentId === 'trending' || parentId === 'fresh') {
      return [];
    }
    return CATEGORIES.filter(c => c.parentSlug === parentId || c.parent_slug === parentId);
  }, [categoryRoutingInfo.parentId]);

  // Map category code to exact data products
  const categoryProductsRaw = useMemo(() => {
    const allProducts = products || PRODUCTS;
    const parentId = categoryRoutingInfo.parentId;
    
    if (parentId === 'trending') {
      return allProducts.filter(p => p.popular);
    }
    if (parentId === 'fresh') {
      return allProducts.filter(p => p.category === 'fruits-veggies' || p.category === 'dairy');
    }

    // Filter by specific subcategory if selected
    if (selectedSubcategory !== 'all') {
      return allProducts.filter(p => p.category === selectedSubcategory);
    }

    // Filter by main category (matches parentSlug)
    if (subcategories.length > 0) {
      const subSlugs = subcategories.map(s => s.id);
      return allProducts.filter(p => subSlugs.includes(p.category) || p.category === parentId);
    }

    // Direct match (if it is a flat category / leaf subcategory)
    return allProducts.filter(p => p.category === parentId);
  }, [categoryRoutingInfo.parentId, selectedSubcategory, subcategories, products]);

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let items = [...categoryProductsRaw];

    // 1. Text Search inside listing
    if (listingSearchQuery.trim()) {
      const q = listingSearchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // 2. Fast Delivery Filter (⚡ Express)
    if (browseFastDelivery) {
      items = items.filter(p => p.popular);
    }

    // 3. Deals Only Filter
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
    } else if (browseDealsOnly) {
      items = items.filter(p => p.discountPercent && p.discountPercent > 0);
    }

    // 4. Brand Filter
    if (selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0) {
      items = items.filter(p => {
        return selectedBrandsList.some(brand => 
          p.name.toLowerCase().includes(brand.toLowerCase())
        );
      });
    } else if (browseBrand !== 'All') {
      items = items.filter(p => p.name.toLowerCase().includes(browseBrand.toLowerCase()));
    }

    // 5. Price Limit Filter
    items = items.filter(p => p.price <= browseMaxPrice);

    // 6. Sorting Sort selection
    if (browseSortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (browseSortBy === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (browseSortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  }, [categoryProductsRaw, listingSearchQuery, browseFastDelivery, browseDealsOnly, browseBrand, browseMaxPrice, browseSortBy, selectedDealsList, selectedBrandsList]);

  // Pagination subset
  const visibleProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  // Cart counting
  const cartTotalQty = useMemo(() => {
    return cart.reduce((acc, i) => acc + i.quantity, 0);
  }, [cart]);

  // Trigger Toast function
  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText(null);
    }, 2800);
  };

  // Trigger link share simulation
  const handleShareCategory = () => {
    const shareUrl = `${window.location.origin}/share/category/${browsingCategory}`;
    // Fallback if writing fails or clipboard is empty
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast(`📋 Link copied! Share ${currentCategory.name} with friends.`);
    }).catch(() => {
      triggerToast(`📋 Link copied to your clipboard.`);
    });
  };

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-white relative" id="product-listing-screen">
      
      {/* ── HEADER (Back arrow, Title, Search Icon, Cart Icon) ── */}
      <div className="px-4 py-3 bg-white border-b border-gray-150 flex items-center justify-between sticky top-0 z-30 shadow-xs" id="listing-header">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
            id="back-to-previous-tab-btn"
          >
            <ArrowLeft className="w-5.5 h-5.5" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[17px] font-bold text-[#1A1A1A] tracking-tight truncate max-w-[200px]" id="listing-category-title">
            {currentCategory.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search trigger icon */}
          <button 
            onClick={() => setIsSearchVisible(prev => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${isSearchVisible ? 'bg-yellow-100 text-yellow-700 font-bold' : 'hover:bg-gray-100 text-gray-500'}`}
            id="toggle-listing-search-btn"
            title="Search within category"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Drawer trigger */}
          <button 
            onClick={onOpenCart}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer text-[#1A1A1A]"
            id="open-basket-drawer-btn"
            title="Basket"
          >
            <ShoppingBag className="w-5.5 h-5.5" />
            {cartTotalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cartTotalQty}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── COLLAPSIBLE SEARCH BAR ── */}
      {isSearchVisible && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-150 animate-slide-down flex items-center gap-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder={`Search in ${currentCategory.name}...`}
              value={listingSearchQuery}
              onChange={(e) => {
                setListingSearchQuery(e.target.value);
                setVisibleCount(20); // Reset page count on query change
              }}
              className="w-full bg-white text-xs font-semibold pl-8 pr-8 py-2 rounded-lg border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
              id="listing-search-input"
              autoFocus
            />
            {listingSearchQuery && (
              <button
                onClick={() => setListingSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => {
              setListingSearchQuery('');
              setIsSearchVisible(false);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── FILTER BAR (Scrollable Chips) ── */}
      <div className="px-4 pt-3.5 pb-4 bg-white border-b border-gray-100 flex items-center gap-2.5 overflow-x-auto scrollbar-none sticky top-[49px] z-20" id="listing-filter-scroll-rail">
        
        {/* Chip 1: ⚡ Fast Delivery */}
        <button
          onClick={() => {
            setBrowseFastDelivery(prev => !prev);
            setVisibleCount(20);
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shrink-0 select-none border ${
            browseFastDelivery 
              ? 'bg-[#FFF9C4] border-[#F5C518] text-[#827717] font-black' 
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="filter-fast-delivery-chip"
        >
          <span>⚡ Fast Delivery</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Chip 2: Deals */}
        <button
          onClick={() => {
            setActiveFilterSheet('deals');
            setVisibleCount(20);
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shrink-0 select-none border ${
            (selectedDealsList && selectedDealsList.length > 0 && !selectedDealsList.includes('All')) || browseDealsOnly
              ? 'bg-[#E1F5FE] border-sky-400 text-sky-700 font-bold'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="filter-deals-chip"
        >
          <span>🏷️ Deals {selectedDealsList && !selectedDealsList.includes('All') && selectedDealsList.length > 0 ? `(${selectedDealsList.length})` : ''}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Chip 3: Brand */}
        <button
          onClick={() => {
            setActiveFilterSheet('brand');
            setVisibleCount(20);
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shrink-0 select-none border ${
            (selectedBrandsList && selectedBrandsList.length > 0 && !selectedBrandsList.includes('All')) || browseBrand !== 'All'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="filter-brand-dropdown-chip"
        >
          <span>🏢 Brand {selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0 ? `(${selectedBrandsList.length})` : browseBrand !== 'All' ? `: ${browseBrand}` : ''}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Chip 4: Price Filter */}
        <button
          onClick={() => {
            setActiveFilterSheet('price');
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shrink-0 select-none border ${
            browseMaxPrice < 3000
              ? 'bg-purple-50 border-purple-400 text-purple-700 font-black'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          id="filter-price-limit-chip"
        >
          <span>💰 Max: LKR {browseMaxPrice}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

      </div>

      {/* ── MAIN SCROLL FEED ── */}
      <div className="flex-grow overflow-y-auto bg-gray-50/50 p-4 pb-20 select-none" id="listing-scroll-feed">
        
        {/* Subcategories Horizontal scroll bar */}
        {subcategories.length > 0 && (
          <div className="mb-4 -mx-4 px-4 pb-2 border-b border-gray-150 overflow-x-auto flex items-center gap-2 scrollbar-none" id="subcategories-horizontal-rail">
            <button
              onClick={() => {
                setSelectedSubcategory('all');
                setVisibleCount(20);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none border ${
                selectedSubcategory === 'all'
                  ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-xs active:scale-95'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95'
              }`}
            >
              All {currentCategory.name}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubcategory(sub.id);
                  setVisibleCount(20);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none border ${
                  selectedSubcategory === sub.id
                    ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-xs active:scale-95'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Summary total count */}
        <div className="text-[11.5px] text-gray-400 font-bold uppercase tracking-wide mb-3 flex items-center justify-between">
          <span>{filteredAndSortedProducts.length} Premium Products Found</span>
          {listingSearchQuery && <span className="text-brand-charcoal lowercase italic">Filtering for &quot;{listingSearchQuery}&quot;</span>}
        </div>

        {/* Empty state placeholder safety */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-4 bg-white rounded-2xl border border-gray-150 my-2 shadow-xs flex flex-col items-center">
            <span className="text-3xl">🥦</span>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#1A1A1A]">No matching items in stock</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-[210px] mx-auto">
                No organic or fast-express items found with your filtered criteria right now.
              </p>
            </div>
            <button
              onClick={() => {
                setBrowseFastDelivery(false);
                setBrowseDealsOnly(false);
                setBrowseBrand('All');
                setBrowseMaxPrice(3000);
                setListingSearchQuery('');
              }}
              className="px-4 py-2 bg-[#F5C518] text-[#1A1A1A] font-bold text-xs rounded-full cursor-pointer hover:bg-yellow-400 active:scale-95 transition-all shadow-xs"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          /* PRODUCT GRID — 2 columns */
          <div className="grid grid-cols-2 gap-3" id="listing-category-product-grid">
            {visibleProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cartQty={cart.find(i => i.product.id === p.id)?.quantity || 0}
                onAddToCart={() => onAddToCart(p)}
                onRemoveOne={() => onRemoveOne(p)}
                onViewDetails={() => onViewDetails(p)}
                isWishlisted={wishlist.includes(p.id)}
                onToggleWishlist={() => onToggleWishlist(p.id)}
              />
            ))}
          </div>
        )}

        {/* Load More Button - Products per page: 20, with load more */}
        {filteredAndSortedProducts.length > visibleCount && (
          <div className="mt-6 flex justify-center pb-4" id="load-more-container">
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="bg-white border border-gray-200 px-6 py-2.5 rounded-full text-xs font-extrabold text-brand-charcoal hover:border-[#F5C518] hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              id="load-more-listing-btn"
            >
              <span>Load more products</span>
              <span className="bg-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {filteredAndSortedProducts.length - visibleCount} left
              </span>
            </button>
          </div>
        )}

      </div>

      {/* ── SORT + FILTER BOTTOM BUTTON Pill + Share Button ── */}
      <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-center gap-3.5 pointer-events-none z-30" id="floating-spec-controls">
        {/* Float sort pill button */}
        <button
          onClick={() => setIsSortModalOpen(true)}
          className="pointer-events-auto bg-[#1A1A1A] hover:bg-[#2B2B2B] active:scale-95 transition-all text-white text-xs font-black py-3 px-6 rounded-full shadow-xl flex items-center gap-2 select-none tracking-wide cursor-pointer"
          id="sort-and-filter-floating-pill"
        >
          <span>Sort ↑↓ | Filter ▽</span>
        </button>

        {/* Circular Share button */}
        <button
          onClick={handleShareCategory}
          className="pointer-events-auto w-11 h-11 bg-white border border-gray-200 hover:border-[#F5C518] hover:bg-gray-50 active:scale-95 transition-all rounded-full flex items-center justify-center text-[#1A1A1A] shadow-lg cursor-pointer tooltip"
          title={`Share ${currentCategory.name}`}
          id="share-category-circle-btn"
        >
          <Share2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* ── SORT SHEET BOTTOM DRAWER OVERLAY ── */}
      {isSortModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs flex justify-center items-end z-50 p-0" id="sort-control-backdrop">
          {/* Main sheet panel */}
          <div className="bg-white w-full max-w-[430px] rounded-t-2xl shadow-2xl overflow-hidden p-4 space-y-4 animate-slide-up select-none">
            
            {/* Sheet Title */}
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-150">
              <span className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">⚡ Sort and Arrange Products</span>
              <button 
                onClick={() => setIsSortModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sort Items Grid */}
            <div className="space-y-1.5 text-xs">
              
              <button
                onClick={() => {
                  setBrowseSortBy('none');
                  setIsSortModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  browseSortBy === 'none' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Relevance Match</span>
                {browseSortBy === 'none' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setBrowseSortBy('price-asc');
                  setIsSortModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  browseSortBy === 'price-asc' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Price: Low to High</span>
                {browseSortBy === 'price-asc' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setBrowseSortBy('price-desc');
                  setIsSortModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  browseSortBy === 'price-desc' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Price: High to Low</span>
                {browseSortBy === 'price-desc' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

              <button
                onClick={() => {
                  setBrowseSortBy('rating');
                  setIsSortModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  browseSortBy === 'rating' 
                    ? 'border-[#F5C518] bg-[#FFFBEA] font-bold text-yellow-800' 
                    : 'border-gray-150 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>Customer Rating</span>
                {browseSortBy === 'rating' && <Check className="w-4 h-4 text-[#827717]" />}
              </button>

            </div>

            {/* Quick Actions Footer */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setBrowseFastDelivery(false);
                  setBrowseDealsOnly(false);
                  setBrowseBrand('All');
                  setBrowseMaxPrice(3000);
                  setBrowseSortBy('none');
                  setListingSearchQuery('');
                  setIsSortModalOpen(false);
                  setVisibleCount(20);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Clear all filters
              </button>
              <button
                onClick={() => setIsSortModalOpen(false)}
                className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#2B2B2B] py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                See Results
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── TOAST FLOATING ALERTS ── */}
      {toastText && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/95 text-white text-[11px] font-bold py-2.5 px-4 rounded-full shadow-2xl z-50 flex items-center gap-1.5 border border-white/10 animate-fade-in pointer-events-none whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
          <span>{toastText}</span>
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
          setBrowseDealsOnly(false);
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
          setBrowseBrand('All');
        }}
      />

      {/* Filter Bottom Sheet for Price */}
      {activeFilterSheet === 'price' && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end select-none font-sans" id="filter-bottom-sheet-price">
          {/* Backdrop tap to close */}
          <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setActiveFilterSheet(null)} />

          {/* Main bottom sheet panel wrapper */}
          <div className="bg-white rounded-t-[24px] flex flex-col relative px-5 pt-6 pb-5 w-full shadow-2xl animate-slide-up">
            
            {/* Absolute floating close button */}
            <button
              onClick={() => setActiveFilterSheet(null)}
              className="absolute -top-7 right-4 w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center rounded-full shadow-md border border-gray-150 transition-transform active:scale-95 cursor-pointer z-50"
              id="price-sheet-close-btn"
            >
              <X className="w-5 h-5 text-gray-500 stroke-[2.5]" />
            </button>

            {/* Title Header Section */}
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-[18px] font-extrabold text-[#1A1A1A] tracking-tight">Select Max Budget</h3>
              <button
                onClick={() => {
                  setBrowseMaxPrice(3000); // reset to default
                  setActiveFilterSheet(null);
                  setVisibleCount(20);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                id="price-sheet-clear-btn"
              >
                Reset
              </button>
            </div>

            {/* Price options */}
            <div className="space-y-4 py-2">
              {[500, 1000, 2000, 3000].map((val) => {
                const isSelected = browseMaxPrice === val;
                return (
                  <label
                    key={val}
                    onClick={() => {
                      setBrowseMaxPrice(val);
                      setActiveFilterSheet(null);
                      setVisibleCount(20);
                    }}
                    className="flex items-center justify-between py-2 cursor-pointer group select-none"
                  >
                    <span className={`text-[14px] font-semibold text-gray-800 group-hover:text-black transition-colors ${isSelected ? 'font-bold text-black' : ''}`}>
                      LKR {val}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="max-price-radio"
                        checked={isSelected}
                        readOnly
                        className="peer h-4.5 w-4.5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
                      />
                      {isSelected && (
                        <div className="absolute w-2 h-2 rounded-full bg-white pointer-events-none" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
