import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, X, AlertCircle, ShoppingBag, Bike, Tag } from "lucide-react";
import { usePortal } from "../context/PortalContext";

interface TopbarProps {
  pageTitle: string;
  adminName: string;
  adminAvatar: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle,
  adminName,
  adminAvatar
}) => {
  const { notifications, markNotificationRead, clearNotifications } = usePortal();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag size={14} className="text-amber-500" />;
      case "rider":
        return <Bike size={14} className="text-emerald-500" />;
      case "promotion":
        return <Tag size={14} className="text-blue-500" />;
      default:
        return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  return (
    <header 
      id="admin-topbar"
      className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Page Title (left) */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-6 rounded-full bg-[#F5C518]" />
        <h1 className="font-display font-bold text-xl text-gray-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Admin Name + Avatar + Bell (right) */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="btn-topbar-bell"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all duration-150 relative cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span 
                id="topbar-bell-badge"
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
              >
              </span>
            )}
          </button>

          {/* Expanded Notification Panel Dropdown */}
          {isOpen && (
            <div 
              id="topbar-notifications-dropdown"
              className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="font-semibold text-sm text-gray-900">Notifications ({unreadCount} new)</div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      id="btn-clear-notifications"
                      onClick={clearNotifications}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Clear all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification Items Scrolllist */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No notifications available
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      id={`notification-item-${item.id}`}
                      className={`p-3.5 flex gap-3 transition-colors ${item.read ? "bg-white" : "bg-[#F5C518]/10"}`}
                    >
                      <div className="mt-0.5 w-6 h-6 rounded-lg bg-gray-100/80 flex items-center justify-center shrink-0">
                        {getAlertIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-gray-800 truncate">{item.title}</span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                          {item.message}
                        </p>
                        {!item.read && (
                          <button
                            id={`btn-read-notification-${item.id}`}
                            onClick={() => markNotificationRead(item.id)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                          >
                            <Check size={10} />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-gray-200" />

        {/* Admin info & Profile avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-sm font-semibold text-gray-900 leading-tight">{adminName}</span>
            <span className="block text-[10px] text-green-600 font-bold uppercase tracking-wider">System Online</span>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs shrink-0">
            <img 
              id="admin-topbar-avatar"
              src={adminAvatar} 
              alt={adminName} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </header>
  );
};
