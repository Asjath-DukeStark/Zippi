import React, { useState } from "react";
import { PortalProvider } from "./context/PortalContext";
import { Sidebar, TabID } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DashboardView } from "./components/DashboardView";
import { ProductsView } from "./components/ProductsView";
import { CategoriesView } from "./components/CategoriesView";
import { PromotionsView } from "./components/PromotionsView";
import { OrdersView } from "./components/OrdersView";
import { RidersView } from "./components/RidersView";
import { CustomersView } from "./components/CustomersView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { ShieldCheck, ChevronRight, HelpCircle } from "lucide-react";

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [emailInput, setEmailInput] = useState("admin@zippi.lk");
  const [passwordInput, setPasswordInput] = useState("••••••••");
  const [loginError, setLoginError] = useState("");

  // Portal States
  const [activeTab, setActiveTab] = useState<TabID>("dashboard");
  const [adminName, setAdminName] = useState("Asjath Ahamed");
  const [adminAvatar, setAdminAvatar] = useState("https://api.dicebear.com/7.x/pixel-art/svg?seed=Asjath");

  const adminRole = "Zippi LK Owner Team";

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setLoginError("Please enter credential parameters.");
      return;
    }
    // Simple mock authentication success
    setIsAuthenticated(true);
    setLoginError("");
  };

  const handleLogout = () => {
    const confirmLogout = confirm("Do you wish to logout from Zippi Admin Portal?");
    if (confirmLogout) {
      setIsAuthenticated(false);
      // Reset default credentials representation
      setEmailInput("admin@zippi.lk");
      setPasswordInput("");
    }
  };

  // Tab Title Resolvers
  const getPageTitle = (): string => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Overview";
      case "products":
        return "Food Menu Catalog";
      case "categories":
        return "Category Hub";
      case "promotions":
        return "Promotions & Banners Manager";
      case "orders":
        return "Active Deliveries Feed";
      case "riders":
        return "Riders Fleet Command";
      case "customers":
        return "Registered Customers Registry";
      case "reports":
        return "Business Financial Reports";
      case "settings":
        return "System Settings Gateway";
      default:
        return "Zippi Admin Portal";
    }
  };

  // Render view mapping
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
      case "products":
        return <ProductsView />;
      case "categories":
        return <CategoriesView />;
      case "promotions":
        return <PromotionsView />;
      case "orders":
        return <OrdersView />;
      case "riders":
        return <RidersView />;
      case "customers":
        return <CustomersView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return (
          <SettingsView 
            adminName={adminName} 
            setAdminName={setAdminName} 
            adminAvatar={adminAvatar} 
            setAdminAvatar={setAdminAvatar} 
          />
        );
      default:
        return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#1A1A1A] to-[#121212] flex items-center justify-center p-4">
        {/* Login Container */}
        <div id="login-container" className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col justify-between p-8 min-h-[500px]">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 justify-center mt-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5C518] flex items-center justify-center font-display font-black text-black text-3xl tracking-tighter shadow-sm">
                Z
              </div>
              <div className="text-left">
                <span className="block font-display font-extrabold text-2xl text-slate-900 tracking-tight leading-6">zippi</span>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Admin Portal</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-wider inline-flex items-center gap-1">
                <ShieldCheck size={12} /> Secure Gateway
              </span>
              <p className="text-xs text-gray-450 mt-2.5 font-medium px-4">
                Exclusive credentials portal for Zippi owners and Colombo delivery dispatch teams.
              </p>
            </div>

            {/* Credentials Forms */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-8">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl text-center">
                  Error: {loginError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-1.5 font-sans">Moderator Email Address</label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="admin@zippi.lk"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-3 px-3.5 rounded-lg outline-none text-gray-955 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-1.5 font-sans">Access Key Passcode</label>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-3 px-3.5 rounded-lg outline-none text-gray-955 font-mono"
                />
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-3 px-4 rounded-lg shadow-sm transition-all duration-200 mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Authorize & Access Session</span>
                <ChevronRight size={14} className="mt-0.5" />
              </button>
            </form>
          </div>

          {/* Footer credentials advice */}
          <div className="border-t border-gray-150 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1">
              <HelpCircle size={12} /> Password required
            </span>
            <span>admin.zippi.lk</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalProvider>
      <div className="min-h-screen bg-[#F9FAFB] flex font-sans">
        
        {/* Left Side: Fixed Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          adminName={adminName} 
          adminRole={adminRole} 
          onLogout={handleLogout} 
        />

        {/* Right Side: Main Dynamic Area */}
        <div className="flex-1 pl-[240px] flex flex-col min-h-screen">
          
          {/* Header Top Bar */}
          <Topbar 
            pageTitle={getPageTitle()} 
            adminName={adminName} 
            adminAvatar={adminAvatar} 
          />

          {/* Main Content Area: Scrollable Frame */}
          <main 
            id="main-app-viewport"
            className="flex-1 p-8 bg-[#F9FAFB] max-w-[1200px] w-full mx-auto overflow-y-auto"
          >
            {renderTabContent()}
          </main>

        </div>

      </div>
    </PortalProvider>
  );
}
