/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  BadgePercent, 
  ChevronRight, 
  ShoppingBag, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CartItem } from '../types';
import ZippiProductImage from './ZippiProductImage';
import { triggerHapticFeedback } from '../utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, selectedUnit: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, selectedUnit?: string) => void;
  onProceedToCheckout: (appliedPromo: string, discountAmt: number, finalFee: number) => void;
  deliveryFee: number;
}

const AVAILABLE_PROMOS = [
  { code: 'COLOMBOSUPER', desc: '15% Off Total Cart Value', type: 'percent', val: 0.15 },
  { code: 'WELCOMEKITS', desc: 'Flat LKR 500 Off (Min spend LKR 2,000)', type: 'flat', val: 500, minPrice: 2000 },
  { code: 'FASTZIPPI', desc: 'Free Express Delivery (Waives LKR 350)', type: 'freedel', val: 350 },
];

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  deliveryFee,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [activePromo, setActivePromo] = useState<typeof AVAILABLE_PROMOS[0] | null>(null);
  const [promoError, setPromoError] = useState('');
  const [courierNote, setCourierNote] = useState('');

  // Computations
  const getItemPrice = (item: CartItem) => {
    if (item.selectedUnit && item.product.variants && item.product.variants.length > 0) {
      const v = item.product.variants.find(x => x.unit === item.selectedUnit);
      if (v) return v.price;
    }
    return item.product.price;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (getItemPrice(item) * item.quantity), 0);
  
  // Calculate Promo Discount
  let promoDiscount = 0;
  let computedDeliveryFee = deliveryFee;

  if (activePromo) {
    if (activePromo.code === 'COLOMBOSUPER') {
      promoDiscount = Math.round(subtotal * activePromo.val);
    } else if (activePromo.code === 'WELCOMEKITS') {
      if (subtotal >= (activePromo.minPrice || 0)) {
        promoDiscount = activePromo.val;
      } else {
        // order went below min spend, deactivate
        promoDiscount = 0;
      }
    } else if (activePromo.code === 'FASTZIPPI') {
      computedDeliveryFee = 0;
    }
  }

  // Waive delivery fee automatically if subtotal > LKR 3500
  const freeDeliveryThreshold = 3500;
  const isAutoFreeDelivery = subtotal >= freeDeliveryThreshold;
  if (isAutoFreeDelivery && activePromo?.code !== 'FASTZIPPI') {
    computedDeliveryFee = 0;
  }

  const grandTotal = Math.max(0, subtotal + computedDeliveryFee - promoDiscount);

  const handleApplyPromo = (code: string) => {
    const matched = AVAILABLE_PROMOS.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!matched) {
      triggerHapticFeedback('error');
      setPromoError('Invalid coupon! Try WELCOMEKITS or COLOMBOSUPER.');
      setActivePromo(null);
      return;
    }

    if (matched.code === 'WELCOMEKITS' && subtotal < (matched.minPrice || 0)) {
      triggerHapticFeedback('error');
      setPromoError(`Minimum spend of LKR ${(matched.minPrice)?.toLocaleString()} required.`);
      setActivePromo(null);
      return;
    }

    triggerHapticFeedback('success');
    setActivePromo(matched);
    setPromoError('');
    setCouponCode(matched.code);
  };

  const removePromo = () => {
    triggerHapticFeedback('light');
    setActivePromo(null);
    setCouponCode('');
    setPromoError('');
  };

  return (
    <div className="fixed inset-0 bg-brand-charcoal/70 backdrop-blur-xs flex justify-end z-50">
      {/* Background Dim Backdrop */}
      <div className="absolute inset-0" onClick={() => { onClose(); triggerHapticFeedback('light'); }}></div>

      {/* Main Drawer Shell */}
      <div 
        className="bg-brand-bg w-full max-w-[430px] h-full flex flex-col shadow-2xl relative z-10 animate-slide-left"
        id="cart-drawer-panel"
      >
        {/* Header Block */}
        <div className="bg-white border-b border-brand-gray-light p-4 flex items-center justify-between sticky top-0 z-25">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-blue" />
            <span className="font-extrabold text-sm text-brand-charcoal uppercase tracking-wider">
              My Basket ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button 
            onClick={() => { onClose(); triggerHapticFeedback('light'); }}
            className="p-1.5 rounded-full hover:bg-gray-100 text-brand-charcoal transition-colors cursor-pointer"
            id="cart-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable contents */}
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-yellow-light rounded-full flex items-center justify-center text-brand-yellow text-4xl">
              🛒
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-charcoal">Your basket is empty</h3>
              <p className="text-xs text-brand-gray mt-1 max-w-[260px] mx-auto">
                Explore our range of organic veggies, Ceylon teas, dairy and grocery essentials to fill your basket.
              </p>
            </div>
            <button
              onClick={() => { onClose(); triggerHapticFeedback('light'); }}
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-charcoal font-extrabold text-xs py-3 px-6 rounded-xl select-none transition-colors duration-200 cursor-pointer shadow-sm"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              
              {/* Colombo Delivery Notice Indicator */}
              <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-xl p-3 flex gap-2.5">
                <span className="text-base">🚀</span>
                <div className="text-xs">
                  <p className="font-bold text-brand-green">Superfine Delivery Active</p>
                  <p className="text-brand-gray text-[11px] mt-0.5">
                    Orders arrive within 25 minutes inside Colombo limits. Sourced 100% fresh.
                  </p>
                </div>
              </div>

              {/* List of checkout items */}
              <div className="bg-white rounded-xl border border-brand-gray-light divide-y divide-brand-gray-light overflow-hidden">
                {cartItems.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const itemKey = `${item.product.id}-${item.selectedUnit || item.product.unit}`;
                  return (
                    <div key={itemKey} className="p-3.5 flex gap-3 items-start group" id={`cart-row-${itemKey}`}>
                      {/* Tiny thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-brand-gray-light flex-shrink-0">
                        <ZippiProductImage
                          image={item.product.image}
                          name={item.product.name}
                          category={item.product.category}
                          className="w-full h-full flex items-center justify-center animate-fade-in"
                          imageClassName="object-contain max-h-14"
                          fallbackSize="xs"
                        />
                      </div>

                      {/* text descriptive info */}
                      <div className="flex-grow space-y-0.5 min-w-0">
                        <h4 className="font-bold text-[13px] text-brand-charcoal line-clamp-1 group-hover:text-brand-blue transition-colors">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-brand-gray font-medium">Unit: {item.selectedUnit || item.product.unit}</p>
                        
                        {/* Pricing sum */}
                        <div className="flex items-baseline gap-1 pt-0.5">
                          <span className="text-[11px] font-bold text-brand-charcoal">LKR</span>
                          <span className="text-xs font-black text-brand-charcoal">
                            {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-brand-gray">
                              (LKR {itemPrice} each)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button counters and deletes */}
                      <div className="flex flex-col items-end justify-between h-16 self-center select-none">
                        <button 
                          onClick={() => onRemoveItem(item.product.id, item.selectedUnit)}
                          className="text-brand-gray hover:text-brand-red p-1 transition-colors rounded hover:bg-gray-100 cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Incremental box */}
                        <div className="flex items-center border border-brand-gray-mid rounded-lg h-7 overflow-hidden bg-brand-yellow-light/20">
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedUnit, -1)}
                            className="w-6 h-full hover:bg-brand-yellow-light flex items-center justify-center text-brand-charcoal text-xs cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" strokeWidth={3} />
                          </button>
                          <span className="text-xs font-bold text-brand-charcoal px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedUnit, 1)}
                            className="w-6 h-full hover:bg-brand-yellow-light flex items-center justify-center text-brand-charcoal text-xs cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon code system */}
              <div className="bg-white rounded-xl border border-brand-gray-light p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-brand-charcoal font-bold uppercase tracking-wider">
                  <BadgePercent className="w-4.5 h-4.5 text-brand-yellow-hover" />
                  <span>APPLY promo coupon</span>
                </div>

                {activePromo ? (
                  <div className="bg-brand-green-light border border-brand-green/30 rounded-xl p-3 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="font-black text-brand-green bg-white border border-brand-green/20 px-2.5 py-0.5 rounded-md uppercase">
                        {activePromo.code}
                      </span>
                      <p className="text-green-800 text-[11px] mt-1 font-semibold">{activePromo.desc}</p>
                    </div>
                    <button 
                      onClick={removePromo}
                      className="text-brand-red hover:bg-red-50 p-1.5 rounded-full transition-colors font-extrabold text-xs cursor-pointer"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOMEKITS"
                        className="flex-grow border border-brand-gray-mid focus:border-brand-yellow rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide placeholder:lowercase"
                      />
                      <button
                        onClick={() => handleApplyPromo(couponCode)}
                        disabled={!couponCode.trim()}
                        className="bg-brand-charcoal text-white hover:bg-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                      >
                        APPLY
                      </button>
                    </div>
                    
                    {promoError && (
                      <p className="text-[11px] font-semibold text-brand-red flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{promoError}</span>
                      </p>
                    )}

                    {/* Pre-suggested quick coupon pills */}
                    <div className="pt-1.5">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider mb-1.5">Quick coupons for you:</p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_PROMOS.map(p => {
                          const isEligible = p.code !== 'WELCOMEKITS' || subtotal >= (p.minPrice || 0);
                          return (
                            <button
                              key={p.code}
                              onClick={() => handleApplyPromo(p.code)}
                              className={`text-[10.5px] border border-dashed text-brand-charcoal font-bold px-2 py-1 rounded-lg text-left hover:border-brand-yellow transition-all flex items-center justify-between gap-1.5 cursor-pointer bg-amber-50/20 ${
                                isEligible ? 'border-brand-gray-mid' : 'border-gray-200 opacity-60'
                              }`}
                            >
                              <span>🏷️ <strong className="font-extrabold text-brand-blue">{p.code}</strong></span>
                              <span className="text-[9px] text-brand-gray font-medium">({p.code === 'WELCOMEKITS' ? 'Flat 500' : '15% Off'})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Courier Instruction Note */}
              <div className="bg-white rounded-xl border border-brand-gray-light p-3.5 space-y-2">
                <span className="text-xs text-brand-charcoal font-extrabold uppercase tracking-wide block">Rider Dispatch Note</span>
                <textarea 
                  value={courierNote}
                  onChange={(e) => setCourierNote(e.target.value)}
                  placeholder="e.g. Leave at the front gate security, ring door bell 3 times, etc."
                  rows={2}
                  className="w-full border border-brand-gray-mid focus:border-brand-yellow rounded-xl p-2.5 text-xs text-brand-charcoal placeholder:text-brand-muted leading-relaxed resize-none"
                />
              </div>

              {/* Automated Free Deliver progress panel */}
              {!isAutoFreeDelivery && (
                <div className="bg-brand-blue-light/40 border border-brand-blue/15 rounded-xl p-3 text-xs text-brand-charcoal">
                  <div className="flex justify-between items-center mb-1 font-bold text-brand-blue">
                    <span>Free express delivery bar</span>
                    <span>LKR {(freeDeliveryThreshold - subtotal).toLocaleString()} left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-blue h-full rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-brand-gray mt-1.5 font-medium">
                    Spend LKR {freeDeliveryThreshold.toLocaleString()} or more to unlock **Free Colombo Express Delivery** (saves LKR 350).
                  </p>
                </div>
              )}
            </div>

            {/* Calculations Breakdown Sticky Footer & Noon blue checkout button */}
            <div className="bg-white border-t border-brand-gray-light p-4 space-y-3.5 shadow-xl sticky bottom-0 z-20">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-gray">
                  <span>Basket Subtotal</span>
                  <span className="font-bold text-brand-charcoal">LKR {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-brand-gray">
                  <span className="flex items-center gap-1">
                    Delivery Charge 
                    <span className="bg-brand-yellow text-[9px] text-brand-charcoal font-black rounded px-1 scale-90">express</span>
                  </span>
                  <span className="font-bold text-brand-charcoal">
                    {computedDeliveryFee === 0 ? (
                      <span className="text-brand-green uppercase font-black tracking-wide">FREE</span>
                    ) : (
                      `LKR ${computedDeliveryFee}`
                    )}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-brand-red font-bold">
                    <span>Coupon Discount</span>
                    <span>- LKR {promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-brand-gray-light my-2"></div>
                
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-extrabold text-brand-charcoal">Total Value (incl. Tax)</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-brand-charcoal">LKR</span>
                    <span className="text-xl font-black text-brand-charcoal tracking-tight" id="cart-grand-total">
                      {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout blue CTA (Noon-style Checkout uses blue) */}
              <button
                onClick={() => onProceedToCheckout(activePromo?.code || '', promoDiscount, computedDeliveryFee)}
                className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-extrabold text-sm py-4 px-4 rounded-xl flex items-center justify-between transition-all transform active:scale-98 shadow-md cursor-pointer group"
                id="checkout-cta-btn"
              >
                <span className="tracking-wide uppercase">Proceed To Checkout</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black">LKR {grandTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4.5 h-4.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-brand-gray mt-1">
                <Info className="w-3.5 h-3.5 text-brand-gray" />
                <span>By checking out, you agree to Zippi food hygiene rules.</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
