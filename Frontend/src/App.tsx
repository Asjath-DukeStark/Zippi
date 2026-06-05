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
  ArrowRight
} from 'lucide-react';

import { Product, CartItem, Address, Order } from './types';
import { PRODUCTS, CATEGORIES, INITIAL_ADDRESSES, ADS_CAROUSEL } from './data';

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
  const [slideStates, setSlideStates] = useState<('active' | 'entering' | 'exiting' | '')[]>(['active', '', '']);
  const currentSlideRef = useRef(0);
  const isHoveredRef = useRef(false);
  const touchStartXRef = useRef(0);

  const goToSlide = React.useCallback((next: number) => {
    const prev = currentSlideRef.current;
    if (prev === next) return;

    setSlideStates((currentStates) => {
      const nextStates = [...currentStates];
      for (let i = 0; i < nextStates.length; i++) {
        if (nextStates[i] === 'exiting' || nextStates[i] === 'entering') {
          nextStates[i] = '';
        }
      }
      nextStates[prev] = 'exiting';
      nextStates[next] = 'entering';
      return nextStates;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSlideStates((currentStates) => {
          const nextStates = [...currentStates];
          if (nextStates[next] === 'entering') {
            nextStates[next] = 'active';
          }
          return nextStates;
        });
      });
    });

    setTimeout(() => {
      setSlideStates((currentStates) => {
        const nextStates = [...currentStates];
        if (nextStates[prev] === 'exiting') {
          nextStates[prev] = '';
        }
        return nextStates;
      });
    }, 600);

    currentSlideRef.current = next;
    setCurrentSlide(next);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const slidesCount = 3;
    if (diff > 50) {
      const next = (currentSlideRef.current + 1) % slidesCount;
      goToSlide(next);
    } else if (diff < -50) {
      const next = (currentSlideRef.current - 1 + slidesCount) % slidesCount;
      goToSlide(next);
    }
  };

  // Wishlist list state - defaults to index bananas and butter item values
  const [wishlist, setWishlist] = useState<string[]>(['f1', 'd1']);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

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

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [browsingCategory, setBrowsingCategory] = useState<string | null>(null);

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

  // Auto carousel rotation with pause on hover
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        const next = (currentSlideRef.current + 1) % 3;
        goToSlide(next);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [goToSlide]);

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

  // Handle Incremental addition to cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const match = prevCart.find((i) => i.product.id === product.id);
      if (match) {
        return prevCart.map((i) => 
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveOne = (product: Product) => {
    setCart((prevCart) => {
      const match = prevCart.find((i) => i.product.id === product.id);
      if (match) {
        if (match.quantity <= 1) {
          return prevCart.filter((i) => i.product.id !== product.id);
        }
        return prevCart.map((i) => 
          i.product.id === product.id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart;
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const match = prevCart.find((i) => i.product.id === productId);
      if (match) {
        const nextQty = match.quantity + delta;
        if (nextQty <= 0) {
          return prevCart.filter((i) => i.product.id !== productId);
        }
        return prevCart.map((i) =>
          i.product.id === productId ? { ...i, quantity: nextQty } : i
        );
      }
      return prevCart;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
  };

  // Wishlist toggle function
  const handleToggleWishlist = (productId: string) => {
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

    const added: Address = {
      id: 'addr-' + Date.now(),
      label: newLabel,
      details: newDetails,
      isDefault: false
    };

    setAddresses((prev) => [...prev, added]);
    setSelectedAddress(added);
    setNewDetails('');
    setIsAddressModalOpen(false);
  };

  // Perform Dynamic filtering and sorting of products in accordance with chips states
  const filteredProducts = PRODUCTS.filter((p) => {
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
  const bestsellerProducts = PRODUCTS.filter(p => p.popular);
  const freshTodayProducts = PRODUCTS.filter(p => p.category === 'veggies' || p.category === 'fruits' || p.category === 'dairy');

  const trendingProductsList = TRENDING_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter((p): p is Product => !!p);
  const freshProductsList = FRESH_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter((p): p is Product => !!p);
  const flashProductsList = FLASH_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter((p): p is Product => !!p);

  const cartTotalQty = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

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
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveOne={handleRemoveOne}
            onViewDetails={setActiveDetailProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenCart={() => setIsCartOpen(true)}
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
                      const qty = cart.find(i => i.product.id === product.id)?.quantity || 0;
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
                  onMouseEnter={() => { isHoveredRef.current = true; }}
                  onMouseLeave={() => { isHoveredRef.current = false; }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="overflow-hidden rounded-2xl">
                    <div className="relative min-h-[145px] transition-all duration-300">
                      
                      {/* Swipeable Slide 0 - Active Green Grocery Banner (Fully Compliant Spec) */}
                      <div className={`slide ${slideStates[0]} bg-[#2E7D32] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden`}>
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
                      <div className={`slide ${slideStates[1]} bg-[#1565C0] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden text-left`}>
                        <div className="space-y-1 relative z-10 w-[65%]">
                          <span className="text-[9px] uppercase tracking-wider bg-yellow-400 text-brand-charcoal font-black px-1.5 py-0.5 rounded-sm">ZIPPI SPEED</span>
                          <h3 className="text-base font-black tracking-tight leading-tight">COLOMBO FLAT DELIVERIES</h3>
                          <p className="text-[10.5px] text-blue-100 font-medium leading-relaxed">
                            LKR 0 shipping fees of fresh meats or veggies on orders above LKR 3,000.
                          </p>
                        </div>
                        <div className="w-[30%] h-20 relative flex items-center justify-center text-5xl">
                          🛵
                        </div>
                      </div>

                      {/* Slide 2 - Fresh Milk & Butter Combo specials */}
                      <div className={`slide ${slideStates[2]} bg-[#FF6F00] text-white p-4 rounded-xl flex justify-between items-center min-h-[145px] relative overflow-hidden text-left`}>
                        <div className="space-y-1 relative z-10 w-[65%]">
                          <span className="text-[9px] uppercase tracking-wider bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-sm">KITCHEN DEALS</span>
                          <h3 className="text-base font-black tracking-tight leading-tight">LOCAL DIARY ESSENTIALS</h3>
                          <p className="text-[10.5px] text-amber-50 font-medium leading-relaxed">
                            Get up to LKR 150 off on Kotmale Butter & Pelwatte fresh milk assemblies.
                          </p>
                        </div>
                        <div className="w-[30%] h-20 relative flex items-center justify-center text-5xl">
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
                    {HOME_CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => {
                            setBrowsingCategory(cat.id);
                          }}
                          className={`relative rounded-2xl flex flex-col justify-between bg-white border p-1 pt-1.5 pb-2.5 cursor-pointer transition-all hover:border-[#F5C518] hover:shadow-xs active:scale-95 border-gray-200`}
                          style={{ height: '100px', width: '92px' }}
                        >
                          {cat.sale && (
                            <span className="absolute top-1 left-1 bg-brand-red text-white font-extrabold text-[8px] px-1 rounded-sm z-10 flex items-center justify-center shadow-xs">
                              SALE
                            </span>
                          )}
                          
                          {/* Category Image - top 70% of card */}
                          <div className="w-full h-[65%] rounded-lg overflow-hidden bg-gray-50/50 flex items-center justify-center p-1 relative">
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              className="object-contain w-full h-full max-h-[48px] transform hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0.5 right-0.5 text-[10px] select-none">{cat.emoji}</span>
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
                        const qty = cart.find(i => i.product.id === product.id)?.quantity || 0;
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
                        const qty = cart.find(i => i.product.id === product.id)?.quantity || 0;
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
                        const qty = cart.find(i => i.product.id === product.id)?.quantity || 0;
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
          <div className="flex-grow flex flex-col overflow-y-auto bg-white">
            
            {/* ── SEARCH BAR (same style as home, clean white) ── */}
            <div className="px-4 pt-4 pb-2 bg-white" id="categories-search-bar-container">
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveTab('home');
                  }}
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
              </div>
            </div>

            {/* ── PAGE TITLE ── */}
            <div className="px-4 pb-2 text-left" id="categories-page-title-container">
              <h1 className="text-[20px] font-bold text-[#1A1A1A] mt-2">Categories</h1>
            </div>

            {/* ── CATEGORIES GRID — 3 columns ── */}
            <div className="px-4 pb-6" id="categories-grid-container">
              <div className="grid grid-cols-3 gap-3">
                {DETAILED_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setBrowsingCategory(cat.id);
                    }}
                    className="bg-[#F5F5F5] rounded-[12px] p-3 flex flex-col justify-between items-center text-center cursor-pointer border border-transparent transition-all hover:border-[#F5C518] active:scale-95 h-[135px]"
                    id={`category-card-${cat.id}`}
                  >
                    {/* Product image fills top 70% of card (object-fit: contain) */}
                    <div className="w-full h-[70%] flex items-center justify-center overflow-hidden">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-contain max-h-[64px] transition-transform duration-300 hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Category name below image (14px, bold, dark) */}
                    <div className="h-[30%] flex items-center justify-center w-full mt-1">
                      <span className="text-[14px] leading-tight font-bold text-[#1A1A1A] line-clamp-2">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* ZIPPI CARD PROMO */}
            <div 
              onClick={() => setActiveAccountSubModal('card_apply')}
              className="bg-[#121212] rounded-2xl p-4 border border-zinc-850 text-white cursor-pointer hover:border-zinc-700 transition-all relative overflow-hidden flex items-center justify-between"
              id="zippi-card-promo-banner"
            >
              {/* Abstract glow circles in dark card background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>

              <div className="z-10 flex-grow pr-3 max-w-[65%] text-left">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#FFFBEA] bg-yellow-500/25 px-2 py-0.5 rounded border border-yellow-500/20 mb-2 inline-block">
                  LIMITED OFFER
                </span>
                <h4 className="font-black text-[16px] text-white leading-tight tracking-tight">
                  Zippi One Credit Card
                </h4>
                
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-sans">
                  Up to 20% savings + Free Zippi One + LKR 5000 Welcome bonus
                </p>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAccountSubModal('card_apply');
                  }}
                  className="mt-3 bg-white hover:bg-neutral-100 text-black text-[10px] font-black px-4.5 py-1.5 rounded-full uppercase tracking-wider transition-all select-none cursor-pointer"
                  id="zippi-card-apply-now"
                >
                  APPLY NOW
                </button>
              </div>

              {/* Right: Credit card representation */}
              <div className="relative shrink-0 select-none scale-95 pr-1">
                <div className="w-24 h-15 bg-gradient-to-tr from-neutral-900 to-zinc-850 hover:to-zinc-800 rounded-lg shadow-lg border border-neutral-800/80 p-2 flex flex-col justify-between relative transform rotate-12 transition-transform">
                  <div className="flex justify-between items-start">
                    <div className="w-3.5 h-2.5 bg-yellow-400/30 border border-yellow-400/20 rounded-xs"></div>
                    <span className="text-[8px] font-extrabold tracking-widest text-[#F5C518]">Z</span>
                  </div>
                  <div className="flex flex-col justify-end text-right">
                    <span className="text-[5px] font-black text-neutral-450 tracking-wider">ONE CARD</span>
                  </div>
                  <div className="absolute bottom-1 left-2 w-4 h-0.5 bg-yellow-500/40 rounded-full"></div>
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

                {/* Zippi Component Library Showcase */}
                <div 
                  onClick={() => setActiveAccountSubModal('zippi_library')}
                  className="flex items-center justify-between p-3.5 hover:bg-amber-50/50 cursor-pointer transition-all active:px-4 text-left"
                  id="account-btn-zippi-library"
                >
                  <div className="flex items-center gap-3 text-brand-charcoal animate-pulse">
                    <span className="text-lg select-none">🎨</span>
                    <div className="flex items-baseline gap-1.5 text-left">
                      <span className="text-[13.5px] font-black text-[#1565C0] font-sans">Zippi UI Library</span>
                      <span className="text-[9.5px] text-[#1565C0] font-black bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">12 UI Components</span>
                    </div>
                  </div>
                  <span className="text-[#1565C0] font-bold text-base select-none">⌃</span>
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

            {activeAccountSubModal === 'card_apply' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left">
                <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-5 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-[#1a1a1a] text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans text-left">
                      <span>💳</span> Apply for Zippi One Card
                    </span>
                    <button onClick={() => setActiveAccountSubModal(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer font-sans">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans text-left">
                    <div className="bg-slate-900 text-white rounded-xl p-4 border border-zinc-800 flex justify-between items-center text-left font-sans">
                      <div>
                        <h4 className="font-black text-[14px] font-sans">Zippi One Premium Credit Card</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-sans font-medium">Up to 20% grocery cashback rewards, welcome bonuses, and zero interest rate.</p>
                      </div>
                      <span className="text-2xl select-none shrink-0">⚡</span>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert('Sending verification parameters to Colombo Credit Bureau... \n\n🎉 Instant Approval! Your Zippi One Card is APPROVED. Welcome bonus of LKR 5,000 has been added to your credits! Your card is ready.');
                        setActiveAccountSubModal(null);
                      }}
                      className="space-y-3.5 font-sans"
                    >
                      <div className="text-left font-sans">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Sri Lankan NIC Number *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 199512345678 or 951234567V" 
                          required
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-brand-charcoal font-semibold text-[13px] uppercase focus:outline-none focus:ring-2 focus:ring-[#Fca311]"
                        />
                      </div>

                      <div className="text-left font-sans">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Monthly Gross Revenue (LKR) *</label>
                        <select
                          required
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a1a1a] font-bold text-[13px] focus:outline-none focus:ring-2 focus:ring-[#Fca311]"
                        >
                          <option value="">Choose income bracket...</option>
                          <option value="Under 100,000">🍳 Under LKR 100,000</option>
                          <option value="100,000 - 250,000">🏢 LKR 100,000 - LKR 250,050</option>
                          <option value="Above 250,000">💸 Above LKR 250,000</option>
                        </select>
                      </div>

                      <div className="flex gap-2.5 items-start text-left font-sans">
                        <input type="checkbox" required className="mt-0.5 rounded cursor-pointer size-4" />
                        <p className="text-[10.5px] text-gray-500 font-semibold leading-normal font-sans">
                          I consent to Zippi performing an automated credit scoring evaluation utilizing my transaction history variables.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer select-none"
                      >
                        Submit Card Application
                      </button>
                    </form>
                  </div>
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
          <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-2xl flex flex-col p-4 space-y-4 animate-scale-up">
              <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                <span className="font-black text-xs text-brand-charcoal uppercase tracking-wider">🎯 Saved Delivery Coordinates</span>
                <button onClick={() => setIsAddressModalOpen(false)} className="p-1 text-[#888888] hover:text-brand-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List current options */}
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setIsAddressModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                      selectedAddress.id === addr.id 
                        ? 'border-[#F5C518] bg-[#FFFBEA]' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="text-base mt-0.5">📍</span>
                    <div className="text-xs">
                      <span className="font-extrabold text-[#1A1A1A]">{addr.label}</span>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">{addr.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form custom coordinate input */}
              <form onSubmit={handleAddAddress} className="space-y-3 pt-2 border-t border-gray-150">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Or add new coordinates:</span>
                
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[9px] text-[#888888] font-bold uppercase">Coordinates Label</label>
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg font-bold text-brand-charcoal"
                    >
                      <option value="Home">Home 🏠</option>
                      <option value="Office">Office 🏢</option>
                      <option value="Gym">Gym/Wellness 👟</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-[#888888] font-bold uppercase">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50, Galle Road, Colombo 03"
                      value={newDetails}
                      onChange={(e) => setNewDetails(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-brand-charcoal placeholder:text-gray-400 font-semibold text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5C518] hover:bg-brand-yellow-hover text-[#1A1A1A] font-extrabold text-xs py-2.5 rounded-xl uppercase transition-colors shadow-sm cursor-pointer"
                >
                  Save & Choose
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. PRODUCT DETAIL SHEETS */}
        {activeDetailProduct && (
          <ProductDetailsModal
            product={activeDetailProduct}
            onClose={() => setActiveDetailProduct(null)}
            cartQty={cart.find((i) => i.product.id === activeDetailProduct.id)?.quantity || 0}
            onAddToCart={() => handleAddToCart(activeDetailProduct)}
            onRemoveOne={() => handleRemoveOne(activeDetailProduct)}
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onOpenCart={() => setIsCartOpen(true)}
            onSelectProduct={setActiveDetailProduct}
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
