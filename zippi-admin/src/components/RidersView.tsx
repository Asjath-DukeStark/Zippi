import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Star, 
  Mail, 
  Smartphone, 
  Bike, 
  X, 
  Check, 
  CheckCircle, 
  TrendingUp, 
  User, 
  MapPin, 
  CreditCard, 
  Lock, 
  Shield, 
  Activity,
  FileText,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Gauge,
  Phone
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { usePortal } from "../context/PortalContext";
import { Rider, RiderStatus, VehicleType } from "../types";

export const RidersView: React.FC = () => {
  const { riders, addRider, updateRider, deleteRider } = usePortal();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals focus state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // Status message feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add Rider form inputs
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rVehicleType, setRVehicleType] = useState<VehicleType>("Bike");
  const [rVehicleNumber, setRVehicleNumber] = useState("");
  const [rLicenseNumber, setRLicenseNumber] = useState("");

  // Submit Handler for onboarding form
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rPhone || !rEmail || !rPassword || !rVehicleNumber || !rLicenseNumber) {
      triggerToast("Please fill all required onboarding fields.", "error");
      return;
    }

    // Add rider to Context
    addRider({
      name: rName,
      phone: rPhone,
      vehicleType: rVehicleType,
      vehicleNumber: rVehicleNumber,
      status: "Online",
      rating: 5.0,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${rName.replace(/\s+/g, "")}`,
      email: rEmail,
      password: rPassword,
      licenseNumber: rLicenseNumber,
      role: "rider" // Explicitly assign user with role='rider'
    });

    // Reset Form Fields
    setRName("");
    setRPhone("");
    setREmail("");
    setRPassword("");
    setRVehicleType("Bike");
    setRVehicleNumber("");
    setRLicenseNumber("");
    setIsAddModalOpen(false);

    triggerToast(`Rider ${rName} onboarded and registered successfully with role 'rider'!`);
  };

  // Metric calculation helpers
  const totalRiders = riders.length;
  const onlineNow = riders.filter(r => r.status === "Online" || r.status === "On Delivery").length;
  const deliveriesToday = riders.reduce((acc, r) => acc + (r.todayDeliveries || 0), 0);
  const avgRating = totalRiders > 0 
    ? (riders.reduce((acc, r) => acc + (r.rating || 0), 0) / totalRiders).toFixed(1)
    : "0.0";

  // Filter riders list
  const filteredRiders = riders.filter(r => {
    const searchLow = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(searchLow) ||
      r.phone.includes(searchLow) ||
      r.vehicleNumber.toLowerCase().includes(searchLow) ||
      (r.email && r.email.toLowerCase().includes(searchLow))
    );
  });

  // Deterministic Mock "Last 10 Deliveries" Generator
  const getLast10Deliveries = (riderId: string) => {
    const getSeedId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };
    
    const seed = getSeedId(riderId);
    const locations = [
      "No 42, Galle Road, Colombo 03",
      "No 18/4, High Level Road, Nugegoda",
      "No 142, W.A. Silva Mawatha, Wellawatte",
      "78, Flower Road, Colombo 07",
      "No 10, Duplication Road, Colombo 04",
      "No 250, Union Place, Colombo 02",
      "56/3, Barnes Place, Colombo 07",
      "No 9, Dharmapala Mawatha, Colombo 03",
      "12, Havelock Road, Colombo 05",
      "No 34, Ward Place, Colombo 07"
    ];
    
    const customers = [
      "Minura Wijesekera",
      "Sajith Premadasa",
      "Heshani Fernando",
      "Ahamed Rilwan",
      "Nadeesha Dilhani",
      "Gayan Perera",
      "Ashan Silva",
      "Priyantha Bandara",
      "Fathima Shazna",
      "Tharindu Jayawardena"
    ];

    const items = [
      "Zippi Signature Chicken Dum Biryani",
      "Classic Sri Lankan Egg Kottu with Gravy",
      "Crispy Cheese and Garlic Naan",
      "Zippi Fire Butter Chicken Blast",
      "Colombo Seafood Mix Kottu",
      "Pol Sambol & Roast Paan Meal"
    ];

    const list = [];
    for (let i = 0; i < 10; i++) {
      const locIdx = (seed + i) % locations.length;
      const custIdx = (seed + i * 2) % customers.length;
      const itemIdx = (seed + i * 3) % items.length;
      const orderNum = 88200 + ((seed + i) % 1500);
      const amount = 850 + ((seed * (i + 1)) % 3200);
      const hoursAgo = (i + 1) * 3;
      const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }) + " - " + new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });

      list.push({
        orderId: `ZIP-${orderNum}`,
        customer: customers[custIdx],
        address: locations[locIdx],
        item: items[itemIdx],
        amount: amount,
        payout: Math.round(250 + (amount * 0.05)),
        date
      });
    }
    return list;
  };

  // Performance chart helper
  const getPerformanceChartData = (riderId: string) => {
    const getSeedId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };
    const seed = getSeedId(riderId);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    return days.map((day, idx) => {
      const deliveriesCount = 3 + ((seed + idx) % 10);
      const earningsAmt = deliveriesCount * 250 + ((seed * (idx + 1)) % 1200);
      return {
        day,
        deliveries: deliveriesCount,
        earnings: earningsAmt
      };
    });
  };

  return (
    <div id="riders-management-root" className="space-y-6">
      
      {/* Dynamic Notification Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-bounce flex items-center gap-2.5 text-xs font-bold ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-205 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-805"
        }`}>
          <CheckCircle size={15} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. METRICS/STATS ROW */}
      <div id="riders-stats-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div id="metric-total-riders" className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Registers Fleet</span>
            <span className="block text-3xl font-black text-slate-900 leading-none">{totalRiders}</span>
            <span className="block text-[10px] text-slate-450 mt-1 font-semibold">Registered driver roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-3xs shrink-0">
            <User size={20} className="text-amber-500" />
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric-online-now" className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Online Now</span>
            <span className="block text-3xl font-black text-emerald-600 leading-none">{onlineNow}</span>
            <span className="block text-[10px] text-emerald-700/80 mt-1 font-semibold">
              ● Active on Colombo streets
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-3xs shrink-0">
            <Activity size={20} className="animate-pulse" />
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric-deliveries-today" className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Deliveries Today</span>
            <span className="block text-3xl font-black text-slate-900 leading-none">{deliveriesToday}</span>
            <span className="block text-[10px] text-slate-450 mt-1 font-semibold">Meals shipped today</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-3xs shrink-0">
            <Bike size={20} className="text-indigo-500" />
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric-avg-rating" className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Avg Fleet Rating</span>
            <span className="block text-3xl font-black text-amber-500 leading-none">★ {avgRating}</span>
            <span className="block text-[10px] text-slate-450 mt-1 font-semibold">On-site client feedback</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-3xs shrink-0">
            <Star size={20} fill="currentColor" />
          </div>
        </div>

      </div>

      {/* 2. LIVE SEARCH AND ONBOARD CTA */}
      <div className="bg-white p-4 rounded-xl border border-gray-205 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        
        {/* Search input with icons */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            id="input-riders-search-field"
            type="text"
            placeholder="Search rider name, phone, plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9.5 pr-4 rounded-lg outline-none text-slate-950 font-bold"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 font-bold text-[10px]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Onboard submit button */}
        <button
          id="btn-trigger-onboard-modal"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all border border-transparent"
        >
          <Plus size={15} className="stroke-[2.5px]" />
          <span>Register New Rider</span>
        </button>

      </div>

      {/* 3. CORE RIDERS DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table id="riders-fleet-table" className="w-full text-left border-collapse">
            
            {/* Table Head */}
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-extrabold text-slate-450 border-b border-gray-150">
              <tr>
                <th className="py-4 px-5">Rider Info & Name</th>
                <th className="py-4 px-4">Contact Phone</th>
                <th className="py-4 px-4">Vehicle & Plates</th>
                <th className="py-4 px-4 text-center">System Status</th>
                <th className="py-4 px-4 text-center">Score Rating</th>
                <th className="py-4 px-4 text-center">Jobs Today</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-450 font-sans font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <User size={30} className="text-gray-300 animate-bounce" />
                      <p>No registers active on the Colombo dispatch grid.</p>
                      <p className="text-[10px] text-gray-400 font-normal">Try clearing search parameter filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRiders.map((r) => {
                  const isOnline = r.status === "Online" || r.status === "On Delivery";

                  return (
                    <tr 
                      key={r.id} 
                      id={`rider-row-${r.id}`}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRider(r)}
                    >
                      
                      {/* Name Column with Avatar image */}
                      <td className="py-4 px-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-gray-200 shadow-3xs shrink-0">
                          <img 
                            src={r.avatar} 
                            alt={r.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {r.name}
                          </div>
                          {r.email && (
                            <div className="text-[10px] text-slate-455 font-normal font-mono lowercase">
                              {r.email}
                            </div>
                          )}
                          {r.role && (
                            <span className="inline-block text-[8px] font-black uppercase text-amber-700 bg-amber-100 px-1 rounded-sm mt-0.5">
                              {r.role}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone metadata */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-700">
                        {r.phone}
                      </td>

                      {/* Vehicle properties */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-slate-800 flex items-center gap-1 capitalize">
                          <Bike size={11} className="text-amber-500" />
                          <span>{r.vehicleType}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">
                          {r.vehicleNumber}
                        </div>
                      </td>

                      {/* Status dot representation */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            r.status === "Online" 
                              ? "bg-emerald-500 animate-pulse" 
                              : r.status === "On Delivery"
                              ? "bg-indigo-500 animate-pulse"
                              : "bg-slate-350"
                          }`} />
                          
                          {/* Dropdown status changer */}
                          <select
                            id={`select-status-table-${r.id}`}
                            value={r.status}
                            onChange={(e) => {
                              updateRider({
                                ...r,
                                status: e.target.value as RiderStatus
                              });
                              triggerToast(`Rider ${r.name} status updated to ${e.target.value}!`);
                            }}
                            className="bg-transparent hover:bg-slate-100 text-slate-700 font-sans font-bold text-[10px] py-1 px-1.5 rounded border border-gray-200 cursor-pointer outline-none"
                          >
                            <option value="Online">Online</option>
                            <option value="On Delivery">Busy (Delivering)</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>
                      </td>

                      {/* Rating Score column */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-0.5 font-bold font-mono text-slate-800">
                          <Star size={11} fill="#F5C518" stroke="#F5C518" />
                          <span>{r.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Deliveries count today */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {r.todayDeliveries}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-details-${r.id}`}
                            onClick={() => setSelectedRider(r)}
                            className="text-[10px] font-black bg-slate-100 hover:bg-[#F5C518]/25 hover:text-black border border-gray-200/60 rounded-md py-1.5 px-2.5 cursor-pointer text-slate-700 transition"
                          >
                            View Stats
                          </button>
                          
                          <button
                            id={`btn-rm-rider-${r.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove rider ${r.name}? This will revoke their role access credentials.`)) {
                                deleteRider(r.id);
                                triggerToast(`Removed rider ${r.name} from Colombo registry.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md border border-transparent transition cursor-pointer"
                            title="Remove Rider permanently"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* 4. MODAL DIALOG: ONBOARD NEW RIDER */}
      {isAddModalOpen && (
        <div 
          id="onboard-modal-overlay" 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            id="onboard-modal-box"
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-150 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Head */}
            <div className="p-5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider font-mono">System Database Entry</span>
                <h3 className="font-display font-black text-slate-900 text-base mt-0.5">Onboard Dispatch Rider</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-slate-950 bg-white border border-gray-200 p-1 rounded-xl shadow-3xs cursor-pointer hover:bg-slate-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleOnboardSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Name field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Full Legal Name *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="form-rider-name"
                    type="text"
                    required
                    placeholder="e.g. Ruwan Weerasinghe"
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9 pr-3 rounded-lg outline-none text-slate-950 font-bold"
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1 font-mono">
                <label className="block text-[10px] font-black text-slate-455 uppercase tracking-wider font-sans">Phone Number *</label>
                <div className="relative">
                  <Smartphone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="form-rider-phone"
                    type="tel"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={rPhone}
                    onChange={(e) => setRPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9 pr-3 rounded-lg outline-none text-slate-950 font-bold"
                  />
                </div>
              </div>

              {/* Credentials Fields: Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Email Address (Rider User Login) *</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="form-rider-email"
                    type="email"
                    required
                    placeholder="ruwan@zippi.lk"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200/80 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9 pr-3 rounded-lg outline-none text-slate-950 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Credentials Fields: Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Credentials App Password *</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="form-rider-password"
                    type="password"
                    required
                    placeholder="Enter unique password"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9 pr-3 rounded-lg outline-none text-slate-950 font-mono font-bold"
                  />
                </div>
                <p className="text-[8px] text-gray-400 font-bold">This assigns and registers a portal user with role='rider'.</p>
              </div>

              {/* Grid 2 Column for Vehicle and plate */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Vehicle classification Selector */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Vehicle Type *</label>
                  <select
                    id="form-rider-vehicle-type-select"
                    value={rVehicleType}
                    onChange={(e) => setRVehicleType(e.target.value as VehicleType)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 text-xs py-2.5 px-2.5 rounded-lg outline-none text-slate-950 font-bold cursor-pointer"
                  >
                    <option value="motorbike">🏍️ Motorbike</option>
                    <option value="bicycle">🚲 Bicycle</option>
                    <option value="car">🚗 Car</option>
                    <option value="Bike">Motorbike (Bike)</option>
                    <option value="Scooter">Scooter Grid</option>
                    <option value="Three-Wheeler">Three-Wheeler Tuk</option>
                  </select>
                </div>

                {/* License Plate number */}
                <div className="space-y-1 font-mono">
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-wider font-sans">Vehicle Plate Number *</label>
                  <input
                    id="form-rider-vehicle-plate"
                    type="text"
                    required
                    placeholder="e.g. WP BHU-9205"
                    value={rVehicleNumber}
                    onChange={(e) => setRVehicleNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 px-3 rounded-lg outline-none text-slate-950 font-bold uppercase"
                  />
                </div>

              </div>

              {/* License plate card */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Driver's License Number *</label>
                <div className="relative">
                  <FileText size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="form-rider-license-number"
                    type="text"
                    required
                    placeholder="e.g. DL-293810239"
                    value={rLicenseNumber}
                    onChange={(e) => setRLicenseNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518]/30 placeholder:text-gray-400 text-xs py-2.5 pl-9 pr-3 rounded-lg outline-none text-slate-950 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Actions submit */}
              <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-onboard-signup"
                  type="submit"
                  className="px-5 py-2.5 bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Register On-duty
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL DIALOG: RIDER DETAIL MODAL */}
      {selectedRider && (
        <div 
          id="rider-detail-modal-overlay"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left font-sans"
          onClick={() => setSelectedRider(null)}
        >
          <div 
            id="rider-detail-modal-box"
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal header */}
            <div className="p-6 bg-slate-50 border-b border-gray-155 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">Performance & Analytics Telemetry</span>
                <h3 className="font-display font-black text-slate-900 text-xl mt-0.5 flex items-center gap-2">
                  <span>Roster File: <span className="text-amber-500 font-mono font-black">{selectedRider.id}</span></span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    selectedRider.status === "Online" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : selectedRider.status === "On Delivery"
                      ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                      : "bg-gray-50 text-gray-7  00 border-gray-200"
                  }`}>
                    {selectedRider.status}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRider(null)}
                className="text-gray-400 hover:text-slate-950 bg-white border border-gray-200 p-1.5 rounded-xl shadow-3xs cursor-pointer hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scroll Content Area */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Profile Card Summary & Weekly Earnings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Profile Info Card */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-gray-150 flex flex-col items-center justify-between space-y-4">
                  <div className="text-center space-y-2 w-full">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden bg-slate-50">
                      <img 
                        src={selectedRider.avatar} 
                        alt={selectedRider.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-tight">{selectedRider.name}</h4>
                      <span className="inline-block text-[9px] font-black uppercase text-amber-800 bg-amber-100 rounded px-1.5 py-0.5 mt-1 font-mono leading-none">
                        {selectedRider.role || "RIDER"}
                      </span>
                    </div>
                    
                    {/* Visual Star Ratings */}
                    <div className="flex items-center justify-center gap-0.5 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={12} 
                          fill={s <= Math.round(selectedRider.rating) ? "#F5C518" : "none"} 
                          stroke="#F5C518" 
                          className="stroke-[1.5px]"
                        />
                      ))}
                      <span className="text-xs font-mono font-bold text-slate-650 ml-1">({selectedRider.rating.toFixed(1)})</span>
                    </div>
                  </div>

                  {/* Meta data list */}
                  <div className="w-full divide-y divide-gray-150/70 text-xs pt-2">
                    <div className="py-2 flex justify-between gap-2 overflow-hidden">
                      <span className="text-slate-450 font-semibold uppercase text-[9px] tracking-wider">Phone contact</span>
                      <a href={`tel:${selectedRider.phone}`} className="font-mono font-bold text-amber-700 hover:underline flex items-center gap-1 shrink-0">
                        <Phone size={10} />
                        <span>{selectedRider.phone}</span>
                      </a>
                    </div>
                    <div className="py-2 flex justify-between gap-2 overflow-hidden">
                      <span className="text-slate-450 font-semibold uppercase text-[9px] tracking-wider">Email Node</span>
                      <span className="font-mono font-bold text-slate-700 truncate" title={selectedRider.email}>
                        {selectedRider.email || `${selectedRider.name.toLowerCase().replace(/\s+/g, "")}@zippi.lk`}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between gap-2">
                      <span className="text-slate-450 font-semibold uppercase text-[9px] tracking-wider">Vehicle Class</span>
                      <span className="font-bold text-slate-900 capitalize font-mono text-[10px]">{selectedRider.vehicleType}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-2">
                      <span className="text-slate-450 font-semibold uppercase text-[9px] tracking-wider">Plate Code</span>
                      <span className="font-mono font-black text-slate-900 text-[10px]">{selectedRider.vehicleNumber}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-2">
                      <span className="text-slate-450 font-semibold uppercase text-[9px] tracking-wider">Driver's License</span>
                      <span className="font-mono font-black text-slate-900 text-[10px]">{selectedRider.licenseNumber || "DL-9382103S-LK"}</span>
                    </div>
                  </div>

                </div>

                {/* Column 2 & 3: Weekly Earnings Financial Box and Chart Area */}
                <div className="md:col-span-2 space-y-5 flex flex-col justify-between">
                  
                  {/* Financial earnings stats blocks */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl">
                      <span className="block text-[8px] uppercase font-black text-slate-400 tracking-wider">Jobs Runs Today</span>
                      <span className="block text-xl font-mono font-black text-indigo-750 mt-1">{selectedRider.todayDeliveries} runs</span>
                      <span className="block text-[8px] text-gray-400 mt-1 font-semibold">Today's metrics</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl">
                      <span className="block text-[8px] uppercase font-black text-slate-400 tracking-wider">Earnings Today</span>
                      <span className="block text-xl font-mono font-black text-[#F5C518] bg-slate-950 px-2 py-0.5 rounded-lg w-max mt-1">
                        Rs. {selectedRider.todayEarnings.toLocaleString()}
                      </span>
                      <span className="block text-[8px] text-zinc-400 mt-1 font-bold">Base + variables</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl">
                      <span className="block text-[8px] uppercase font-black text-slate-400 tracking-wider">Earnings This Week</span>
                      <span className="block text-xl font-mono font-black text-emerald-600 mt-1">
                        Rs. {(selectedRider.todayEarnings * 4.5 + 12500).toLocaleString()}
                      </span>
                      <span className="block text-[8px] text-gray-400 mt-1 font-semibold">Consolidated billing</span>
                    </div>
                  </div>

                  {/* Performance Chart with beautiful area line of earnings */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shrink-0 flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-505" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Weekly Revenue Growth Curve</span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-400 font-bold">Revenue generated daily (LKR)</span>
                    </div>

                    {/* Chart Container */}
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getPerformanceChartData(selectedRider.id)}
                          margin={{ top: 5, right: 5, left: -22, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F5C518" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="day" 
                            stroke="#9CA3AF" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#1F2937", 
                              borderRadius: "8px", 
                              border: "none", 
                              color: "#fff",
                              fontFamily: "monospace",
                              fontSize: "10px"
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="earnings" 
                            stroke="#F5C518" 
                            fillOpacity={1} 
                            fill="url(#colorEarnings)" 
                            strokeWidth={2.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                  </div>

                </div>

              </div>

              {/* Log segment: Last 10 deliveries list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-155 pb-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    <span>Last 10 Delivery Logs</span>
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-2.5 py-0.5 uppercase tracking-wide leading-none">
                    Verified Jobs Ledger
                  </span>
                </div>

                {/* List Container */}
                <div className="border border-gray-200/80 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white max-h-72 overflow-y-auto shadow-2xs">
                  {getLast10Deliveries(selectedRider.id).map((job, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 flex flex-col sm:flex-row justify-between gap-3 hover:bg-slate-50/50 transition"
                    >
                      
                      {/* Left: Metadata */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900">{job.orderId}</span>
                          <span className="text-[10px] text-gray-400 font-bold font-mono">
                            {job.date}
                          </span>
                          <span className="text-[8px] font-black uppercase text-emerald-800 bg-emerald-50 px-1 rounded-sm border border-emerald-200">
                            Success
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-800 font-bold leading-normal">
                          Client: {job.customer}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 leading-tight">
                          <MapPin size={10} className="text-gray-400 shrink-0" />
                          <span>{job.address}</span>
                        </div>
                      </div>

                      {/* Right: Calculations Cash amounts */}
                      <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end font-mono border-t sm:border-0 border-gray-100 pt-2 sm:pt-0 shrink-0">
                        <div>
                          <span className="text-[9px] text-gray-400 font-sans block sm:inline">Order Bill:</span>
                          <span className="text-xs font-bold text-slate-950 ml-1">Rs. {job.amount.toLocaleString()}</span>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[9px] text-slate-450 font-sans font-bold block sm:inline">Rider Payout:</span>
                          <span className="text-xs font-black text-emerald-600 ml-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Rs. {job.payout.toLocaleString()}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Modal actions close button footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 flex justify-between items-center shrink-0 text-xs font-mono text-slate-400">
              <span>Zippi dispatch file synchronization: live</span>
              <button
                onClick={() => setSelectedRider(null)}
                className="bg-slate-900 hover:bg-black text-white font-black text-xs py-2 px-5 rounded-lg shadow-sm transition"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
