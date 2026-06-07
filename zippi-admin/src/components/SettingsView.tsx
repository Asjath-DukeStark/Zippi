import React, { useState, useRef } from "react";
import { 
  Sliders, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Power, 
  CheckCircle, 
  Building, 
  Smartphone,
  Save,
  Grid,
  Info,
  Clock,
  Mail,
  Phone,
  Image,
  Upload,
  Calendar,
  MessageSquare,
  Gift,
  Coins
} from "lucide-react";
import { usePortal } from "../context/PortalContext";

interface SettingsViewProps {
  adminName: string;
  setAdminName: (name: string) => void;
  adminAvatar: string;
  setAdminAvatar: (url: string) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  adminName,
  setAdminName,
  adminAvatar,
  setAdminAvatar
}) => {
  const { settings, updateSettings } = usePortal();

  // 1. Operational gatekeeper switches and thresholds
  const [onlineStatus, setOnlineStatus] = useState(settings.onlineStatus);
  const [baseFee, setBaseFee] = useState(settings.baseDeliveryFee.toString());
  const [commission, setCommission] = useState(settings.commissionRate.toString());
  const [radius, setRadius] = useState(settings.operatingRadius.toString());
  const [autoAssign, setAutoAssign] = useState(settings.autoAssignRiders);
  const [support, setSupport] = useState(settings.supportPhone);

  // 2. New requested fields (with fallback bounds)
  const [appName, setAppName] = useState(settings.appName || "Zippi Food Delivery");
  const [tagline, setTagline] = useState(settings.tagline || "Ultra-fast food delivery system across Colombo");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=120&auto=format&fit=crop");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || "ops@zippi.lk");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || "+94 11 255 1212");

  const [minOrder, setMinOrder] = useState((settings.minOrderAmount ?? 500).toString());
  const [freeDelAbove, setFreeDelAbove] = useState((settings.freeDeliveryAbove ?? 3000).toString());
  const [estTime, setEstTime] = useState((settings.estDeliveryTime ?? 30).toString());

  const [openTime, setOpenTime] = useState(settings.openTime || "08:00");
  const [closeTime, setCloseTime] = useState(settings.closeTime || "23:00");
  
  const [operatingDays, setOperatingDays] = useState<string[]>(
    settings.operatingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  );

  const [smsConfirmed, setSmsConfirmed] = useState(
    settings.orderConfirmedSms || 
    "Zippi Order Alert! Your order {orderId} of Rs.{total} has been confirmed and transferred to the kitchen. Prep has begun!"
  );
  const [smsOutForDelivery, setSmsOutForDelivery] = useState(
    settings.orderOutForDeliverySms || 
    "Zippi Status update! Rider {riderName} (+9477XXXXXXX) is on their way with your food. Get ready to devour! Order {orderId}"
  );

  // Profile Form States
  const [profName, setProfName] = useState(adminName);
  const [profAvatar, setProfAvatar] = useState(adminAvatar);

  // Feedback notifications
  const [savingFeedback, setSavingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo file-upload converter
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle active week operational days
  const handleToggleDay = (day: string) => {
    setOperatingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  // Submit operations save
  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);

    updateSettings({
      onlineStatus,
      baseDeliveryFee: parseFloat(baseFee) || 0,
      commissionRate: parseFloat(commission) || 0,
      operatingRadius: parseFloat(radius) || 0,
      autoAssignRiders: autoAssign,
      supportPhone: support,
      // Extended fields
      appName,
      tagline,
      logoUrl,
      contactEmail,
      contactPhone,
      minOrderAmount: parseFloat(minOrder) || 0,
      freeDeliveryAbove: parseFloat(freeDelAbove) || 0,
      estDeliveryTime: parseInt(estTime, 10) || 0,
      openTime,
      closeTime,
      operatingDays,
      orderConfirmedSms: smsConfirmed,
      orderOutForDeliverySms: smsOutForDelivery
    });

    // Re-assign admin profile details
    setAdminName(profName);
    setAdminAvatar(profAvatar);

    setTimeout(() => {
      setSavingFeedback(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  return (
    <div id="settings-view" className="space-y-6">
      
      {/* 1. MASTER OPERATIONAL FORM VIEW */}
      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        
        {/* Dynamic high-friction success trigger */}
        {savingFeedback && (
          <div id="settings-save-success-banner" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-2xl flex items-center gap-3 animate-pulse shadow-md">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
            <div>
              <span className="block font-black uppercase text-[10px] tracking-wider text-emerald-900">Settings Saved Successfully</span>
              <span className="block mt-0.5 font-bold text-emerald-700/90">Platform operational constants, delivery logic, operating schedules and auto-response templates recalculated.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT/CENTER DOUBLE SPAN GRID FOR SYSTEM INPUTS */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* BOX A: GENERAL CONFIGURATION (App, tagline, upload logo, operational contact info) */}
            <div id="settings-sec-general" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-5">
              <div>
                <span className="text-[9px] uppercase font-black text-amber-600 tracking-wider font-mono">Platform Identity</span>
                <h3 className="font-display font-black text-slate-900 text-sm mt-0.5">General Settings</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Configure corporate identity markers, business contacts and brand assets.</p>
              </div>

              {/* Logo Upload Section */}
              <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-slate-50/50 flex flex-col sm:flex-row gap-5 items-center">
                
                {/* Preview Box */}
                <div className="relative w-16 h-16 rounded-xl border border-gray-200 bg-white shadow-3xs overflow-hidden shrink-0 flex items-center justify-center">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="App Logo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Image size={24} className="text-gray-300" />
                  )}
                </div>

                {/* Upload Action controls */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="block text-xs font-black text-slate-900">Zippi System Logo Upload</span>
                  <p className="text-[10px] text-gray-400">Provide any public image URL or select a local logo file to convert instantly.</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 font-extrabold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-3xs"
                    >
                      <Upload size={11} />
                      <span>Choose File</span>
                    </button>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Quick preset resets */}
                    <button
                      type="button"
                      onClick={() => setLogoUrl("https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=120&auto=format&fit=crop")}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 text-[10px] py-1 px-2 rounded font-bold"
                    >
                      Reset to Default URL
                    </button>
                  </div>
                </div>

              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* App Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Application Brand Name *</label>
                  <input
                    id="input-setting-appname"
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Product Tagline *</label>
                  <input
                    id="input-setting-tagline"
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-sans">Contact Email Address *</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="input-setting-contactemail"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-sans">Customer Hotline (Phone) *</label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="input-setting-contactphone"
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slide-50 bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

                {/* Public Logo URL fallback input */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Alternative Logo Image URL</label>
                  <input
                    id="input-setting-logourl"
                    type="url"
                    value={logoUrl.startsWith("data:") ? "Local File Upload Loaded (Base64)" : logoUrl}
                    onChange={(e) => !e.target.value.includes("Local File") && setLogoUrl(e.target.value)}
                    disabled={logoUrl.startsWith("data:")}
                    placeholder="Enter image web URL"
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3.5 rounded-xl outline-none font-medium text-slate-500 focus:ring-2 focus:ring-[#F5C518]/30 font-mono text-[10px]"
                  />
                  {logoUrl.startsWith("data:") && (
                    <button 
                      type="button" 
                      onClick={() => setLogoUrl("")} 
                      className="text-[9px] text-red-500 font-bold hover:underline"
                    >
                      Clear uploaded file to paste Web URL
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* BOX B: DELIVERY CONFIGURATION (Min order, Base delivery, Free threshold, Est. delivery, plus commission/radius) */}
            <div id="settings-sec-delivery" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-5">
              <div>
                <span className="text-[9px] uppercase font-black text-emerald-600 tracking-wider font-mono">Financial Logistical Logic</span>
                <h3 className="font-display font-black text-slate-900 text-sm mt-0.5">Delivery & Checkout Rules</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Control baseline parameters applied dynamically to order calculations.</p>
              </div>

              {/* Threshold parameter entries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Min Order LKR */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Minimum Order Amount (LKR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rs.</span>
                    <input
                      id="input-setting-minorder"
                      type="number"
                      required
                      min="0"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-11 pr-3.5 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-sans font-bold">Orders cannot checkout if product sums sit below this.</p>
                </div>

                {/* Base Delivery Fee LKR */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Base Delivery Fee (LKR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rs.</span>
                    <input
                      id="input-setting-basefee"
                      type="number"
                      required
                      min="0"
                      value={baseFee}
                      onChange={(e) => setBaseFee(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-11 pr-3.5 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-sans font-bold">Surcharge added initially to rider delivery jobs.</p>
                </div>

                {/* Free Delivery Above Threshold LKR */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider font-sans">Free Delivery Threshold *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rs.</span>
                    <input
                      id="input-setting-freedelabove"
                      type="number"
                      required
                      min="0"
                      value={freeDelAbove}
                      onChange={(e) => setFreeDelAbove(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-11 pr-3.5 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-sans font-bold">Delivery fee matches Rs. 0 when basket goes above this.</p>
                </div>

                {/* Estimated Delivery time in minutes */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider font-sans">Est. Delivery Time (Mins) *</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-sans">mins</span>
                    <input
                      id="input-setting-esttime"
                      type="number"
                      required
                      min="5"
                      value={estTime}
                      onChange={(e) => setEstTime(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-3.5 pr-12 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-sans font-bold">Standard dispatch estimate printed on client invoices.</p>
                </div>

                {/* App Flat commission rate (%) */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider font-sans">Platform Flat Commission (%) *</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
                    <input
                      id="input-setting-commission"
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-3.5 pr-8 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

                {/* Max Service Radius */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider font-sans">Dispatched Radius (km) *</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-wider">km</span>
                    <input
                      id="input-setting-operatingradius"
                      type="number"
                      required
                      min="1"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-3.5 pr-10 rounded-xl outline-none font-bold text-slate-950 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* BOX C: OPERATING HOURS (Open, Close, Day week checkboxes) */}
            <div id="settings-sec-hours" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-5">
              <div>
                <span className="text-[9px] uppercase font-black text-purple-600 tracking-wider font-mono">Operations Scheduler</span>
                <h3 className="font-display font-black text-slate-900 text-sm mt-0.5">Operating Hours</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Control calendar availability when buyers are allowed to check out items.</p>
              </div>

              {/* Times Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Open Time */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-sans">Kitchen Opening Time *</label>
                  <div className="relative">
                    <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="input-setting-opentime"
                      type="time"
                      required
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

                {/* Close Time */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-sans">Kitchen Closing Time *</label>
                  <div className="relative">
                    <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="input-setting-closetime"
                      type="time"
                      required
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#F5C518]/30"
                    />
                  </div>
                </div>

              </div>

              {/* Day toggler triggers */}
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Operational Days *</label>
                
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => {
                    const isActive = operatingDays.includes(day);
                    return (
                      <button
                        key={day}
                        id={`btn-toggle-day-${day}`}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`text-[11px] font-bold py-2 px-3 rounded-lg border transition cursor-pointer ${
                          isActive 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-slate-50 border-gray-200 text-slate-450 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Orders accepted on highlighted days only. Disabled days close dispatcher pipelines.</p>
              </div>

            </div>

            {/* BOX D: NOTIFICATION TEMPLATES (Confirmed template, Out for delivery template) */}
            <div id="settings-sec-notifications" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-5">
              <div>
                <span className="text-[9px] uppercase font-black text-blue-650 tracking-wider font-mono">Automated CRM Outreach</span>
                <h3 className="font-display font-black text-slate-900 text-sm mt-0.5">Notification Templates</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Define variables to populate automated SMS/push alerts on order milestones.</p>
              </div>

              <div className="space-y-4">
                
                {/* Template 1: Order Confirmed */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Order Confirmed SMS Template *</span>
                    <span className="font-mono text-[8px] text-amber-600 bg-amber-50 px-1 rounded">SMS Channel</span>
                  </label>
                  
                  <div className="relative">
                    <MessageSquare size={13} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <textarea
                      id="textarea-template-confirmed"
                      required
                      rows={3}
                      value={smsConfirmed}
                      onChange={(e) => setSmsConfirmed(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-[#F5C518]/30"
                      placeholder="Write system template..."
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-450 font-semibold leading-none">
                    <span>Supported placeholders:</span>
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{"{orderId}"}</code>
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{"{total}"}</code>
                  </div>
                </div>

                {/* Template 2: Out for delivery */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Order Out For Delivery SMS Template *</span>
                    <span className="font-mono text-[8px] text-amber-600 bg-amber-50 px-1 rounded">SMS Channel</span>
                  </label>
                  
                  <div className="relative">
                    <MessageSquare size={13} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <textarea
                      id="textarea-template-dispatched"
                      required
                      rows={3}
                      value={smsOutForDelivery}
                      onChange={(e) => setSmsOutForDelivery(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3.5 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-[#F5C518]/30"
                      placeholder="Write system template..."
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-455 font-semibold leading-none">
                    <span>Supported placeholders:</span>
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{"{orderId}"}</code>
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{"{riderName}"}</code>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN GRID FOR ACCESS CONTROL & MODERATORS */}
          <div className="space-y-6">
            
            {/* Box 1: Platform Gatekeeper Status Indicator */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Dispatcher Gatekeeper</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Toggle to close or resume general storefront ordering instantly.</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-150 flex justify-between items-center bg-slate-50">
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-3xs flex items-center justify-center border border-gray-100">
                    <Power size={14} className={onlineStatus ? "text-emerald-500" : "text-rose-500"} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-800">Operational Gate</span>
                    <span className="block text-[8px] font-bold text-gray-400">Stores active status</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-black uppercase ${onlineStatus ? "text-emerald-600" : "text-rose-550"}`}>
                    {onlineStatus ? "OPEN" : "CLOSED"}
                  </span>
                  
                  <button
                    type="button"
                    id="btn-settings-gateguard-toggle"
                    onClick={() => setOnlineStatus(!onlineStatus)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      onlineStatus ? "bg-emerald-500" : "bg-gray-250"
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                      onlineStatus ? "translate-x-4.5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Fast Rider Auto Assignment Rule */}
              <div className="p-4 rounded-xl border border-gray-150 flex flex-col gap-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">Auto Route Riders</span>
                  <button
                    type="button"
                    id="btn-settings-autoassignment-toggle-sec"
                    onClick={() => setAutoAssign(!autoAssign)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      autoAssign ? "bg-[#F5C518] text-black" : "bg-gray-220"
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                      autoAssign ? "translate-x-4.5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Systematically maps nearest active Rider when kitchen updates order parameter to confirmed status.</p>
              </div>

            </div>

            {/* Box 2: Profile Account details */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-3xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Account Settings</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Edit active portal moderator display details.</p>
              </div>

              {/* Avatar Preview */}
              <div className="flex flex-col items-center py-2 border-b border-gray-100">
                <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#F5C518] shadow-md bg-slate-50">
                  <img 
                    src={profAvatar} 
                    alt="Moderator avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250 font-mono uppercase font-black tracking-wider mt-3">
                  System Moderator
                </span>
              </div>

              {/* Moderator Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Display Nickname *</label>
                <input
                  id="input-setting-adminname"
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg outline-none font-bold text-slate-900"
                />
              </div>

              {/* Moderator Avatar url */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Avatar Graphic URL</label>
                <input
                  id="input-setting-adminavatar"
                  type="url"
                  value={profAvatar}
                  onChange={(e) => setProfAvatar(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg outline-none text-slate-705 truncate font-mono text-[9px]"
                />
              </div>

              {/* Presets avatars helper buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[9px] uppercase font-black text-gray-400 tracking-wider">Quick Graphics</span>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setProfAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=Moderator")}
                    className="bg-slate-50 hover:bg-slate-100 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded"
                  >
                    Robot
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setProfAvatar("https://api.dicebear.com/7.x/pixel-art/svg?seed=Zippi")}
                    className="bg-slate-50 hover:bg-slate-100 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded"
                  >
                    Pixel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setProfAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix")}
                    className="bg-slate-50 hover:bg-slate-100 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded"
                  >
                    Avatar
                  </button>
                </div>
              </div>

            </div>

            {/* Big Global Save settings button */}
            <div className="pt-2">
              <button
                id="btn-settings-massive-save"
                type="submit"
                className="w-full bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-all border border-transparent hover:scale-[1.01] active:scale-[0.99]"
              >
                <Save size={16} className="stroke-[2.5px]" />
                <span className="uppercase tracking-wider">Save Dashboard Settings</span>
              </button>
              <p className="text-[9px] text-gray-400 text-center font-bold mt-2">Adjustments trigger real-time client calculations upon click.</p>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};
