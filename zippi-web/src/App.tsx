/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, 
  Layers, 
  ShoppingBag, 
  ShoppingBasket,
  Star, 
  MapPin, 
  Search, 
  ChevronDown, 
  X, 
  Sparkles, 
  Plus, 
  Minus,
  Check,
  ChevronRight,
  RefreshCw,
  Clock,
  Heart,
  History,
  Info,
  Tag,
  Camera,
  Percent,
  User,
  ShieldCheck,
  HelpCircle,
  Truck,
  Phone,
  ArrowRight,
  ArrowLeft,
  Share2,
  MoreVertical,
  Edit
} from 'lucide-react';

import { Product, CartItem, Address, Order, Category } from './types';
import { PRODUCTS, CATEGORIES, INITIAL_ADDRESSES, ADS_CAROUSEL } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHapticFeedback } from './utils';

import Logo from './components/Logo';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutSimulation from './components/CheckoutSimulation';
import OrdersHistory from './components/OrdersHistory';
import ProductListingView from './components/ProductListingView';
import DealsView from './components/DealsView';
import CartView from './components/CartView';
import OrderTracking from './components/OrderTracking';
import ZippiLibraryShowcase from './components/ZippiLibraryShowcase';
import { ZippiBottomNav } from './components/ZippiLibrary';
import FilterBottomSheet from './components/FilterBottomSheet';
import ZippiSplashScreen from './components/ZippiSplashScreen';
import FlashDealsTimer from './components/FlashDealsTimer';

const DEALS_OPTIONS = [
  "Grand Lifestyle Sale",
  "Mega Deal 📣",
  "Eid Deal 🌙",
  "Deal"
];

const BRANDS_OPTIONS = [
  "Sebamed",
  "Aveeno",
  "Cool & Cool",
  "HUGGIES",
  "Pampers",
  "BabyJoy",
  "Mustela",
  "Rubies",
  "Generic",
  "Sage Square",
  "Kotmale",
  "Pelwatte",
  "Araliya",
  "Dilmah",
  "Harischandra"
];

