import React from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Bike, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Phone,
  ArrowUpRight
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Order, Rider } from "../types";

interface DashboardViewProps {
  onNavigateTab: (tab: "orders" | "riders" | "settings") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { orders, riders, settings, updateOrderStatus } = usePortal();

  // Dynamic calculations based on state
  const completedOrders = orders.filter(o => o.status === "delivered");
  const todayRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  
  const pendingOrders = orders.filter(o => o.status === "pending");
  const urgentOrders = orders.filter(o => o.status === "pending" || o.status === "preparing" || o.status === "dispatched" || o.status === "arriving");
  const activeRiders = riders.filter(r => r.status === "Online" || r.status === "On Delivery");

  // Format currency
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace("LKR", "Rs.");
  };

  // Static performance data for SVG Charting
  const salesHistory = [
    { label: "Mon", sales: 12000, orders: 8 },
    { label: "Tue", sales: 15400, orders: 11 },
    { label: "Wed", sales: 14200, orders: 10 },
    { label: "Thu", sales: 18500, orders: 14 },
    { label: "Fri", sales: 24700, orders: 19 },
    { label: "Sat", sales: 32000, orders: 24 },
    { label: "Sun", sales: todayRevenue || 28900, orders: completedOrders.length || 18 }
  ];

  const maxSales = Math.max(...salesHistory.map(s => s.sales));

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* 1. TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Rev Card */}
        <div id="metric-revenue" className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Today's Revenue</span>
            <span className="font-display font-bold text-2xl text-gray-900 mt-1 block">
              {formatLKR(todayRevenue || 43250)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              +14.2% vs last Sunday
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F5C518]/15 text-black rounded-xl flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Deliveries Card */}
        <div id="metric-deliveries" className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-gray-500 tracking-wider block">Completed Orders</span>
            <span className="font-display font-bold text-2xl text-gray-900 mt-1 block">
              {completedOrders.length || 5}
            </span>
            <span className="text-[11px] text-gray-500 font-medium mt-1 block">
              {orders.filter(o => o.status === "cancelled").length} cancelled/refused
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Fleet On-duty Card */}
        <div id="metric-riders" className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-gray-500 tracking-wider block">Active Riders On-Duty</span>
            <span className="font-display font-bold text-2xl text-gray-900 mt-1 block">
              {activeRiders.length} / {riders.length}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              {riders.filter(r => r.status === "On Delivery").length} busy on routes
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center">
            <Bike size={20} />
          </div>
        </div>

        {/* Operating Hours Card */}
        <div id="metric-operating-status" className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-gray-500 tracking-wider block">Kitchen Status</span>
            <span className="font-display font-bold text-xl text-gray-900 mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.onlineStatus ? "bg-emerald-500" : "bg-red-500"} animate-pulse shrink-0`} />
              {settings.onlineStatus ? "Active & Accepting" : "Closed / Emergency"}
            </span>
            <button 
              id="btn-dash-settings-redirect"
              onClick={() => onNavigateTab("settings")}
              className="text-[10px] font-bold text-black border-b border-black/30 hover:border-black mt-1.5 flex items-center gap-0.5 cursor-pointer"
            >
              Configure hours <ChevronRight size={12} />
            </button>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC ANALYTICS & STATS PLOT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sales Chart (2 cols) */}
        <div id="dashboard-sales-chart" className="bg-white p-6 rounded-xl border border-gray-200 md:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Weekly Order Turnovers</h2>
              <p className="text-xs text-gray-400 mt-0.5">LKR revenue generated daily across Colombo districts</p>
            </div>
            <button 
              id="btn-navigate-reports"
              onClick={() => onNavigateTab("settings")} // Wait, let's navigate to settings or reports
              className="text-xs font-semibold text-black hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer font-bold"
            >
              Full breakdown <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Simple Highly Professional Custom HTML/SVG Bar Chart */}
          <div className="h-[220px] w-full flex items-end justify-between px-2 gap-3 pb-2 border-b border-gray-100">
            {salesHistory.map((item, i) => {
              const heightPercent = maxSales ? (item.sales / maxSales) * 100 : 0;
              const isToday = i === 6;
              return (
                <div key={item.label} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-[calc(100%-10px)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 font-mono shadow-md">
                    {formatLKR(item.sales)} ({item.orders} orders)
                  </div>
                  
                  {/* Bar */}
                  <div 
                    style={{ height: `${Math.max(heightPercent, 10)}%` }}
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 cursor-pointer ${
                      isToday 
                        ? "bg-[#F5C518] hover:brightness-95 hover:shadow-md" 
                        : "bg-gray-100 hover:bg-[#F5C518]/40"
                    }`}
                  />
                  {/* Label */}
                  <span className="text-xs font-medium text-gray-400 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Chart footer detail badges */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-4 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F5C518]" /> Actual Revenue
            </span>
            <span>Historical Week Total: Rs. 135,750</span>
          </div>
        </div>

        {/* Real-time Order Actions (1 col) */}
        <div id="dashboard-urgent-orders" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Quick Actions</h3>
                <p className="text-xs text-gray-400 mt-0.5">{urgentOrders.length} order requests waiting</p>
              </div>
              <button 
                id="btn-view-all-orders-dash"
                onClick={() => onNavigateTab("orders")}
                className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                All Orders
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {urgentOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-gray-200" />
                  All orders processed!
                </div>
              ) : (
                urgentOrders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-gray-950 font-mono block">{ord.id}</span>
                        <span className="text-[10px] text-gray-400 font-medium block">
                          {ord.customerName} • {ord.paymentMethod}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        ord.status === "pending" 
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : ord.status === "preparing"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : ord.status === "dispatched"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : ord.status === "arriving"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-205"
                          : ord.status === "delivered"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 truncate font-mono">
                      {ord.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
                    </div>

                    <div className="flex justify-between items-center mt-1 border-t border-gray-100 pt-2">
                      <span className="text-xs font-bold text-gray-900">{formatLKR(ord.total)}</span>
                      {ord.status === "pending" && (
                        <button
                          id={`btn-dash-prepare-${ord.id}`}
                          onClick={() => updateOrderStatus(ord.id, "preparing")}
                          className="text-[10px] font-bold bg-[#F5C518] text-black px-2.5 py-1 rounded-lg hover:brightness-95 transition-all cursor-pointer"
                        >
                          Confirm Order
                        </button>
                      )}
                      {ord.status === "preparing" && (
                        <button
                          id={`btn-dash-prepare-${ord.id}`}
                          onClick={() => updateOrderStatus(ord.id, "dispatched")}
                          className="text-[10px] font-bold bg-purple-600 text-white px-2.5 py-1 rounded-lg hover:bg-purple-700 transition-all cursor-pointer"
                        >
                          Ship / Dispatch
                        </button>
                      )}
                      {ord.status === "dispatched" && (
                        <button
                          id={`btn-dash-prepare-${ord.id}`}
                          onClick={() => updateOrderStatus(ord.id, "arriving")}
                          className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
                        >
                          Mark Arriving
                        </button>
                      )}
                      {ord.status === "arriving" && (
                        <button
                          id={`btn-dash-prepare-${ord.id}`}
                          onClick={() => updateOrderStatus(ord.id, "delivered")}
                          className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-400 mt-4 border border-dashed border-gray-200">
            🔔 Tip: Tap "Accept Order" to trigger a kitchen signal and move requested meals to the preparation stage.
          </div>
        </div>

      </div>

      {/* 3. LOWER SECTION: ACTIVE RIDERS LOCALISED TRACKING MAP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Map (2 cols) */}
        <div id="dashboard-riders-map" className="bg-white p-6 rounded-xl border border-gray-200 md:col-span-2 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Active Live Dispatch Monitor</h3>
              <p className="text-xs text-gray-400 mt-0.5">Geospatial delivery locations of Zippi agents in Colombo Metropolitan Area</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sim Tracking
            </span>
          </div>

          {/* Map Representation HTML / SVG Grid */}
          <div className="bg-slate-900 h-[280px] rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
            {/* Absolute Abstract lines depicting Colombo road structures */}
            <svg className="absolute inset-0 w-full h-full text-slate-800 opacity-25" xmlns="http://www.w3.org/2000/svg">
              {/* Galle Road */}
              <line x1="15%" y1="0%" x2="15%" y2="100%" stroke="currentColor" strokeWidth="4" />
              {/* Baseline Road */}
              <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="currentColor" strokeWidth="3" />
              {/* Duplication Road */}
              <line x1="30%" y1="0%" x2="30%" y2="100%" stroke="currentColor" strokeWidth="2" />
              {/* Havelock Road */}
              <line x1="50%" y1="10%" x2="65%" y2="90%" stroke="currentColor" strokeWidth="2.5" />
              {/* Highlevel Road */}
              <line x1="50%" y1="60%" x2="100%" y2="90%" stroke="currentColor" strokeWidth="3" />
              {/* Parliament Road */}
              <line x1="50%" y1="35%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="3" />
              {/* Local connections */}
              <line x1="15%" y1="20%" x2="75%" y2="20%" stroke="currentColor" strokeWidth="1" />
              <line x1="15%" y1="45%" x2="75%" y2="45%" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="15%" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" />
            </svg>

            {/* Geographical landmarks tags */}
            <span className="absolute left-[8%] top-[10%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Colombo Fort</span>
            <span className="absolute left-[6%] top-[45%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Colpetty (C03)</span>
            <span className="absolute left-[40%] top-[30%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Cinnamon Gdns</span>
            <span className="absolute left-[70%] top-[40%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Rajagiriya</span>
            <span className="absolute left-[35%] top-[70%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Havelock Town</span>
            <span className="absolute right-[10%] top-[80%] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Nugegoda</span>

            {/* Central hub indicator */}
            <div className="absolute left-[48%] top-[45%] w-5 h-5 rounded-full bg-[#F5C518] flex items-center justify-center text-slate-950 font-black animate-ping" />
            <div className="absolute left-[48%] top-[45%] w-5 h-5 rounded-full bg-[#F5C518] flex items-center justify-center text-slate-950 font-bold border border-white text-[10px] shadow-lg select-none" title="Zippi Colombo Hub">
              Z
            </div>

            {/* Interactive representation of riders plotted dynamically */}
            {riders.filter(r => r.status !== "Offline").map((rider, i) => {
              // Plotted systematically
              const fixedPlacements = [
                { x: "28%", y: "35%" }, // Nuwan Perera in Colombo 3
                { x: "22%", y: "15%" }, // Mohamed Salman in Fort
                { x: "60%", y: "65%" }, // Janith Bandara in Havelock Road
                { x: "82%", y: "30%" }, // Sajith Alwis in Rajagiriya
              ];
              const place = fixedPlacements[i % fixedPlacements.length];
              
              return (
                <div 
                  key={rider.id}
                  id={`map-rider-marker-${rider.id}`}
                  style={{ left: place.x, top: place.y }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  {/* Outer circle status wave */}
                  <span className={`absolute -inset-1.5 rounded-full ${rider.status === "On Delivery" ? "bg-amber-500 animate-ping opacity-75" : "bg-emerald-500 animate-ping opacity-40"} duration-1000`} />
                  
                  {/* Solid dot */}
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-md ${
                    rider.status === "On Delivery" ? "bg-amber-400" : "bg-emerald-400"
                  } relative`} />

                  {/* Bubble tooltip on hover */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 border border-slate-800 min-w-[130px]">
                    <div className="font-bold flex items-center gap-1 justify-between">
                      <span>{rider.name}</span>
                      <span className={`text-[8px] font-extrabold px-1 text-slate-900 rounded-sm ${rider.status === "On Delivery" ? "bg-amber-300" : "bg-emerald-300"}`}>
                        {rider.status === "On Delivery" ? "BUSY" : "FREE"}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[9px] mt-0.5">{rider.vehicleNumber}</div>
                    <div className="text-[9px] text-[#F5C518] font-semibold mt-1">⭐ {rider.rating} • {rider.vehicleType}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Rider Roster Widget */}
        <div id="dashboard-riders-side" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 text-sm">Rider Duty Status</h4>
              <button 
                id="btn-dash-manage-riders"
                onClick={() => onNavigateTab("riders")}
                className="text-[10px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {riders.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between p-2 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                      <img src={ride.avatar} alt={ride.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-gray-900 truncate">{ride.name}</span>
                      <span className="block text-[10px] text-gray-400 truncate font-mono">{ride.vehicleNumber}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ride.status === "On Delivery" 
                        ? "bg-amber-100 text-amber-800"
                        : ride.status === "Online"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {ride.status}
                    </span>
                    <a 
                      href={`tel:${ride.phone}`} 
                      className="block text-[10px] text-gray-400 hover:text-[#E2B616] mt-0.5 cursor-pointer"
                      title={ride.phone}
                    >
                      Call rider
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[11px] text-amber-800 mt-4 font-medium">
            💡 Active riders coordinate deliveries smoothly using auto-routing. Tap markers on the live map to review instant dispatcher routes.
          </div>
        </div>

      </div>

    </div>
  );
};
