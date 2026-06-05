/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  MapPin, 
  Heart, 
  X, 
  Check, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Info 
} from 'lucide-react';
import { CartItem, Address, Product } from '../types';
import ZippiProductImage from './ZippiProductImage';

interface CartViewProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveOne: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  addresses?: Address[];
  selectedAddress?: Address;
  onSelectAddress?: (addr: Address) => void;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

export default function CartView({
  cart,
  onAddToCart,
  onRemoveOne,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  addresses = [],
  selectedAddress,
  onSelectAddress,
  onBack,
  wishlist,
  onToggleWishlist,
}: CartViewProps) {
  const [showLocationWarning, setShowLocationWarning] = useState(true);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Compute total price of cart items
  const cartTotalPriceRaw = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  }, [cart]);

  // Support address change
  const handleAddressPick = (addr: Address) => {
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    setShowAddressDropdown(false);
  };

  return (
    <div className="flex-grow flex flex-col bg-white overflow-hidden relative select-none" id="cart-viewport-container">
      
      {/* ── HEADER ── */}
      <div className="px-4 py-3 bg-white border-b border-gray-150 flex items-center justify-between sticky top-0 z-30" id="cart-header-navigation">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
            id="cart-back-btn"
          >
            <ArrowLeft className="w-5.5 h-5.5" strokeWidth={2.5} />
          </button>

          {/* 'Home - [address] ▾' option dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddressDropdown(prev => !prev)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-left transition-all cursor-pointer"
              id="cart-address-dropdown-btn"
            >
              <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
              <div className="max-w-[130px] md:max-w-[155px]">
                <p className="text-[11.5px] font-black text-[#1A1A1A] leading-none">
                  {selectedAddress ? `${selectedAddress.label} - ${selectedAddress.details}` : 'Home - Colombo'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            </button>

            {showAddressDropdown && (
              <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-40 min-w-[210px] space-y-1 animate-scale-up">
                <div className="px-2.5 py-1 text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">
                  Choose Sourcing Destination
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

        {/* Header Right Option for viewing wishlist */}
        <button
          onClick={() => {
            // Quick alert/back door trigger of wishlist
            const wlBtn = document.getElementById('wishlist-tab-entry-btn');
            if (wlBtn) wlBtn.click();
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all cursor-pointer"
          header-wishlist-indicator="true"
        >
          <Heart className="w-5.5 h-5.5 text-gray-500" strokeWidth={2.3} />
        </button>
      </div>

      {/* Main vertical scrolling area */}
      <div className="flex-grow overflow-y-auto" id="cart-scrolling-content-feed">
        
        {/* ── LOCATION WARNING (same as product detail page) ── */}
        {showLocationWarning && (
          <div className="bg-[#FFFDE7] border-b border-[#FBE9E7] py-2 px-4 flex items-center justify-between text-[#827717]" id="location-warning-toast-cart">
            <span className="text-[11.5px] font-semibold tracking-tight">
              You seem far away from this location ✕
            </span>
            <button 
              onClick={() => setShowLocationWarning(false)}
              className="p-1 hover:bg-[#FFF9C4] rounded-full text-gray-500 cursor-pointer"
              title="Dismiss location modal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── EXPRESS SECTION LABEL ── */}
        <div className="px-4 pt-3.5" id="cart-express-marker">
          <div className="border-l-4 border-[#F5C518] bg-amber-50/50 p-2.5 rounded-r-lg flex items-center gap-1.5">
            <span className="text-[#827717] font-extrabold italic text-xs tracking-wider uppercase">
              ⚡ express
            </span>
            <span className="text-[11px] text-gray-500 font-bold">
              Zippi fresh-sourced daily distribution hub.
            </span>
          </div>
        </div>

        {/* ── CART ITEMS LIST ── */}
        {cart.length === 0 ? (
          <div className="p-8 text-center space-y-4 my-10" id="cart-empty-placeholder">
            <div className="w-16 h-16 bg-yellow-50 text-[#F5C518] rounded-full flex items-center justify-center text-3xl mx-auto">
              🛒
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-[#1A1A1A]">Your basket is empty</h4>
              <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-normal">
                Noon-style fresh selections are ready! Tap back and add grocery commodities to start.
              </p>
            </div>
            <button
              onClick={onBack}
              className="bg-[#F5C518] hover:bg-yellow-500 active:scale-95 text-[#1A1A1A] font-black text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider h-[40px]"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4" id="cart-active-rows">
            {cart.map((item, index) => {
              return (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onUpdateQty={onUpdateQty}
                  onRemoveItem={onRemoveItem}
                  isWishlisted={wishlist.includes(item.product.id)}
                  onToggleWishlist={onToggleWishlist}
                  isLast={index === cart.length - 1}
                />
              );
            })}
          </div>
        )}

      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-150 px-4 py-3 shadow-2xl z-30 flex items-center justify-between" id="cart-footer-dock">
          
          {/* Leftside: Total details */}
          <div className="flex flex-col select-none">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Amount</span>
            <span 
              className="text-[20px] font-black text-[#1A1A1A] tracking-tight underline adornment-dashed decoration-gray-300"
              style={{ textDecorationStyle: 'dotted' }}
              title="Includes VAT + sourcing costs"
            >
              LKR {cartTotalPriceRaw.toLocaleString()}
            </span>
          </div>

          {/* Rightside: Noon-Style Checkout button */}
          <button
            onClick={onProceedToCheckout}
            className="w-[60%] bg-[#1565C0] hover:bg-[#0D47A1] active:scale-95 text-white font-black text-[15px] py-3 px-6 rounded-full flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer tracking-wide"
            id="cart-checkout-noon-btn"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>

        </div>
      )}

    </div>
  );
}

/* ────────────────────────────────────────────────────────
   SUB-COMPONENT: CartItemRow (Dynamic alternative sizes support)
   ──────────────────────────────────────────────────────── */
interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isLast: boolean;
}

function CartItemRow({
  item,
  onUpdateQty,
  onRemoveItem,
  isWishlisted,
  onToggleWishlist,
  isLast
}: CartItemRowProps) {
  const { product, quantity } = item;
  const [activeSize, setActiveSize] = useState(product.unit);
  const [showSizeSelect, setShowSizeSelect] = useState(false);

  // Sync state if product updates
  useEffect(() => {
    setActiveSize(product.unit);
  }, [product]);

  // Alternate sizes generator matching product detail modal sizing formula
  const sizeOptions = useMemo(() => {
    const defaultUnit = product.unit;
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

  const currentOption = sizeOptions.find(o => o.label === activeSize) || { label: product.unit, multiplier: 1.0 };
  const calculatedRowPrice = Math.round(product.price * currentOption.multiplier);

  return (
    <div className="space-y-3" id={`cart-row-container-${product.id}`}>
      
      {/* Row details card wrapper */}
      <div className="bg-white rounded-xl border border-gray-150 p-3.5 relative flex gap-3.5 shadow-xs" id={`cart-row-${product.id}`}>
        
        {/* Left Aspect ratio image container (80x80) */}
        <div className="w-[80px] h-[80px] shrink-0 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-1.5 select-none relative">
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="absolute -top-1.5 -left-1.5 bg-[#E11D48] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              -{product.discountPercent}%
            </span>
          ) : null}
          <ZippiProductImage
            image={product.image}
            name={product.name}
            category={product.category}
            className="w-full h-full flex items-center justify-center"
            imageClassName="w-full h-full object-contain max-h-[70px]"
            fallbackSize="sm"
          />
        </div>

        {/* Right Info Section */}
        <div className="flex-grow flex flex-col justify-between">
          
          <div className="space-y-1">
            
            {/* Product Name (14px, bold, 2 lines max) */}
            <h4 className="text-[14px] font-extrabold text-[#1A1A1A] leading-tight line-clamp-2 pr-4">
              {product.name}
            </h4>

            {/* Size chip: 'Size: 175g >' (tappable) */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowSizeSelect(p => !p)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10.5px] font-bold text-gray-600 rounded-full cursor-pointer transition-colors"
                id={`cart-row-size-btn-${product.id}`}
              >
                <span>Size: {activeSize}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {showSizeSelect && (
                <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-40 min-w-[125px]">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setActiveSize(opt.label);
                        setShowSizeSelect(false);
                      }}
                      className={`w-full text-left text-[10.5px] px-2 py-1.5 rounded-lg hover:bg-gray-50 flex items-center justify-between font-bold cursor-pointer ${activeSize === opt.label ? 'text-brand-blue bg-blue-50/20' : ''}`}
                    >
                      <span>{opt.label}</span>
                      {activeSize === opt.label && <Check className="w-3 h-3 text-brand-blue" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Line: 'LKR 2,765' (16px, bold) */}
            <p className="text-[16px] font-black text-[#1A1A1A] tracking-tight">
              LKR {calculatedRowPrice.toLocaleString()}
            </p>

            {/* Delivery Info Block: Get it by Mon, Jun 8 */}
            <div className="text-[10px] space-y-0.5 pt-0.5">
              <p className="font-bold text-gray-600">
                🚚 Get it by <span className="text-[#1A1A1A] font-extrabold">Mon, Jun 8</span>
              </p>
              <p className="text-gray-400">
                ⏱️ Order in 16 hrs 57 mins (countdown)
              </p>
            </div>

            {/* Cashback Dash Chips row */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
              <div className="px-2 py-0.5 bg-[#FFFDE7] border border-dashed border-[#F5C518] text-[#827717] rounded text-[9px] font-extrabold shrink-0">
                15% cashback
              </div>
              <div className="px-2 py-0.5 bg-[#FFFDE7] border border-dashed border-[#F5C518] text-[#827717] rounded text-[9px] font-extrabold shrink-0">
                10% cashback
              </div>
            </div>

            {/* Shipping details caveats */}
            <div className="text-[9.5px] text-gray-400 flex items-center gap-2 pt-1">
              <span>🚚 Free Shipping eligible</span>
              <span>•</span>
              <span>📦 Non-returnable</span>
            </div>

          </div>

          {/* Stepper with quantity trigger bottom of item */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mt-3" id={`actions-row-${product.id}`}>
            
            {/* Stepper: [🗑️] [1] [+] */}
            <div className="flex items-center justify-between border-2 border-[#F5C518] bg-[#FFFDEA] rounded-xl h-[34px] w-[110px] overflow-hidden select-none">
              <button
                onClick={() => {
                  if (quantity <= 1) {
                    onRemoveItem(product.id);
                  } else {
                    onUpdateQty(product.id, -1);
                  }
                }}
                className="w-10 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/15 text-red-500 cursor-pointer"
                title="Remove 1 item"
              >
                <span>🗑️</span>
              </button>

              <span className="font-extrabold text-[#1a1a1a] text-xs">
                {quantity}
              </span>

              <button
                onClick={() => onUpdateQty(product.id, 1)}
                className="w-10 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/15 cursor-pointer font-black text-sm"
              >
                +
              </button>
            </div>

            {/* Heart Icon RIGHT (save for later / wishlist quick toggle) */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-full transition-all active:scale-90"
              title="Save for Later"
            >
              <Heart 
                className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400'}`} 
                strokeWidth={2.3}
              />
            </button>

          </div>

          {/* Fast Delivery Promo lines */}
          <div className="mt-2 text-[9.5px] text-gray-400 italic bg-amber-50/25 p-1.5 rounded-lg border border-yellow-200/20">
            🚐 Get it as early as today! Select fast delivery on checkout.
          </div>

        </div>

      </div>

      {/* Item Separator (not full separation card style) */}
      {!isLast && <div className="border-b border-gray-100/70 py-1" />}

    </div>
  );
}
