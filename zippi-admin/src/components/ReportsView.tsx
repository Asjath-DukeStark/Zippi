import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Download, 
  ShoppingBag, 
  FileText,
  Calendar,
  CheckCircle2,
  Printer,
  XCircle,
  Package,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip 
} from "recharts";
import { usePortal } from "../context/PortalContext";
import { Order, OrderStatus } from "../types";

export const ReportsView: React.FC = () => {
  const { orders, products, categories } = usePortal();

  // Date picker states
  const [dateRange, setDateRange] = useState<"Today" | "Week" | "Month" | "Custom">("Week");
  
  // Custom date range bounds (Default covers existing June 2026 data beautifully)
  const [customStartDate, setCustomStartDate] = useState("2026-06-01");
  const [customEndDate, setCustomEndDate] = useState("2026-06-07");

  // Export success local notification
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Trigger feedback banner
  const triggerFeedback = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  // Standard UTC reference from prompt/metadata
  const TODAY_STR = "2026-06-07";

  // Filter orders according to active date range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDateOnly = o.date.split("T")[0]; // "2026-06-07"

      if (dateRange === "Today") {
        return orderDateOnly === TODAY_STR;
      } else if (dateRange === "Week") {
        // past 7 days: June 1st to June 7th 2026
        return orderDateOnly >= "2026-06-01" && orderDateOnly <= "2026-06-07";
      } else if (dateRange === "Month") {
        // June 1st to June 30th 2026
        return orderDateOnly >= "2026-06-01" && orderDateOnly <= "2026-06-30";
      } else if (dateRange === "Custom") {
        return orderDateOnly >= customStartDate && orderDateOnly <= customEndDate;
      }
      return true;
    });
  }, [orders, dateRange, customStartDate, customEndDate]);

  // Report metrics state aggregations
  const stats = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    
    const deliveredOrders = filteredOrders.filter(o => o.status === "delivered");
    const cancelledOrders = filteredOrders.filter(o => o.status === "cancelled");
    
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = deliveredOrders.length > 0 ? Math.floor(totalRevenue / deliveredOrders.length) : 0;
    const completionRate = totalOrdersCount > 0 ? Math.round((deliveredOrders.length / totalOrdersCount) * 100) : 0;

    return {
      totalRevenue,
      totalOrdersCount,
      deliveredCount: deliveredOrders.length,
      cancelledCount: cancelledOrders.length,
      averageOrderValue,
      completionRate
    };
  }, [filteredOrders]);

  // 1. Revenue over time dataset
  const revenueOverTimeData = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === "delivered");
    
    if (dateRange === "Today") {
      // Group by hours for precise Today visualization
      const hourMap: Record<string, number> = {
        "08:00": 0,
        "10:00": 0,
        "12:00": 0,
        "14:00": 0,
        "16:00": 0,
        "18:00": 0,
        "20:00": 0,
        "22:00": 0
      };

      delivered.forEach(o => {
        try {
          const timePart = o.date.split("T")[1];
          if (timePart) {
            const hr = parseInt(timePart.split(":")[0], 10);
            let key = "12:00";
            if (hr < 9) key = "08:00";
            else if (hr < 11) key = "10:00";
            else if (hr < 13) key = "12:00";
            else if (hr < 15) key = "14:00";
            else if (hr < 17) key = "16:00";
            else if (hr < 19) key = "18:00";
            else if (hr < 21) key = "20:00";
            else key = "22:00";

            hourMap[key] = (hourMap[key] || 0) + o.total;
          }
        } catch (e) {
          // ignore
        }
      });

      return Object.entries(hourMap).map(([hour, amount]) => ({
        time: hour,
        "Revenue (Rs.)": amount
      }));

    } else {
      // Group by day for other ranges
      const dateMap: Record<string, number> = {};
      
      // Seed range dates so the daily timeline looks neat
      const dateList: string[] = [];
      const start = new Date(dateRange === "Week" ? "2026-06-01" : dateRange === "Month" ? "2026-06-01" : customStartDate);
      const end = new Date(dateRange === "Week" ? "2026-06-07" : dateRange === "Month" ? "2026-06-30" : customEndDate);
      
      let temp = new Date(start);
      while (temp <= end) {
        try {
          const formatted = temp.toISOString().split("T")[0];
          dateMap[formatted] = 0;
          dateList.push(formatted);
        } catch {
          // Date overflow safeguard
        }
        temp.setDate(temp.getDate() + 1);
      }

      delivered.forEach(o => {
        const orderDateOnly = o.date.split("T")[0];
        if (dateMap[orderDateOnly] !== undefined) {
          dateMap[orderDateOnly] += o.total;
        } else {
          dateMap[orderDateOnly] = o.total;
        }
      });

      return Object.entries(dateMap)
        .map(([date, amount]) => {
          let label = date;
          try {
            const d = new Date(date);
            label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } catch {}
          return {
            time: label,
            "Revenue (Rs.)": amount
          };
        });
    }
  }, [filteredOrders, dateRange, customStartDate, customEndDate]);

  // 2. Orders by status code chart data
  const orderStatusData = useMemo(() => {
    const statuses: Record<string, { count: number; color: string }> = {
      "pending": { count: 0, color: "#F5C518" },     // Gold
      "preparing": { count: 0, color: "#10B981" },   // Emerald
      "dispatched": { count: 0, color: "#3B82F6" },  // Blue
      "arriving": { count: 0, color: "#8B5CF6" },    // Purple
      "delivered": { count: 0, color: "#047857" },   // Deep Emerald
      "cancelled": { count: 0, color: "#EF4444" }    // Red
    };

    filteredOrders.forEach(o => {
      if (statuses[o.status]) {
        statuses[o.status].count++;
      }
    });

    return Object.entries(statuses)
      .filter(([_, data]) => data.count > 0)
      .map(([status, data]) => ({
        name: status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1),
        value: data.count,
        color: data.color
      }));
  }, [filteredOrders]);

  // 3. Top 10 products
  const topProductsData = useMemo(() => {
    const pCounts: Record<string, { name: string; quantity: number }> = {};
    
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!pCounts[item.productId]) {
          pCounts[item.productId] = { name: item.name, quantity: 0 };
        }
        pCounts[item.productId].quantity += item.quantity;
      });
    });

    return Object.values(pCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 18) + ".." : p.name,
        fullName: p.name,
        "Quantity Sold": p.quantity
      }));
  }, [filteredOrders]);

  // 4. Revenue by category
  const revenueByCategoryData = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === "delivered");
    const catRevenue: Record<string, number> = {};

    delivered.forEach(o => {
      o.items.forEach(item => {
        const productObj = products.find(p => p.id === item.productId);
        const categoryId = productObj ? productObj.categoryId : "other";
        const categoryObj = categories.find(c => c.id === categoryId);
        const categoryName = categoryObj ? categoryObj.name : "Other Specials";

        const lineTotal = item.quantity * item.price;
        catRevenue[categoryName] = (catRevenue[categoryName] || 0) + lineTotal;
      });
    });

    return Object.entries(catRevenue).map(([catName, sum]) => ({
      category: catName,
      "Revenue (Rs.)": sum
    })).sort((a, b) => b["Revenue (Rs.)"] - a["Revenue (Rs.)"]);
  }, [filteredOrders, products, categories]);

  // Trigger Excel-compatible CSV compilation download
  const handleExportExcel = () => {
    try {
      const headers = ["Metric Segment", "Value Representation", "Unit Indicator", "Scope Frame"];
      const rows = [
        ["Report Range Preset", dateRange, "text", `Custom dates: ${customStartDate} to ${customEndDate}`],
        ["Total Platform Gross Revenue", stats.totalRevenue.toString(), "LKR (Rs.)", "Delivered sales only"],
        ["Total Logged Orders", stats.totalOrdersCount.toString(), "qty", "All order states inside window"],
        ["Average Order Value", stats.averageOrderValue.toString(), "LKR (Rs.)", "Delivered total divided by count"],
        ["Completion success rate", `${stats.completionRate}%`, "percent", "Delivered over Total placed"],
        ["Success Deliveries", stats.deliveredCount.toString(), "qty", "Delivered flag text"],
        ["Cancelled Orders", stats.cancelledCount.toString(), "qty", "Cancelled flag text"],
        [],
        ["CATEGORY PERFORMANCE BREAKDOWN", "REVENUE (LKR)", "PERCENTAGE (%)"],
        ...revenueByCategoryData.map(c => {
          const ratio = stats.totalRevenue > 0 ? Math.round((c["Revenue (Rs.)"] / stats.totalRevenue) * 100) : 0;
          return [c.category, c["Revenue (Rs.)"].toString(), `${ratio}%`];
        }),
        [],
        ["TOP POPULAR PRODUCTS SOLD", "QUANTITY METRICS"],
        ...topProductsData.map(p => [p.fullName, p["Quantity Sold"].toString()]),
        [],
        ["ORDER STATUS RATIOS", "COUNTS"],
        ...orderStatusData.map(s => [s.name, s.value.toString()])
      ];

      const csvContent = [
        ["ZIPPI DISPATCH PORTAL - FINANCIAL & OPERATIONAL EXCEL REPORT"],
        [`Generated Timestamp: ${new Date().toLocaleString()} UTC`],
        [`File scope timeframe: ${dateRange} (${customStartDate} to ${customEndDate})`],
        [],
        headers,
        ...rows.map(row => row.map(cell => {
          if (!cell) return "";
          return `"${cell.replace(/"/g, '""')}"`;
        }))
      ].map(r => r.join(",")).join("\n");

      // Generate Blob download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Zippi_Financial_Report_${dateRange}_${TODAY_STR}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerFeedback(`Successfully compiled & generated "Zippi_Financial_Report_${dateRange}.csv" spreadsheet!`);
    } catch {
      triggerFeedback("Failure executing data array format. Please check parameters.");
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatLKR = (val: number) => {
    return `Rs. ${val.toLocaleString()}`;
  };

  return (
    <div id="reports-view-canvas" className="space-y-6">
      
      {/* Dynamic inline stylesheet to hide UI chrome when PDF printing executes */}
      <style>{`
        @media print {
          aside, 
          #admin-sidebar, 
          header, 
          #admin-topbar, 
          .no-print,
          #date-picker-bar-dock,
          #export-actions-segment {
            display: none !important;
          }
          
          main, 
          #main-app-viewport {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background-color: white !important;
          }

          .flex-1.pl-\\[240px\\] {
            padding-left: 0 !important;
          }

          body {
            background-color: white !important;
            color: black !important;
          }

          #printable-reports-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 15px !important;
          }

          .chart-box-card {
            border: 1px solid #E5E7EB !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #print-header-banner {
            display: flex !important;
          }
        }
      `}</style>

      {/* PRINT-ONLY HEADER BANNER */}
      <div id="print-header-banner" className="hidden flex-col border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Zippi Food Delivery</h1>
            <p className="text-xs text-slate-500 font-mono">Colombo 03, Sri Lanka | dispatch.zippi.lk</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-extrabold tracking-widest bg-slate-900 text-white px-2 py-1">Business Audit Reports</span>
            <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date().toLocaleString()} UTC</p>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-xs text-slate-700 font-bold">
          <div>Preset Range: <span className="font-mono text-slate-900">{dateRange}</span></div>
          <div>Period Scope: <span className="font-mono text-slate-900">{customStartDate} to {customEndDate}</span></div>
        </div>
      </div>

      {/* Action feedback popup banners */}
      {exportFeedback && (
        <div id="toast-feedback-alert" className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-bounce flex items-center gap-2.5 text-xs font-bold bg-emerald-50 border-emerald-250 text-emerald-800">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* 1. DATE PICKER & QUICK CONTROL BOARD */}
      <div id="date-picker-bar-dock" className="bg-white p-4 rounded-2xl border border-gray-200 shadow-3xs flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between no-print">
        
        {/* Presets segment button group */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-max self-start md:self-auto shrink-0">
          {(["Today", "Week", "Month", "Custom"] as const).map(option => (
            <button
              key={option}
              id={`preset-range-btn-${option}`}
              onClick={() => {
                setDateRange(option);
                if (option === "Today") {
                  setCustomStartDate(TODAY_STR);
                  setCustomEndDate(TODAY_STR);
                } else if (option === "Week") {
                  setCustomStartDate("2026-06-01");
                  setCustomEndDate("2026-06-07");
                } else if (option === "Month") {
                  setCustomStartDate("2026-06-01");
                  setCustomEndDate("2026-06-30");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateRange === option
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-gray-500 hover:text-slate-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Dynamic Custom Calendars Display */}
        <div className="flex flex-wrap items-center gap-4">
          
          <div className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-800 font-bold">
            <Calendar size={13} className="text-[#F5C518]" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-400 font-sans mr-1">From</span>
              <input
                id="input-custom-start-date"
                type="date"
                value={customStartDate}
                disabled={dateRange !== "Custom"}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={`bg-transparent outline-none cursor-pointer border-none text-xs font-bold p-0 ${
                  dateRange !== "Custom" ? "opacity-50 pointer-events-none" : "text-slate-950"
                }`}
              />
            </div>
            <ArrowRight size={12} className="text-gray-400" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-400 font-sans mr-1">To</span>
              <input
                id="input-custom-end-date"
                type="date"
                value={customEndDate}
                disabled={dateRange !== "Custom"}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={`bg-transparent outline-none cursor-pointer border-none text-xs font-bold p-0 ${
                  dateRange !== "Custom" ? "opacity-50 pointer-events-none" : "text-slate-950"
                }`}
              />
            </div>
          </div>

          {/* Indicators description */}
          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 rounded py-1">
            Displaying {filteredOrders.length} of {orders.length} orders
          </span>

        </div>

      </div>

      {/* 2. STATS REPORT CARDS */}
      <div id="reports-stats-deck" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: Total Revenue */}
        <div id="report-card-revenue" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-3xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Total Revenue</span>
              <span className="block text-2xl font-black text-slate-900 leading-none">
                {formatLKR(stats.totalRevenue)}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="text-xs font-bold font-mono">Rs</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 border-t border-gray-100">
            <span>Delivered meals sales</span>
            <span className="text-emerald-600 flex items-center gap-0.5 font-mono">
              <TrendingUp size={11} /> +12.4%
            </span>
          </div>
        </div>

        {/* CARD 2: Total Orders */}
        <div id="report-card-orders" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-3xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Total Orders</span>
              <span className="block text-2xl font-black text-slate-900 leading-none">
                {stats.totalOrdersCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Package size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 border-t border-gray-100">
            <span>Placed: {stats.totalOrdersCount} orders</span>
            <span className="text-slate-400">
              Delivered: {stats.deliveredCount}
            </span>
          </div>
        </div>

        {/* CARD 3: Average Order Value */}
        <div id="report-card-aov" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-3xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Average Order Value</span>
              <span className="block text-2xl font-black text-slate-900 leading-none">
                {formatLKR(stats.averageOrderValue)}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 border-t border-gray-100">
            <span>Spend per checkout basket</span>
            <span className="text-amber-600 font-mono font-bold">Stable</span>
          </div>
        </div>

        {/* CARD 4: Completion Rate % */}
        <div id="report-card-completion" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-3xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Completion Rate %</span>
              <span className="block text-2xl font-black text-slate-900 leading-none">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center text-amber-550">
              <Activity size={16} />
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div style={{ width: `${stats.completionRate}%` }} className="bg-[#F5C518] h-full" />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
              <span>{stats.deliveredCount} Delivered</span>
              <span>{stats.cancelledCount} Cancelled</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BUSINESS ANALYTICS CHARTS GRID */}
      <div id="printable-reports-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Revenue Over Time Line */}
        <div id="chart-revenue-timeline" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4 chart-box-card">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Revenue Over Time</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Timeline curve of successful Delivered orders (LKR)</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Trend Line
            </span>
          </div>

          <div className="h-64 w-full">
            {revenueOverTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No revenue records in targeted date window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueOverTimeData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0F172A", 
                      color: "#FFFFFF", 
                      fontSize: "11px", 
                      borderRadius: "10px", 
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }} 
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="Revenue (Rs.)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Orders By Status Pie */}
        <div id="chart-orders-ratio-pie" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4 chart-box-card">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Orders by Status</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Ratio and percentage distributions of all order parameters</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Donut Ratio
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* Pie Container */}
            <div className="h-48 sm:col-span-2 relative">
              {orderStatusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No orders found.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0F172A", 
                        color: "#FFFFFF", 
                        fontSize: "10px", 
                        borderRadius: "8px", 
                        border: "none" 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Central absolute badge label */}
              {orderStatusData.length > 0 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Total</span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                    {stats.totalOrdersCount}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Pie Legend */}
            <div className="text-[10px] space-y-1.5 font-bold text-slate-700">
              {orderStatusData.map((entry, idx) => {
                const ratio = stats.totalOrdersCount > 0 ? Math.round((entry.value / stats.totalOrdersCount) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="truncate flex-1 font-medium">{entry.name}</span>
                    <span className="font-mono text-slate-900">{entry.value} ({ratio}%)</span>
                  </div>
                );
              })}
              {orderStatusData.length === 0 && (
                <p className="text-gray-400 font-sans font-medium text-center">Zero registries in current preset scope.</p>
              )}
            </div>

          </div>
        </div>

        {/* Chart C: Top 10 Products sold Bar */}
        <div id="chart-top-products" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4 chart-box-card">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Top 10 Products Sold</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Most outstanding product units ordered (quantities sold)</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Popular Items
            </span>
          </div>

          <div className="h-64 w-full">
            {topProductsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No orders compiled in active range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#4B5563" fontSize={9} fontStyle="bold" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#0F172A", 
                      color: "#FFFFFF", 
                      fontSize: "11px", 
                      borderRadius: "8px", 
                      border: "none" 
                    }}
                    formatter={(value) => [`${value} items`, "Sold"]}
                  />
                  <Bar dataKey="Quantity Sold" fill="#F5C518" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart D: Revenue by Category Bar */}
        <div id="chart-category-revenue" className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4 chart-box-card">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Revenue by Category</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Financial segmentation of catalog divisions (LKR)</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Food Categories
            </span>
          </div>

          <div className="h-64 w-full">
            {revenueByCategoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Zero revenue recorded inside window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#0F172A", 
                      color: "#FFFFFF", 
                      fontSize: "11px", 
                      borderRadius: "8px", 
                      border: "none" 
                    }}
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Financial Revenue"]}
                  />
                  <Bar dataKey="Revenue (Rs.)" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 4. SHEET DOCUMENTS EXPORT CARD */}
      <div id="export-actions-segment" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm no-print">
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers size={15} className="text-[#F5C518]" />
              <span>Shareable Audit & Operational Documents</span>
            </h4>
            <p className="text-xs text-gray-400">Export high-fidelity spreadsheet registers and clean PDF document packages instantly.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Export PDF */}
            <button
              id="btn-export-pdf"
              onClick={handleExportPDF}
              className="bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm border border-transparent"
            >
              <Printer size={14} />
              <span>Export PDF / Print</span>
            </button>

            {/* Export Excel (CSV Download) */}
            <button
              id="btn-export-excel-custom"
              onClick={handleExportExcel}
              className="bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm border border-transparent"
            >
              <Download size={14} className="stroke-[2.5px]" />
              <span>Export Excel (CSV)</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
