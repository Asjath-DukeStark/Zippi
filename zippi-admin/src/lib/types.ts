export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  role: 'customer' | 'rider' | 'admin';
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  parentSlug?: string | null;
  sortOrder?: number;
  isActive: boolean;
}

export interface ProductVariant {
  unit: string;
  price: number;
  originalPrice?: number | null;
  stock?: number | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  categorySlug?: string | null;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  unit: string;
  imageUrl?: string | null;
  popular: boolean;
  isFlashDeal: boolean;
  stock: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  variants?: ProductVariant[] | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'dispatched' | 'arriving' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { id: string; name: string; unit: string; imageUrl?: string | null } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: Record<string, any>;
  paymentMethod: 'COD' | 'CARD';
  status: OrderStatus;
  deliveryEtaMin: number;
  specialInstructions?: string | null;
  riderId?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items?: OrderItem[];
  customer?: { id: string; name: string; phone: string } | null;
  rider?: { id: string; name: string; phone: string } | null;
  events?: { id: string; status: string; note?: string | null; createdAt: string }[];
}

export interface Rider extends User {
  profile?: { latitude?: number; longitude?: number; isOnline: boolean; vehicleType?: string; updatedAt?: string } | null;
  activeOrders: number;
  totalDeliveries: number;
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  totalRiders: number;
  activeProducts: number;
  statusBreakdown: Record<string, number>;
}
