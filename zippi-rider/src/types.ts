/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiderStatus = 'ONLINE' | 'OFFLINE';

export type TabType = 'home' | 'active_order' | 'earnings' | 'profile';

export type DeliveryStep = 'PICKUP' | 'DROPOFF' | null;

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string; // e.g., "ZP-2084"
  storeName: string;
  storeAddress: string;
  storeLocation: LatLng;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: LatLng;
  distance: number; // in km
  payout: number; // in LKR
  time: string; // e.g., "10:42 AM"
  date: string; // e.g., "Today", "2026-06-07"
  status: 'pending' | 'preparing' | 'dispatched' | 'arriving' | 'delivered' | 'cancelled';
}

export interface EarningsRecord {
  id: string;
  address: string;
  amount: number;
  time: string;
  date: string; // "Today", "This Week", etc.
}

export interface RiderState {
  isLoggedIn: boolean;
  riderName: string;
  riderPhone: string;
  riderVehicle: string;
  status: RiderStatus;
  currentLocation: LatLng;
  earningsToday: number;
  ordersCompleted: number;
  rating: number;
  activeTab: TabType;
  
  // Navigation stack state
  activeOrder: Order | null;
  orderStep: DeliveryStep;
  orderRequest: Order | null;
  countdown: number; // 10 seconds accept timer
  
  // Simulated ride state
  rideProgress: number; // 0 to 100% of current segment
  isSimulatingDrive: boolean;
}
