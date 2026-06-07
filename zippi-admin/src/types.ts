/**
 * Zippi Admin Portal - TypeScript Types & Interfaces
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  status: "Active" | "Inactive";
  parentCategoryId?: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  categoryId: string;
  image: string;
  stock: number;
  status: "Active" | "Out of Stock" | "Draft";
  description?: string;
  brand?: string;
  discountPercentage?: number;
  weightUnit?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  images?: string[];
}

export type OrderStatus = "pending" | "preparing" | "dispatched" | "arriving" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: "COD" | "Card" | "Koko" | "MintPay";
  items: OrderItem[];
  assignedRiderId?: string;
}

export type RiderStatus = "Online" | "Offline" | "On Delivery";
export type VehicleType = "Bike" | "Scooter" | "Three-Wheeler" | "motorbike" | "bicycle" | "car" | "Motorbike" | "Bicycle" | "Car";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  status: RiderStatus;
  rating: number;
  avatar: string;
  todayDeliveries: number;
  todayEarnings: number;
  lat: number;   // For active interactive tracking simulations
  lng: number;
  email?: string;
  password?: string;
  licenseNumber?: string;
  role?: "rider";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  orderCount: number;
  totalSpent: number;
  status: "Active" | "Suspended";
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Scheduled";
  useCount: number;
  usageLimit?: "One-use" | "Unlimited";
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  status: "Active" | "Inactive";
  slot: "Home Hero" | "Category Offer" | "Promo Bar";
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  linkType?: "category" | "product" | "url";
  linkTargetId?: string;
}

export interface PortalSettings {
  onlineStatus: boolean;
  baseDeliveryFee: number;
  commissionRate: number;
  operatingRadius: number;
  autoAssignRiders: boolean;
  supportPhone: string;
  // General Configurations
  appName: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  // Delivery Configurations
  minOrderAmount: number;
  freeDeliveryAbove: number;
  estDeliveryTime: number; // in minutes
  // Operating Hours
  openTime: string;
  closeTime: string;
  operatingDays: string[];
  // Notification templates SMS text
  orderConfirmedSms: string;
  orderOutForDeliverySms: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "rider" | "promotion" | "system";
}
