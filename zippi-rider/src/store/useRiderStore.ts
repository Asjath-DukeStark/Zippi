/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import axios from 'axios';
import { RiderState, RiderStatus, TabType, Order, DeliveryStep, LatLng, EarningsRecord } from '../types';
import { INITIAL_EARNINGS, DEFAULT_RIDER_PROFILE, SAMPLE_ASSIGNABLE_ORDERS } from '../data/mockData';

const API_BASE_URL = 'http://localhost:3001/api';

// Graceful axios location patch dispatcher
const updateLocationOnServer = async (location: LatLng, status: RiderStatus) => {
  try {
    const token = localStorage.getItem('zippi_rider_token');
    await axios.patch(`${API_BASE_URL}/riders/location`, {
      latitude: location.latitude,
      longitude: location.longitude,
      status: status,
      timestamp: new Date().toISOString(),
    }, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      timeout: 1500
    });
    console.log('Location patched successfully to server:', location);
  } catch (error) {
    console.warn('API Endpoint http://localhost:3001/api/riders/location is in demo mode.');
  }
};

const updateOrderStatusOnServer = async (orderId: string, status: string) => {
  try {
    const token = localStorage.getItem('zippi_rider_token');
    await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
      status
    }, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      timeout: 1500
    });
    console.log(`Order ${orderId} status updated to ${status} on server`);
  } catch (error) {
    console.warn(`Failed to update order status on server:`, error);
  }
};

interface RiderStoreActions {
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  setStatus: (status: RiderStatus) => void;
  setActiveTab: (tab: TabType) => void;
  assignRandomOrder: () => void;
  tickCountdown: () => void;
  acceptOrder: () => void;
  declineOrder: () => void;
  markAsPickedUp: () => void;
  markAsDelivered: () => void;
  updateLocation: (loc: LatLng) => void;
  startSimulatedDrive: () => void;
  stopSimulatedDrive: () => void;
  progressSimulatedRide: () => void;
  clearActiveRequest: () => void;
  syncActiveOrder: () => Promise<void>;
}

type RiderStore = RiderState & RiderStoreActions;

