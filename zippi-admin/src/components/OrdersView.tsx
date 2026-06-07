import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Clock, 
  Bike, 
  X, 
  SlidersHorizontal,
  Printer,
  Eye,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Package,
  Calendar,
  FileText,
  Truck,
  Check,
  ShoppingBag,
  Trash
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Order, OrderStatus, Rider, Product } from "../types";

export const OrdersView: React.FC = () => {
  const { 
    orders, riders, products,
    updateOrderStatus, assignRiderToOrder, updateOrder 
  } = usePortal();

  // Primary states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Detailed Modal Focus
  const [focusedOrderDetail, setFocusedOrderDetail] = useState<Order | null>(null);

  // Invoice POS print modal focus
  const [printableInvoiceOrder, setPrintableInvoiceOrder] = useState<Order | null>(null);

  // Status feedback alerts
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const triggerFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Status List filters
  const STATUS_CATEGORIES = ["all", "pending", "preparing", "dispatched", "arriving", "delivered", "cancelled"];

  // Helper: Format Currency (LKR)
  const formatLKR = (val: number) => {
    return `Rs. ${Math.round(val).toLocaleString()}`;
  };

  // Helper: Time Format
  const formatTime = (isoString: string) => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "12:00 PM";
    }
  };

  // Helper: Date Format
  const formatDate = (isoString: string) => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Jun 7, 2026";
    }
  };

  // Deterministic Mock Delivery Instructions
  const getDeliveryInstructions = (orderId: string) => {
    const instructions: Record<string, string> = {
      "ZIP-88219": "Ring doorbell twice, leave with tower lobby guard. Customer has pre-paid online.",
      "ZIP-88218": "Call before arrival, gate has automatic access pass code. Collect cash carefully.",
      "ZIP-88217": "Drop off at receptionist counter, 1st floor of office container. Leave receipt copy.",
      "ZIP-88216": "Do not ring the bell or honk bike, toddler sleeping in private annex.",
      "ZIP-88215": "Phone first, elderly relative will come to gate. Exact change is ready in bag.",
      "ZIP-88214": "Drop directly into green metal resident mailbox in front of white porch.",
    };
    return instructions[orderId] || "Deliver directly to customer doorstep. Wear sanitised delivery gear.";
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Find product details
  const getProductImage = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    return prod?.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150";
  };

  // Status Badge styling helper
  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-100/85 text-amber-800 border-amber-200/80";
      case "preparing":
        return "bg-sky-100/85 text-sky-800 border-sky-200/80";
      case "dispatched":
        return "bg-purple-100/85 text-purple-800 border-purple-200/80";
      case "arriving":
        return "bg-indigo-100/85 text-indigo-800 border-indigo-200/80";
      case "delivered":
        return "bg-emerald-100/85 text-emerald-800 border-emerald-200/80";
      case "cancelled":
        return "bg-rose-100/85 text-rose-800 border-rose-200/80";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Retrieve assigned rider name / vehicle
  const getAssignedRider = (riderId?: string) => {
    if (!riderId) return null;
    return riders.find(r => r.id === riderId);
  };

  // Direct trigger to browser standard window printing routines
  const handlePrintAction = (order: Order) => {
    setPrintableInvoiceOrder(order);
    // Let DOM render before popping dialog
    setTimeout(() => {
      window.print();
    }, 450);
  };

  return (
    <div id="orders-view-main" className="space-y-6">
      
      {/* Visual Feedback Banner */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-bounce flex items-center gap-2.5 text-xs font-bold ${
          feedback.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <CheckCircle size={15} />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none">Deliveries Command</h2>
          <p className="text-xs text-slate-450 mt-1">
            Dispatch, assign riders, update order processes and print high-fidelity thermal POS invoices dynamically.
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER BUTTONS TAB BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        
        {/* Tab Filters */}
        <div id="status-filter-tabs" className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {STATUS_CATEGORIES.map(cat => {
            const count = cat === "all" 
              ? orders.length 
              : orders.filter(o => o.status === cat).length;
            
            return (
              <button
                key={cat}
                id={`tab-btn-status-${cat}`}
                onClick={() => setSelectedStatus(cat)}
                className={`cursor-pointer px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 border ${
                  selectedStatus === cat
                    ? "bg-[#F5C518] text-black border-[#F5C518] shadow-sm"
                    : "bg-gray-50/50 hover:bg-gray-100 text-slate-550 border-gray-200/80 hover:text-slate-900"
                }`}
              >
                <span>{cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 leading-none font-mono ${
                  selectedStatus === cat ? "bg-slate-950/20 text-slate-950" : "bg-gray-200/50 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search by ID / Customer */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Search Order Number, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9.5 pr-4 rounded-lg outline-none text-slate-950 font-bold"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-slate-900 text-[10px] font-bold"
            >
              Clear
            </button>
          )}
        </div>

      </div>

      {/* CORE LIVE ORDERS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table id="orders-catalog-table" className="w-full text-left border-collapse">
            
            {/* Table Head */}
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-extrabold text-slate-450 border-b border-gray-150">
              <tr>
                <th className="py-4 px-5">Order#</th>
                <th className="py-4 px-4">Customer Info</th>
                <th className="py-4 px-4">Items Summary</th>
                <th className="py-4 px-4 text-right">Total (LKR)</th>
                <th className="py-4 px-4 text-center">Payment</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Time</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Content */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-450 font-sans font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingBag size={30} className="text-gray-300 animate-pulse" />
                      <p>No client deliveries detected under this status filter.</p>
                      <p className="text-[10px] text-gray-400 font-normal">Try searching with other statuses or keys.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => {
                  const riderAssigned = getAssignedRider(ord.assignedRiderId);
                  const itemCount = ord.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr 
                      key={ord.id} 
                      id={`order-row-${ord.id}`}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      
                      {/* 1. Order Number */}
                      <td className="py-4 px-5 font-mono font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                        {ord.id}
                      </td>

                      {/* 2. Customer Name & Phone */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 font-sans text-xs">
                          {ord.customerName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium font-mono mt-0.5 flex items-center gap-1 text-slate-650">
                          <Phone size={10} className="text-gray-300" />
                          <span>{ord.customerPhone}</span>
                        </div>
                      </td>

                      {/* 3. Items Summary */}
                      <td className="py-4 px-4 max-w-[210px] truncate">
                        <div className="font-medium text-slate-800 truncate" title={ord.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}>
                          {ord.items.map(i => i.name).join(", ")}
                        </div>
                        <div className="text-[10px] font-mono text-amber-600 font-bold mt-1">
                          {itemCount} {itemCount === 1 ? "item" : "items"} packed
                        </div>
                      </td>

                      {/* 4. Total Amount LKR */}
                      <td className="py-4 px-4 font-mono font-black text-slate-900 text-right text-xs">
                        {formatLKR(ord.total)}
                      </td>

                      {/* 5. Payment Method */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          ord.paymentMethod === "COD" 
                            ? "bg-amber-100 text-amber-800 border-amber-250" 
                            : "bg-teal-50 text-teal-800 border-teal-200"
                        }`}>
                          {ord.paymentMethod}
                        </span>
                      </td>

                      {/* 6. Status Tag */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>

                      {/* 7. Time/Date Timestamp */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-450">
                        <div>{formatTime(ord.date)}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5 font-normal">{formatDate(ord.date)}</div>
                      </td>

                      {/* 8. Interactive Actions row */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Details modal shortcut */}
                          <button
                            id={`btn-view-${ord.id}`}
                            onClick={() => setFocusedOrderDetail(ord)}
                            className="p-1.5 hover:bg-[#F5C518]/10 text-slate-650 hover:text-black hover:border-amber-400 rounded-lg border border-transparent transition-all cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye size={13} className="stroke-[2.5px]" />
                          </button>

                          {/* Print POS Invoice shortcut */}
                          <button
                            id={`btn-print-${ord.id}`}
                            onClick={() => setPrintableInvoiceOrder(ord)}
                            className="p-1.5 hover:bg-slate-100 text-indigo-700 hover:text-indigo-950 hover:border-indigo-200 rounded-lg border border-transparent transition-all cursor-pointer"
                            title="Print POS Invoice Draft"
                          >
                            <Printer size={13} className="stroke-[2.5px]" />
                          </button>

                          {/* Assign Rider dropdown selector */}
                          <div id={`dropdown-rider-wrap-${ord.id}`} className="relative inline-block align-middle select-none">
                            <select
                              id={`select-rider-${ord.id}`}
                              value={ord.assignedRiderId || ""}
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignRiderToOrder(ord.id, e.target.value);
                                  triggerFeedback(`Rider assigned to order ${ord.id}!`);
                                }
                              }}
                              className="bg-transparent hover:bg-slate-100 text-slate-700 hover:text-black text-[10px] font-black py-1.5 px-2 rounded-lg outline-none border border-gray-200 cursor-pointer text-center max-w-[110px] truncate"
                            >
                              <option value="">🚲 No Rider</option>
                              {riders
                                .filter(r => r.status !== "Offline")
                                .map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} ({r.vehicleType})
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Change status inline dropdown */}
                          <div id={`dropdown-status-wrap-${ord.id}`} className="relative inline-block align-middle select-none">
                            <select
                              id={`select-status-${ord.id}`}
                              value={ord.status}
                              onChange={(e) => {
                                updateOrderStatus(ord.id, e.target.value as OrderStatus);
                                triggerFeedback(`Order ${ord.id} status mapped to ${e.target.value}!`);
                              }}
                              className="bg-slate-100/50 hover:bg-[#F5C518]/15 hover:border-amber-400 text-slate-800 text-[10px] font-black py-1.5 px-2 rounded-lg outline-none border border-gray-200 cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="arriving">Arriving</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DIALOG/MODAL: ORDER DETAIL MODAL ENCLOSURE
          ══════════════════════════════════════════ */}
      {focusedOrderDetail && (
        <div 
          id="order-detail-modal-overlay"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setFocusedOrderDetail(null)}
        >
          <div 
            id="order-detail-modal"
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">Real-time Delivery Logs</span>
                <h3 className="font-display font-black text-lg text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>Order: <span className="font-mono text-[#F5C518] text-xl font-black">{focusedOrderDetail.id}</span></span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(focusedOrderDetail.status)}`}>
                    {focusedOrderDetail.status}
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400 font-mono font-medium mt-1">
                  Placed on {formatDate(focusedOrderDetail.date)} at {formatTime(focusedOrderDetail.date)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="modal-btn-print-invoice"
                  onClick={() => {
                    setPrintableInvoiceOrder(focusedOrderDetail);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer border border-gray-200"
                >
                  <Printer size={13} className="stroke-[2.5px]" />
                  <span>POS Receipt</span>
                </button>
                <button 
                  onClick={() => setFocusedOrderDetail(null)}
                  className="text-gray-450 hover:text-black cursor-pointer p-1.5 bg-white shadow-xs rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Scroll Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Client and Address block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-gray-150">
                
                {/* Customer Details */}
                <div className="space-y-2.5 text-xs">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</span>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <User size={14} className="text-[#F5C518]" />
                    <span className="text-sm">{focusedOrderDetail.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-650 font-semibold pl-0.5">
                    <Phone size={12} className="text-gray-400" />
                    <span>{focusedOrderDetail.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-500 pl-0.5">
                    <Mail size={12} className="text-gray-400" />
                    <span className="truncate">{focusedOrderDetail.customerEmail}</span>
                  </div>
                </div>

                {/* Shipping Location */}
                <div className="space-y-2.5 text-xs">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
                  <div className="flex gap-2 text-slate-800 font-bold leading-relaxed">
                    <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{focusedOrderDetail.address}</span>
                  </div>
                  
                  {/* Delivery instructions block */}
                  <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-amber-800 text-[11px] font-semibold leading-relaxed mt-1">
                    <span className="block text-[8px] font-black uppercase text-amber-700 tracking-wider mb-0.5">Delivery Notes</span>
                    "{getDeliveryInstructions(focusedOrderDetail.id)}"
                  </div>
                </div>

              </div>

              {/* Items List inside Cart */}
              <div className="space-y-3">
                <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Dishes & Cart Items ({focusedOrderDetail.items.length})</span>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150 shadow-2xs">
                  {focusedOrderDetail.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      
                      {/* Image and name */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                          <img 
                            src={getProductImage(it.productId)} 
                            alt={it.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs">
                            {it.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatLKR(it.price)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Cumulative price */}
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 rounded-lg px-2 py-1 leading-none border border-amber-100">
                          {it.quantity}x
                        </span>
                        <span className="inline-block w-20 font-mono font-black text-slate-950 text-right text-xs pl-3">
                          {formatLKR(it.price * it.quantity)}
                        </span>
                      </div>

                    </div>
                  ))}

                  {/* Calculations row footer */}
                  <div className="p-4 bg-slate-50 flex flex-col gap-2 font-semibold text-xs border-t border-gray-200">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Packaging & Base Delivery</span>
                      <span className="font-mono text-slate-700">Rs. 150</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Payment Method</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded leading-none border border-slate-305">{focusedOrderDetail.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-950 font-black text-sm pt-2 border-t border-dashed border-gray-300">
                      <span className="font-sans leading-none">Total Customer Bill</span>
                      <span className="font-mono text-[#F5C518] bg-slate-950 rounded-xl px-3 py-1 text-md leading-none">{formatLKR(focusedOrderDetail.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline Progress block */}
              <div className="space-y-4">
                <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Active Delivery Progression</span>
                
                {/* Horizontal / Vertical Timeline flow */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-semibold select-none">
                  {[
                    { key: "pending", label: "Pending", sub: "Incoming Request" },
                    { key: "preparing", label: "Preparing", sub: "Kitchen Approved" },
                    { key: "dispatched", label: "Dispatched", sub: "Rider Out" },
                    { key: "arriving", label: "Arriving", sub: "Rider Near" },
                    { key: "delivered", label: "Delivered", sub: "Completed Success" }
                  ].map((stage, sIdx) => {
                    const statusSequence = ["pending", "preparing", "dispatched", "arriving", "delivered"];
                    const currentIdx = statusSequence.indexOf(focusedOrderDetail.status);
                    const stageIdx = statusSequence.indexOf(stage.key);

                    const isCurrent = focusedOrderDetail.status === stage.key;
                    const isPassed = stageIdx <= currentIdx && focusedOrderDetail.status !== "cancelled";

                    return (
                      <div 
                        key={stage.key} 
                        className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
                          isCurrent 
                            ? "bg-[#F5C518]/15 border-[#F5C518] text-[#F5C518]" 
                            : isPassed 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                            : "bg-slate-50 text-slate-450 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-center shrink-0">
                          {isPassed ? (
                            <CheckCircle size={14} className="text-emerald-700 animate-pulse" />
                          ) : (
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${isCurrent ? "border-[#F5C518]" : "border-gray-300"}`} />
                          )}
                        </div>
                        <div className="mt-1">
                          <span className="block font-black text-[11px] font-sans truncate">{stage.label}</span>
                          <span className="block text-[8px] text-gray-400 font-normal leading-tight font-mono whitespace-nowrap mt-0.5">{stage.sub}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Cancelled timeline stage card if active */}
                  {focusedOrderDetail.status === "cancelled" && (
                    <div className="col-span-1 p-3 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 flex flex-col justify-between h-20 text-center">
                      <div className="flex items-center justify-center">
                        <AlertTriangle size={15} className="text-red-650" />
                      </div>
                      <div className="mt-1">
                        <span className="block font-black text-[11px]">Cancelled</span>
                        <span className="block text-[8px] text-rose-500 font-mono">Order Refused</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Rider Allocation and status controls inside modal */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                
                {/* Status selection widget */}
                <div className="space-y-2 text-xs">
                  <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Update Delivery Status</span>
                  <div className="flex items-center gap-2">
                    <select
                      id="modal-status-select-control"
                      value={focusedOrderDetail.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value as OrderStatus;
                        updateOrderStatus(focusedOrderDetail.id, nextStatus);
                        setFocusedOrderDetail(prev => prev ? { ...prev, status: nextStatus } : null);
                        triggerFeedback(`Updated order status to ${nextStatus}!`);
                      }}
                      className="w-full bg-white border border-gray-300 font-black text-xs py-2.5 px-3.5 rounded-xl outline-none text-slate-800 cursor-pointer shadow-2xs"
                    >
                      <option value="pending">🕒 Pending Booking</option>
                      <option value="preparing">✅ Preparing Kitchen</option>
                      <option value="dispatched">🚴 Dispatched (Rider Out)</option>
                      <option value="arriving">📍 Arriving (Rider Near)</option>
                      <option value="delivered">⭐ Delivered & Closed</option>
                      <option value="cancelled">❌ Cancelled / Denied</option>
                    </select>
                  </div>
                </div>

                {/* Rider allocation */}
                <div className="space-y-2 text-xs">
                  <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Colombo Roster fleet Assignment</span>
                  <div className="flex items-center gap-2">
                    <select
                      id="modal-rider-select-control"
                      value={focusedOrderDetail.assignedRiderId || ""}
                      onChange={(e) => {
                        const riderId = e.target.value;
                        if (riderId) {
                          assignRiderToOrder(focusedOrderDetail.id, riderId);
                          setFocusedOrderDetail(prev => prev ? { ...prev, assignedRiderId: riderId } : null);
                          triggerFeedback(`On-duty rider dispatched!`);
                        }
                      }}
                      className="w-full bg-white border border-gray-300 font-black text-xs py-2.5 px-3.5 rounded-xl outline-none text-slate-800 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Roster Rider --</option>
                      {riders
                        .filter(r => r.status !== "Offline")
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            🚴 {r.name} ({r.vehicleType} &bull; Rating {r.rating})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom control panel actions */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-400 font-mono">ZIPPI Colombo Delivery Core Engine</span>
              <button
                onClick={() => setFocusedOrderDetail(null)}
                className="bg-slate-900 hover:bg-black text-white font-black text-xs py-2 px-5 rounded-lg shadow-sm transition-all text-center cursor-pointer block"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          THERMAL RECEIPT INVOICE MODAL ENCLOSURE (POS PRINT DRAFT DESIGN)
          ══════════════════════════════════════════ */}
      {printableInvoiceOrder && (
        <div 
          id="invoice-print-modal-overlay"
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setPrintableInvoiceOrder(null)}
        >
          <div 
            id="invoice-print-modal"
            className="bg-[#2D2D30] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-450 font-bold text-xs font-mono">
                <Printer size={15} />
                <span>Standard Thermal POS Invoice Draft</span>
              </div>
              <button 
                onClick={() => setPrintableInvoiceOrder(null)}
                className="text-gray-400 hover:text-white cursor-pointer bg-slate-800 p-1 rounded-md transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* In-Modal Receipt Rendering Scroll Box */}
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-[#252526]">
              
              {/* Thermal Paper Block */}
              <div 
                id="thermal-pos-paper"
                className="bg-[#FFFDF3] text-slate-900 p-5 rounded-md shadow-lg border border-dashed border-yellow-800/10 w-full max-w-[280px] font-mono text-[9px] uppercase leading-relaxed text-left flex flex-col justify-between"
              >
                
                {/* Receipt Header */}
                <div className="text-center space-y-1">
                  <h1 className="font-black text-sm tracking-tight border-b-2 border-dashed border-slate-700 pb-1 text-black font-sans leading-none flex items-center justify-center gap-1">
                    <span className="bg-slate-950 text-[#F5C518] px-1.5 py-0.5 rounded text-xs font-black">Z</span>
                    <span>ZIPPI KITCHEN</span>
                  </h1>
                  <p className="text-[7px] text-gray-500 font-bold">Premium Kottu & Biryani Dispatch</p>
                  <p className="text-[7px] text-gray-500 font-normal">Colombo 03 Office, Sri Lanka</p>
                  <p className="text-[7px] text-gray-400 font-normal">Hotline: +94 11 255 1212</p>
                </div>

                {/* Receipt Divider */}
                <div className="text-slate-450 border-t border-dashed border-slate-450 my-2 pt-1 font-bold text-[8px]">
                  Order: {printableInvoiceOrder.id}
                </div>

                {/* Date and Customer Meta */}
                <div className="space-y-1 text-[8px] tracking-wide text-slate-850">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(printableInvoiceOrder.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{formatTime(printableInvoiceOrder.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paying:</span>
                    <span className="font-extrabold">{printableInvoiceOrder.paymentMethod}</span>
                  </div>
                  <div className="border-b border-dotted border-slate-300 pb-1 flex justify-between">
                    <span>Status:</span>
                    <span className="font-extrabold text-indigo-700">{printableInvoiceOrder.status}</span>
                  </div>

                  <div className="pt-1.5 font-bold text-black flex flex-col gap-0.5 text-[8px]">
                    <span>To: {printableInvoiceOrder.customerName}</span>
                    <span>ph: {printableInvoiceOrder.customerPhone}</span>
                  </div>
                  <div className="text-[7px] text-slate-500 font-normal leading-normal line-clamp-2" title={printableInvoiceOrder.address}>
                    Loc: {printableInvoiceOrder.address}
                  </div>
                </div>

                {/* Items loop */}
                <div className="border-t border-dashed border-slate-450 my-2 pt-2 space-y-1.5">
                  <div className="flex justify-between text-[7px] font-bold text-black border-b border-dotted border-slate-300 pb-1">
                    <span>Item & Qty</span>
                    <span className="text-right">Price</span>
                  </div>
                  
                  {printableInvoiceOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-[8px] text-slate-900">
                      <div className="max-w-[160px] truncate">
                        {it.quantity}x {it.name}
                      </div>
                      <span className="text-right whitespace-nowrap">{formatLKR(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-dashed border-slate-450 pt-2 space-y-1 text-[8px] text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatLKR(printableInvoiceOrder.total - 150)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>base fee:</span>
                    <span>Rs. 150</span>
                  </div>
                  <div className="flex justify-between font-bold text-black text-[9px] border-t border-dotted border-slate-450 pt-1">
                    <span>TOTAL BILL:</span>
                    <span>{formatLKR(printableInvoiceOrder.total)}</span>
                  </div>
                </div>

                {/* Barcode / QR Decorator */}
                <div className="mt-4 text-center space-y-2">
                  <div className="bg-slate-950 text-white font-mono text-[6px] tracking-widest p-1.5 rounded flex items-center justify-center font-normal leading-none select-none border border-slate-800">
                    ||||| | ||| |||| | ||||| | || || 
                  </div>
                  <p className="text-[7px] text-gray-500 font-bold leading-normal">
                    Thank you for dining with Zippi Express!
                  </p>
                  <p className="text-[6px] text-gray-400 font-normal leading-normal">
                    Powered by Colombo Delivery Command Gate
                  </p>
                </div>

              </div>

            </div>

            {/* Print Confirmation Actions footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 gap-3">
              <button
                onClick={() => setPrintableInvoiceOrder(null)}
                className="bg-slate-850 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer w-1/3 text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.print();
                  triggerFeedback("Initiated operating system print dialog successfully!", "success");
                }}
                className="bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer flex-1 text-center"
              >
                <Printer size={13} className="stroke-[2.5px]" />
                <span>Send to Browser Print</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
