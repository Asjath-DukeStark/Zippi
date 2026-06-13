/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVariant {
  unit: string;
  price: number;
  originalPrice?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // LKR
  originalPrice?: number; // for discount display
  discountPercent?: number; // e.g. 15 for 15% off
  unit: string; // e.g. "500g", "1 kg", "1 pack"
  image: string;
  popular: boolean;
  stock: number;
  rating: number;
  reviewsCount: number;
  variants?: ProductVariant[];
  isFlashDeal?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  details: string; // e.g., "45, Galle Road, Colombo 03"
  isDefault: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'dispatched' | 'arriving' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: Address;
  paymentMethod: 'COD' | 'CARD';
  status: OrderStatus;
  timestamp: string; // ISO string
  deliveryEtaMin: number; // e.g., 25 for 25 mins
  rating?: number; // voluntary review
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string | null;
  imageUrl?: string | null;
  parentSlug?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}
