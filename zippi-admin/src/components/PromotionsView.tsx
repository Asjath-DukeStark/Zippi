import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Percent, 
  Tag, 
  Image as ImageIcon, 
  X, 
  Calendar,
  CheckCircle,
  EyeOff,
  GripVertical,
  Edit,
  Sparkles,
  Search,
  Timer,
  ExternalLink,
  ChevronRight,
  Upload,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  Loader2,
  Trash
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Promotion, Banner, Product } from "../types";
import { uploadProductImage } from "../lib/supabase";

export const PromotionsView: React.FC = () => {
  const { 
    promotions, banners, products, categories,
    addPromotion, updatePromotion, deletePromotion, 
    addBanner, updateBanner, deleteBanner, reorderBanners,
    updateProduct
  } = usePortal();

  // Primary active tab under promotions page
  const [activeTab, setActiveTab ] = useState<"banners" | "flash" | "coupons">("banners");

  // Status feedback bar
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Format currency helper
  const formatLKR = (val: number) => {
    return `Rs. ${Math.round(val).toLocaleString()}`;
  };

  // ════════════════════════════════
  // 1. BANNERS SECTION LOGIC
  // ════════════════════════════════
  const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null);
  const [draggedOverBannerId, setDraggedOverBannerId] = useState<string | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Banner input state fields
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bImage, setBImage] = useState("");
  const [bSlot, setBSlot] = useState<"Home Hero" | "Category Offer" | "Promo Bar">("Home Hero");
  const [bStatus, setBStatus] = useState<"Active" | "Inactive">("Active");
  const [bStartDate, setBStartDate] = useState("");
  const [bEndDate, setBEndDate] = useState("");
  const [bLinkType, setBLinkType] = useState<"category" | "product" | "url">("url");
  const [bLinkTargetId, setBLinkTargetId] = useState("");
  const [bCustomUrl, setBCustomUrl] = useState("");
  
  // Image uploading states
  const [bannerUploadProgress, setBannerUploadProgress] = useState<number | null>(null);
  const [bannerDragOver, setBannerDragOver] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Sort and prep banners list
  const sortedBanners = [...banners].sort((a, b) => {
    const orderA = a.sortOrder !== undefined ? a.sortOrder : 999;
    const orderB = b.sortOrder !== undefined ? b.sortOrder : 999;
    return orderA - orderB;
  });

  const openAddBanner = () => {
    setEditingBanner(null);
    setBTitle("");
    setBSubtitle("");
    setBImage("https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=900");
    setBSlot("Home Hero");
    setBStatus("Active");
    setBStartDate("2026-06-07");
    setBEndDate("2026-12-31");
    setBLinkType("url");
    setBLinkTargetId("");
    setBCustomUrl("/search");
    setBannerUploadProgress(null);
    setIsBannerModalOpen(true);
  };

  const openEditBanner = (ban: Banner) => {
    setEditingBanner(ban);
    setBTitle(ban.title);
    setBSubtitle(ban.subtitle);
    setBImage(ban.imageUrl);
    setBSlot(ban.slot);
    setBStatus(ban.status);
    setBStartDate(ban.startDate || "2026-06-07");
    setBEndDate(ban.endDate || "2026-12-31");
    setBLinkType(ban.linkType || "url");
    setBLinkTargetId(ban.linkTargetId || "");
    setBCustomUrl(ban.linkUrl || "");
    setBannerUploadProgress(null);
    setIsBannerModalOpen(true);
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) {
      triggerFeedback("Please specify a banner title.", "error");
      return;
    }
    if (!bImage.trim()) {
      triggerFeedback("Please choose or specify an image asset.", "error");
      return;
    }

    // Calculate linkUrl depending on LinkType
    let resolvedUrl = bCustomUrl;
    if (bLinkType === "category") {
      resolvedUrl = `/category/${bLinkTargetId}`;
    } else if (bLinkType === "product") {
      resolvedUrl = `/product/${bLinkTargetId}`;
    }

    const payload = {
      title: bTitle.trim(),
      subtitle: bSubtitle.trim(),
      imageUrl: bImage.trim(),
      slot: bSlot,
      status: bStatus,
      startDate: bStartDate || undefined,
      endDate: bEndDate || undefined,
      linkType: bLinkType,
      linkTargetId: bLinkTargetId || undefined,
      linkUrl: resolvedUrl || "/search",
      sortOrder: editingBanner?.sortOrder !== undefined ? editingBanner.sortOrder : banners.length
    };

    if (editingBanner) {
      updateBanner({
        ...editingBanner,
        ...payload
      });
      triggerFeedback(`Successfully modified banner "${bTitle}"!`);
    } else {
      addBanner(payload);
      triggerFeedback(`Successfully created promotional banner "${bTitle}"!`);
    }

    setIsBannerModalOpen(false);
  };

  // HTML5 Drag and Drop for Banners
  const handleBannerDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBannerId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBannerDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedBannerId !== id) {
      setDraggedOverBannerId(id);
    }
  };

  const handleBannerDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBannerId || draggedBannerId === targetId) return;

    const items = [...sortedBanners];
    const draggedIdx = items.findIndex(b => b.id === draggedBannerId);
    const targetIdx = items.findIndex(b => b.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, removed);

    // Save recalculated sorted sequence
    const updatedWithOrder = items.map((item, idx) => ({
      ...item,
      sortOrder: idx
    }));

    reorderBanners(updatedWithOrder);
    triggerFeedback("Banner slide presentation re-sequenced successfully!", "success");

    setDraggedBannerId(null);
    setDraggedOverBannerId(null);
  };

  const handleBannerDragEnd = () => {
    setDraggedBannerId(null);
    setDraggedOverBannerId(null);
  };

  // File Upload Handlers for Banner Modal
  const processBannerFile = async (file: File) => {
    setBannerUploadProgress(10);
    try {
      const res = await uploadProductImage(file, (p) => {
        setBannerUploadProgress(p);
      });
      setBImage(res.url);
      triggerFeedback("Uploaded design element directly to secure Cloud bucket!", "success");
    } catch (err: any) {
      triggerFeedback(`Upload failed: ${err.message || "Error"}`, "error");
    } finally {
      setBannerUploadProgress(null);
    }
  };

  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processBannerFile(e.target.files[0]);
    }
  };

  const handleBannerFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setBannerDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processBannerFile(e.dataTransfer.files[0]);
    }
  };


  // ════════════════════════════════
  // 2. FLASH DEALS LOGIC & COUNTDOWN
  // ════════════════════════════════
  // Retrieve expiry countdown date-time from localStorage or set default to end of today
  const [flashDealExpiry, setFlashDealExpiry] = useState<string>(() => {
    const stored = localStorage.getItem("zippi_admin_flash_deal_expiry");
    if (stored) return stored;
    // Default to tomorrow 12:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });

  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, expired: true });

  // Update ticking countdown seconds
  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(flashDealExpiry) - +new Date();
      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [flashDealExpiry]);

  // Flash Deal State handlers
  const [flashSelectProductId, setFlashSelectProductId] = useState("");
  const [flashDiscountValue, setFlashDiscountValue] = useState("25");

  const flashFeaturedProducts = products.filter(p => p.isFlashDeal);
  const eligibleFlashCandidates = products.filter(p => !p.isFlashDeal && p.status === "Active");

  const handleAddFlashDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashSelectProductId) {
      triggerFeedback("Please select a target culinary product.", "error");
      return;
    }
    const productToUpdate = products.find(p => p.id === flashSelectProductId);
    if (!productToUpdate) return;

    const discountNum = parseInt(flashDiscountValue) || 10;
    if (discountNum < 1 || discountNum > 99) {
      triggerFeedback("Discount percentage must be integers between 1 and 99.", "error");
      return;
    }

    updateProduct({
      ...productToUpdate,
      isFlashDeal: true,
      discountPercentage: discountNum,
      comparePrice: productToUpdate.comparePrice || productToUpdate.price
    });

    triggerFeedback(`"${productToUpdate.name}" added to Flash deals with ${discountNum}% off!`);
    setFlashSelectProductId("");
  };

  const handleRemoveFlashDeal = (prod: Product) => {
    updateProduct({
      ...prod,
      isFlashDeal: false,
      discountPercentage: undefined
    });
    triggerFeedback(`Removed "${prod.name}" from active flash discounts.`);
  };

  const handleSaveCountdownTimer = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("zippi_admin_flash_deal_expiry", flashDealExpiry);
    triggerFeedback("Flash deal countdown expiration updated!", "success");
  };


  // ════════════════════════════════
  // 3. COUPONS & PROMO CODES LOGIC
  // ════════════════════════════════
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Promotion | null>(null);

  // Coupon inputs
  const [cCode, setCCode] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cType, setCType] = useState<"Percentage" | "Fixed">("Percentage");
  const [cValue, setCValue] = useState("");
  const [cMinSpend, setCMinSpend] = useState("");
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");
  const [cStatus, setCStatus] = useState<"Active" | "Scheduled" | "Expired">("Active");
  const [cLimitType, setCLimitType] = useState<"One-use" | "Unlimited">("Unlimited");

  const openAddCoupon = () => {
    setEditingCoupon(null);
    setCCode("");
    setCTitle("");
    setCType("Percentage");
    setCValue("");
    setCMinSpend("1000");
    setCStart("2026-06-07");
    setCEnd("2026-06-30");
    setCStatus("Active");
    setCLimitType("Unlimited");
    setIsCouponModalOpen(true);
  };

  const openEditCoupon = (promo: Promotion) => {
    setEditingCoupon(promo);
    setCCode(promo.code);
    setCTitle(promo.title);
    setCType(promo.discountType);
    setCValue(promo.discountValue.toString());
    setCMinSpend(promo.minOrderAmount.toString());
    setCStart(promo.startDate);
    setCEnd(promo.endDate);
    setCStatus(promo.status);
    setCLimitType(promo.usageLimit || "Unlimited");
    setIsCouponModalOpen(true);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim() || !cTitle.trim() || !cValue.trim()) {
      triggerFeedback("Please fulfill all coupon identifier variables.", "error");
      return;
    }

    const payload = {
      code: cCode.toUpperCase().replace(/\s+/g, ""),
      title: cTitle.trim(),
      discountType: cType,
      discountValue: parseFloat(cValue) || 0,
      minOrderAmount: parseFloat(cMinSpend) || 0,
      startDate: cStart || "2026-06-07",
      endDate: cEnd || "2026-12-31",
      status: cStatus,
      usageLimit: cLimitType
    };

    if (editingCoupon) {
      updatePromotion({
        ...editingCoupon,
        ...payload
      });
      triggerFeedback(`Coupon code "${cCode}" modified and compiled!`);
    } else {
      addPromotion(payload);
      triggerFeedback(`New coupon code "${cCode}" instantiated successfully!`);
    }

    setIsCouponModalOpen(false);
  };

  return (
    <div id="promotions-view-wrapper" className="space-y-6">

      {/* Persistent Feedback notifications */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-bounce flex items-center gap-2 text-xs font-bold ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <CheckCircle size={15} />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* TOP HEADER TITLE */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none">Campaign Console</h2>
          <p className="text-xs text-gray-400 mt-1">
            Publish app banners, configure real-time flash deal countdown clock multipliers, or issue customer discount vouchers.
          </p>
        </div>
      </div>

      {/* CORE SELECTOR SUB TABS */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          id="btn-tab-banners"
          onClick={() => setActiveTab("banners")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "banners"
              ? "border-[#F5C518] text-slate-950 bg-slate-50/50"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
        >
          <ImageIcon size={14} />
          <span>Banners Slider ({banners.length})</span>
        </button>
        <button
          id="btn-tab-flash"
          onClick={() => setActiveTab("flash")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "flash"
              ? "border-[#F5C518] text-slate-950 bg-slate-50/50"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
        >
          <Timer size={14} />
          <span>Active Flash Deals ({flashFeaturedProducts.length})</span>
        </button>
        <button
          id="btn-tab-coupons"
          onClick={() => setActiveTab("coupons")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "coupons"
              ? "border-[#F5C518] text-slate-950 bg-slate-50/50"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
        >
          <Tag size={14} />
          <span>Coupon Codes ({promotions.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════
          SUBTAB VIEW: BANNERS SLIDER
          ══════════════════════════════════════════ */}
      {activeTab === "banners" && (
        <div id="banners-tab-panel" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide">Sliding Marketing Banner Nodes</h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Hold drag-handles to sort banner presentation order sequentially inside standard consumer sliders.
              </p>
            </div>
            <button
              id="btn-add-banner-trigger"
              onClick={openAddBanner}
              className="bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2 px-4 rounded-lg flex items-center gap-2 uppercase tracking-wide shadow-xs cursor-pointer block"
            >
              <Plus size={14} className="stroke-[3.5px]" />
              <span>Add Banner</span>
            </button>
          </div>

          {/* Grid Layout of banner cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedBanners.length === 0 ? (
              <div className="col-span-full bg-white py-16 text-center text-gray-400 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm">
                No active sliders live inside primary consumer application nodes.
              </div>
            ) : (
              sortedBanners.map((ban, idx) => {
                const isDragging = draggedBannerId === ban.id;
                const isOver = draggedOverBannerId === ban.id;

                return (
                  <div
                    key={ban.id}
                    id={`banner-card-${ban.id}`}
                    draggable
                    onDragStart={(e) => handleBannerDragStart(e, ban.id)}
                    onDragOver={(e) => handleBannerDragOver(e, ban.id)}
                    onDrop={(e) => handleBannerDrop(e, ban.id)}
                    onDragEnd={handleBannerDragEnd}
                    className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative group ${
                      isDragging ? "opacity-30 border-dashed border-[#F5C518]" : "border-gray-200"
                    } ${isOver ? "border-solid border-2 border-[#F5C518] scale-[1.01]" : ""}`}
                  >
                    
                    {/* Drag grab handle overlay */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs p-1 rounded-md text-white z-10 opacity-70 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                      <GripVertical size={13} />
                      <span className="text-[8px] font-mono">Pos #{ban.sortOrder !== undefined ? ban.sortOrder : idx}</span>
                    </div>

                    {/* Image frame */}
                    <div className="relative h-44 w-full bg-slate-100 shrink-0">
                      <img 
                        src={ban.imageUrl} 
                        alt={ban.title} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover" 
                      />

                      {/* Status display Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          id={`banner-status-toggle-${ban.id}`}
                          onClick={() => {
                            updateBanner({
                              ...ban,
                              status: ban.status === "Active" ? "Inactive" : "Active"
                            });
                            triggerFeedback(`Banner toggle compiled!`);
                          }}
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-xs cursor-pointer ${
                            ban.status === "Active"
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-gray-800 text-gray-300 border-gray-700"
                          }`}
                        >
                          {ban.status === "Active" ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {/* Schedule validity indicators */}
                      {(ban.startDate || ban.endDate) && (
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded text-[8px] text-white font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          <span>
                            {ban.startDate || "Anytime"} to {ban.endDate || "Forever"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold text-[#F5C518] bg-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                            {ban.slot}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                          {ban.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {ban.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <span className="text-[10px] text-slate-600 font-semibold truncate max-w-[200px] flex items-center gap-1">
                          <ExternalLink size={10} className="text-gray-400" />
                          <span>Link: <span className="font-mono bg-slate-50 px-1 rounded border border-gray-150 text-gray-500">{ban.linkUrl}</span></span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-edit-banner-ctrl-${ban.id}`}
                            onClick={() => openEditBanner(ban)}
                            className="p-1 px-2 hover:bg-slate-100 text-slate-700 hover:text-black rounded transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                            title="Edit banner slider properties"
                          >
                            <Edit size={12} className="stroke-[2.5px]" />
                          </button>
                          <button
                            id={`btn-delete-banner-ctrl-${ban.id}`}
                            onClick={() => {
                              if (confirm(`Trash sliding banner "${ban.title}"?`)) {
                                deleteBanner(ban.id);
                                triggerFeedback("Banner design scrubbed from active sliding lists.");
                              }
                            }}
                            className="p-1 px-2 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SUBTAB VIEW: FLASH DEALS
          ══════════════════════════════════════════ */}
      {activeTab === "flash" && (
        <div id="flash-deals-tab-panel" className="space-y-6">
          
          {/* TWO PANEL GRID CONTROL LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Countdown Setting & Product adder */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Box 1: Expiry Countdown Controller */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#F5C518]" />
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900">Campaign Expiry Clock</h4>
                </div>
                
                <form onSubmit={handleSaveCountdownTimer} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Expiry Date-Time *</label>
                    <input
                      id="input-flash-expiry"
                      type="datetime-local"
                      required
                      value={flashDealExpiry}
                      onChange={(e) => setFlashDealExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-2.5 rounded-lg shadow-sm transition-all text-center cursor-pointer block uppercase tracking-wider"
                  >
                    Sync Promotion Expiry
                  </button>
                </form>

                {/* Clock Ticking readout widget */}
                <div className="bg-slate-950 p-4 rounded-xl text-center border border-slate-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Ticking Live Clock Countdown</span>
                  {timeRemaining.expired ? (
                    <p className="text-sm font-black text-red-500 mt-1 uppercase tracking-wide">Deals Expired / Inactive</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <div className="bg-slate-900 leading-none p-2 rounded border border-slate-800">
                        <span className="block text-white font-mono font-black text-lg">{timeRemaining.hours.toString().padStart(2, "0")}</span>
                        <span className="text-[7px] text-slate-400 font-bold uppercase">HRS</span>
                      </div>
                      <div className="bg-slate-900 leading-none p-2 rounded border border-slate-800">
                        <span className="block text-white font-mono font-black text-lg">{timeRemaining.minutes.toString().padStart(2, "0")}</span>
                        <span className="text-[7px] text-slate-400 font-bold uppercase">MINS</span>
                      </div>
                      <div className="bg-slate-900 leading-none p-2 rounded border border-slate-800">
                        <span className="block text-amber-400 font-mono font-black text-lg animate-pulse">{timeRemaining.seconds.toString().padStart(2, "0")}</span>
                        <span className="text-[7px] text-slate-400 font-bold uppercase">SECS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Select and Add Product Form */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#F5C518]" />
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900">Enlist Promo Dishes</h4>
                </div>

                <form onSubmit={handleAddFlashDeal} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Product *</label>
                    <select
                      id="select-flash-product"
                      required
                      value={flashSelectProductId}
                      onChange={(e) => setFlashSelectProductId(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="">-- Choose active culinary item --</option>
                      {eligibleFlashCandidates.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatLKR(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Discount Mode Percentage *</label>
                    <div className="relative">
                      <input
                        id="input-flash-discount"
                        type="number"
                        min="1"
                        max="99"
                        required
                        value={flashDiscountValue}
                        onChange={(e) => setFlashDiscountValue(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg outline-none font-bold text-slate-950 pr-8"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-mono text-xs">%</span>
                    </div>
                  </div>

                  <button
                    id="btn-submit-flash-deal"
                    type="submit"
                    className="w-full bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2.5 rounded-lg shadow-sm transition-all text-center cursor-pointer block uppercase tracking-wider"
                  >
                    Enlist Flash Discount
                  </button>
                </form>
              </div>

            </div>

            {/* List of enrolled flash deals dishes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 mb-4 shrink-0">
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-slate-950">Active Flash Sale Dish Enclosures</h4>
                    <p className="text-[11px] text-gray-400">Culinary cards flagged with immediate discount rates on client menu displays.</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 uppercase">
                    ⚡ {flashFeaturedProducts.length} Items Listed
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px]">
                  {flashFeaturedProducts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-gray-450 space-y-2">
                      <Timer size={32} className="text-gray-300 animate-spin-slow" />
                      <p className="text-xs font-bold font-sans">No culinary designs tagged under flash campaigns currently.</p>
                      <p className="text-[10px] text-gray-400 max-w-sm">Use the left configuration gateway to bind active products with discount values.</p>
                    </div>
                  ) : (
                    flashFeaturedProducts.map((p) => {
                      const finalDiscountRate = p.discountPercentage || 0;
                      const calculatedDiscountAmount = (p.price * finalDiscountRate) / 100;
                      const computedOfferPrice = p.price - calculatedDiscountAmount;

                      return (
                        <div
                          key={p.id}
                          id={`flash-product-row-${p.id}`}
                          className="bg-slate-50/50 p-4 rounded-xl border border-gray-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >
                          {/* Image + Basic metadata */}
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="text-[8px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                Active Flash deal
                              </span>
                              <h5 className="font-bold text-xs text-slate-950 mt-1 line-clamp-1" title={p.name}>
                                {p.name}
                              </h5>
                              <p className="text-[10px] font-mono text-gray-400">SKU Reference: {p.sku}</p>
                            </div>
                          </div>

                          {/* Calculations center */}
                          <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-start">
                            <div className="text-left sm:text-right">
                              <span className="block text-[8px] text-gray-400 uppercase font-black tracking-widest leading-none">Price Breakdown</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="line-through text-gray-400 text-[10px] font-mono">{formatLKR(p.price)}</span>
                                <span className="font-display text-xs font-black text-red-650 font-sans">{formatLKR(computedOfferPrice)}</span>
                              </div>
                            </div>

                            <div className="bg-red-50 text-red-700 font-black text-xs font-sans px-3 py-1.5 rounded-lg border border-red-100 shrink-0">
                              -{finalDiscountRate}% OFF
                            </div>

                            <button
                              id={`btn-remove-flash-${p.id}`}
                              type="button"
                              onClick={() => handleRemoveFlashDeal(p)}
                              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                              title="Remove from Flash Deal list"
                            >
                              <Trash size={13} className="stroke-[2.5px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════
          SUBTAB VIEW: COUPONS & PROMO CODES
          ══════════════════════════════════════════ */}
      {activeTab === "coupons" && (
        <div id="coupons-tab-panel" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-955 uppercase tracking-wider">Active Promotional Coupon Tokens</h3>
              <p className="text-[11px] text-gray-400">Issued codes available for checkout validation checks inside student/office delivery streams.</p>
            </div>
            <button
              id="btn-add-coupon-trigger"
              onClick={openAddCoupon}
              className="bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2 px-4 rounded-lg flex items-center gap-2 uppercase tracking-wide shadow-xs cursor-pointer block"
            >
              <Plus size={14} className="stroke-[3.5px]" />
              <span>Create Coupon</span>
            </button>
          </div>

          {/* Coupons tickets design layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {promotions.length === 0 ? (
              <div className="col-span-full bg-white py-16 text-center text-gray-400 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm">
                No promotions structured inside checkout tables currently.
              </div>
            ) : (
              promotions.map((promo) => (
                <div 
                  key={promo.id} 
                  id={`coupon-card-${promo.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between border-l-4 border-l-[#F5C518] relative overflow-hidden group select-none"
                >
                  {/* Decorative ticket notch circles */}
                  <span className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border border-gray-200 z-10" />
                  <span className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border border-gray-200 z-10" />

                  {/* Body Content */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* Coupon Code badge */}
                        <span className="inline-block bg-[#F5C518]/15 text-amber-700 text-xs font-mono font-black px-3 py-1 rounded-lg tracking-widest border border-[#F5C518]/30 select-all shadow-2xs">
                          {promo.code}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-2 truncate max-w-[180px]">
                          {promo.title}
                        </h4>
                      </div>

                      {/* Status badge pill */}
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        promo.status === "Active" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                          : promo.status === "Scheduled"
                          ? "bg-blue-50 text-blue-800 border-blue-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}>
                        {promo.status}
                      </span>
                    </div>

                    {/* Rate and configuration specifics */}
                    <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-left">
                      <div>
                        <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-black leading-none">Discount</span>
                        <span className="font-display font-black text-slate-950 text-sm mt-1.5 block">
                          {promo.discountType === "Percentage" ? `${promo.discountValue}%` : formatLKR(promo.discountValue)}
                        </span>
                      </div>
                      
                      <div className="border-l border-gray-150 pl-3">
                        <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-black leading-none">Min Spend</span>
                        <span className="font-mono text-xs font-extrabold text-slate-650 mt-1.5 block">
                          {promo.minOrderAmount > 0 ? formatLKR(promo.minOrderAmount) : "N/A"}
                        </span>
                      </div>

                      <div className="border-l border-gray-150 pl-3">
                        <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-black leading-none">Redeems</span>
                        <span className="font-mono text-[10px] font-extrabold text-slate-900 mt-1.5 block truncate">
                          🔋 {promo.useCount} uses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer details + controller trigger bounds */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-4 pt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 font-medium font-sans">
                        <Calendar size={11} className="text-gray-400" />
                        <span>Expiry: {promo.endDate}</span>
                      </span>
                      {promo.usageLimit && (
                        <span className="block text-[9px] font-bold text-slate-500 font-mono">
                          Limit: {promo.usageLimit}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-promo-${promo.id}`}
                        onClick={() => openEditCoupon(promo)}
                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-700 hover:text-black rounded transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                        title="Edit coupon"
                      >
                        <Edit size={12} className="stroke-[2.5px]" />
                      </button>
                      
                      <button
                        id={`btn-delete-promo-${promo.id}`}
                        onClick={() => {
                          if (confirm(`Revoke and trash campaign voucher "${promo.code}"?`)) {
                            deletePromotion(promo.id);
                            triggerFeedback(`Coupon code "${promo.code}" deleted!`);
                          }
                        }}
                        className="p-1 px-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete voucher permanently"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DIALOG DICTIONARY: BANNER FORM MODAL (COMPLEX SLIDER BUILDER WITH LINK ROUTING)
          ══════════════════════════════════════════ */}
      {isBannerModalOpen && (
        <div 
          id="modal-banner-enclosure"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-100">
            
            {/* Header Area */}
            <div className="p-5 border-b border-gray-205 bg-white flex items-center justify-between sticky top-0 shrink-0">
              <div>
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Colombo campaign gateway</span>
                <h3 className="font-display font-black text-base text-slate-950 mt-0.5">
                  {editingBanner ? "Modify Sliding Banner Design" : "Deploy Slider Media Node"}
                </h3>
              </div>
              <button 
                onClick={() => setIsBannerModalOpen(false)} 
                className="text-gray-400 hover:text-black cursor-pointer p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scroll form */}
            <form onSubmit={handleBannerSubmit} className="p-6 overflow-y-auto max-h-[82vh] space-y-4">
              
              {/* Placement Node Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Placement Target Slot *</label>
                <select
                  id="form-banner-slot"
                  value={bSlot}
                  onChange={(e) => setBSlot(e.target.value as any)}
                  className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="Home Hero">Home Hero Slider</option>
                  <option value="Category Offer">Category Offer grid block</option>
                  <option value="Promo Bar">Bottom Promo Ribbon banner</option>
                </select>
              </div>

              {/* Title parameters */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Banner Caption Header *</label>
                  <input
                    id="form-banner-title"
                    type="text"
                    required
                    placeholder="e.g. 50% discount on first 5 kottu orders"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-950 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subcaption / Description</label>
                  <input
                    id="form-banner-subtitle"
                    type="text"
                    placeholder="e.g. Valid only on select payment partners"
                    value={bSubtitle}
                    onChange={(e) => setBSubtitle(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Upload image recommended width */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Visual Banner Asset * (800x300px recommended)
                </label>

                {/* Drag drop area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setBannerDragOver(true); }}
                  onDragLeave={() => setBannerDragOver(false)}
                  onDrop={handleBannerFileDrop}
                  onClick={() => bannerFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer flex flex-col items-center justify-center min-h-[110px] transition-all mb-2 ${
                    bannerDragOver 
                      ? "border-[#F5C518] bg-[#F5C518]/5"
                      : "border-gray-200 hover:border-[#F5C518] bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <input
                    id="form-banner-image-uploader"
                    type="file"
                    accept="image/*"
                    ref={bannerFileInputRef}
                    onChange={handleBannerFileSelect}
                    className="hidden"
                  />
                  {bannerUploadProgress !== null ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 size={24} className="text-[#F5C518] animate-spin" />
                      <span className="text-[10px] font-bold text-gray-500">Uploading: {bannerUploadProgress}%</span>
                    </div>
                  ) : bImage ? (
                    <div className="w-full h-16 rounded overflow-hidden relative">
                      <img src={bImage} alt="Banner Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
                        <span className="text-[9px] text-white font-extrabold uppercase bg-black/50 px-2 py-0.5 rounded">Change Design Asset</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-gray-400">
                      <Upload size={18} className="mx-auto" />
                      <p className="text-[10px] font-bold">Drag & drop graphic banner, or click to upload</p>
                      <p className="text-[8px]">Accepts JPEG / PNG standard landscape resolutions</p>
                    </div>
                  )}
                </div>

                {/* Manual text backup */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block shrink-0">Asset URL:</span>
                  <input
                    id="form-banner-image"
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bImage}
                    onChange={(e) => setBImage(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-1 focus:ring-[#F5C518] text-[10px] py-1.5 px-2.5 rounded-md outline-none text-gray-650 font-medium truncate"
                  />
                </div>
              </div>

              {/* Dynamic Link routing system block: Link to Category | Product | Custom URL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Configure Interactive Redirection Link</span>
                
                <div className="grid grid-cols-3 gap-1.5 shrink-0">
                  {(["url", "category", "product"] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { setBLinkType(option); setBLinkTargetId(""); }}
                      className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        bLinkType === option
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-white border-gray-200 text-gray-500 hover:text-black"
                      }`}
                    >
                      {option === "url" ? "Custom URL" : option === "category" ? "To Category" : "To Product"}
                    </button>
                  ))}
                </div>

                {/* Link inputs depending layout */}
                {bLinkType === "category" && (
                  <div>
                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Target Category *</label>
                    <select
                      id="form-banner-target-category"
                      required
                      value={bLinkTargetId}
                      onChange={(e) => setBLinkTargetId(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs py-2 px-2.5 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Category link --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name} (/{c.slug})</option>
                      ))}
                    </select>
                  </div>
                )}

                {bLinkType === "product" && (
                  <div>
                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Target Culinary dish *</label>
                    <select
                      id="form-banner-target-product"
                      required
                      value={bLinkTargetId}
                      onChange={(e) => setBLinkTargetId(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs py-2 px-2.5 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Product dish --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatLKR(p.price)})</option>
                      ))}
                    </select>
                  </div>
                )}

                {bLinkType === "url" && (
                  <div>
                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Link Target URL *</label>
                    <input
                      id="form-banner-link"
                      type="text"
                      required
                      placeholder="e.g. /search?query=kottu"
                      value={bCustomUrl}
                      onChange={(e) => setBCustomUrl(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs py-2 px-2.5 rounded-lg outline-none text-slate-800 font-mono shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Schedule and Active triggers */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Schedule Publish</label>
                  <input
                    id="form-banner-start"
                    type="date"
                    required
                    value={bStartDate}
                    onChange={(e) => setBStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2 px-2 rounded-lg outline-none text-slate-850 font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Schedule Expiry</label>
                  <input
                    id="form-banner-end"
                    type="date"
                    required
                    value={bEndDate}
                    onChange={(e) => setBEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2 px-2 rounded-lg outline-none text-slate-850 font-medium font-mono"
                  />
                </div>
              </div>

              {/* Toggle switch for display */}
              <div className="bg-slate-50 p-3 rounded-lg border border-gray-150 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-xs text-slate-950">Active Display Trigger</span>
                  <span className="block text-[9px] text-gray-400">Toggles visibility instantly inside client layout sliders</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBStatus(bStatus === "Active" ? "Inactive" : "Active")}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    bStatus === "Active" ? "bg-[#F5C518]" : "bg-gray-200"
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-xs transform transition-transform duration-200 ${
                    bStatus === "Active" ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-150 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-black border border-gray-205 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  id="btn-submit-banner-form"
                  type="submit"
                  className="px-6 py-2 bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 uppercase tracking-widest"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DIALOG DICTIONARY: COUPON FORM MODAL (COMPLEX TICKET BUILDER)
          ══════════════════════════════════════════ */}
      {isCouponModalOpen && (
        <div 
          id="modal-coupon-enclosure"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-100">
            
            {/* Header Area */}
            <div className="p-5 border-b border-gray-205 bg-white flex items-center justify-between sticky top-0 shrink-0">
              <div>
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Zippi LK Promotions hub</span>
                <h3 className="font-display font-black text-base text-slate-950 mt-0.5">
                  {editingCoupon ? "Modify Discount Coupon Schema" : "Instantiate Discount Voucher"}
                </h3>
              </div>
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="text-gray-400 hover:text-black cursor-pointer p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scroll form */}
            <form onSubmit={handleCouponSubmit} className="p-6 overflow-y-auto max-h-[82vh] space-y-4">
              
              <div className="grid grid-cols-2 gap-3 shrink-0">
                {/* Code (e.g. FRESH10) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Code *</label>
                  <input
                    id="form-promo-code"
                    type="text"
                    required
                    placeholder="e.g. FRESH10"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none font-mono font-black text-slate-950 uppercase"
                  />
                </div>

                {/* Discount type (percentage or fixed amount) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Discount Type *</label>
                  <select
                    id="form-promo-type"
                    value={cType}
                    onChange={(e) => setCType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Flat Amount (Rs.)</option>
                  </select>
                </div>
              </div>

              {/* Title Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Label Title *</label>
                <input
                  id="form-promo-title"
                  type="text"
                  required
                  placeholder="e.g. 10% Discount for First-Time Orders"
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-850 font-semibold"
                />
              </div>

              {/* Discount Value + Minimum Spend */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Value Rate *</label>
                  <input
                    id="form-promo-value"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={cValue}
                    onChange={(e) => setCValue(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none font-bold text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Min Spend (Rs.)</label>
                  <input
                    id="form-promo-minspend"
                    type="number"
                    min="0"
                    required
                    placeholder="1000"
                    value={cMinSpend}
                    onChange={(e) => setCMinSpend(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none font-mono text-slate-750"
                  />
                </div>
              </div>

              {/* Date Limits */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                  <input
                    id="form-promo-start"
                    type="date"
                    required
                    value={cStart}
                    onChange={(e) => setCStart(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2 px-2.5 rounded-lg outline-none text-slate-650 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input
                    id="form-promo-end"
                    type="date"
                    required
                    value={cEnd}
                    onChange={(e) => setCEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs py-2 px-2.5 rounded-lg outline-none text-slate-650 font-mono font-medium"
                  />
                </div>
              </div>

              {/* One-use Limit selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Redeem Usage Constraints</label>
                <div className="grid grid-cols-2 gap-2 shrink-0">
                  {(["One-use", "Unlimited"] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCLimitType(option)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        cLimitType === option
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:text-black"
                      }`}
                    >
                      {option === "One-use" ? "One-use Customer Limit" : "Unlimited Redemptions"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Initial status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">State Status</label>
                <select
                  id="form-promo-status"
                  value={cStatus}
                  onChange={(e) => setCStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="Active">Active & Deploy immediately</option>
                  <option value="Scheduled">Scheduled Plan</option>
                  <option value="Expired">Pre-Expired Out</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-150 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-black border border-gray-205 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  id="btn-submit-promo-form"
                  type="submit"
                  className="px-6 py-2 bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 uppercase tracking-widest"
                >
                  Confirm coupon
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
