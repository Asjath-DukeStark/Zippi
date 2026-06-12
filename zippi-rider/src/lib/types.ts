export interface RiderUser {
  id: string;
  phone: string;
  name: string;
  role: string;
}

export interface RiderProfile {
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
  vehicleType?: string;
  rating?: number;
}

export interface RiderStats {
  deliveredToday: number;
  earnedToday: number;
  totalDeliveries: number;
  activeOrders: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'dispatched' | 'arriving' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { id: string; name: string; unit: string; imageUrl?: string | null } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: Record<string, any>;
  paymentMethod: 'COD' | 'CARD';
  status: OrderStatus;
  specialInstructions?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items?: OrderItem[];
  customer?: { id: string; name: string; phone: string } | null;
}
