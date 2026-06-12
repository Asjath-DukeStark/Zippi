/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Heart, 
  X, 
  Truck, 
  Check, 
  ShoppingBag, 
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Product, Address, CartItem } from '../types';
import { PRODUCTS } from '../data';
import ZippiProductImage from './ZippiProductImage';
import { triggerHapticFeedback } from '../utils';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (selectedUnit?: string) => void;
  onRemoveOne: (selectedUnit?: string) => void;
  // Dynamic features
  addresses?: Address[];
  selectedAddress?: Address;
  onSelectAddress?: (addr: Address) => void;
  onOpenCart?: () => void;
  onSelectProduct?: (product: Product) => void;
  products?: Product[];
}

export default function ProductDetailsModal({
  product,
  onClose,
  cart,
  onAddToCart,
  onRemoveOne,
  addresses = [],
  selectedAddress,
  onSelectAddress,
  onOpenCart,
  onSelectProduct,
  products = PRODUCTS,
}: ProductDetailsModalProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(true);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [activeSize, setActiveSize] = useState(product?.variants && product.variants.length > 0 ? product.variants[0].unit : (product?.unit || ''));
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  // Auto Reset state on product change
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setActiveSize(product.variants[0].unit);
      } else {
        setActiveSize(product.unit);
      }
    }
    setShowSizeDropdown(false);
  }, [product]);

  // Derive potential sizes based on product unit/variants
  const sizeOptions = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => ({
        label: v.unit,
        price: v.price,
        originalPrice: v.originalPrice ?? undefined,
        stock: v.stock ?? undefined
      }));
    }
    const defaultUnit = product.unit;
    // Generate some mock alternatives
    if (defaultUnit.includes('g') && !defaultUnit.includes('kg')) {
      const gValue = parseInt(defaultUnit) || 250;
      return [
        { label: `${Math.round(gValue * 0.5)}g`, multiplier: 0.6 },
        { label: defaultUnit, multiplier: 1.0 },
        { label: `${Math.round(gValue * 2)}g`, multiplier: 1.8 }
      ];
    } else if (defaultUnit.includes('L') || defaultUnit.includes('l')) {
      return [
        { label: '500ml', multiplier: 0.6 },
        { label: defaultUnit, multiplier: 1.0 },
        { label: '2L', multiplier: 1.8 }
      ];
    } else if (defaultUnit.includes('pack') || defaultUnit.includes('Pc')) {
      return [
        { label: 'Single Pc', multiplier: 0.4 },
        { label: defaultUnit, multiplier: 1.0 },
        { label: 'Family Pack', multiplier: 2.2 }
      ];
    }
    return [
      { label: defaultUnit, multiplier: 1.0 }
    ];
  }, [product]);

  const cartQty = useMemo(() => {
    if (!product) return 0;
    const match = cart.find(i => i.product.id === product.id && (i.selectedUnit || i.product.unit) === activeSize);
    return match ? match.quantity : 0;
  }, [cart, product, activeSize]);

  if (!product) return null;

  // Find current size details
  const currentSizeOption = sizeOptions.find(o => o.label === activeSize) || { label: product.unit, multiplier: 1.0 };
  
  const displayPrice = 'price' in currentSizeOption 
    ? currentSizeOption.price 
    : Math.round(product.price * (currentSizeOption as { multiplier: number }).multiplier);

  const displayOriginalPrice = 'originalPrice' in currentSizeOption 
    ? currentSizeOption.originalPrice 
    : (product.originalPrice && 'multiplier' in currentSizeOption
      ? Math.round(product.originalPrice * (currentSizeOption as { multiplier: number }).multiplier)
      : undefined);

  const displayDiscountPercent = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
    : 0;

  // Filter similar items from same category
  const similarProducts = useMemo(() => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 8);
  }, [product, products]);

  // Handle address picker selection
  const handleAddressPick = (addr: Address) => {
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    setShowAddressDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/65 backdrop-blur-xs flex items-end justify-center z-50 p-0 md:p-4 select-none">
      {/* Background clicking dismiss backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide up screen sheet (Max 430px) */}
      <div 
        className="bg-white w-full max-w-[430px] rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[94vh] animate-slide-up"
        id="product-details-sheet-container"
      >
        
        {/* ── HEADER: Back arrow | 'Home - [address]' dropdown | Heart icon ── */}
        <div className="px-4 py-3 bg-white border-b border-gray-150 flex items-center justify-between sticky top-0 z-30" id="detail-header-nav">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onClose();
                triggerHapticFeedback('light');
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
              id="detail-back-btn"
            >
              <ArrowLeft className="w-5.5 h-5.5" strokeWidth={2.5} />
            </button>

            {/* Home Address select dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddressDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-left transition-all cursor-pointer"
                id="header-address-dropdown-btn"
              >
                <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                <div className="max-w-[130px] md:max-w-[155px]">
                  <p className="text-[11.5px] font-black text-brand-charcoal leading-none">
                    {selectedAddress ? `${selectedAddress.label} - ${selectedAddress.details}` : 'Home - Colombo'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              </button>

              {showAddressDropdown && (
                <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-40 min-w-[210px] space-y-1 animate-scale-up">
                  <div className="px-2.5 py-1 text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">
                    Select delivery destination
                  </div>
                  {addresses.length === 0 ? (
                    <button 
                      onClick={() => setShowAddressDropdown(false)}
                      className="w-full text-left text-xs px-2.5 py-2 hover:bg-gray-50 rounded-lg font-bold"
                    >
                      123, Main Street, Colombo 03
                    </button>
                  ) : (
                    addresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => handleAddressPick(addr)}
                        className={`w-full text-left p-2 rounded-lg hover:bg-gray-50 flex flex-col cursor-pointer ${selectedAddress?.id === addr.id ? 'bg-[#FFF9C4]/35 font-bold' : ''}`}
                      >
                        <span className="text-[11.5px] font-black text-brand-charcoal">{addr.label}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{addr.details}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Heart toggler button */}
            <button
              onClick={() => {
                const nextState = !isWishlisted;
                setIsWishlisted(nextState);
                triggerHapticFeedback(nextState ? 'double' : 'light');
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-all active:scale-90 text-gray-400 hover:text-red-500"
              id="detail-wishlist-toggle"
            >
              <Heart 
                className={`w-5.5 h-5.5 ${isWishlisted ? 'fill-[#E11D48] text-[#E11D48]' : 'text-gray-500'}`} 
                strokeWidth={2.3}
              />
            </button>
          </div>
        </div>

        {/* Scroll Body Container */}
        <div className="flex-grow overflow-y-auto" id="detail-scrolling-view">
          
          {/* ── LOCATION WARNING (Dismissable banner) ── */}
          {showLocationWarning && (
            <div className="bg-[#FFFDE7] border-b border-[#FBE9E7] py-2 px-4 flex items-center justify-between text-[#827717]" id="location-warning-toast">
              <span className="text-[11.5px] font-semibold tracking-tight">
                ⚠️ You seem far away from this delivery location.
              </span>
              <button 
                onClick={() => {
                  setShowLocationWarning(false);
                  triggerHapticFeedback('light');
                }}
                className="p-1 hover:bg-[#FFF9C4] rounded-full text-gray-500 cursor-pointer"
                title="Dismiss location modal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── EXPRESS BADGE ── */}
          {product.popular && (
            <div className="px-4 pt-3.5" id="express-badge-pendant">
              <div className="border-l-4 border-[#F5C518] bg-amber-50/50 p-2.5 rounded-r-lg flex items-center gap-1.5">
                <span className="text-[#827717] font-extrabold italic text-xs tracking-wider uppercase">
                  ⚡ express
                </span>
                <span className="text-[11px] text-gray-500 font-bold">
                  Sourced fresh & delivered direct.
                </span>
              </div>
            </div>
          )}

          {/* ── PRODUCT IMAGE: Square, white bg ── */}
          <div className="px-4 py-3 bg-white flex justify-center items-center relative" id="image-frame-showcase">
            {displayDiscountPercent > 0 && (
              <span className="absolute top-2 left-6 bg-[#E11D48] text-white text-[11px] font-black px-2.5 py-1 rounded-full z-10 shadow-xs uppercase">
                Save {displayDiscountPercent}%
              </span>
            )}
            
            <div className="w-full h-[280px] bg-white rounded-xl flex items-center justify-center p-3">
              <ZippiProductImage
                image={product.image}
                name={product.name}
                category={product.category}
                className="w-full h-full flex items-center justify-center"
                imageClassName="object-contain w-full h-full max-h-[260px] animate-fade-in"
                fallbackSize="xl"
              />
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="px-4 py-3 space-y-3 bg-white" id="main-product-descriptor">
            {/* Category tag */}
            <span className="text-[11px] text-brand-blue font-extrabold tracking-wider uppercase">
              {product.category} Sourcing
            </span>

            {/* Product Name (18px, bold, dark, 2-3 lines max) */}
            <h1 className="text-[18px] font-bold text-[#1A1A1A] leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Size/variant chip: 'Size: 175g >' (tappable) */}
            <div className="relative pt-1">
              <button
                onClick={() => setShowSizeDropdown(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-black text-brand-charcoal hover:bg-gray-200 transition-all cursor-pointer"
                id="variant-sizes-picker-btn"
              >
                <span>Size: {activeSize}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {showSizeDropdown && (
                <div className="absolute left-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-xl p-1.5 z-40 min-w-[140px] animate-scale-up">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt.label}
                    onClick={() => {
                      setActiveSize(opt.label);
                      setShowSizeDropdown(false);
                      triggerHapticFeedback('light');
                    }}
                      className={`w-full text-left text-xs px-2.5 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-between font-bold cursor-pointer ${activeSize === opt.label ? 'text-brand-blue' : ''}`}
                    >
                      <span>{opt.label}</span>
                      {activeSize === opt.label && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Line: LKR 2,765 — 24px, bold, dark */}
            <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100" id="spec-pricing-row">
              <span className="text-[24px] font-black text-[#1A1A1A] tracking-tight">
                LKR {displayPrice.toLocaleString()}
              </span>
              {displayDiscountPercent > 0 && displayOriginalPrice && (
                <span className="text-[14px] text-gray-400 line-through font-medium">
                  LKR {displayOriginalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* ── DELIVERY INFO BLOCK ── */}
          <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-100 space-y-1" id="delivery-info-segment">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E8F5E9] text-emerald-700 p-1 rounded-full">
                <Truck className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-black text-brand-charcoal">
                Get it by Mon, Jun 8
              </p>
            </div>
            <p className="text-[11px] text-gray-400 pl-6">
              Order in 16 hrs 57 mins (countdown dynamic update)
            </p>
          </div>

          {/* ── CASHBACK CHIPS: Horizontal dashed border ── */}
          <div className="px-4 py-3 bg-white" id="cashback-scroller">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Available Cashback Promos:</p>
            <div className="flex gap-2 mr-2 overflow-x-auto scrollbar-none">
              
              <div className="px-3 py-1.5 bg-[#FFFDE7] border border-dashed border-[#F5C518] text-[#827717] rounded-lg text-[10.5px] font-extrabold shrink-0">
                Get 15% cashback
              </div>

              <div className="px-3 py-1.5 bg-[#FFFDE7] border border-dashed border-[#F5C518] text-[#827717] rounded-lg text-[10.5px] font-extrabold shrink-0">
                Get 10% cashback
              </div>

              <div className="px-3 py-1.5 bg-[#FFFDE7] border border-dashed border-[#F5C518] text-[#827717] rounded-lg text-[10.5px] font-extrabold shrink-0">
                Free Delivery Bonus Coupon
              </div>

            </div>
          </div>

          {/* ── DELIVERY DETAILS ── */}
          <div className="px-4 py-3 bg-gray-50/40 text-[11.5px] text-gray-400 space-y-2 border-t border-gray-100" id="legal-caveats-panel">
            <div className="flex items-center gap-1.5">
              <span>🚚</span>
              <span className="font-bold text-[#1A1A1A]">Free Shipping</span>
              <span>- Eligible on standard grocery deliveries above LKR 3,000.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📦</span>
              <span className="font-semibold">Non-returnable. Non-exchangeable.</span>
            </div>
          </div>

          {/* ── FAST DELIVERY PROMO ── */}
          <div className="px-4 py-2.5 bg-yellow-50/35 text-[11px] text-gray-500 italic border-y border-gray-100" id="fast-delivery-promo-banner">
            🚐 Get it as early as today! Select fast delivery on checkout.
          </div>

          {/* ── SIMILAR PRODUCTS ── */}
          <div className="px-4 py-5 bg-white pb-24" id="similar-products-block">
            <h3 className="text-xs text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Similar Products</span>
              <span className="bg-brand-blue-light text-brand-blue text-[9px] px-2 py-0.5 rounded">Customers also bought</span>
            </h3>

            {similarProducts.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No similar organic grocery lines available today.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" id="similar-scrollbar">
                {similarProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(p);
                        triggerHapticFeedback('light');
                      }
                    }}
                    className="w-[120px] bg-white border border-gray-200 rounded-xl p-2 shrink-0 hover:border-[#F5C518] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-20 flex items-center justify-center p-1 bg-white">
                      <ZippiProductImage
                        image={p.image}
                        name={p.name}
                        category={p.category}
                        className="w-full h-full flex items-center justify-center"
                        imageClassName="max-h-16 max-w-full object-contain"
                        fallbackSize="sm"
                      />
                    </div>
                    
                    <div className="mt-1.5">
                      <h4 className="text-[11px] font-bold text-brand-charcoal line-clamp-2 h-7 leading-tight mb-1">
                        {p.name}
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-medium mb-1">{p.unit}</p>
                      <p className="text-[11.5px] font-black text-brand-charcoal">LKR {p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── QUANTITY STEPPER / ADD BAR ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-150 p-4 shadow-xl z-30" id="detail-actions-dock-panel">
          
          <div className="flex gap-3 w-full">
            
            {/* Left Portion: Quantity details/stepper */}
            <div className="w-[125px] shrink-0">
              {cartQty === 0 ? (
                /* BEFORE Adding: default 0 indicator */
                <div className="w-full h-[44px] flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 text-[11.5px] text-gray-400 font-semibold uppercase">
                  Not in basket
                </div>
              ) : (
                /* AFTER Adding: Shows trash indicator / stepper */
                <div className="flex items-center justify-between border-2 border-[#F5C518] bg-[#FFFDEA] rounded-xl h-[44px] overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveOne(activeSize);
                    }}
                    className="w-11 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/15 text-red-500 cursor-pointer"
                  >
                    <span>🗑️</span>
                  </button>

                  <span className="font-extrabold text-[#1a1a1a] text-[13px]">
                    {cartQty}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(activeSize);
                    }}
                    className="w-11 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/15 cursor-pointer font-black text-lg"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Right Portion: Action buttons */}
            <div className="flex-grow">
              {cartQty === 0 ? (
                /* Full-width: 'Add to Cart' yellow button */
                <button
                  onClick={() => onAddToCart(activeSize)}
                  className="w-full bg-[#F5C518] hover:bg-[#E0B407] active:scale-95 text-[#1A1A1A] font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer uppercase tracking-wider h-[44px]"
                  id="detail-action-add-btn"
                >
                  <Plus className="w-4 h-4 shrink-0" strokeWidth={3} />
                  <span>Add to Cart</span>
                </button>
              ) : (
                /* Multi action: Show basket link if added */
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCart) {
                      onOpenCart();
                    }
                  }}
                  className="w-full bg-[#1A1A1A] hover:bg-[#2B2B2B] active:scale-95 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider h-[44px] animate-pulse"
                  id="detail-action-basket-btn"
                >
                  <span>Go to Cart</span>
                  <ArrowRight className="w-4 h-4 text-[#F5C518]" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

