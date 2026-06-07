import React from "react";
import { 
  BarChart3, 
  ShoppingBag, 
  Folder, 
  Tag, 
  Package, 
  Bike, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { usePortal } from "../context/PortalContext";

export type TabID = 
  | "dashboard" 
  | "products" 
  | "categories" 
  | "promotions" 
  | "orders" 
  | "riders" 
  | "customers" 
  | "reports" 
  | "settings";

interface SidebarProps {
  activeTab: TabID;
  setActiveTab: (tab: TabID) => void;
  adminName: string;
  adminRole: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  adminName,
  adminRole,
  onLogout
}) => {
  const { settings } = usePortal();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Folder },
    { id: "promotions", label: "Promotions & Banners", icon: Tag },
    { id: "orders", label: "Orders", icon: Package },
    { id: "riders", label: "Riders", icon: Bike },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reports", label: "Reports", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <aside 
      id="admin-sidebar"
      className="fixed top-0 left-0 w-[240px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between z-30"
    >
      <div>
        {/* Top: Logo + Badge */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-[#F5C518] shadow-3xs border border-amber-250 shrink-0">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Brand logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="font-extrabold text-black text-xl">Z</span>
            )}
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 font-display truncate max-w-[100px]">
            {settings.appName || "Zippi"}
          </span>
          <span className="bg-[#F5C518] text-[9px] font-black tracking-wider px-1 py-0.5 rounded uppercase ml-auto text-black">
            Admin
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-r transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#F5C518]/10 text-black border-l-4 border-[#F5C518] font-semibold"
                    : "text-gray-500 hover:bg-gray-50 rounded"
                }`}
              >
                <Icon size={18} className={isActive ? "text-black opacity-80" : "text-gray-400"} />
                <span className="truncate text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Details & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5C518] flex items-center justify-center font-bold text-black shrink-0">
            {adminName.split(" ").map(w => w.charAt(0)).join("").substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
            <p className="text-xs text-gray-500 truncate">{adminRole}</p>
          </div>
          <button 
            id="btn-sidebar-logout"
            onClick={onLogout}
            title="Logout Portal"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
