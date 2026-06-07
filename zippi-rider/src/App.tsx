/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRiderStore } from './store/useRiderStore';
import { PhoneFrame } from './components/PhoneFrame';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { OrderRequestPopup } from './components/OrderRequestPopup';
import { ActiveDeliveryPickup } from './components/ActiveDeliveryPickup';
import { ActiveDeliveryDropoff } from './components/ActiveDeliveryDropoff';
import { EarningsScreen } from './components/EarningsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { Sparkles, Bike, CalendarDays, Compass } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { isLoggedIn, activeTab, activeOrder, orderStep, orderRequest, status } = useRiderStore();

  React.useEffect(() => {
    if (!isLoggedIn || status !== 'ONLINE') return;
    
    // Poll the backend for new orders assigned to this rider
    useRiderStore.getState().syncActiveOrder();
    const interval = setInterval(() => {
      useRiderStore.getState().syncActiveOrder();
    }, 5500);

    return () => clearInterval(interval);
  }, [isLoggedIn, status]);

  const renderActiveScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'active_order':
        if (!activeOrder) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center w-full h-full bg-white p-6 text-center text-[#1A1A1A] space-y-4"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <Bike size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black tracking-tight">No Active Task assigned</h3>
                <p className="text-xs text-gray-500 max-w-xs font-medium leading-relaxed">
                  Go back to Home and toggle your status to <span className="text-emerald-700 font-bold">ONLINE</span> to start receiving dispatch assignments!
                </p>
              </div>
              <button
                onClick={() => useRiderStore.getState().setActiveTab('home')}
                className="px-4 py-2 bg-[#F5C518] hover:bg-[#e2b40d] text-xs font-bold text-slate-900 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95"
              >
                Go to Dashboard
              </button>
            </motion.div>
          );
        }
        return orderStep === 'PICKUP' ? <ActiveDeliveryPickup /> : <ActiveDeliveryDropoff />;
      case 'earnings':
        return <EarningsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLoggedIn ? activeTab : 'login'}
          className="w-full h-full relative"
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {renderActiveScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Incoming Order Sheet Overlay */}
      {orderRequest && <OrderRequestPopup />}
    </PhoneFrame>
  );
}
