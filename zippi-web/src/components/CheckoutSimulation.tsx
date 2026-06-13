/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  Phone,
  AlertCircle,
  ArrowRight,
  Check,
  Plus,
  Info
} from 'lucide-react';
import { Address, Order, CartItem, OrderStatus } from '../types';
import ZippiProductImage from './ZippiProductImage';

interface CheckoutSimulationProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  promoCode: string;
  discount: number;
  deliveryFee: number;
  total: number;
  selectedAddress: Address;
  onOrderPlaced: (order: Order) => void;
  addresses?: Address[];
  onAddAddress?: (newAddr: Address) => void;
  onSelectAddress?: (addr: Address) => void;
}

type CheckoutStep = 1 | 2 | 3 | 4;

export default function CheckoutSimulation({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  promoCode,
  discount,
  deliveryFee,
  total,
  selectedAddress,
  onOrderPlaced,
  addresses = [],
  onAddAddress,
  onSelectAddress,
}: CheckoutSimulationProps) {
  if (!isOpen) return null;

  // Flow steps: 1 = Address, 2 = Payment, 3 = Review, 4 = Order Confirmed
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Slot selector state
  const [selectedSlot, setSelectedSlot] = useState<'express' | 'today' | 'tomorrow'>('express');

  // Address adding form toggle and states
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress1, setFormAddress1] = useState('');
  const [formAddress2, setFormAddress2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPostal, setFormPostal] = useState('10000');
  const [formLabel, setFormLabel] = useState('Home');

  // Payment Selection state: 'COD' (Cash on Delivery) or 'CARD_COD' (Card on Delivery)
  const [paymentOption, setPaymentOption] = useState<'COD' | 'CARD_COD'>('COD');

  // Order instructions summary state
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Sourcing list of addresses from props, or use default fallback if empty array
  const defaultAddresses: Address[] = useMemo(() => {
    if (addresses && addresses.length > 0) return addresses;
    return [
      { id: 'addr-default-1', label: 'Home', details: '128/A, Dutugemunu Street, Kohuwala, Colombo', isDefault: true },
      { id: 'addr-default-2', label: 'Office', details: 'Level 24, World Trade Center East Tower, Colombo 01', isDefault: false }
    ];
  }, [addresses]);

  const activeAddress = selectedAddress || defaultAddresses[0];

  // Derive dynamic delivery fee from slot selection:
  // "Express" -> LKR 150
  // "Schedule Today/Tomorrow" -> FREE
  const computedDeliveryFee = deliveryFee === 0 ? 0 : (selectedSlot === 'express' ? 150 : 0);
  const finalCalculatedTotal = Math.max(0, subtotal + computedDeliveryFee - discount);

  // Address saving logic
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAddress1.trim() || !formCity.trim() || !formFullName.trim()) {
      alert('Please fill in required fields (Full Name, Address Line 1 and City)');
      return;
    }

    const compiledDetails = `${formAddress1}${formAddress2 ? ', ' + formAddress2 : ''}, ${formCity} (Recipient: ${formFullName}, Phone: ${formPhone})`;
    const brandNewAddr: Address = {
      id: 'addr-' + Date.now(),
      label: formLabel,
      details: compiledDetails,
      isDefault: false
    };

    if (onAddAddress) {
      onAddAddress(brandNewAddr);
    } else {
      // Local sync if callback is omitted
      defaultAddresses.push(brandNewAddr);
      if (onSelectAddress) onSelectAddress(brandNewAddr);
    }

    // Reset forms
    setShowAddAddressForm(false);
    setFormAddress1('');
    setFormAddress2('');
    setFormFullName('');
    setFormPhone('');
    setFormCity('');
  };

  const handleChipClick = (msg: string) => {
    setDeliveryNotes(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return msg;
      if (trimmed.endsWith('.')) return `${trimmed} ${msg}`;
      return `${trimmed}. ${msg}`;
    });
  };

  // Live order tracker sub-system toggled from the Order Confirmed page
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [trackingTimer, setTrackingTimer] = useState(25); // seconds countdown for demo
  const [trackingStatus, setTrackingStatus] = useState<OrderStatus>('preparing');
  const [riderMapOffset, setRiderMapOffset] = useState(0);
  const [riderContacted, setRiderContacted] = useState(false);
  const [orderRating, setOrderRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Map progress countdown simulator
  useEffect(() => {
    if (!showLiveTracker || trackingStatus === 'delivered') return;

    const streamInterval = setInterval(() => {
      setTrackingTimer((pendingSec) => {
        if (pendingSec <= 1) {
          setTrackingStatus('delivered');
          clearInterval(streamInterval);
          return 0;
        }

        const nextSec = pendingSec - 1;

        // Transition logical statuses based on simple simulation timer index
        if (nextSec > 19) {
          setTrackingStatus('preparing');
        } else if (nextSec > 12) {
          setTrackingStatus('dispatched');
        } else if (nextSec > 3) {
          setTrackingStatus('arriving');
        }

        // Animate rider offset percentage indicator
        const percentage = ((25 - nextSec) / 25) * 100;
        setRiderMapOffset(percentage);

        return nextSec;
      });
    }, 1000);

    return () => clearInterval(streamInterval);
  }, [showLiveTracker, trackingStatus]);

  // Place Order execution
  const handleTriggerPlaceOrder = () => {
    // Generate order object
    const simulatedOrderId = 'ZP-2026-00' + Math.floor(100 + Math.random() * 900);
    const finalizedOrder: Order = {
      id: simulatedOrderId,
      items: cartItems,
      subtotal,
      deliveryFee: computedDeliveryFee,
      discount,
      total: finalCalculatedTotal,
      address: activeAddress,
      paymentMethod: paymentOption === 'COD' ? 'COD' : 'CARD',
      status: 'pending',
      timestamp: new Date().toISOString(),
      deliveryEtaMin: selectedSlot === 'express' ? 30 : 120
    };

    // Call onOrderPlaced back to trigger clear cart etc.
    onOrderPlaced(finalizedOrder);
    
    // Jump to step 4 (Order Confirmed)
    setCurrentStep(4);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto" id="checkout-modal-backdrop">
      
      {/* Checkout Wrapper Container */}
      <div className="bg-white w-full max-w-[450px] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh] border border-gray-100" id="checkout-wizard-card">
        
        {/* Header section with sticky banner */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10" id="checkout-navigation-bar">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shrink-0"></span>
            <span className="font-extrabold text-xs text-gray-500 uppercase tracking-widest leading-none">
              Secured Checkout Checkout
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-[#1a1a1a]"
            title="Close checkout screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── STEP INDICATOR (1 → 2 → 3) at top ── */}
        {currentStep <= 3 && (
          <div className="bg-gray-50/75 border-b border-gray-100 py-3.5 px-6 flex items-center justify-between select-none" id="step-indicator-bar">
            {/* Step 1: Address */}
            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-black">
                  ✓
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
              )}
              <span className={`text-xs ${currentStep === 1 ? 'font-black text-[#1A1A1A]' : 'font-semibold text-gray-400'}`}>
                Address
              </span>
            </div>

            <span className="text-gray-300 font-bold text-xs">→</span>

            {/* Step 2: Payment */}
            <div className="flex items-center gap-2">
              {currentStep > 2 ? (
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-black">
                  ✓
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
              )}
              <span className={`text-xs ${currentStep === 2 ? 'font-black text-[#1A1A1A]' : 'font-semibold text-gray-400'}`}>
                Payment
              </span>
            </div>

            <span className="text-gray-300 font-bold text-xs">→</span>

            {/* Step 3: Review */}
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`text-xs ${currentStep === 3 ? 'font-black text-[#1A1A1A]' : 'font-semibold text-gray-400'}`}>
                Review
              </span>
            </div>
          </div>
        )}

        {/* Outer scrollable view body area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          
          {/* ──────────────────────────────────────────────────────────
              [STEP 1] DELIVERY ADDRESS & SLOTS
              ────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in" id="step-1-address-content">
              
              <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">
                Delivery Address
              </h2>

              {/* Saved Address Selection Cards list */}
              <div className="space-y-3">
                {defaultAddresses.map((addr) => {
                  const isCurSelected = activeAddress.id === addr.id;
                  return (
                    <div 
                      key={addr.id}
                      onClick={() => onSelectAddress && onSelectAddress(addr)}
                      className={`bg-white rounded-xl border p-4 text-left transition-all relative cursor-pointer ${isCurSelected ? 'border-blue-600 shadow-sm ring-1 ring-blue-600/35' : 'border-gray-200 hover:border-gray-300'}`}
                      id={`address-saved-card-${addr.id}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-blue-600">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="font-extrabold text-[13px]">{addr.label}</span>
                        </div>
                        {isCurSelected && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-3">
                        {addr.details}
                      </p>

                      {/* 'Deliver here' full-width blue button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectAddress) onSelectAddress(addr);
                        }}
                        className={`w-full text-center py-2 px-4 rounded-full text-xs font-black transition-all cursor-pointer ${isCurSelected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A1A]'}`}
                        id={`deliver-here-btn-${addr.id}`}
                      >
                        Deliver here
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Toggle to add a brand-new address details */}
              {!showAddAddressForm ? (
                <button
                  onClick={() => setShowAddAddressForm(true)}
                  className="w-full bg-white hover:bg-blue-50/10 text-blue-600 border border-dashed border-blue-500/50 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  id="add-new-address-toggle-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add new address</span>
                </button>
              ) : (
                <form 
                  onSubmit={handleSaveAddress}
                  className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3.5 animate-scale-up"
                  id="new-address-form-element"
                >
                  <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                    <span className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider block">
                      New Address Information
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddAddressForm(false)}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Destination Label</label>
                      <select 
                        value={formLabel} 
                        onChange={(e) => setFormLabel(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-label"
                      >
                        <option value="Home">📍 Home</option>
                        <option value="Office">🏢 Office</option>
                        <option value="Apartment">🏫 Apartment</option>
                        <option value="Other">🗺️ Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Asjath" 
                        required
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-fullname"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Phone Number *</label>
                      <input 
                        type="tel" 
                        placeholder="+94 77 123 4567" 
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-phone"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Postal Code</label>
                      <input 
                        type="text" 
                        placeholder="10000" 
                        value={formPostal}
                        onChange={(e) => setFormPostal(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Address Line 1 *</label>
                    <input 
                      type="text" 
                      placeholder="Street name, flat number, building" 
                      required
                      value={formAddress1}
                      onChange={(e) => setFormAddress1(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="new-addr-line1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Address Line 2 (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Area, land mark" 
                        value={formAddress2}
                        onChange={(e) => setFormAddress2(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-line2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">City *</label>
                      <input 
                        type="text" 
                        placeholder="Colombo" 
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="new-addr-city"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm"
                    id="new-addr-save-btn"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* DELIVERY SLOT SELECTOR CONTAINER */}
              <div className="space-y-2 pt-2" id="delivery-slot-selector">
                <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider block">
                  Select Delivery Slot
                </span>

                <div className="space-y-2.5">
                  {/* Express 30-60 min option card */}
                  <label 
                    onClick={() => setSelectedSlot('express')}
                    className={`flex items-center justify-between p-3.5 bg-white border rounded-xl cursor-pointer transition-all select-none ${selectedSlot === 'express' ? 'border-blue-600 bg-blue-50/5 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                    id="slot-express-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 border-blue-600">
                        {selectedSlot === 'express' && <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-scale-up" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#1A1A1A]">⚡ Express (30–60 min)</p>
                        <p className="text-[10.5px] text-gray-400">Direct flash delivery from nearest packaging hub</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 whitespace-nowrap">LKR 150</span>
                  </label>

                  {/* Today schedule option card */}
                  <label 
                    onClick={() => setSelectedSlot('today')}
                    className={`flex items-center justify-between p-3.5 bg-white border rounded-xl cursor-pointer transition-all select-none ${selectedSlot === 'today' ? 'border-blue-600 bg-blue-50/5 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                    id="slot-scheduled-today"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 border-blue-600">
                        {selectedSlot === 'today' && <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-scale-up" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#1A1A1A]">📅 Schedule: Today 4–6 PM</p>
                        <p className="text-[10.5px] text-gray-400">Perfect afternoon dispatch window</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-green-600 uppercase tracking-wide">FREE</span>
                  </label>

                  {/* Tomorrow option slot card */}
                  <label 
                    onClick={() => setSelectedSlot('tomorrow')}
                    className={`flex items-center justify-between p-3.5 bg-white border rounded-xl cursor-pointer transition-all select-none ${selectedSlot === 'tomorrow' ? 'border-blue-600 bg-blue-50/5 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                    id="slot-scheduled-tomorrow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 border-blue-600">
                        {selectedSlot === 'tomorrow' && <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-scale-up" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#1A1A1A]">📅 Schedule: Tomorrow 9 AM–12 PM</p>
                        <p className="text-[10.5px] text-gray-400">Fresh morning distribution block</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-green-600 uppercase tracking-wide">FREE</span>
                  </label>
                </div>
              </div>

              {/* Continue button */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-full flex items-center justify-center gap-1 text-[14px] transition-all cursor-pointer shadow-md tracking-wider uppercase"
                  id="checkout-step-1-continue-btn"
                >
                  <span>Continue →</span>
                </button>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              [STEP 2] PAYMENT METHODS (2 OPTIONS ONLY SPECIFIED BY MANDATE)
              ────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in" id="step-2-payment-content">
              
              <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">
                Payment Method
              </h2>

              <p className="text-xs text-gray-400 leading-normal">
                Choose how you would like to settle the invoice value upon physical arrival. No online checkout required.
              </p>

              <div className="space-y-3 pt-1">
                
                {/* OPTION A: Cash on Delivery */}
                <div 
                  onClick={() => setPaymentOption('COD')}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${paymentOption === 'COD' ? 'border-blue-600 bg-blue-50/5 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                  id="payment-option-a-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <span className="text-2xl mt-0.5 shrink-0 select-none">💵</span>
                      <div>
                        <h4 className="text-[13.5px] font-black text-[#1A1A1A] leading-tight">
                          Cash on Delivery
                        </h4>
                        <p className="text-[11.5px] text-gray-500 font-bold mt-1">
                          Pay with cash when your order arrives
                        </p>
                        <p className="text-[10px] text-gray-400 italic mt-0.5 font-medium">
                          Please prepare exact change if possible for faster rider handling.
                        </p>
                      </div>
                    </div>
                    {/* Circle radio */}
                    <div className="w-5.5 h-5.5 rounded-full border border-blue-600 flex items-center justify-center shrink-0">
                      {paymentOption === 'COD' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                </div>

                {/* OPTION B: Card on Delivery */}
                <div 
                  onClick={() => setPaymentOption('CARD_COD')}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${paymentOption === 'CARD_COD' ? 'border-blue-600 bg-blue-50/5 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                  id="payment-option-b-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <span className="text-2xl mt-0.5 shrink-0 select-none">💳</span>
                      <div>
                        <h4 className="text-[13.5px] font-black text-[#1A1A1A] leading-tight">
                          Card on Delivery
                        </h4>
                        <p className="text-[11.5px] text-gray-500 font-bold mt-1">
                          Pay by card when your order arrives
                        </p>
                        <p className="text-[11.5px] text-blue-600 font-extrabold tracking-tight mt-0.5">
                          Visa, Mastercard accepted
                        </p>
                        <p className="text-[10px] text-gray-400 italic mt-0.5 font-medium">
                          Rider 🛵 will carry a secure tap-to-pay portable card terminal.
                        </p>
                      </div>
                    </div>
                    {/* Circle radio */}
                    <div className="w-5.5 h-5.5 rounded-full border border-blue-600 flex items-center justify-center shrink-0">
                      {paymentOption === 'CARD_COD' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                </div>

              </div>

              {/* Info Disclaimer strip */}
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex gap-2 items-start text-[10.5px] text-blue-700 leading-normal">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="font-semibold">
                  <strong>Zero-Risk Guarantee:</strong> You only pay upon receipt of high-quality items. Not satisfied? Hand any item back immediately with the rider!
                </p>
              </div>

              {/* Navigation Back and forward buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] text-xs font-extrabold h-11 rounded-full cursor-pointer flex items-center justify-center transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="col-span-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black h-11 rounded-full flex items-center justify-center gap-1 text-[13.5px] transition-all cursor-pointer shadow-md uppercase tracking-wider"
                  id="checkout-step-2-continue-btn"
                >
                  <span>Continue →</span>
                </button>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              [STEP 3] ORDER SUMMARY AND CONSTRAINED PLACEMENT
              ────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in" id="step-3-review-content">
              
              <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">
                Review Your Order
              </h2>

              {/* Delivery Address Summary Card (gray bg, rounded) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex gap-2.5" id="review-addr-card">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                    Sourcing Delivery Address
                  </h4>
                  <p className="text-xs font-extrabold text-[#1A1A1A]">{activeAddress.label}</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                    {activeAddress.details}
                  </p>
                  <p className="text-[10px] text-blue-600 font-extrabold uppercase mt-1 leading-none">
                    🚚 SLOT: {selectedSlot === 'express' ? '⚡ Express (30–60 min)' : selectedSlot === 'today' ? '📅 Today 4–6 PM' : '📅 Tomorrow morning'}
                  </p>
                </div>
              </div>

              {/* Payment Method Summary Card (gray bg, rounded) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex gap-2.5" id="review-payment-card">
                <div className="text-xl mt-0.5 select-none shrink-0">
                  {paymentOption === 'COD' ? '💵' : '💳'}
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                    Settlement Method
                  </h4>
                  <p className="text-xs font-extrabold text-[#1A1A1A]">
                    {paymentOption === 'COD' ? 'Cash on Delivery' : 'Card on Delivery'}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {paymentOption === 'COD' ? 'Pay cash on cargo handoff' : 'Swipe credit/debit card on mobile point of sales'}
                  </p>
                </div>
              </div>

              {/* Items checklist block (compact image list, max-h-36 scrollable if many items) */}
              <div className="space-y-2">
                <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider block">
                  Items Checklist ({cartItems.length} items)
                </span>

                <div className="border border-gray-150 rounded-xl max-h-40 overflow-y-auto bg-white divide-y divide-gray-100 p-1 px-3" style={{ scrollbarWidth: 'thin' }}>
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 max-w-[70%]">
                        <ZippiProductImage 
                          image={item.product.image} 
                          name={item.product.name}
                          category={item.product.category}
                          className="w-10 h-10 shrink-0"
                          imageClassName="w-10 h-10 object-contain bg-gray-50 border border-gray-100 rounded p-1 shrink-0"
                          fallbackSize="xs"
                        />
                        <div className="truncate">
                          <p className="text-[11.5px] font-extrabold text-brand-charcoal truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Size: {item.product.unit} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#1A1A1A] shrink-0">
                        LKR {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special instructions field with chips below */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 font-black uppercase tracking-wider block">
                  Special Sourcing Instructions (optional)
                </label>
                
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Enter custom driver dropoff rules (e.g., Gate number, apartment floor)"
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                  id="checkout-delivery-notes-input"
                />

                {/* Automation Quick Chips */}
                <div className="flex gap-1.5 overflow-x-auto pt-0.5 scrollbar-none select-none">
                  <button
                    type="button"
                    onClick={() => handleChipClick('Leave at door')}
                    className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-[10.5px] font-bold text-gray-600 rounded-full cursor-pointer transition-colors whitespace-nowrap active:scale-95"
                  >
                    🚪 Leave at door
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChipClick('Ring bell')}
                    className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-[10.5px] font-bold text-gray-600 rounded-full cursor-pointer transition-colors whitespace-nowrap active:scale-95"
                  >
                    🔔 Ring bell
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChipClick('Call on arrival')}
                    className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-[10.5px] font-bold text-gray-600 rounded-full cursor-pointer transition-colors whitespace-nowrap active:scale-95"
                  >
                    📞 Call on arrival
                  </button>
                </div>
              </div>

              {/* Price Breakdown block */}
              <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-2" id="review-price-invoice shadow-xs">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cart Items Subtotal</span>
                  <span className="font-extrabold text-[#1A1A1A]">LKR {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sourcing Delivery fee</span>
                  <span className="font-extrabold text-[#1A1A1A]">
                    {computedDeliveryFee === 0 ? 'FREE' : `LKR ${computedDeliveryFee}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-xs text-red-600 font-extrabold">
                    <span>Discount Promo ({promoCode || 'DEFAULT_SAVE'})</span>
                    <span>- LKR {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-gray-100 my-1" />

                <div className="flex justify-between text-[16px] font-black text-[#1A1A1A] tracking-tight">
                  <span>Total Amount Due</span>
                  <span>LKR {finalCalculatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Placement Action bar */}
              <div className="pt-2">
                {/* Place Order CTA with large height (52px equivalent to py-3.5) */}
                <button
                  onClick={handleTriggerPlaceOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-97 text-white font-black text-[15px] h-[52px] rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer tracking-wider uppercase"
                  id="checkout-place-order-final-btn"
                >
                  <span>Place Order • LKR {finalCalculatedTotal.toLocaleString()}</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2.5 leading-relaxed leading-none">
                  By placing order you agree to our <span className="underline cursor-pointer">Terms of Services</span> & <span className="underline cursor-pointer font-bold">Zippi Guarantee</span> rules.
                </p>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              [STEP 4] ORDER CONFIRMED SCREEN (SUCCESS!)
              ────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 pt-6 text-center select-none" id="step-4-order-confirmed">
              
              {/* Checkmark animation overlay */}
              {!showLiveTracker ? (
                <div className="space-y-6 animate-scale-up py-4 flex flex-col items-center">
                  
                  {/* Large animated green checkmark (CSS scale-in) */}
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 border-4 border-green-200 animate-bounce">
                    <Check className="w-10 h-10" strokeWidth={3.5} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#1A1A1A]">
                      Order Confirmed! 🎉
                    </h2>
                    <p className="text-xs text-gray-400 leading-normal max-w-[280px] mx-auto">
                      Thank you for purchasing checkout items! Sourcing agent has claimed your request.
                    </p>
                  </div>

                  {/* Order ID: monospace gray */}
                  <div className="bg-gray-150 py-2 px-4 rounded-lg inline-block border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">ID invoice reference</span>
                    <code className="text-xs font-mono font-extrabold text-[#1A1A1A]">
                      #ZP-2026-00847
                    </code>
                  </div>

                  {/* Delivery time expectation and packing subtitle */}
                  <div className="space-y-1">
                    <p className="text-[13px] text-green-600 font-black">
                      Estimated delivery: Today, 4–6 PM
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      Your items are being packed
                    </p>
                  </div>

                  {/* Operational primary button blocks */}
                  <div className="space-y-2.5 w-full pt-4">
                    
                    {/* Track Order CTA */}
                    <button
                      onClick={() => setShowLiveTracker(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 active:scale-97 text-white font-extrabold h-11 rounded-full flex items-center justify-center gap-1 text-xs transition-colors cursor-pointer shadow-md tracking-wider uppercase"
                      id="order-confirmed-track-btn"
                    >
                      Track Order
                    </button>

                    {/* Continue Shopping Ghost button */}
                    <button
                      onClick={onClose}
                      className="w-full bg-white hover:bg-blue-50/10 text-blue-600 border border-blue-500/40 font-extrabold h-11 rounded-full text-xs transition-all cursor-pointer uppercase tracking-wider"
                      id="order-confirmed-continue-btn"
                    >
                      Continue Shopping
                    </button>

                  </div>

                </div>
              ) : (
                /* Interactive nested Live GPS status dashboard simulation tracker */
                <div className="space-y-4 text-left animate-fade-in" id="nested-live-visual-tracker">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                    <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider">
                      🛵 Live GPS Delivery Tracker
                    </h3>
                    <button 
                      onClick={() => setShowLiveTracker(false)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full cursor-pointer font-bold transition-all"
                    >
                      ← Back
                    </button>
                  </div>

                  {/* ETA Counter banner */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated ETA</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-[#1A1A1A]">
                          {trackingStatus === 'delivered' ? 'ARRIVED!' : `${trackingTimer}s`}
                        </span>
                        {trackingStatus !== 'delivered' && (
                          <span className="text-[9.5px] text-gray-400 font-bold">accelerated scale</span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-green-600 font-black mt-1">
                        {trackingStatus === 'preparing' && '🥬 Sourcing agency packing inventory boxes'}
                        {trackingStatus === 'dispatched' && '🛵 Rider Kapila speeding down Galle Face Avenue'}
                        {trackingStatus === 'arriving' && '📍 Almost at your gate on Duplication Road'}
                        {trackingStatus === 'delivered' && '🎉 Food items securely delivered to your door!'}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 text-2xl flex items-center justify-center border border-blue-100 animate-pulse">
                      {trackingStatus === 'delivered' ? '🎁' : '🛵'}
                    </div>
                  </div>

                  {/* Animated Colombo SVGMAP */}
                  <div className="bg-slate-100 rounded-xl border border-gray-200 overflow-hidden h-44 relative shadow-inner">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Ocean sector */}
                      <path d="M 0 0 Q 30 100 0 200 L 0 0 Z" fill="#E3F2FD" opacity="0.8" />
                      
                      {/* Grid overlays */}
                      <line x1="0" y1="40" x2="400" y2="40" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="160" y1="0" x2="160" y2="200" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="280" y1="0" x2="280" y2="200" stroke="#E2E8F0" strokeWidth="1" />

                      {/* Galle Road boulevard line */}
                      <path d="M 100 0 C 120 70, 110 130, 130 200" fill="none" stroke="#CBD5E1" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 100 0 C 120 70, 110 130, 130 200" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
                      
                      {/* Duplication Road */}
                      <path d="M 230 0 C 250 80, 240 140, 260 200" fill="none" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round" />
                      
                      {/* Linking boulevard */}
                      <line x1="110" y1="80" x2="245" y2="90" stroke="#CBD5E1" strokeWidth="8" />

                      {/* Map label decorations */}
                      <text x="15" y="30" fill="#1E88E5" fontSize="8" fontWeight="bold">Indian Ocean</text>
                      <text x="70" y="20" fill="#94A3B8" fontSize="8" fontWeight="bold">Galle Face</text>
                      <text x="240" y="30" fill="#94A3B8" fontSize="7" fontWeight="bold">Duplication Rd</text>

                      {/* Kollupitiya dispatch point */}
                      <circle cx="110" cy="30" r="5" fill="#1565C0" />
                      
                      {/* User's Home marker point */}
                      <circle cx="250" cy="150" r="5" fill="#E53935" />
                    </svg>

                    {/* Absolute Rider Overlay dynamic point widget */}
                    {(() => {
                      let riderX = 110;
                      let riderY = 30;

                      if (riderMapOffset < 40) {
                        const factor = riderMapOffset / 40;
                        riderX = 110 + (245 - 110) * factor;
                        riderY = 30 + (90 - 30) * factor;
                      } else {
                        const factor = (riderMapOffset - 40) / 60;
                        riderX = 245 + (250 - 245) * factor;
                        riderY = 90 + (150 - 90) * factor;
                      }

                      if (trackingStatus === 'delivered') {
                        riderX = 250;
                        riderY = 150;
                      }

                      return (
                        <div 
                          className="absolute w-7 h-7 bg-[#F5C518] rounded-full border border-brand-charcoal shadow-md flex items-center justify-center text-xs pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
                          style={{ left: `${riderX}px`, top: `${riderY}px` }}
                        >
                          {trackingStatus === 'delivered' ? '🎁' : '🛵'}
                        </div>
                      );
                    })()}

                    <div className="absolute top-2 right-2 bg-[#1A1A1A] text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Live Delivery Tracker
                    </div>
                  </div>

                  {/* Rider Profile Card */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200 divide-y divide-gray-100 space-y-2.5">
                    <div className="flex justify-between items-center pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shadow-xs select-none">
                          🤵
                        </div>
                        <div>
                          <h5 className="font-extrabold text-[12.5px] text-[#1A1A1A] leading-tight">Kapila Perera</h5>
                          <span className="text-[10px] text-gray-400 font-bold">🚀 Verified Zippi Express Courier</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setRiderContacted(true);
                          alert('Calling rider Kapila Perera at +94 77 123 4567. He is on his motorcycle on Duplication Road, Colombo.');
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700 text-[10.5px] font-black h-8 px-3 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>📞 {riderContacted ? 'Calling...' : 'Call Rider'}</span>
                      </button>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[11px] text-gray-500 font-medium">
                      <span>Vehicle Code: MH-8120 (Red Boxer)</span>
                      <span className="text-green-600 font-bold">Temperature Checked</span>
                    </div>
                  </div>

                  {/* Dynamic Rider Rating feedback once completed */}
                  {trackingStatus === 'delivered' && (
                    <div className="bg-green-50/20 border-2 border-dashed border-green-500/35 rounded-xl p-4 text-center space-y-2.5">
                      <span className="text-2xl block animate-bounce">💚</span>
                      <h4 className="font-extrabold text-xs text-[#1A1A1A]">Rate your Delivery Sourcing Experience</h4>
                      <p className="text-[11px] text-gray-400">Your feedback helps sustain clean local distributions!</p>
                      
                      {ratingSubmitted ? (
                        <div className="text-xs text-green-600 font-black uppercase tracking-wider pt-2">
                          ✨ Thank you for rating Kapila!
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setOrderRating(star)}
                                className="text-2xl transition-all cursor-pointer active:scale-95"
                              >
                                {orderRating >= star ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setRatingSubmitted(true)}
                            disabled={orderRating === 0}
                            className="bg-blue-600 hover:bg-blue-700 font-bold text-[10.5px] h-8 px-4 rounded-xl text-white disabled:opacity-40 transition-colors uppercase cursor-pointer"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Return shop CTA */}
                  <div className="pt-2 select-none">
                    <button
                      onClick={onClose}
                      className="w-full bg-[#1A1A1A] hover:bg-black font-extrabold h-11 text-xs text-white rounded-full transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Close & Return to Store
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