const HOME_CATEGORIES = [
  { id: 'veggies', name: 'Fresh Produce', emoji: '🥦', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150&auto=format&fit=crop&q=80', sale: true },
  { id: 'dairy', name: 'Dairy & Eggs', emoji: '🥛', image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=150&auto=format&fit=crop&q=80', sale: false },
  { id: 'meats', name: 'Meat & Seafood', emoji: '🥩', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150&auto=format&fit=crop&q=80', sale: false },
  { id: 'bakery', name: 'Bakery', emoji: '🍞', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=150&auto=format&fit=crop&q=80', sale: false },
  { id: 'beverages', name: 'Beverages', emoji: '🧃', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=80', sale: false },
  { id: 'snacks', name: 'Snacks', emoji: '🍿', image: 'https://images.unsplash.com/photo-1511125341079-05a909dd6802?w=150&auto=format&fit=crop&q=80', sale: false },
  { id: 'frozen', name: 'Frozen', emoji: '❄️', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=80', sale: true },
  { id: 'cleaning', name: 'Cleaning', emoji: '🧹', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=80', sale: false },
];

const BRANDS_LIST = ['All', 'Kotmale', 'Pelwatte', 'Araliya', 'Dilmah'];

const DETAILED_CATEGORIES = [
  { id: 'veggies', name: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&auto=format&fit=crop&q=80' },
  { id: 'dairy', name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=300&auto=format&fit=crop&q=80' },
  { id: 'meats', name: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80' },
  { id: 'bakery', name: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&auto=format&fit=crop&q=80' },
  { id: 'beverages', name: 'Beverages', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80' },
  { id: 'snacks', name: 'Snacks & Chips', image: 'https://images.unsplash.com/photo-1511125341079-05a909dd6802?w=300&auto=format&fit=crop&q=80' },
  { id: 'frozen', name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80' },
  { id: 'cleaning', name: 'Cleaning & Home', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80' },
  { id: 'personal', name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80' },
  { id: 'baby', name: 'Baby & Kids', image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=300&auto=format&fit=crop&q=80' },
  { id: 'breakfast', name: 'Breakfast', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
  { id: 'canned', name: 'Canned & Dry Goods', image: 'https://images.unsplash.com/photo-1536640712247-c57530c1737e?w=300&auto=format&fit=crop&q=80' },
  { id: 'pantry', name: 'Oils & Condiments', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80' },
  { id: 'sweets', name: 'Sweets & Chocolates', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&auto=format&fit=crop&q=80' },
  { id: 'health', name: 'Health Foods', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' }
];

// Define list of IDs for home marquee sections
const TRENDING_IDS = [
  't1_anchor',
  't1_delmege_basmati',
  't1_coke',
  't1_maliban_crackers',
  't1_sunlight',
  't1_parachute_oil',
  't1_munchee_puff',
  't1_surf_excel',
  't1_delmege_juice',
  't1_araliya_basmati'
];

const FRESH_IDS = [
  't2_carrots',
  't2_tomatoes',
  't2_spinach',
  't2_bananas',
  't2_apples',
  't2_chicken',
  't2_eggs',
  't2_yogurt',
  't2_bread',
  't2_cheese'
];

const FLASH_IDS = [
  'fd_milo',
  'fd_nestomalt',
  'fd_cream_soda',
  'fd_kfc_chicken',
  'fd_delmege_pasta',
  'fd_maggi_noodles',
  'fd_pringles',
  'fd_anchor_butter',
  'fd_ovaltine',
  'fd_harpic'
];

export default function App() {
  // Navigation 5 View Tabs: 'home' | 'categories' | 'deals' | 'account' | 'cart'
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'deals' | 'account' | 'cart'>('home');
  const [showSplash, setShowSplash] = useState(true);

  // Dynamic products and categories loaded from backend
  const [activeProducts, setActiveProducts] = useState<Product[]>(PRODUCTS);
  const [activeCategories, setActiveCategories] = useState<Category[]>(() => [
    // Parents
    { id: 'grocery', name: 'Grocery', slug: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=120&auto=format&fit=crop&q=80', icon: '🛒' },
    { id: 'pharmacy', name: 'Pharmacy', slug: 'pharmacy', imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&auto=format&fit=crop&q=80', icon: '💊' },
    { id: 'baby', name: 'Baby Care', slug: 'baby', imageUrl: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=120&auto=format&fit=crop&q=80', icon: '👶' },
    { id: 'meat', name: 'Meat', slug: 'meat', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&auto=format&fit=crop&q=80', icon: '🥩' },
    { id: 'bakery', name: 'Bakery', slug: 'bakery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80', icon: '🍞' },
    { id: 'fancy', name: 'Fancy & Cosmetics', slug: 'fancy', imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=120&auto=format&fit=crop&q=80', icon: '💄' },
    { id: 'masala', name: 'Masala', slug: 'masala', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=120&auto=format&fit=crop&q=80', icon: '🌶️' },
    { id: 'car_rental', name: 'Car Rental', slug: 'car_rental', imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&auto=format&fit=crop&q=80', icon: '🚗' },
    
    // Children
    { id: 'veggies', name: 'Fruits & Vegetables', slug: 'veggies', parentSlug: 'grocery', icon: '🥗' },
    { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', parentSlug: 'grocery', icon: '🧀' },
    { id: 'pantry', name: 'Pantry & Staples', slug: 'pantry', parentSlug: 'grocery', icon: '📦' },
    { id: 'snacks', name: 'Snacks & Sweets', slug: 'snacks', parentSlug: 'grocery', icon: '🍪' },
    { id: 'beverages', name: 'Beverages', slug: 'beverages', parentSlug: 'grocery', icon: '🥤' },
    { id: 'frozen', name: 'Frozen Food', slug: 'frozen', parentSlug: 'grocery', icon: '❄️' },
    { id: 'cleaning', name: 'Cleaning & Home', slug: 'cleaning', parentSlug: 'grocery', icon: '🧼' },
    
    { id: 'bakery-breads', name: 'Breads & Buns', slug: 'bakery-breads', parentSlug: 'bakery', icon: '🍞' },
    { id: 'bakery-cakes', name: 'Cakes & Pastries', slug: 'bakery-cakes', parentSlug: 'bakery', icon: '🍰' },
    { id: 'bakery-cookies', name: 'Cookies & Savories', slug: 'bakery-cookies', parentSlug: 'bakery', icon: '🍪' },
    
    { id: 'health_presc', name: 'Prescription Drugs', slug: 'health_presc', parentSlug: 'pharmacy', icon: '🩺' },
    { id: 'health_otc', name: 'OTC Medicine', slug: 'health_otc', parentSlug: 'pharmacy', icon: '💊' },
    { id: 'health_vit', name: 'Wellness & Vitamins', slug: 'health_vit', parentSlug: 'pharmacy', icon: '🌿' },
    { id: 'health_safety', name: 'First Aid & Safety', slug: 'health_safety', parentSlug: 'pharmacy', icon: '🩹' },

    { id: 'baby_diap', name: 'Baby Diapers & Wipes', slug: 'baby_diap', parentSlug: 'baby', icon: '🧻' },
    { id: 'baby_food', name: 'Baby Food & Formula', slug: 'baby_food', parentSlug: 'baby', icon: '🍼' },
    { id: 'baby_skin', name: 'Baby Bath & Skin', slug: 'baby_skin', parentSlug: 'baby', icon: '🧴' },
    { id: 'baby_toys', name: 'Toys & Gear', slug: 'baby_toys', parentSlug: 'baby', icon: '🧸' },

    { id: 'meats_chicken', name: 'Chicken', slug: 'meats_chicken', parentSlug: 'meat', icon: '📦' },
    { id: 'meats_beef_mutton', name: 'Beef & Mutton', slug: 'meats_beef_mutton', parentSlug: 'meat', icon: '📦' },
    { id: 'meats_seafood', name: 'Seafood', slug: 'meats_seafood', parentSlug: 'meat', icon: '📦' },
    { id: 'meats_coldcuts', name: 'Sausage & Cold Cuts', slug: 'meats_coldcuts', parentSlug: 'meat', icon: '📦' },

    { id: 'sweets', name: 'Chocolates & Candies', slug: 'sweets', parentSlug: 'fancy', icon: '🍬' },
    { id: 'personal_makeup', name: 'Makeup & Beauty', slug: 'personal_makeup', parentSlug: 'fancy', icon: '💄' },
    { id: 'personal_perf', name: 'Perfumes & Fragrances', slug: 'personal_perf', parentSlug: 'fancy', icon: '✨' },
    { id: 'snacks_gift', name: 'Gift Boxes & Hampers', slug: 'snacks_gift', parentSlug: 'fancy', icon: '🎁' },

    { id: 'pantry_spices', name: 'Spices & Powders', slug: 'pantry_spices', parentSlug: 'masala', icon: '🌶️' },
    { id: 'pantry_pastes', name: 'Pastes & Sauces', slug: 'pantry_pastes', parentSlug: 'masala', icon: '🍲' },
    { id: 'pantry_herbs', name: 'Herbs & Seasonings', slug: 'pantry_herbs', parentSlug: 'masala', icon: '🌿' },
    { id: 'pantry_whole', name: 'Whole Spices', slug: 'pantry_whole', parentSlug: 'masala', icon: '🍂' },

    { id: 'car_rental_hatch', name: 'Hatchbacks & Sedans', slug: 'car_rental_hatch', parentSlug: 'car_rental', icon: '🚗' },
    { id: 'car_rental_suv', name: 'SUVs & Jeeps', slug: 'car_rental_suv', parentSlug: 'car_rental', icon: '🚙' },
    { id: 'car_rental_van', name: 'Vans & Buses', slug: 'car_rental_van', parentSlug: 'car_rental', icon: '🚐' }
  ]);

  const [dealsOptions, setDealsOptions] = useState<string[]>([
    "Grand Lifestyle Sale",
    "Mega Deal 📣",
    "Eid Deal 🌙",
    "Deal"
  ]);
  const [brandsOptions, setBrandsOptions] = useState<string[]>([
    "Sebamed",
    "Aveeno",
    "Cool & Cool",
    "HUGGIES",
    "Pampers",
    "BabyJoy",
    "Mustela",
    "Rubies",
    "Generic",
    "Sage Square",
    "Kotmale",
    "Pelwatte",
    "Araliya",
    "Dilmah",
    "Harischandra"
  ]);

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const [catRes, prodRes, settingsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=200'),
          fetch('/api/settings').catch(() => null)
        ]);

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data)) {
            const mapped = catJson.data.map((c: any) => ({
              id: c.slug,
              name: c.name,
              slug: c.slug,
              icon: c.icon,
              imageUrl: c.imageUrl,
              parentSlug: c.parentSlug,
              sortOrder: c.sortOrder,
              isActive: c.isActive
            }));
            setActiveCategories(mapped);
          }
        }

        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.success && prodJson.data && Array.isArray(prodJson.data.products)) {
            const mapped = prodJson.data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || '',
              category: p.categorySlug || '',
              price: Number(p.price),
              originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
              discountPercent: p.discountPercent ? Number(p.discountPercent) : undefined,
              unit: p.unit || '',
              image: p.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=80',
              popular: !!p.popular,
              stock: Number(p.stock || 0),
              rating: Number(p.rating || 5.0),
              reviewsCount: Number(p.reviewsCount || 0),
              variants: p.variants ? p.variants.map((v: any) => ({
                unit: v.unit,
                price: Number(v.price),
                originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
                stock: v.stock !== null && v.stock !== undefined ? Number(v.stock) : undefined
              })) : undefined
            }));
            setActiveProducts(mapped);
          }
        }

        if (settingsRes && settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          if (settingsJson.success && settingsJson.data && settingsJson.data.filters) {
            const filters = settingsJson.data.filters;
            if (Array.isArray(filters.deals)) setDealsOptions(filters.deals);
            if (Array.isArray(filters.brands)) setBrandsOptions(filters.brands);
          }
        }
      } catch (err) {
        console.error("Failed to load live catalog", err);
      }
    };
    loadDynamicData();
  }, []);

  // Interactive Switcher Tile Active ID
  const [activeSwitcherTile, setActiveSwitcherTile] = useState<string>('zippi');

  // Filter conditions & text searching states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Header Switch/Feature States
  const [fastDeliveryFilter, setFastDeliveryFilter] = useState(true); // default active as yellow
  const [dealsFilter, setDealsFilter] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // New bottom sheet filter states to support advanced selections
  const [activeFilterSheet, setActiveFilterSheet] = useState<'deals' | 'brand' | null>(null);
  const [selectedDealsList, setSelectedDealsList] = useState<string[]>(['All']);
  const [selectedBrandsList, setSelectedBrandsList] = useState<string[]>(['All']);

  // Swipeable carousel banner state
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSlideRef = useRef(0);
  const isHoveredRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastInteractionTime = useRef<number>(Date.now());
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const goToSlide = React.useCallback((next: number) => {
    lastInteractionTime.current = Date.now();
    const container = scrollContainerRef.current;
    if (container) {
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: next * slideWidth,
        behavior: 'smooth'
      });
      currentSlideRef.current = next;
      setCurrentSlide(next);
    }
  }, []);

  const handleTouchStart = () => {
    lastInteractionTime.current = Date.now();
  };

  const handleTouchMove = () => {
    lastInteractionTime.current = Date.now();
  };

  const handleTouchEnd = () => {
    lastInteractionTime.current = Date.now();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    lastInteractionTime.current = Date.now();
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    lastInteractionTime.current = Date.now();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    isDraggingRef.current = false;
    lastInteractionTime.current = Date.now();

    const container = scrollContainerRef.current;
    const slideWidth = container.clientWidth || 1;
    const nearestIndex = Math.round(container.scrollLeft / slideWidth);
    const targetIndex = Math.max(0, Math.min(2, nearestIndex));
    
    container.scrollTo({
      left: targetIndex * slideWidth,
      behavior: 'smooth'
    });
    currentSlideRef.current = targetIndex;
    setCurrentSlide(targetIndex);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    lastInteractionTime.current = Date.now();

    const container = scrollContainerRef.current;
    const slideWidth = container.clientWidth || 1;
    const index = Math.round(container.scrollLeft / slideWidth);
    const targetIndex = Math.max(0, Math.min(2, index));

    if (targetIndex !== currentSlideRef.current) {
      currentSlideRef.current = targetIndex;
      setCurrentSlide(targetIndex);
    }
  };

  // Wishlist list state - defaults to index bananas and butter item values
  const [wishlist, setWishlist] = useState<string[]>(['f1', 'd1']);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Haptic feedback preference state (defaults to true)
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(() => {
    return localStorage.getItem('zippi_haptic_enabled') !== 'false';
  });

  const handleToggleHaptic = () => {
    const nextVal = !isHapticEnabled;
    setIsHapticEnabled(nextVal);
    localStorage.setItem('zippi_haptic_enabled', String(nextVal));
    if (nextVal) {
      triggerHapticFeedback('light');
    }
  };

  // Simulated Camera OCR Scan Popup state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);

  // Local Storage Persistent Carts & Orders
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('zippi_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('zippi_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Location/Addresses State with updated default details to match 123, Main Street, Colombo 03
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const savedAddrs = localStorage.getItem('zippi_addresses');
    if (savedAddrs) return JSON.parse(savedAddrs);
    return [
      {
        id: 'a1',
        label: 'Home',
        details: '123, Main Street, Colombo 03...',
        isDefault: true,
      },
      {
        id: 'a2',
        label: 'Office',
        details: 'Level 14, World Trade Center East Tower, Colombo 01',
        isDefault: false,
      },
    ];
  });
  const [selectedAddress, setSelectedAddress] = useState<Address>(addresses[0]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newDetails, setNewDetails] = useState('');
  const [addressTab, setAddressTab] = useState<'address' | 'locker'>('address');
  const [addressSearch, setAddressSearch] = useState('');
  const [addressOptionsItem, setAddressOptionsItem] = useState<Address | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [browsingCategory, setBrowsingCategory] = useState<string | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>('grocery');
  const [categoriesToast, setCategoriesToast] = useState<string | null>(null);

  // Drawer / details views overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  
  // Checkout calculations & simulated process variables
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPromo, setCheckoutPromo] = useState('');
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutDeliveryFee, setCheckoutDeliveryFee] = useState(350);

  // Track active orders modal
  const [activeTrackOrder, setActiveTrackOrder] = useState<Order | null>(null);

  // User profile states for Zippi Account section (Noon Match)
  const [userName, setUserName] = useState(() => localStorage.getItem('zippi_userName') || 'Asjath Ahamed');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('zippi_userEmail') || 'asjathahamed0@gmail.com');
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('zippi_userPhone') || '');
  const [userGender, setUserGender] = useState(() => localStorage.getItem('zippi_userGender') || '');
  const [userCity, setUserCity] = useState(() => localStorage.getItem('zippi_userCity') || '');
  const [profileAvatarFile, setProfileAvatarFile] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('zippi_language') || 'English');
  const [activeAccountSubModal, setActiveAccountSubModal] = useState<
    'profile_edit' | 'orders' | 'returns' | 'credits' | 'notifications' | 'language' | 'help' | 'terms' | 'card_apply' | 'zippi_one' | 'zippi_library' | null
  >(null);

  // Notifications toggle settings states
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifDelivery, setNotifDelivery] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  // Dynamic profile progress calculation (starts at 20% and hits 100% when details are completed)
  const profileProgress = React.useMemo(() => {
    let score = 20;
    if (userPhone.trim()) score += 25;
    if (userGender.trim()) score += 25;
    if (userCity.trim()) score += 30;
    return Math.min(score, 100);
  }, [userPhone, userGender, userCity]);

  // Auto carousel rotation with user interaction checking & smooth scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      // If no interaction for 4.5 seconds, auto-scroll to the next slide
      if (!isHoveredRef.current && Date.now() - lastInteractionTime.current >= 4500) {
        const next = (currentSlideRef.current + 1) % 3;
        const container = scrollContainerRef.current;
        if (container) {
          const slideWidth = container.clientWidth;
          container.scrollTo({
            left: next * slideWidth,
            behavior: 'smooth'
          });
          currentSlideRef.current = next;
          setCurrentSlide(next);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize cart to localStorage on modification
  useEffect(() => {
    localStorage.setItem('zippi_cart', JSON.stringify(cart));
  }, [cart]);

  // Synchronize orders to localStorage on modification
  useEffect(() => {
    localStorage.setItem('zippi_orders', JSON.stringify(orders));
  }, [orders]);

  // Synchronize addresses
  useEffect(() => {
    localStorage.setItem('zippi_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Synchronize profile details and language preferences
  useEffect(() => {
    localStorage.setItem('zippi_userName', userName);
    localStorage.setItem('zippi_userEmail', userEmail);
    localStorage.setItem('zippi_userPhone', userPhone);
    localStorage.setItem('zippi_userGender', userGender);
    localStorage.setItem('zippi_userCity', userCity);
    localStorage.setItem('zippi_language', selectedLanguage);
  }, [userName, userEmail, userPhone, userGender, userCity, selectedLanguage]);

  // Auto dismiss category toast alerts
  useEffect(() => {
    if (categoriesToast) {
      const timer = setTimeout(() => setCategoriesToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [categoriesToast]);

  // Handle Incremental addition to cart
  const handleAddToCart = (product: Product, selectedUnit?: string) => {
    triggerHapticFeedback('double');
    const unit = selectedUnit || (product.variants && product.variants.length > 0 ? product.variants[0].unit : product.unit);
    setCart((prevCart) => {
      const match = prevCart.find((i) => i.product.id === product.id && (i.selectedUnit || i.product.unit) === unit);
      if (match) {
        return prevCart.map((i) => 
          i.product.id === product.id && (i.selectedUnit || i.product.unit) === unit ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { product, quantity: 1, selectedUnit: unit }];
    });
  };

  const handleRemoveOne = (product: Product, selectedUnit?: string) => {
    triggerHapticFeedback('light');
    const unit = selectedUnit || (product.variants && product.variants.length > 0 ? product.variants[0].unit : product.unit);
    setCart((prevCart) => {
      const match = prevCart.find((i) => i.product.id === product.id && (i.selectedUnit || i.product.unit) === unit);
      if (match) {
        if (match.quantity <= 1) {
          return prevCart.filter((i) => !(i.product.id === product.id && (i.selectedUnit || i.product.unit) === unit));
        }
        return prevCart.map((i) => 
          i.product.id === product.id && (i.selectedUnit || i.product.unit) === unit ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart;
    });
  };

  const handleUpdateQty = (productId: string, selectedUnit: string | undefined, delta: number) => {
    triggerHapticFeedback(delta > 0 ? 'double' : 'light');
    setCart((prevCart) => {
      const resolvedUnit = selectedUnit || prevCart.find(i => i.product.id === productId)?.product.unit;
      const match = prevCart.find((i) => i.product.id === productId && (i.selectedUnit || i.product.unit) === resolvedUnit);
      if (match) {
        const nextQty = match.quantity + delta;
        if (nextQty <= 0) {
          return prevCart.filter((i) => !(i.product.id === productId && (i.selectedUnit || i.product.unit) === resolvedUnit));
        }
        return prevCart.map((i) =>
          i.product.id === productId && (i.selectedUnit || i.product.unit) === resolvedUnit ? { ...i, quantity: nextQty } : i
        );
      }
      return prevCart;
    });
  };

  const handleRemoveItem = (productId: string, selectedUnit?: string) => {
    triggerHapticFeedback('error');
    setCart((prevCart) => {
      const resolvedUnit = selectedUnit || prevCart.find(i => i.product.id === productId)?.product.unit;
      return prevCart.filter((i) => !(i.product.id === productId && (i.selectedUnit || i.product.unit) === resolvedUnit));
    });
  };

  const handleUpdateUnit = (productId: string, oldUnit: string | undefined, newUnit: string) => {
    setCart((prevCart) => {
      const resolvedOldUnit = oldUnit || prevCart.find(i => i.product.id === productId)?.product.unit;
      const matchIndex = prevCart.findIndex(i => i.product.id === productId && (i.selectedUnit || i.product.unit) === resolvedOldUnit);
      if (matchIndex > -1) {
        const itemToUpdate = prevCart[matchIndex];
        const existingTargetIndex = prevCart.findIndex(i => i.product.id === productId && (i.selectedUnit || i.product.unit) === newUnit);
        if (existingTargetIndex > -1 && existingTargetIndex !== matchIndex) {
          const updated = [...prevCart];
          updated[existingTargetIndex] = { ...updated[existingTargetIndex], quantity: updated[existingTargetIndex].quantity + itemToUpdate.quantity };
          return updated.filter((_, idx) => idx !== matchIndex);
        } else {
          return prevCart.map((i, idx) =>
            idx === matchIndex ? { ...i, selectedUnit: newUnit } : i
          );
        }
      }
      return prevCart;
    });
  };

  // Wishlist toggle function
  const handleToggleWishlist = (productId: string) => {
    const isAdding = !wishlist.includes(productId);
    triggerHapticFeedback(isAdding ? 'double' : 'light');
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Checkout Actions
  const handleProceedToCheckout = (promo: string, amt: number, finalFee: number) => {
    setIsCartOpen(false);
    setCheckoutPromo(promo);
    setCheckoutDiscount(amt);
    setCheckoutDeliveryFee(finalFee);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    triggerHapticFeedback('success');
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setActiveTrackOrder(newOrder); 
    setIsCheckoutOpen(false);
    setActiveTab('account'); // Route to account where Order logs & active tracking are presented beautifully!
  };

  const handleReorder = (order: Order) => {
    setCart((prev) => {
      let next = [...prev];
      order.items.forEach((item) => {
        const matchIdx = next.findIndex((i) => i.product.id === item.product.id);
        if (matchIdx >= 0) {
          next[matchIdx].quantity += item.quantity;
        } else {
          next.push({ product: item.product, quantity: item.quantity });
        }
      });
      return next;
    });
    setActiveTab('cart'); // Immediately open checkout baskets inline view!
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetails.trim()) return;

    triggerHapticFeedback('success');

    if (editingAddressId) {
      // Edit mode
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddressId
            ? { ...addr, label: newLabel, details: newDetails }
            : addr
        )
      );
      
      // Keep selectedAddress in sync
      setSelectedAddress((prev) => {
        if (prev && prev.id === editingAddressId) {
          return { ...prev, label: newLabel, details: newDetails };
        }
        return prev;
      });

      setEditingAddressId(null);
      setNewDetails('');
      setCategoriesToast("Address updated successfully!");
      setIsAddressModalOpen(false);
    } else {
      // Create mode
      const added: Address = {
        id: 'addr-' + Date.now(),
        label: newLabel,
        details: newDetails,
        isDefault: false
      };

      setAddresses((prev) => [...prev, added]);
      setSelectedAddress(added);
      setNewDetails('');
      setCategoriesToast("Address added successfully!");
      setIsAddressModalOpen(false);
    }
  };

  // Perform Dynamic filtering and sorting of products in accordance with chips states
  const filteredProducts = activeProducts.filter((p) => {
    // 1. Category checklist
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    // 2. Text Search queries
    const matchesSearch = searchQuery === '' || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 3. Fast delivery filter (only show popular items)
    const matchesFastDelivery = !fastDeliveryFilter || p.popular;

    // 4. Deals filter mapping
    let matchesDeals = true;
    if (selectedDealsList && !selectedDealsList.includes('All') && selectedDealsList.length > 0) {
      matchesDeals = selectedDealsList.some(dealType => {
        if (dealType === 'Grand Lifestyle Sale') return p.originalPrice ? (p.originalPrice - p.price >= 150) : false;
        if (dealType === 'Mega Deal 📣') return p.discountPercent ? (p.discountPercent >= 15) : false;
        if (dealType === 'Eid Deal 🌙') return p.discountPercent ? (p.discountPercent >= 20) : false;
        if (dealType === 'Deal') return p.discountPercent ? (p.discountPercent > 0) : false;
        return false;
      });
    } else if (dealsFilter) {
      matchesDeals = p.discountPercent !== undefined && p.discountPercent > 0;
    }

    // 5. Brand filter check
    let matchesBrand = true;
    if (selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0) {
      matchesBrand = selectedBrandsList.some(brand => 
        p.name.toLowerCase().includes(brand.toLowerCase())
      );
    } else if (selectedBrand !== 'All') {
      matchesBrand = p.name.toLowerCase().includes(selectedBrand.toLowerCase());
    }

    return matchesCategory && matchesSearch && matchesFastDelivery && matchesDeals && matchesBrand;
  });

  // Calculate separate list values for sections
  const bestsellerProducts = activeProducts.filter(p => p.popular);
  const freshTodayProducts = activeProducts.filter(p => p.category === 'veggies' || p.category === 'fruits' || p.category === 'dairy');

  const trendingProductsList = activeProducts.filter(p => p.popular).length > 0
    ? activeProducts.filter(p => p.popular).slice(0, 10)
    : TRENDING_IDS.map(id => activeProducts.find(p => p.id === id)).filter((p): p is Product => !!p);

  const freshProductsList = activeProducts.filter(p => p.category === 'veggies' || p.category === 'fruits').length > 0
    ? activeProducts.filter(p => p.category === 'veggies' || p.category === 'fruits').slice(0, 10)
    : FRESH_IDS.map(id => activeProducts.find(p => p.id === id)).filter((p): p is Product => !!p);

  const flashProductsList = activeProducts.filter(p => p.isFlashDeal).length > 0
    ? activeProducts.filter(p => p.isFlashDeal).slice(0, 10)
    : FLASH_IDS.map(id => activeProducts.find(p => p.id === id)).filter((p): p is Product => !!p);

  const cartTotalQty = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => {
    const price = (i.selectedUnit && i.product.variants && i.product.variants.length > 0)
      ? (i.product.variants.find(v => v.unit === i.selectedUnit)?.price ?? i.product.price)
      : i.product.price;
    return acc + (price * i.quantity);
  }, 0);

  // Dynamic predictions list for popular terms
  const searchPredictions = [
    'Cavendish Bananas',
    'Kotmale Butter',
    'Nuwara Eliya Carrot',
    'Keeri Samba Rice',
    'English Breakfast Tea',
    'Premium Frozen French Fries'
  ];

  // Switcher Tile item triggers
  const handleSwitcherClick = (tileId: string) => {
    setActiveSwitcherTile(tileId);
    if (tileId === 'zippi') {
      // Reset view to raw Home and reset filter overrides
      setSelectedCategory('all');
      setFastDeliveryFilter(false);
      setDealsFilter(false);
      setSelectedBrand('All');
      setActiveTab('home');
    } else if (tileId === 'fresh') {
      // Direct user to Home tab with Fresh Produce filter focused
      setSelectedCategory('veggies');
      setActiveTab('home');
    } else if (tileId === 'express') {
      // Toggle Express Delivery and view Home tab
      setFastDeliveryFilter(true);
      setActiveTab('home');
    } else if (tileId === 'deals') {
      // Redirect direct to Deals bottom tab!
      setActiveTab('deals');
    }
  };

  // Launch Simulated camera barcode scan
  const triggerCameraScan = () => {
    setIsCameraOpen(true);
    setIsScanningActive(true);
    setTimeout(() => {
      setIsScanningActive(false);
      // Automatically detect "Kotmale Butter" and filter products to dairy
      setSelectedCategory('dairy');
      setSearchQuery('Kotmale');
      setIsCameraOpen(false);
    }, 2400);
  };

  if (showSplash) {
    return <ZippiSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center py-0 md:py-6 text-[#1A1A1A] font-sans" id="zippi-root-wrapper">
      
      {/* Mobile viewport frame boundary constraint - MAX WIDTH 430px, Pristine White Background */}
      <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col justify-between overflow-hidden h-[100dvh] md:h-[92vh] md:rounded-2xl border border-gray-200">
        
        {browsingCategory ? (
          <ProductListingView
            browsingCategory={browsingCategory}
            onClose={() => setBrowsingCategory(null)}
            categories={activeCategories}
            dealsOptions={dealsOptions}
            brandsOptions={brandsOptions}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveOne={handleRemoveOne}
            onViewDetails={setActiveDetailProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenCart={() => setIsCartOpen(true)}
            products={activeProducts}
          />
        ) : (
          <>
            {/* VIEWPORT AREA: HOME SCREEN TAB */}
            {activeTab === 'home' && (
          <div className="flex-grow flex flex-col overflow-y-auto">
            
            {/* ── TOP APP SWITCHER ROW ── (At the absolute top of the screen) */}
            <div className="px-4 pt-4 pb-2 bg-white flex items-center justify-between gap-2.5 z-20 border-b border-gray-150" id="top-app-switcher">
              {/* Tile 1: Zippi Active */}
              <button 
                onClick={() => handleSwitcherClick('zippi')}
                className={`w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center p-2.5 transition-all text-center border cursor-pointer select-none ${
                  activeSwitcherTile === 'zippi' 
                    ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-sm ring-1 ring-yellow-400' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="w-7 h-7 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-1 text-yellow-400 text-[11px] font-black pointer-events-none">
                  Z
                </div>
                <span className="text-[11.5px] font-bold tracking-tight">Zippi</span>
              </button>

              {/* Tile 2: Fresh */}
              <button 
                onClick={() => handleSwitcherClick('fresh')}
                className={`w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center p-2.5 transition-all text-center border cursor-pointer select-none ${
                  activeSwitcherTile === 'fresh' 
                    ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-sm ring-1 ring-yellow-400' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <ShoppingBasket className={`w-6 h-6 mb-1 ${activeSwitcherTile === 'fresh' ? 'text-brand-charcoal' : 'text-gray-400'}`} />
                <span className="text-[11px] font-semibold tracking-tight">Fresh</span>
              </button>

              {/* Tile 3: Express */}
              <button 
                onClick={() => handleSwitcherClick('express')}
                className={`w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center p-2.5 transition-all text-center border cursor-pointer select-none ${
                  activeSwitcherTile === 'express' 
                    ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-sm ring-1 ring-yellow-400' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Clock className={`w-6 h-6 mb-1 ${activeSwitcherTile === 'express' ? 'text-brand-charcoal' : 'text-gray-400'}`} />
                <span className="text-[11px] font-semibold tracking-tight">Express</span>
              </button>

              {/* Tile 4: Deals */}
              <button 
                onClick={() => handleSwitcherClick('deals')}
                className={`w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center p-2.5 transition-all text-center border cursor-pointer select-none ${
                  activeSwitcherTile === 'deals' 
                    ? 'bg-[#F5C518] border-transparent text-[#1A1A1A] font-extrabold shadow-sm ring-1 ring-yellow-400' 
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Tag className={`w-6 h-6 mb-1 ${activeSwitcherTile === 'deals' ? 'text-brand-charcoal' : 'text-gray-400'}`} />
                <span className="text-[11px] font-semibold tracking-tight">Deals</span>
              </button>
            </div>

            {/* ── ADDRESS BAR ── */}
            <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-gray-100" id="address-bar">
              <div 
                className="flex flex-col text-left cursor-pointer select-none max-w-[80%] hover:opacity-85"
                onClick={() => setIsAddressModalOpen(true)}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm">🏠</span>
                  <span className="font-extrabold text-sm text-[#1A1A1A] flex items-center gap-0.5">
                    Home <span className="text-[10px] text-gray-500 font-bold">▾</span>
                  </span>
                </div>
                <span className="text-[11px] text-[#888888] truncate mt-0.5 tracking-tight font-medium">
                  {selectedAddress.details}
                </span>
              </div>

              {/* Heart Wishlist Trigger icon (outlined, dark) */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#1A1A1A] transition-colors relative"
                id="wishlist-header-btn"
              >
                <Heart className="w-5 h-5" strokeWidth={2.2} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                )}
              </button>
            </div>

            {/* ── SEARCH BAR ── */}
            <div className="px-4 py-2 bg-white" id="search-bar-container">
              <div className="relative">
                {/* Search glass left icon */}
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                
                <input
                  type="text"
                  placeholder="Search groceries..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 220)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-xs font-semibold pl-10 pr-10 py-3 rounded-full border border-gray-200 placeholder:text-gray-400"
                />

                {/* Camera icon right */}
                <button 
                  onClick={triggerCameraScan}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-charcoal cursor-pointer"
                  title="Scan grocery barcode"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>

                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-10 pr-2 flex items-center text-gray-400 hover:text-brand-charcoal cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Interactive Auto-prediction Popover Box */}
                {isSearchFocused && !searchQuery && (
                  <div className="absolute top-12 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-xl p-3.5 z-40 space-y-2 text-xs">
                    <p className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">Fast Colombo Predictions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {searchPredictions.map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="bg-gray-50 hover:bg-gray-100 text-[#1A1A1A] font-semibold px-2 py-1.5 rounded-lg border border-gray-200 text-[11px] transition-colors cursor-pointer"
                        >
                          ⚡ {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── SEARCH OR FILTER OVERLAY DISPLAY ── */}
            {(searchQuery || selectedCategory !== 'all' || selectedBrand !== 'All' || dealsFilter) ? (
              <div className="flex-grow p-4 space-y-4 bg-white">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-[14px]">Active Filter Catalogue ({filteredProducts.length} items)</h3>
                    <p className="text-[10px] text-gray-400">Showing custom query adjustments</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setDealsFilter(false);
                      setFastDeliveryFilter(false);
                      setSelectedBrand('All');
                    }}
                    className="text-[11px] text-brand-blue font-bold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Reset All
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
                    <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-2xl mx-auto">🥬</div>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">No matches for this selection</h4>
                    <p className="text-xs text-gray-400 max-w-[240px] mx-auto">
                      Adjust your filter chips or reset text searches above to load more fresh assets.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => {
                      const qty = cart.filter(i => i.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          cartQty={qty}
                          onAddToCart={() => handleAddToCart(product)}
                          onRemoveOne={() => handleRemoveOne(product)}
                          onViewDetails={() => setActiveDetailProduct(product)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ── PROMOTIONAL BANNER CAROUSEL ── */}
                <div 
                  className="relative px-4 py-2 bg-white select-none cursor-pointer" 
                  id="promo-carousel"
                  onMouseEnter={() => { isHoveredRef.current = true; lastInteractionTime.current = Date.now() + 999999; }}
                  onMouseLeave={() => { isHoveredRef.current = false; lastInteractionTime.current = Date.now(); }}
                >
                  <div className="overflow-hidden rounded-2xl">
                    <div 
                      ref={scrollContainerRef}
                      onScroll={handleScroll}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      className="flex flex-nowrap gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none select-none rounded-2xl"
                      style={{ touchAction: 'pan-y', scrollbarWidth: 'none' }}
                    >
                      
                      {/* Swipeable Slide 0 - Active Green Grocery Banner (Fully Compliant Spec) */}
                      <div className="w-full shrink-0 bg-[#2E7D32] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden select-none snap-center">
                        {/* Abstract background styling */}
                        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-white/5 rounded-l-full pointer-events-none transform translate-x-12 scale-110 z-0"></div>
                        
                        <div className="space-y-1.5 relative z-10 w-[60%] flex flex-col justify-center text-left">
                          <span className="text-[9px] uppercase tracking-wider bg-white/25 border border-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-sm w-fit">Promo code</span>
                          <h3 className="text-base font-black tracking-tight uppercase leading-none">GROCERY SAVER WEEK</h3>
                          
                          {/* Cashback code chips */}
                          <div className="space-y-1 pt-1">
                            <div className="bg-white/10 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap w-fit">
                              10% cashback · Use code: <span className="text-yellow-300 font-extrabold font-mono">FRESH10</span>
                            </div>
                            <div className="bg-white/10 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap w-fit">
                              15% cashback · Use code: <span className="text-yellow-300 font-extrabold font-mono">ZIPPI15</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Circle badge and grocery product mock items */}
                        <div className="relative w-[38%] h-28 flex flex-col justify-between items-end z-10">
                          {/* Yellow Up to 70% off circle badge */}
                          <div className="bg-[#F5C518] text-[#1A1A1A] w-12 h-12 rounded-full flex flex-col justify-center items-center text-center shadow-md border border-yellow-250 transform rotate-12 mt-1">
                            <span className="text-[7px] font-black uppercase leading-none">Up to</span>
                            <span className="text-[11px] font-black leading-none">70% off</span>
                          </div>
                          
                          {/* Rice, detergent and crops */}
                          <div className="absolute bottom-0 right-1 flex items-end gap-1 font-sans">
                            <span className="text-3xl filter drop-shadow-sm select-none transform hover:scale-105 transition-all">🍚</span>
                            <span className="text-3xl filter drop-shadow-sm select-none transform hover:scale-105 transition-all">🧼</span>
                            <span className="text-2xl filter drop-shadow-sm select-none transform hover:scale-105 transition-all">🥕</span>
                          </div>
                        </div>
                      </div>

                      {/* Slide 1 - TVS King Express Delivery */}
                      <div className="w-full shrink-0 bg-[#1565C0] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden text-left select-none snap-center">
                        <div className="space-y-1 relative z-10 w-[65%]">
                          <span className="text-[9px] uppercase tracking-wider bg-yellow-400 text-brand-charcoal font-black px-1.5 py-0.5 rounded-sm">ZIPPI SPEED</span>
                          <h3 className="text-base font-black tracking-tight leading-tight">COLOMBO FLAT DELIVERIES</h3>
                          <p className="text-[10.5px] text-blue-100 font-medium leading-relaxed">
                            LKR 0 shipping fees of fresh meats or veggies on orders above LKR 3,000.
                          </p>
                        </div>
                        <div className="w-[30%] h-20 relative flex items-center justify-center text-5xl select-none">
                          🛵
                        </div>
                      </div>

                      {/* Slide 2 - Fresh Milk & Butter Combo specials */}
                      <div className="w-full shrink-0 bg-[#FF6F00] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden text-left select-none snap-center">
                        <div className="space-y-1 relative z-10 w-[65%]">
                          <span className="text-[9px] uppercase tracking-wider bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-sm">KITCHEN DEALS</span>
                          <h3 className="text-base font-black tracking-tight leading-tight">LOCAL DIARY ESSENTIALS</h3>
                          <p className="text-[10.5px] text-amber-50 font-medium leading-relaxed">
                            Get up to LKR 150 off on Kotmale Butter & Pelwatte fresh milk assemblies.
                          </p>
                        </div>
                        <div className="w-[30%] h-20 relative flex items-center justify-center text-5xl select-none">
                          🥛
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Dot Indicators below banner */}
                  <div className="flex justify-center gap-1.5 mt-2.5">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`carousel-dot ${currentSlide === idx ? 'active-dot' : ''}`}
                        aria-label={`Slide index ${idx}`}
                        style={{
                          background: currentSlide === idx ? '#F5C518' : 'rgba(0, 0, 0, 0.15)',
                          width: currentSlide === idx ? '20px' : '6px',
                          height: '6px',
                          borderRadius: '999px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* ── FILTER CHIPS ROW ── */}
                <div className="px-4 pt-3.5 pb-4 bg-white border-b border-gray-100 overflow-x-auto flex items-center gap-2.5 scrollbar-none select-none relative" id="filter-chips">
                  {/* [⚡ Fast Delivery ▾] Yellow BG Bold, Active */}
                  <button 
                    onClick={() => setFastDeliveryFilter(!fastDeliveryFilter)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                      fastDeliveryFilter 
                        ? 'bg-[#F5C518] text-[#1A1A1A] border-[#E0B000]' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>⚡ Fast Delivery</span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {/* [Deals ▾] Trigger Bottom Sheet */}
                  <button 
                    onClick={() => setActiveFilterSheet('deals')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                      (selectedDealsList && selectedDealsList.length > 0 && !selectedDealsList.includes('All')) || dealsFilter
                        ? 'bg-[#F5C518] text-[#1A1A1A] border-[#E0B000]' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>
                      {selectedDealsList && !selectedDealsList.includes('All') && selectedDealsList.length > 0
                        ? `Deals (${selectedDealsList.length})`
                        : 'Deals'}
                    </span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {/* [Brand ▾] Trigger Bottom Sheet */}
                  <button 
                    onClick={() => setActiveFilterSheet('brand')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                      (selectedBrandsList && selectedBrandsList.length > 0 && !selectedBrandsList.includes('All')) || selectedBrand !== 'All'
                        ? 'bg-[#F5C518] text-[#1A1A1A] border-[#E0B000]' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>
                      {selectedBrandsList && !selectedBrandsList.includes('All') && selectedBrandsList.length > 0
                        ? `Brand (${selectedBrandsList.length})`
                        : selectedBrand !== 'All' ? `Brand: ${selectedBrand}` : 'Brand'}
                    </span>
                    <span className="text-[10px]">▾</span>
                  </button>
                </div>

                {/* ── CATEGORY GRID ── (No title, 4 columns, 2 rows) */}
                <div className="px-4 py-3 bg-white" id="category-grid-box">
                  <div className="grid grid-cols-4 gap-2.5">
                    {activeCategories.filter(c => !c.parentSlug).slice(0, 8).map((cat) => {
                      return (
                        <div 
                          key={cat.slug} 
                          onClick={() => {
                            setBrowsingCategory(cat.slug);
                          }}
                          className={`relative rounded-2xl flex flex-col justify-between bg-white border p-1 pt-1.5 pb-2.5 cursor-pointer transition-all hover:border-[#F5C518] hover:shadow-xs active:scale-95 border-gray-200`}
                          style={{ height: '100px', width: '92px' }}
                        >
                          
                          {/* Category Image - top 70% of card */}
                          <div className="w-full h-[65%] rounded-lg overflow-hidden bg-gray-50/50 flex items-center justify-center p-0 relative">
                            <img 
                              src={cat.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=120&auto=format&fit=crop&q=80'} 
                              alt={cat.name} 
                              className="object-cover w-full h-full transform hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            {cat.icon && (
                              <span className="absolute bottom-0.5 right-0.5 text-[10px] select-none">{cat.icon}</span>
                            )}
                          </div>
 
                          {/* Category Name - center, 12px, dark text */}
                          <div className="h-[35%] flex items-end justify-center pt-1">
                            <span className="text-[11.5px] font-bold text-[#1A1A1A] text-center truncate px-0.5 leading-tight">
                              {cat.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── 8px GRAY PAGE DIVIDER ── */}
                <div className="h-2 bg-[#EEEEEE]" id="divider-1"></div>

                {/* ── SECTION 1: "🔥 Trending Now" (marquee right-to-left 22s) ── */}
                <div className="bg-white py-4 flex flex-col" id="section-marquee-trending-1">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h2 className="text-[18px] font-black text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
                      🔥 Trending Now
                    </h2>
                    <button 
                      onClick={() => {
                        setFastDeliveryFilter(true);
                      }}
                      className="text-[13px] text-[#1565C0] hover:text-[#0D47A1] font-bold flex items-center gap-0.5 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      View all <span className="text-[11px]">→</span>
                    </button>
                  </div>

                  <div 
                    className="marquee-container"
                    onTouchStart={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'paused';
                    }}
                    onTouchEnd={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'running';
                    }}
                  >
                    <div className="marquee-track-rtl-s1">
                      {[...trendingProductsList, ...trendingProductsList].map((product, idx) => {
                        const qty = cart.filter(i => i.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                          <div className="w-[140px] shrink-0" key={`${product.id}-trend1-${idx}`}>
                            <ProductCard
                              product={product}
                              cartQty={qty}
                              onAddToCart={() => handleAddToCart(product)}
                              onRemoveOne={() => handleRemoveOne(product)}
                              onViewDetails={() => setActiveDetailProduct(product)}
                              isWishlisted={wishlist.includes(product.id)}
                              onToggleWishlist={() => handleToggleWishlist(product.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── 8px GRAY PAGE DIVIDER ── */}
                <div className="h-2 bg-[#EEEEEE]" id="divider-under-trending-1"></div>

                {/* ── SECTION 2: "🌿 Fresh Today" (marquee right-to-left 25s) ── */}
                <div className="bg-white py-4 flex flex-col" id="section-marquee-fresh">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h2 className="text-[18px] font-black text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
                      🌿 Fresh Today
                    </h2>
                    <button 
                      onClick={() => {
                        setSelectedCategory('veggies');
                      }}
                      className="text-[13px] text-[#1565C0] hover:text-[#0D47A1] font-bold flex items-center gap-0.5 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      View all <span className="text-[11px]">→</span>
                    </button>
                  </div>

                  <div 
                    className="marquee-container"
                    onTouchStart={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'paused';
                    }}
                    onTouchEnd={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'running';
                    }}
                  >
                    <div className="marquee-track-ltr">
                      {[...freshProductsList, ...freshProductsList].map((product, idx) => {
                        const qty = cart.filter(i => i.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                          <div className="w-[140px] shrink-0" key={`${product.id}-fresh-${idx}`}>
                            <ProductCard
                              product={product}
                              cartQty={qty}
                              onAddToCart={() => handleAddToCart(product)}
                              onRemoveOne={() => handleRemoveOne(product)}
                              onViewDetails={() => setActiveDetailProduct(product)}
                              isWishlisted={wishlist.includes(product.id)}
                              onToggleWishlist={() => handleToggleWishlist(product.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── 8px GRAY PAGE DIVIDER ── */}
                <div className="h-2 bg-[#EEEEEE]" id="divider-under-fresh"></div>

                {/* ── SECTION 4: "⚡ Flash Deals" ── */}
                <div className="bg-white py-4 px-0 flex flex-col" id="section-marquee-flash">
                  {/* Full-width yellow countdown timer bar  */}
                  <div className="px-4 mb-3">
                    <FlashDealsTimer />
                  </div>

                  <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="text-[18px] font-extrabold text-[#1A1A1A] tracking-tight">Active Flash Discounts</h3>
                    <button 
                      onClick={() => {
                        setActiveTab('deals');
                      }}
                      className="text-[13px] text-[#1565C0] hover:text-[#0D47A1] font-bold flex items-center gap-0.5 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      View all <span className="text-[11px]">→</span>
                    </button>
                  </div>

                  <div 
                    className="marquee-container"
                    onTouchStart={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'paused';
                    }}
                    onTouchEnd={(e) => {
                      const track = e.currentTarget.firstElementChild as HTMLElement;
                      if (track) track.style.animationPlayState = 'running';
                    }}
                  >
                    <div className="marquee-track-rtl-flash">
                      {[...flashProductsList, ...flashProductsList].map((product, idx) => {
                        const qty = cart.filter(i => i.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                          <div className="w-[140px] shrink-0" key={`${product.id}-flash-${idx}`}>
                            <ProductCard
                              product={product}
                              cartQty={qty}
                              onAddToCart={() => handleAddToCart(product)}
                              onRemoveOne={() => handleRemoveOne(product)}
                              onViewDetails={() => setActiveDetailProduct(product)}
                              isWishlisted={wishlist.includes(product.id)}
                              onToggleWishlist={() => handleToggleWishlist(product.id)}
                              isFlashDeal={true}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── 8px GRAY PAGE DIVIDER ── */}
                <div className="h-2 bg-[#EEEEEE]" id="divider-under-flash"></div>
              </>
            )}

            {/* Support Colombo Farmers Collective Promise footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-start gap-2.5">
              <span className="text-xl">👩‍🌾</span>
              <div className="text-[10.5px] leading-relaxed">
                <p className="font-extrabold text-brand-charcoal">Official Colombo Farmers Collective Partnership</p>
                <p className="text-[#888888]">By shopping on Zippi, you support 140+ Sri Lankan cooperative families.</p>
              </div>
            </div>

          </div>
        )}

        {/* VIEWPORT AREA: CATEGORIES DISPLAY DEPARTMENTS */}
        {activeTab === 'categories' && (
          <div className="flex-grow flex flex-col overflow-y-auto bg-white relative pb-6" id="categories-viewport">
            
            {/* ── SEARCH BAR (same style as home, clean white) ── */}
            <div className="px-4 pt-4 pb-2 bg-white" id="categories-search-bar-container">
              <div className="relative">
                {/* Search glass left icon */}
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 220)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveTab('home');
                  }}
                  className="w-full bg-white text-xs font-semibold pl-10 pr-10 py-3 rounded-full border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-[#F5C518]"
                />
                {/* Camera icon right */}
                <button 
                  onClick={triggerCameraScan}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-charcoal cursor-pointer"
                  title="Scan grocery barcode"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* ── CATEGORIES GRID — Rows with nested inline subcategories ── */}
            <div className="px-4 pt-2 pb-6 flex-grow flex flex-col gap-3.5" id="categories-grid-container">
              {(() => {
                const parentCategories = activeCategories.filter(c => !c.parentSlug);
                const categoryRows: Category[][] = [];
                for (let i = 0; i < parentCategories.length; i += 3) {
                  categoryRows.push(parentCategories.slice(i, i + 3));
                }
                return categoryRows.map((row, rowIndex) => {
                  const rowHasSelected = row.some((cat) => cat.slug === selectedMainCategory);
                  
                  return (
                    <div key={`row-${rowIndex}`} className="flex flex-col gap-3">
                      {/* The 3-column row grid */}
                      <div className="grid grid-cols-3 gap-3">
                        {row.map((cat) => {
                          const isSelected = selectedMainCategory === cat.slug;
                          return (
                            <div
                              key={cat.slug}
                              onClick={() => {
                                setSelectedMainCategory(isSelected ? null : cat.slug);
                              }}
                              className="flex flex-col cursor-pointer select-none transition-all duration-250 active:scale-95 text-left group"
                              id={`category-card-${cat.slug}`}
                            >
                              {/* Rounded image container matching screenshot */}
                              <div className={`w-full aspect-[4/5] rounded-[24px] bg-[#F0F3F9] flex items-center justify-center overflow-hidden transition-all ${
                                isSelected 
                                  ? 'ring-2 ring-offset-2 ring-[#1A1A1A] shadow-md bg-white' 
                                  : 'border border-transparent hover:border-slate-200'
                              }`}>
                                <img 
                                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=150&auto=format&fit=crop&q=80'} 
                                  alt={cat.name} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {/* Category name below image container */}
                              <div className="mt-2 px-1 min-h-[36px]">
                                <span className="text-[12px] leading-tight font-extrabold text-slate-800 line-clamp-2">
                                  {cat.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Subcategories directly underneath this row */}
                      <AnimatePresence initial={false}>
                        {rowHasSelected && selectedMainCategory && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                            id="subcategories-animation-wrapper"
                          >
                            <div className="mt-2 pb-2 pt-1 flex flex-col gap-3" id="subcategories-list-container">
                              <div className="flex flex-col gap-2.5">
                                {(
                                  activeCategories.filter(c => c.parentSlug === selectedMainCategory).concat([
                                    {
                                      id: selectedMainCategory + '_all',
                                      slug: selectedMainCategory,
                                      name: 'View all',
                                      icon: 'layers',
                                      parentSlug: selectedMainCategory
                                    }
                                  ])
                                ).map((sub, idx) => (
                                  <div
                                    key={`${sub.slug}-${idx}`}
                                    onClick={() => {
                                      if (selectedMainCategory === 'car_rental') {
                                        setCategoriesToast(`${sub.name} service is launching soon in Colombo! Stay tuned.`);
                                      } else {
                                        setBrowsingCategory(sub.slug);
                                      }
                                    }}
                                    className="bg-[#F4F5F8] hover:bg-[#EAECF0] active:bg-[#E2E5EA] rounded-[20px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] group text-left h-[92px]"
                                    id={`subcat-row-${sub.slug}-${idx}`}
                                  >
                                    <div className="flex items-center gap-4">
                                      {/* Left icon wrapper */}
                                      <div className="w-16 h-16 bg-white rounded-[14px] border border-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                                        {sub.imageUrl ? (
                                          <img
                                            src={sub.imageUrl}
                                            alt={sub.name}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : sub.icon === 'layers' ? (
                                          <Layers className="w-[18px] h-[18px] text-[#2D3142]" />
                                        ) : (
                                          <span className="text-[26px] filter drop-shadow-xs leading-none">
                                            {sub.icon || '📦'}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Subcategory Name */}
                                      <span className="text-[15.5px] font-extrabold text-[#1A1A1A]">
                                        {sub.name}
                                      </span>
                                    </div>

                                    {/* Naked Chevron right */}
                                    <div>
                                      <ChevronRight className="w-4 h-4 text-[#A0AABF] group-hover:text-[#1A1A1A] transition-colors mr-1" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Categories coming soon custom floating toast */}
            {categoriesToast && (
              <div className="absolute bottom-22 left-6 right-6 mx-auto bg-[#1A1A1A] text-white text-[11px] font-semibold px-4.5 py-3 rounded-xl shadow-xl flex items-center justify-between animate-fade-in z-50 border border-white/10 select-none">
                <span>{categoriesToast}</span>
                <button 
                  onClick={() => setCategoriesToast(null)} 
                  className="text-brand-yellow font-black uppercase text-[9px] tracking-wider ml-4.5 active:scale-90 cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEWPORT AREA: DEALS SCREEN */}
        {activeTab === 'deals' && (
          <DealsView
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveOne={handleRemoveOne}
            onViewDetails={setActiveDetailProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenCart={() => setIsCartOpen(true)}
            setBrowsingCategory={setBrowsingCategory}
            products={activeProducts}
          />
        )}

        {/* VIEWPORT AREA: USER ACCOUNT & ORDERS HISTORIES */}
        {activeTab === 'account' && (
          <div className="flex-grow flex flex-col overflow-y-auto p-4 space-y-4 pb-12" id="noon-account-viewport">
            
            {/* USER PROFILE SECTION (white card, rounded) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-4" id="user-profile-section-card">
              <div className="flex items-center justify-between">
                {/* Left: Avatar circle (gray bg, white initial letter, 48px) */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-[#1A1A1A] text-[18px] shrink-0 uppercase select-none">
                    {profileAvatarFile ? (
                      <img src={profileAvatarFile} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    ) : (
                      userName.charAt(0) || 'U'
                    )}
                  </div>
                  {/* Center: User name (bold, 16px) + email (gray, 13px) */}
                  <div className="flex-grow">
                    <h4 className="font-extrabold text-[16px] text-brand-charcoal tracking-tight">{userName}</h4>
                    <p className="text-[13px] text-gray-500 font-medium break-all">{userEmail}</p>
                  </div>
                </div>

                {/* Right: 'Edit' button (gray outlined pill, small) */}
                <button
                  onClick={() => setActiveAccountSubModal('profile_edit')}
                  className="border border-gray-300 hover:bg-gray-50 text-[12px] font-bold px-3 py-1 rounded-full text-gray-600 transition-all cursor-pointer shadow-2xs"
                  id="edit-profile-btn"
                >
                  Edit
                </button>
              </div>

              {/* Below: Yellow progress bar (profile completion %) */}
              <div className="space-y-1.5 pt-1 border-t border-gray-55">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[12px] text-gray-500 font-medium font-sans">
                    Complete your profile to personalize experience
                  </span>
                  {/* '20%' yellow badge (right end of bar) */}
                  <span className="bg-[#FFFBEA] text-[#1A1A1A] font-black scale-95 border border-[#F5C518]/30 px-1.5 py-0.5 rounded-md text-[10.5px]">
                    {profileProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#FCA311] h-full rounded-full transition-all duration-500"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ZIPPI ONE PROMO CARD */}
            <div 
              onClick={() => setActiveAccountSubModal('zippi_one')}
              className="bg-gray-100/80 hover:bg-gray-100 rounded-2xl p-4 border border-gray-200 cursor-pointer flex items-center justify-between transition-all"
              id="zippi-one-promo-card"
            >
              {/* Left: 'Save LKR 1000+ every month' (green bold text) */}
              <div>
                <span className="text-[9.5px] uppercase font-black bg-emerald-105 text-emerald-850 tracking-wider px-2 py-0.5 rounded mb-1 inline-block">
                  ZIPPI ONE PREMIUM
                </span>
                <h4 className="font-extrabold text-[15px] text-emerald-700 leading-tight">
                  Save LKR 1000+ every month
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Enjoy VIP fast shipping, free delivery benefits & cashbacks
                </p>
              </div>

              {/* Right: 'Try Free · Zippi One →' (with Zippi One badge + arrow in yellow circle) */}
              <div className="flex items-center gap-1.5 pl-2">
                <span className="text-[11px] font-black text-brand-charcoal hidden sm:inline whitespace-nowrap">
                  Try Free
                </span>
                <div className="w-8 h-8 rounded-full bg-[#fca311] hover:bg-yellow-500 text-white flex items-center justify-center font-black transition-colors shrink-0 shadow-sm">
                  →
                </div>
              </div>
            </div>

            {/* QUICK ACTION GRID — 2x2 */}
            <div className="grid grid-cols-2 gap-3" id="quick-action-grid">
              {/* 1. Orders card */}
              <div 
                onClick={() => setActiveAccountSubModal('orders')}
                className="bg-white rounded-2xl border border-gray-200/90 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                id="qa-card-orders"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 text-xl font-bold">
                  📦
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[13px] text-brand-charcoal truncate">Orders</h4>
                  <p className="text-[10.5px] text-gray-400 font-medium truncate">Manage & track</p>
                </div>
              </div>

              {/* 2. Returns card */}
              <div 
                onClick={() => setActiveAccountSubModal('returns')}
                className="bg-white rounded-2xl border border-gray-200/90 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                id="qa-card-returns"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 text-xl font-bold font-sans">
                  🔄
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[13px] text-brand-charcoal truncate">Returns</h4>
                  <p className="text-[10.5px] text-gray-400 font-medium truncate">0 active requests</p>
                </div>
              </div>

              {/* 3. Zippi Credits card */}
              <div 
                onClick={() => setActiveAccountSubModal('credits')}
                className="bg-white rounded-2xl border border-gray-200/90 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                id="qa-card-credits"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xl font-bold">
                  💰
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[13px] text-brand-charcoal truncate">Zippi Credits</h4>
                  <p className="text-[10.5px] text-gray-400 font-medium truncate font-sans">LKR 0.00</p>
                </div>
              </div>

              {/* 4. Wishlist card */}
              <div 
                onClick={() => setIsWishlistOpen(true)}
                className="bg-white rounded-2xl border border-gray-200/90 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                id="qa-card-wishlist"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-xl font-bold">
                  ❤️
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[13px] text-brand-charcoal truncate">Wishlist</h4>
                  <p className="text-[10.5px] text-gray-400 font-medium truncate">{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
            </div>

            {/* MY ACCOUNT SECTION */}
            <div className="space-y-2.5 pt-1" id="my-account-section">
              <h3 className="font-extrabold text-[16px] text-brand-charcoal tracking-tight text-left">
                My account
              </h3>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 font-sans" id="account-list-container">
                
                {/* Addresses Item */}
                <div 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">📍</span>
                    <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Addresses</span>
                  </div>
                  <span className="text-gray-400 font-bold text-base select-none">›</span>
                </div>

                {/* Notifications Item */}
                <div 
                  onClick={() => setActiveAccountSubModal('notifications')}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">🔔</span>
                    <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Notifications</span>
                  </div>
                  <span className="text-gray-400 font-bold text-base select-none">›</span>
                </div>

                {/* Tactile Haptics Toggle Switch Item */}
                <div 
                  onClick={handleToggleHaptic}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                  id="account-btn-haptic-feedback"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">📳</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Tactile Haptics</span>
                      <span className="text-[10px] text-gray-400 font-medium">Vibrate on actions & button taps</span>
                    </div>
                  </div>
                  <div 
                    className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${
                      isHapticEnabled ? 'bg-brand-green' : 'bg-gray-200'
                    }`}
                  >
                    <div 
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                        isHapticEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Language Item */}
                <div 
                  onClick={() => setActiveAccountSubModal('language')}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">🌐</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Language</span>
                      <span className="text-[10px] text-[#FCA311] font-black bg-amber-50/40 px-1.5 py-0.5 rounded border border-[#FCA311]/20">{selectedLanguage}</span>
                    </div>
                  </div>
                  <span className="text-gray-400 font-bold text-base select-none">›</span>
                </div>

                {/* Help & Support Item */}
                <div 
                  onClick={() => setActiveAccountSubModal('help')}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">❓</span>
                    <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Help & Support</span>
                  </div>
                  <span className="text-gray-400 font-bold text-base select-none">›</span>
                </div>

                {/* Terms & Conditions Item */}
                <div 
                  onClick={() => setActiveAccountSubModal('terms')}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">📄</span>
                    <span className="text-[13.5px] font-extrabold text-neutral-800 font-sans">Terms & Conditions</span>
                  </div>
                  <span className="text-gray-400 font-bold text-base select-none">›</span>
                </div>

                {/* View App Intro / Screen animation */}
                <div 
                  onClick={() => setShowSplash(true)}
                  className="flex items-center justify-between p-3.5 hover:bg-yellow-50/50 cursor-pointer transition-all active:px-4 text-left"
                  id="account-btn-zippi-intro"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal">
                    <span className="text-lg select-none">🚀</span>
                    <div className="flex items-baseline gap-1.5 text-left">
                      <span className="text-[13.5px] font-extrabold text-[#D4AF37] font-sans">App Intro Sequence</span>
                      <span className="text-[9.5px] text-[#A57C00] font-black bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 font-sans">Watch Splash</span>
                    </div>
                  </div>
                  <span className="text-[#A57C00] font-bold text-base select-none">›</span>
                </div>

                {/* Log Out Item */}
                <div 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out from Zippi grocery delivery service?')) {
                      setCart([]);
                      setOrders([]);
                      setUserName('Asjath Ahamed');
                      setUserEmail('asjathahamed0@gmail.com');
                      setUserPhone('');
                      setUserGender('');
                      setUserCity('');
                      setSelectedLanguage('English');
                      setActiveTab('home');
                      alert('Logged out and simulation data has been reset to defaults.');
                    }
                  }}
                  className="flex items-center justify-between p-3.5 hover:bg-red-50/40 cursor-pointer transition-all active:px-4 text-left"
                >
                  <div className="flex items-center gap-3 text-rose-600">
                    <span className="text-lg select-none">🚪</span>
                    <span className="text-[13.5px] font-extrabold font-sans">Log Out</span>
                  </div>
                  <span className="text-rose-500 font-bold text-base select-none">›</span>
                </div>

              </div>
            </div>

            {/* FLOATING HELP BUTTON */}
            <button 
              onClick={() => setActiveAccountSubModal('help')}
              className="fixed bottom-19 right-4 bg-[#FCA311] hover:bg-amber-500 select-none text-brand-charcoal font-black text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform z-40 border border-white cursor-pointer"
              id="floating-help-button"
            >
              <span>💬</span>
              <span className="uppercase tracking-wider font-sans">Need Help?</span>
            </button>

            {/* ── ACCOUNT VIEW SUB-MODAL SWITCHER RENDERS ── */}
            {activeAccountSubModal === 'profile_edit' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide font-sans">Edit Profile Settings</span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs text-left font-sans">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Avatar Image URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. https://images.unsplash.com/photo-..." 
                          value={profileAvatarFile || ''}
                          onChange={(e) => setProfileAvatarFile(e.target.value)}
                          className="flex-grow p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium"
                        />
                        {profileAvatarFile && (
                          <button 
                            onClick={() => setProfileAvatarFile(null)} 
                            className="text-red-500 bg-red-55 px-2 rounded-lg font-bold cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="Asjath Ahamed" 
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-brand-charcoal font-semibold text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        placeholder="asjathahamed0@gmail.com" 
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-brand-charcoal font-semibold text-[13px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="+94 77 123 4567" 
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-brand-charcoal font-semibold text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Gender</label>
                        <select
                          value={userGender}
                          onChange={(e) => setUserGender(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a1a1a] font-bold text-[13px] focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Rather not say">Rather not say</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">City / Region</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Colombo, Sri Lanka" 
                        value={userCity}
                        onChange={(e) => setUserCity(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-brand-charcoal font-semibold text-[13px]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!userName.trim() || !userEmail.trim()) {
                        alert('Full Name and Email Address are required!');
                        return;
                      }
                      setActiveAccountSubModal(null);
                      alert('Profile settings saved successfully! Enjoy personalized Zippi features.');
                    }}
                    className="w-full bg-[#FCA311] hover:bg-[#E08F00] font-black text-brand-charcoal py-3 rounded-xl uppercase tracking-wider text-xs shadow-sm cursor-pointer transition-all active:scale-98"
                  >
                    Save Profile Settings
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'orders' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden shadow-2xl flex flex-col p-4 space-y-4 max-h-[85vh] animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>📦</span> My Zippi Orders History
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto text-left" style={{ scrollbarWidth: 'thin' }}>
                    <OrdersHistory 
                      orders={orders}
                      onTrackOrder={(order) => {
                        setActiveTrackOrder(order);
                        setActiveAccountSubModal(null);
                      }}
                      onReorder={(order) => {
                        handleReorder(order);
                        setActiveAccountSubModal(null);
                      }}
                      onClearHistory={() => {
                        if (confirm('Are you sure you want to clear your Sri Lankan order history logs?')) {
                          setOrders([]);
                        }
                      }}
                      onCancelOrder={(orderId) => {
                        setOrders((prev) => 
                          prev.map((o) => o.id === orderId ? { ...o, status: 'cancelled' } : o)
                        );
                        if (activeTrackOrder && activeTrackOrder.id === orderId) {
                          setActiveTrackOrder((prev) => prev ? { ...prev, status: 'cancelled' as const } : null);
                        }
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setActiveAccountSubModal(null)}
                    className="w-full bg-gray-150 hover:bg-gray-200 font-extrabold text-brand-charcoal text-xs py-2.5 rounded-lg select-none transition-colors cursor-pointer"
                  >
                    Close Orders Screen
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'returns' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>🔄</span> Zippi Hassle-Free Returns
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs text-gray-600 leading-relaxed font-sans">
                    <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-xl text-center space-y-1.5">
                      <span className="text-3xl select-none">📦</span>
                      <p className="font-extrabold text-[13px] text-purple-950">No Active Return Requests</p>
                      <p className="text-[11px] text-purple-700 font-medium font-sans">All order deliveries are complete without any items handed back.</p>
                    </div>

                    <div className="space-y-3 text-left">
                      <h4 className="font-black text-brand-charcoal uppercase tracking-wider text-[10.5px]">How Zippi Returns Work:</h4>
                      
                      <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                        <p className="font-extrabold text-[#1a1a1a]">1. Handoff immediate reject</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium font-sans">Check quality with the rider on arrival. If not satisfied, reject the product instantly with zero charges!</p>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                        <p className="font-extrabold text-[#1a1a1a]">2. 24-Hour freshness window</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium font-sans">Found issue within 24 hours of delivery? Submit a claim through chat support, and we'll send a fresh pickup!</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveAccountSubModal(null)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'credits' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>💰</span> Sri Lankan Zippi Wallet
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden h-32">
                      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                      
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFBEA]">Zippi Wallet Account</span>
                        <span className="font-mono text-xs font-black">LKR</span>
                      </div>

                      <div className="mt-4 flex items-baseline gap-1.5 text-left">
                        <span className="text-[8px] font-black text-emerald-100 uppercase">Balance:</span>
                        <span className="text-3xl font-black tracking-tight leading-none">0.00</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/50 p-3 rounded-xl flex gap-2 text-left">
                      <span className="text-lg select-none">💡</span>
                      <div>
                        <p className="font-extrabold text-amber-950 text-[11.5px] font-sans">How to load Zippi credits?</p>
                        <p className="text-[10.5px] text-amber-800 leading-relaxed mt-0.5 font-medium">
                          We credit cash refunds directly to your wallet. You can also refer friends using coupon codes to receive LKR 250 bonus!
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center font-medium">
                      <div className="text-left font-sans">
                        <p className="text-[#1a1a1a] font-black text-[12px]">Promo Code: ZIPPI15</p>
                        <p className="text-[10px] text-gray-400">Claims 15% discount on checkout baskets</p>
                      </div>
                      <button 
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText('ZIPPI15');
                          } catch (err) {}
                          alert('Copied voucher code "ZIPPI15" to clipboard!');
                        }}
                        className="text-[11px] bg-white hover:bg-neutral-50 px-2.5 py-1 rounded-md border font-extrabold shadow-3xs cursor-pointer select-none"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveAccountSubModal(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
                  >
                    Close Wallet
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'notifications' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>🔔</span> Channel Settings
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer font-sans">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 py-2 font-sans text-left">
                    <div className="flex items-center justify-between">
                      <div className="pr-4">
                        <h4 className="font-extrabold text-xs text-brand-charcoal">Promo offers & coupons</h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-0.5">Receive reminders about flash deals and weekend grocery vouchers.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNotifPromo(!notifPromo)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${notifPromo ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] transition-all ${notifPromo ? 'right-[3px]' : 'left-[3px]'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="pr-4">
                        <h4 className="font-extrabold text-xs text-brand-charcoal">Order delivery updates</h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-0.5">Important logs on driver coordinates, dispatching speeds, and arrival buzzers.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNotifDelivery(!notifDelivery)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${notifDelivery ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] transition-all ${notifDelivery ? 'right-[3px]' : 'left-[3px]'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="pr-4">
                        <h4 className="font-extrabold text-xs text-brand-charcoal">Rider SMS triggers</h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-0.5">Instant automated Colombo SMS broadcast to your phone on driver dispatching.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNotifSms(!notifSms)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${notifSms ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] transition-all ${notifSms ? 'right-[3px]' : 'left-[3px]'}`}></div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveAccountSubModal(null);
                      alert('Notification preferences updated successfully!');
                    }}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
                  >
                    Update Settings
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'language' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[360px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>🌐</span> Language Selector
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer font-sans">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 py-1 text-xs font-sans text-left">
                    <div 
                      onClick={() => setSelectedLanguage('English')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedLanguage === 'English' ? 'border-[#Fca311] bg-amber-50/10 font-bold' : 'border-gray-150 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">🇬🇧</span>
                        <span className="text-neutral-800 font-extrabold font-sans animate-fade-in">English</span>
                      </div>
                      {selectedLanguage === 'English' && <span className="text-[#Fca311] font-black text-[11px] font-sans">✓ Active</span>}
                    </div>

                    <div 
                      onClick={() => setSelectedLanguage('සිංහල (Sinhala)')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedLanguage === 'සිංහල (Sinhala)' ? 'border-[#Fca311] bg-amber-50/10 font-bold' : 'border-gray-150 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">🇱🇰</span>
                        <span className="text-neutral-800 font-extrabold font-sans animate-fade-in">සිංහල (Sinhala)</span>
                      </div>
                      {selectedLanguage === 'සිංහල (Sinhala)' && <span className="text-[#Fca311] font-black text-[11px] font-sans">✓ Active</span>}
                    </div>

                    <div 
                      onClick={() => setSelectedLanguage('தமிழ் (Tamil)')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedLanguage === 'தமிழ் (Tamil)' ? 'border-[#Fca311] bg-amber-50/10 font-bold' : 'border-gray-150 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">🇱🇰</span>
                        <span className="text-neutral-800 font-extrabold font-sans animate-fade-in">தமிழ் (Tamil)</span>
                      </div>
                      {selectedLanguage === 'தமிழ் (Tamil)' && <span className="text-[#Fca311] font-black text-[11px] font-sans">✓ Active</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveAccountSubModal(null);
                      alert(`Application language successfully set to "${selectedLanguage}".`);
                    }}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
                  >
                    Update Language
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'help' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 max-h-[85vh] animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                      <span>💬</span> Zippi Live Helpdesk
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto space-y-4 text-xs pr-1 font-sans text-left" style={{ scrollbarWidth: 'thin' }}>
                    <div className="bg-amber-305/10 border border-amber-300/35 p-4 rounded-2xl text-slate-800 flex items-start gap-3">
                      <span className="text-2xl mt-0.5 select-none">🛵</span>
                      <div>
                        <h4 className="font-black text-[#1A1A1A] text-[13px] font-sans">Zippi Support Center</h4>
                        <p className="text-[11.5px] text-gray-500 font-medium leading-relaxed mt-0.5 font-sans">
                          Available 24/7. Average wait for Colombo dispatcher verification is under 2 minutes.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <h4 className="font-black text-brand-charcoal text-[11px] uppercase tracking-wider font-sans">Frequently Asked Questions</h4>
                      
                      <div className="space-y-1.5 text-left">
                        <details className="bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer select-none group font-medium">
                          <summary className="font-extrabold text-[#1a1a1a] flex justify-between items-center text-[11.5px] font-sans">
                            <span>Are delivery times accurate?</span>
                            <span className="text-gray-400 transition-transform">▼</span>
                          </summary>
                          <p className="text-gray-500 text-[10.5px] mt-1.5 leading-relaxed font-sans font-medium">
                            Yes! Our "Express" delivery speeds package direct from the nearest Colombo packaging center in 30-60 minutes, using physical dispatchers with optimized routing maps!
                          </p>
                        </details>

                        <details className="bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer select-none group font-medium">
                          <summary className="font-extrabold text-[#1a1a1a] flex justify-between items-center text-[11.5px] font-sans">
                            <span>What payment methods are supported?</span>
                            <span className="text-gray-400 transition-transform">▼</span>
                          </summary>
                          <p className="text-gray-500 text-[10.5px] mt-1.5 leading-relaxed font-sans font-medium">
                            We accommodate both Cash on Delivery (COD) and Card on Delivery (swipe securely on physical arrival with the dispatcher).
                          </p>
                        </details>

                        <details className="bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer select-none group font-medium">
                          <summary className="font-extrabold text-[#1a1a1a] flex justify-between items-center text-[11.5px] font-sans">
                            <span>Can I order groceries from specific brands?</span>
                            <span className="text-gray-400 transition-transform">▼</span>
                          </summary>
                          <p className="text-gray-500 text-[10.5px] mt-1.5 leading-relaxed font-sans font-medium">
                            Yes! We support premier local Sri Lankan brands including Kotmale, Pelwatte, Araliya, Dilmah, Maliban, and Harischandra!
                          </p>
                        </details>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          alert('Connecting with Zippi Customer Sourcing Officer Kapila... \n\n"Hello! Sourcing Dispatch Officer Kapila here. How can I help you accelerate your order delivery today?"');
                        }}
                        className="w-full bg-[#FCA311] hover:bg-amber-500 font-black text-brand-charcoal py-3 rounded-xl uppercase tracking-wider text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer select-none"
                      >
                        <span>💬</span> Start Live Chat Simulation
                      </button>
                    </div>

                  </div>

                  <button
                    onClick={() => setActiveAccountSubModal(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-brand-charcoal text-xs font-extrabold py-2.5 rounded-xl uppercase transition-colors cursor-pointer"
                  >
                    Close Support
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'terms' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 max-h-[80vh] animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans animate-fade-in">
                      <span>📄</span> Terms & Guidance
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer font-sans">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto space-y-4 text-[11px] text-gray-500 leading-relaxed font-sans pr-1 text-left" style={{ scrollbarWidth: 'thin' }}>
                    <div>
                      <h4 className="font-bold text-[#1a1a1a] font-sans">1. Acceptance of Terms</h4>
                      <p className="mt-1 font-medium font-sans">By downloading or using the Zippi application, these terms of service automatically apply to you. You are responsible for complying with Sri Lankan regional coordinates laws.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1a1a1a] font-sans">2. Delivery Commitments</h4>
                      <p className="mt-1 font-medium font-sans">Zippi pledges 100% freshness guarantee on produce, greens, dairy, and eggs. If any item is damaged during cargo transit, you are qualified for instant refund to Zippi Credits.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1a1a1a] font-sans">3. No-cost Cashbacks</h4>
                      <p className="mt-1 font-medium font-sans">Cashback incentives generated by the Zippi One Credit Card are calculated automatically and loaded as persistent Zippi Credits, ready for next shopping basket settlement.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1a1a1a] font-sans">4. Privacy & Location coordinates</h4>
                      <p className="mt-1 font-medium font-sans font-medium">Your delivery addresses and GPS coordination notes are safely stored client-side inside the standard browser storage module, fully private and protected.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveAccountSubModal(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
                  >
                    I Agree & Accept
                  </button>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'zippi_one' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans text-left">
                      <span>🌿</span> Zippi One Trial Activator
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer font-sans">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans text-left">
                    <p className="text-gray-500 font-medium leading-relaxed text-center font-sans">
                      Join 50,000+ Colombo smart shoppers saving LKR 1,000+ every single month!
                    </p>

                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3 font-sans text-left">
                      <div className="flex items-start gap-2.5 text-left">
                        <span className="text-base select-none mt-0.5">🚀</span>
                        <div className="text-left font-sans">
                          <p className="font-extrabold text-emerald-950 text-[12px] font-sans">Free Express Cargo Shipping</p>
                          <p className="text-[11px] text-emerald-700 leading-normal mt-0.5 font-sans font-medium">Free delivery for all eligible fresh grocery orders above LKR 1,500.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-left">
                        <span className="text-base select-none mt-0.5">🍎</span>
                        <div className="text-left font-sans">
                          <p className="font-extrabold text-emerald-950 text-[12px] font-sans">Exclusive Gourmet Sales</p>
                          <p className="text-[11px] text-emerald-700 leading-normal mt-0.5 font-sans font-medium">Access direct farm rates and member-only 50% discount deals on organic veggies.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-left">
                        <span className="text-base select-none mt-0.5">📞</span>
                        <div className="text-left font-sans">
                          <p className="font-extrabold text-emerald-950 text-[12px] font-sans">Dedicated VIP Dispatch Officer</p>
                          <p className="text-[11px] text-emerald-700 leading-normal mt-0.5 font-sans font-medium font-sans">Direct chat-line response from Colombo sourcing leads without holding cue.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        alert('Congratulations! Your 14-Day Free Zippi One Premium trial has been successfully activated. Enjoy premier speeds and VIP free delivery benefits!');
                        setActiveAccountSubModal(null);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer select-none"
                    >
                      Start 14-Day Trial for Free
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeAccountSubModal === 'zippi_library' && (
              <ZippiLibraryShowcase
                onClose={() => setActiveAccountSubModal(null)}
              />
            )}

          </div>
        )}

        {/* VIEWPORT AREA: CART SECTION INLINE */}
        {activeTab === 'cart' && (
          <CartView
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveOne={handleRemoveOne}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onUpdateUnit={handleUpdateUnit}
            onProceedToCheckout={() => {
              const finalDeliveryFee = cartSubtotal > 3000 ? 0 : 350;
              const computedDiscount = Math.round(cartSubtotal * 0.15);
              handleProceedToCheckout('ZIPPI15', computedDiscount, finalDeliveryFee);
            }}
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onBack={() => setActiveTab('home')}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
          </>
        )}

        {/* ── STICKY BOTTOM NAV TABS RAIL ── */}
        <ZippiBottomNav 
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setBrowsingCategory(null);
            triggerHapticFeedback('light');
          }}
          cartCount={cartTotalQty}
        />

        {/* ── MODALS / OVERLAYS DRAWER SYSTEMS ── */}

        {/* 1. WISHLIST DROPOUT DRAWER DRAWER */}
        {isWishlistOpen && (
          <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs flex justify-center items-end z-50 p-0">
            <div className="absolute inset-0" onClick={() => setIsWishlistOpen(false)}></div>
            <div className="bg-white rounded-t-2xl w-full max-w-[430px] p-4 space-y-4 max-h-[80vh] overflow-y-auto relative z-10 animate-slide-up">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-brand-red fill-brand-red" />
                  <span className="font-black text-sm text-[#1A1A1A] uppercase tracking-wide">My Wishlist ({wishlist.length})</span>
                </div>
                <button onClick={() => setIsWishlistOpen(false)} className="p-1 text-gray-400 hover:text-brand-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <span className="text-3xl">❤️</span>
                  <p className="font-bold text-xs text-[#1A1A1A]">Your wishlist is clear</p>
                  <p className="text-[10.5px] text-gray-400 max-w-[200px] mx-auto">Toggle the heart icon on any products file to remember ingredients!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {PRODUCTS.filter(p => wishlist.includes(p.id)).map(p => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <img src={p.image} className="w-10 h-10 object-contain" alt={p.name} referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-bold text-xs text-[#1A1A1A] line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] text-gray-400">{p.unit} • LKR {p.price}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            handleAddToCart(p);
                            setIsWishlistOpen(false);
                            setActiveTab('cart');
                          }}
                          className="bg-brand-blue text-white text-[10.5px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap"
                        >
                          Buy Item
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(p.id)}
                          className="p-1.5 text-brand-red bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SIMULATED CAMERA OCR OVERLAY DRAWER */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-brand-charcoal/90 backdrop-blur-md flex flex-col justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-[360px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-yellow-400 shadow-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-900/80">
              
              {/* Dynamic blinking green laser line scanning */}
              {isScanningActive && (
                <div className="absolute left-0 right-0 h-1 bg-green-500 animate-bounce blur-[1px] tracking-wide" style={{ top: '40%' }}></div>
              )}

              <span className="text-5xl animate-pulse">📷</span>
              <div className="space-y-2 mt-4 z-10">
                <h4 className="font-black text-sm text-white">SIMULATING BARCODE OCR SCAN</h4>
                <p className="text-xs text-yellow-300 font-bold max-w-[240px] leading-relaxed mx-auto">
                  Aligning Zippi grocery sticker parameters...
                </p>
                <div className="bg-black/50 text-white rounded font-mono text-[10px] p-2 inline-block">
                  {isScanningActive ? 'DECODING: "KOTMALE_ salted_butter"' : 'FINISHED SUCCESSFULLY'}
                </div>
              </div>
              
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="absolute top-3 right-3 text-white p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3 max-w-[260px]">
              Simulates a direct micro-scandevice parsing premium Sri Lankan butter and applying filters.
            </p>
          </div>
        )}

        {/* 3. COORDINATES DELIVERY SELECTOR ADDR MODALS */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-[#1A1A1A]/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-[32px] w-full max-w-[420px] max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up text-[#1A1A1A] select-none" id="address-book-modal">
              
              {/* Header block with back icon */}
              <div className="flex items-center justify-between border-b border-gray-100/80 px-5 py-4 shrink-0 bg-white">
                <button 
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-1 -ml-1 text-gray-800 hover:text-black transition-colors cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-[18px] h-[18px] stroke-[2.8]" />
                </button>
                <span className="font-extrabold text-[15px] text-[#1A1A1A] text-center flex-grow pr-7">
                  Address Book
                </span>
              </div>

              {/* Segmented controls block */}
              <div className="px-5 pt-4 pb-2 shrink-0 bg-white">
                <div className="bg-[#EDEDF0] p-1 rounded-2xl flex w-full">
                  <button
                    type="button"
                    onClick={() => setAddressTab('address')}
                    className={`flex-1 py-2.5 text-[12.5px] font-extrabold rounded-xl transition-all duration-150 ${
                      addressTab === 'address'
                        ? 'bg-white text-[#1A1A1A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressTab('locker')}
                    className={`flex-1 py-2.5 text-[12.5px] font-extrabold rounded-xl transition-all duration-150 ${
                      addressTab === 'locker'
                        ? 'bg-white text-[#1A1A1A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Locker/ Pickup
                  </button>
                </div>
              </div>

              {/* Search input bar block */}
              <div className="px-5 py-2 shrink-0 bg-white">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4 text-[#A0AABF]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search for your building, area..."
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] hover:border-gray-300 focus:border-[#4B84F7] pl-10 pr-4 py-3 rounded-2xl text-[12.5px] font-semibold text-[#1A1A1A] placeholder-[#A3AED0] focus:outline-none focus:ring-1 focus:ring-[#4B84F7] transition-all"
                  />
                </div>
              </div>

              {/* Blue contextual action button row */}
              <div className="px-5 py-2.5 shrink-0 bg-white">
                {addressTab === 'address' ? (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewLabel('Home');
                      setNewDetails('');
                      const flowContainer = document.getElementById('address-scroll-container');
                      if (flowContainer) {
                        flowContainer.scrollTo({ top: flowContainer.scrollHeight, behavior: 'smooth' });
                      }
                    }}
                    className="w-full flex items-center justify-between py-1 text-[#2264E2] hover:text-[#184EB0] font-black text-[13px] active:scale-[0.99] transition-transform text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2264E2] text-[#2264E2]">
                        <Plus className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span>Add new address</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2264E2]" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      setCategoriesToast("Locker Service is launching soon in Colombo! Stay tuned.");
                    }}
                    className="w-full flex items-center justify-between py-1 text-[#2264E2] hover:text-[#184EB0] font-black text-[13px] active:scale-[0.99] transition-transform text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2264E2] text-[#2264E2]">
                        <Plus className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span>Add new locker/pickup point</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2264E2]" />
                  </button>
                )}
              </div>

              {/* Middle dynamic content viewport block */}
              <div 
                className="flex-grow overflow-y-auto px-5 py-2 space-y-4" 
                id="address-scroll-container"
                style={{ scrollbarWidth: 'thin' }}
              >
                {addressTab === 'address' ? (
                  <div className="space-y-4 pt-1">
                    {/* List filterable address cards */}
                    <div className="space-y-3.5">
                      {addresses
                        .filter(addr => 
                          addr.label.toLowerCase().includes(addressSearch.toLowerCase()) || 
                          addr.details.toLowerCase().includes(addressSearch.toLowerCase())
                        )
                        .map((addr) => {
                          const isSelected = selectedAddress.id === addr.id;
                          let emoji = '🏠';
                          if (addr.label.toLowerCase().includes('office')) {
                            emoji = '💼';
                          } else if (addr.label.toLowerCase().includes('gym') || addr.label.toLowerCase().includes('wellness')) {
                            emoji = '👟';
                          }

                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddress(addr);
                                setIsAddressModalOpen(false);
                              }}
                              className={`p-4 rounded-[24px] border-2 cursor-pointer transition-all duration-150 flex flex-col relative text-left ${
                                isSelected 
                                  ? 'border-[#2D79F6] bg-[#F1F6FF] ring-2 ring-[#2D79F6]/10' 
                                  : 'border-gray-100 bg-[#F9FAFB] hover:border-gray-200'
                              }`}
                              id={`address-card-${addr.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  {/* Emoji visual card */}
                                  <div className="w-9 h-9 rounded-2xl bg-white border border-gray-150/50 flex items-center justify-center shrink-0 shadow-3xs">
                                    <span className="text-[17px] filter drop-shadow-xs">{emoji}</span>
                                  </div>
                                  
                                  {/* Label text */}
                                  <span className="font-extrabold text-[14px] text-[#1A1A1A] truncate max-w-[140px]">
                                    {addr.label.replace(' (Default)', '')}
                                  </span>
                                  
                                  {/* Sky travel badge */}
                                  <span className="bg-[#E0EBFF] text-[#1C58D9] font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                    999+ km
                                  </span>
                                </div>

                                {/* Share & more options meatballs row */}
                                <div className="flex items-center gap-2 text-[#7A869A]" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddressOptionsItem(addr);
                                    }}
                                    className="p-1 hover:text-[#2D79F6] active:scale-90 transition-transform cursor-pointer"
                                  >
                                    <Share2 className="w-4 h-4 text-[#A0AABF] hover:text-[#1A1A1A]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddressOptionsItem(addr);
                                    }}
                                    className="p-1 hover:text-[#2D79F6] active:scale-90 transition-transform cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4 text-[#A0AABF] hover:text-[#1A1A1A]" />
                                  </button>
                                </div>
                              </div>

                              {/* Physical Street address details */}
                              <p className="text-[13px] font-bold text-[#1A1A1A] mt-3 leading-snug">
                                {addr.details}
                              </p>

                              {/* Static profile contacts + green check */}
                              <div className="flex items-center gap-1.5 mt-2.5 mb-0.5">
                                <span className="text-[12px] font-semibold text-[#7A869A]">
                                  Asjath Ahamed, +94 77 123 4567
                                </span>
                                <div className="w-4.5 h-4.5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[4.5px]" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Styled form footer block inside scrolls */}
                    <div className="pt-5 pb-3 border-t border-gray-100 flex flex-col gap-3.5" id="address-form-viewport">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-[#7A869A] font-black uppercase tracking-wider pl-1 font-mono">
                          {editingAddressId ? 'EDIT ADDRESS DETAILS' : 'ADD NEW ADDRESS'}
                        </span>
                        {editingAddressId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressId(null);
                              setNewLabel('Home');
                              setNewDetails('');
                            }}
                            className="text-[10px] text-red-500 font-extrabold uppercase tracking-wide hover:underline cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                      
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        {/* LABEL custom box */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#7A869A] font-black uppercase tracking-wide block pl-1">
                            LABEL
                          </label>
                          <div className="relative">
                            <select
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              className="w-full bg-[#F4F5F8] border border-transparent hover:bg-gray-100/80 focus:bg-white focus:border-[#4B84F7] py-3.5 px-4 pr-10 rounded-[18px] text-[13px] font-extrabold text-[#1A1A1A] outline-none appearance-none transition-all cursor-pointer shadow-3xs"
                            >
                              <option value="Home">🏠 Home</option>
                              <option value="Office">🏢 Office</option>
                              <option value="Gym/Wellness">👟 Gym/Wellness</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                              <ChevronDown className="w-4 h-4 text-[#7A869A]" />
                            </span>
                          </div>
                        </div>

                        {/* STREET ADDRESS custom box */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#7A869A] font-black uppercase tracking-wide block pl-1">
                            STREET ADDRESS
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 50, Galle Road, Colombo 03"
                            value={newDetails}
                            onChange={(e) => setNewDetails(e.target.value)}
                            className="w-full bg-[#F4F5F8] border border-transparent hover:bg-gray-100/80 focus:bg-white focus:border-[#4B84F7] py-3.5 px-4 rounded-[18px] text-[13px] font-bold text-[#1A1A1A] placeholder-[#A3AED0] outline-none transition-all"
                          />
                        </div>

                        {/* Grand Yellow Save & Select coordinates action */}
                        <button
                          type="submit"
                          className="w-full bg-[#FCE000] hover:bg-[#EED400] active:scale-[0.98] text-[#1A1A1A] font-extrabold text-[13px] py-4 rounded-[22px] uppercase transition-all shadow-xs cursor-pointer tracking-wider mt-2"
                        >
                          {editingAddressId ? 'SAVE CHANGES' : 'SAVE & SELECT ADDRESS'}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* ── LOCKER / PICKUP STATE VIEW REPLICATION ── */
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-8 px-4 animate-fade-in" id="locker-view-state">
                    {/* Centered square container holding representation of location box */}
                    <div className="w-36 h-36 bg-[#F0F5FF] rounded-[36px] flex items-center justify-center relative p-6 mb-7 shadow-xs">
                      <div className="relative scale-110">
                        {/* Simulated box */}
                        <span className="text-[52px] filter drop-shadow-sm leading-none block select-none">📦</span>
                        {/* Pin placement annotation bubble */}
                        <span className="absolute -top-2.5 right-0.5 text-[28px] animate-bounce select-none">📍</span>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-[280px]">
                      <h4 className="text-[15px] font-black text-[#1D212C] leading-snug">
                        Get your order delivered to a locker or pickup point
                      </h4>
                      
                      <div className="flex flex-col gap-2.5 pt-4 items-start text-left text-[12px] font-extrabold text-[#2264E2] pl-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] shrink-0">📦</span>
                          <span>No minimum order size</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] shrink-0">🕒</span>
                          <span>Your preferred time & location</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] shrink-0">🚚</span>
                          <span>Free Delivery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ADDRESS BOOK ITEM OPTIONS BOTTOM SHEET */}
        {addressOptionsItem && (
          <div 
            className="fixed inset-0 bg-[#000000]/40 backdrop-blur-3xs flex items-end justify-center z-[100] p-0 animate-fade-in"
            onClick={() => setAddressOptionsItem(null)}
          >
            <div 
              className="bg-white rounded-t-[32px] w-full max-w-[420px] pb-8 pt-4.5 shadow-2xl flex flex-col animate-slide-up text-[#1A1A1A] select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Central premium pull bar/handle pill */}
              <div className="w-[44px] h-[5px] bg-[#EDEDF0] hover:bg-gray-300 rounded-full mx-auto mb-5 transition-colors shrink-0" />

              {/* Action Rows */}
              <div className="flex flex-col">
                {/* Edit option row */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(addressOptionsItem.id);
                    setNewLabel(addressOptionsItem.label);
                    setNewDetails(addressOptionsItem.details);
                    setAddressOptionsItem(null); // Close bottom sheets
                    
                    // Automatically scroll smooth down to the editor block inside the list container
                    setTimeout(() => {
                      const flowContainer = document.getElementById('address-scroll-container');
                      if (flowContainer) {
                        flowContainer.scrollTo({ top: flowContainer.scrollHeight, behavior: 'smooth' });
                      }
                      
                      const detailInput = document.getElementById('address-form-viewport');
                      if (detailInput) {
                        detailInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }, 120);
                  }}
                  className="w-full flex items-center gap-[18px] px-6 py-4.5 hover:bg-[#F9FAFB] active:bg-gray-100/90 transition-all text-left cursor-pointer duration-100"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-[#F4F5F8] flex items-center justify-center text-[#1A1A1A] shrink-0">
                    <Edit className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                  <span className="text-[15.5px] font-extrabold text-[#1A1A1A]">Edit</span>
                </button>

                {/* Separation line spacer */}
                <div className="h-[1px] bg-gray-100 mx-6" />

                {/* Share option row */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(addressOptionsItem.details);
                    }
                    setCategoriesToast("Address details copied successfully!");
                    setAddressOptionsItem(null);
                  }}
                  className="w-full flex items-center gap-[18px] px-6 py-4.5 hover:bg-[#F9FAFB] active:bg-gray-100/90 transition-all text-left cursor-pointer duration-100"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-[#F4F5F8] flex items-center justify-center text-[#1A1A1A] shrink-0">
                    <Share2 className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                  <span className="text-[15.5px] font-extrabold text-[#1A1A1A]">Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. PRODUCT DETAIL SHEETS */}
        {activeDetailProduct && (
          <ProductDetailsModal
            product={activeDetailProduct}
            onClose={() => setActiveDetailProduct(null)}
            cart={cart}
            onAddToCart={(unit) => handleAddToCart(activeDetailProduct, unit)}
            onRemoveOne={(unit) => handleRemoveOne(activeDetailProduct, unit)}
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onOpenCart={() => setIsCartOpen(true)}
            onSelectProduct={setActiveDetailProduct}
            products={activeProducts}
          />
        )}

        {/* 5. BASKET CART DRAWERS SLIDERS */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={handleProceedToCheckout}
          deliveryFee={cartSubtotal > 3000 ? 0 : 350}
        />

        {/* 6. SECURED CHECKOUT SIMULATION OVERLAY WIZARDS */}
        <CheckoutSimulation
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          subtotal={cartSubtotal}
          promoCode={checkoutPromo}
          discount={checkoutDiscount}
          deliveryFee={checkoutDeliveryFee}
          total={Math.max(0, cartSubtotal + checkoutDeliveryFee - checkoutDiscount)}
          selectedAddress={selectedAddress}
          onOrderPlaced={handleOrderPlaced}
        />

        {/* 7. LIVE ACTIVE TRACKING OVERLAY */}
        {activeTrackOrder && (
          <OrderTracking
            order={activeTrackOrder}
            onClose={() => setActiveTrackOrder(null)}
          />
        )}

        {/* Filter Bottom Sheet for Deals */}
        <FilterBottomSheet
          isOpen={activeFilterSheet === 'deals'}
          onClose={() => setActiveFilterSheet(null)}
          title="Deals"
          options={DEALS_OPTIONS}
          initialSelected={selectedDealsList}
          onApply={(selected) => setSelectedDealsList(selected)}
          onClear={() => {
            setSelectedDealsList(['All']);
            setDealsFilter(false);
          }}
        />

        {/* Filter Bottom Sheet for Brand */}
        <FilterBottomSheet
          isOpen={activeFilterSheet === 'brand'}
          onClose={() => setActiveFilterSheet(null)}
          title="Brand"
          options={BRANDS_OPTIONS}
          initialSelected={selectedBrandsList}
          onApply={(selected) => setSelectedBrandsList(selected)}
          onClear={() => {
            setSelectedBrandsList(['All']);
            setSelectedBrand('All');
          }}
        />

      </div>
    </div>
  );
}