export const useRiderStore = create<RiderStore>((set, get) => ({
  // Core Initial State
  isLoggedIn: true, // Auto-logged in for instantaneous visual testing, can logout/login anytime
  riderName: DEFAULT_RIDER_PROFILE.name,
  riderPhone: DEFAULT_RIDER_PROFILE.phone,
  riderVehicle: DEFAULT_RIDER_PROFILE.vehicle,
  status: 'ONLINE',
  currentLocation: { latitude: 6.9271, longitude: 79.8612 }, // Colombo Center
  earningsToday: 1070, // 450 + 620 LKR initial completed orders
  ordersCompleted: 2,
  rating: DEFAULT_RIDER_PROFILE.rating,
  activeTab: 'home',
  
  activeOrder: null,
  orderStep: null,
  orderRequest: null,
  countdown: 10,
  
  rideProgress: 0,
  isSimulatingDrive: false,

  // Login action
  login: async (phone, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { phone, password });
      if (res.data.success && res.data.data?.token) {
        localStorage.setItem('zippi_rider_token', res.data.data.token);
        set({
          isLoggedIn: true,
          riderPhone: phone,
          riderName: res.data.data.user.name,
          activeTab: 'home',
        });
        // Set online status in DB
        try {
          await axios.patch(`${API_BASE_URL}/riders/status`, {
            is_online: true
          }, {
            headers: { 'Authorization': `Bearer ${res.data.data.token}` }
          });
        } catch {}
        return true;
      }
    } catch (err) {
      console.warn('Login request failed, using offline fallback');
    }

    if (phone.trim().length >= 8 && password.trim().length >= 4) {
      set({
        isLoggedIn: true,
        riderPhone: phone,
        activeTab: 'home',
      });
      return true;
    }
    return false;
  },

  // Logout action
  logout: () => {
    const token = localStorage.getItem('zippi_rider_token');
    if (token) {
      axios.patch(`${API_BASE_URL}/riders/status`, { is_online: false }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('zippi_rider_token');
    set({
      isLoggedIn: false,
      status: 'OFFLINE',
      activeOrder: null,
      orderStep: null,
      orderRequest: null,
      isSimulatingDrive: false,
    });
  },

  // Toggle status
  setStatus: (status) => {
    set({ status });
    const { currentLocation } = get();
    updateLocationOnServer(currentLocation, status);
    
    // Sync status online/offline with API
    const token = localStorage.getItem('zippi_rider_token');
    if (token) {
      axios.patch(`${API_BASE_URL}/riders/status`, { is_online: status === 'ONLINE' }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  // Simulate remote admin push assigning an order
  assignRandomOrder: () => {
    const { status, activeOrder, orderRequest } = get();
    if (status !== 'ONLINE' || activeOrder !== null || orderRequest !== null) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * SAMPLE_ASSIGNABLE_ORDERS.length);
    const orderTemplate = SAMPLE_ASSIGNABLE_ORDERS[randomIndex];
    
    const newOrder: Order = {
      ...orderTemplate,
      id: `ZP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
    };

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      }, 150);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio Context push notification triggered');
    }

    set({
      orderRequest: newOrder,
      countdown: 10,
    });
  },

  // Ticks the 10-second request ring
  tickCountdown: () => {
    const { orderRequest, countdown } = get();
    if (!orderRequest) return;

    if (countdown <= 1) {
      get().declineOrder();
    } else {
      set({ countdown: countdown - 1 });
    }
  },

  // Accepted order event
  acceptOrder: () => {
    const { orderRequest } = get();
    if (!orderRequest) return;

    const accepted: Order = {
      ...orderRequest,
      status: 'preparing',
    };

    set({
      activeOrder: accepted,
      orderStep: 'PICKUP',
      orderRequest: null,
      activeTab: 'active_order',
      rideProgress: 0,
    });
    
    updateOrderStatusOnServer(orderRequest.id, 'preparing');
    get().startSimulatedDrive();
  },

  // Declined order event
  declineOrder: () => {
    set({
      orderRequest: null,
      countdown: 10,
    });
  },

  // Mark as picked up (transits step to dropoff)
  markAsPickedUp: () => {
    const { activeOrder } = get();
    if (!activeOrder) return;

    const updatedOrder: Order = {
      ...activeOrder,
      status: 'dispatched',
    };

    set({
      activeOrder: updatedOrder,
      orderStep: 'DROPOFF',
      rideProgress: 0,
    });

    updateOrderStatusOnServer(activeOrder.id, 'dispatched');
    get().startSimulatedDrive();
  },

  // Mark as delivered (earns payout, increments count, reset active state)
  markAsDelivered: () => {
    const { activeOrder, earningsToday, ordersCompleted } = get();
    if (!activeOrder) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      setTimeout(() => {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
      }, 150);
      setTimeout(() => {
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime);
      }, 300);
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}

    const newEarningsRecord: EarningsRecord = {
      id: activeOrder.id,
      address: activeOrder.customerAddress,
      amount: activeOrder.payout,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };

    const currentListStr = localStorage.getItem('zippi_earnings');
    const existingList: EarningsRecord[] = currentListStr ? JSON.parse(currentListStr) : INITIAL_EARNINGS;
    localStorage.setItem('zippi_earnings', JSON.stringify([newEarningsRecord, ...existingList]));

    updateOrderStatusOnServer(activeOrder.id, 'delivered');

    set({
      earningsToday: earningsToday + activeOrder.payout,
      ordersCompleted: ordersCompleted + 1,
      activeOrder: null,
      orderStep: null,
      activeTab: 'home',
      rideProgress: 0,
      isSimulatingDrive: false,
    });
  },

  // Manual or GPS position updates
  updateLocation: (currentLocation) => {
    set({ currentLocation });
    const { status } = get();
    if (status === 'ONLINE') {
      updateLocationOnServer(currentLocation, status);
    }
  },

  startSimulatedDrive: () => {
    set({ isSimulatingDrive: true, rideProgress: 0 });
  },

  stopSimulatedDrive: () => {
    set({ isSimulatingDrive: false });
  },

  // Steps the progress along on-screen simulated vector routing map
  progressSimulatedRide: () => {
    const { rideProgress, isSimulatingDrive, activeOrder, orderStep } = get();
    if (!isSimulatingDrive || !activeOrder) return;

    if (rideProgress >= 100) {
      return;
    }

    const nextProgress = Math.min(rideProgress + 10, 100);
    
    // Interpolate simulated location coordinates
    let startLoc = activeOrder.storeLocation;
    let endLoc = activeOrder.customerLocation;

    if (orderStep === 'PICKUP') {
      startLoc = { latitude: 6.9271, longitude: 79.8612 };
      endLoc = activeOrder.storeLocation;
    }

    const interpolatedLat = startLoc.latitude + (endLoc.latitude - startLoc.latitude) * (nextProgress / 100);
    const interpolatedLng = startLoc.longitude + (endLoc.longitude - startLoc.longitude) * (nextProgress / 100);

    set({
      rideProgress: nextProgress,
      currentLocation: { latitude: interpolatedLat, longitude: interpolatedLng },
    });

    // Notify simulated API of location transitions
    get().updateLocation({ latitude: interpolatedLat, longitude: interpolatedLng });

    // Transition to arriving when halfway during dropoff
    if (orderStep === 'DROPOFF' && nextProgress >= 50 && activeOrder.status !== 'arriving') {
      const updatedOrder: Order = { ...activeOrder, status: 'arriving' };
      set({ activeOrder: updatedOrder });
      updateOrderStatusOnServer(activeOrder.id, 'arriving');
    }
  },

  clearActiveRequest: () => {
    set({ orderRequest: null });
  },

  // Polling helper to check if admin assigned any order to this rider
  syncActiveOrder: async () => {
    try {
      const token = localStorage.getItem('zippi_rider_token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/riders/active-order`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        const bo = res.data.data;
        const mappedOrder: Order = {
          id: bo.orderNumber || bo.id,
          storeName: bo.storeName || "Zippi Grocery Hub",
          storeAddress: bo.storeAddress || "182 Galle Road, Colombo 03",
          storeLocation: bo.storeLocation || { latitude: 6.9145, longitude: 79.8492 },
          customerName: bo.customer?.name || "Customer",
          customerPhone: bo.customer?.phone || "",
          customerAddress: bo.deliveryAddress?.details || (typeof bo.deliveryAddress === 'string' ? bo.deliveryAddress : ""),
          customerLocation: bo.customerLocation || { latitude: 6.8710, longitude: 79.8601 },
          distance: bo.distance || 3.5,
          payout: bo.payout || 450,
          time: new Date(bo.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          status: bo.status
        };

        const currentActive = get().activeOrder;
        if (!currentActive || currentActive.id !== mappedOrder.id || currentActive.status !== mappedOrder.status) {
          set({
            activeOrder: mappedOrder,
            orderStep: mappedOrder.status === 'preparing' ? 'PICKUP' : 'DROPOFF',
            activeTab: 'active_order'
          });
        }
      }
    } catch (err) {
      console.warn("Failed to sync active order from backend:", err);
    }
  }
}));
