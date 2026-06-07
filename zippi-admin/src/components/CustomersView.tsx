import React, { useState } from "react";
import { 
  Search, 
  Mail, 
  Smartphone, 
  Calendar, 
  ShoppingBag, 
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Unlock
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Customer } from "../types";

export const CustomersView: React.FC = () => {
  const { customers, updateCustomer } = usePortal();

  // Search input
  const [searchTerm, setSearchTerm] = useState("");

  // Filter customers matching input keys
  const filteredCustomers = customers.filter((c) => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
  });

  // Toggle user account lock state
  const handleToggleBlockStatus = (cust: Customer) => {
    const finalStatus = cust.status === "Active" ? "Suspended" : "Active";
    const decision = confirm(`Confirm changing account status of "${cust.name}" to ${finalStatus}?`);
    
    if (decision) {
      updateCustomer({
        ...cust,
        status: finalStatus
      });
    }
  };

  // Format currency
  const formatLKR = (val: number) => {
    return `Rs. ${val.toLocaleString()}`;
  };

  return (
    <div id="customers-view" className="space-y-6">
      
      {/* 1. FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            id="input-customers-search"
            type="text"
            placeholder="Search customer name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-4 rounded-lg outline-none text-gray-950 font-medium"
          />
        </div>
      </div>

      {/* 2. CUSTOMERS DATA BOARD */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="customers-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-150 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Customer & Contact profile</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4 text-center">Orders Completed</th>
                <th className="py-4 px-4 text-right">Total Spent LKR</th>
                <th className="py-4 px-4 text-center">Platform Status</th>
                <th className="py-4 px-6 text-right">Control Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-semibold">
                    No customers found matching the search filters
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} id={`customer-row-${cust.id}`} className="hover:bg-gray-50/40 transition-colors">
                    
                    {/* Customer Profile Column */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F5C518]/15 text-amber-600 flex items-center justify-center font-display font-bold shrink-0 border border-[#F5C518]/30">
                          {cust.name.split(" ").map(w => w.charAt(0)).join("").substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-gray-950 truncate max-w-[200px]">{cust.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block truncate max-w-[200px]">{cust.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Join date column */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Calendar size={12} className="text-gray-450" />
                        {cust.joinedDate}
                      </span>
                    </td>

                    {/* Order counts */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs text-gray-800 font-bold font-mono">
                        📦 {cust.orderCount} times
                      </span>
                    </td>

                    {/* Total spent LKR */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-black text-gray-950 font-mono">
                        {formatLKR(cust.totalSpent)}
                      </span>
                    </td>

                    {/* Current system status badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        cust.status === "Active" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {cust.status === "Active" ? <CheckCircle2 size={10} /> : <AlertOctagon size={10} />}
                        {cust.status}
                      </span>
                    </td>

                    {/* Security Suspension Actions toggle button */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        id={`btn-suspend-customer-toggle-${cust.id}`}
                        onClick={() => handleToggleBlockStatus(cust)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          cust.status === "Active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {cust.status === "Active" ? (
                          <>
                            <Lock size={11} /> Block Profile
                          </>
                        ) : (
                          <>
                            <Unlock size={11} /> Reset Access
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
