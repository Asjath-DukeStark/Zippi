import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Category, Product, Order, Rider, Customer, 
  Promotion, Banner, PortalSettings, NotificationAlert, OrderStatus 
} from "../types";
import { 
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, 
  INITIAL_RIDERS, INITIAL_CUSTOMERS, INITIAL_PROMOTIONS, 
  INITIAL_BANNERS, INITIAL_SETTINGS, INITIAL_NOTIFICATIONS 
} from "../mockData";

interface PortalContextType {
  categories: Category[];
  products: Product[];
  orders: Order[];
  riders: Rider[];
  customers: Customer[];
  promotions: Promotion[];
  banners: Banner[];
  settings: PortalSettings;
  notifications: NotificationAlert[];
  
  // Category operations
  addCategory: (category: Omit<Category, "id" | "productCount">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => void;

  // Product operations
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Order operations
  updateOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  assignRiderToOrder: (orderId: string, riderId: string) => Promise<void>;

  // Rider operations
  addRider: (rider: Omit<Rider, "id" | "todayDeliveries" | "todayEarnings" | "lat" | "lng">) => void;
  updateRider: (rider: Rider) => void;
  deleteRider: (id: string) => void;

  // Customer operations
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "orderCount" | "totalSpent">) => void;
  updateCustomer: (customer: Customer) => void;

  // Promotion operations
  addPromotion: (promo: Omit<Promotion, "id" | "useCount">) => void;
  updatePromotion: (promo: Promotion) => void;
  deletePromotion: (id: string) => void;

  // Banner operations
  addBanner: (banner: Omit<Banner, "id">) => Promise<void>;
  updateBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (banners: Banner[]) => void;

  // Settings
  updateSettings: (settings: PortalSettings) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:3001/api";

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read state from localStorage helper
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`zippi_admin_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [categories, setCategories] = useState<Category[]>(() => getStored("categories", INITIAL_CATEGORIES));
  const [products, setProducts] = useState<Product[]>(() => getStored("products", INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => getStored("orders", INITIAL_ORDERS));
  const [riders, setRiders] = useState<Rider[]>(() => getStored("riders", INITIAL_RIDERS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored("customers", INITIAL_CUSTOMERS));
  const [promotions, setPromotions] = useState<Promotion[]>(() => getStored("promotions", INITIAL_PROMOTIONS));
  const [banners, setBanners] = useState<Banner[]>(() => getStored("banners", INITIAL_BANNERS));
  const [settings, setSettings] = useState<PortalSettings>(() => getStored("settings", INITIAL_SETTINGS));
  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => getStored("notifications", INITIAL_NOTIFICATIONS));

  // Save to localStorage whenever collections modify
  useEffect(() => { localStorage.setItem("zippi_admin_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("zippi_admin_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("zippi_admin_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("zippi_admin_riders", JSON.stringify(riders)); }, [riders]);
  useEffect(() => { localStorage.setItem("zippi_admin_customers", JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem("zippi_admin_promotions", JSON.stringify(promotions)); }, [promotions]);
  useEffect(() => { localStorage.setItem("zippi_admin_banners", JSON.stringify(banners)); }, [banners]);
  useEffect(() => { localStorage.setItem("zippi_admin_settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem("zippi_admin_notifications", JSON.stringify(notifications)); }, [notifications]);

  // Recalculate Category ProductCount when products or categories update
  useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      productCount: products.filter(p => p.categoryId === cat.id).length
    })));
  }, [products]);

  // API Call helper
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("zippi_admin_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  };

  // Sync Data on mount
  const refreshData = async () => {
    try {
      // 1. Fetch categories
      const catRes = await fetch(`${API_BASE_URL}/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.data)) {
          const mappedCats = catData.data.map((c: any) => ({
            id: c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=640",
            productCount: 0,
            status: c.isActive !== false ? "Active" : "Inactive"
          }));
          setCategories(mappedCats);
        }
      }

      // 2. Fetch products
      const prodRes = await fetch(`${API_BASE_URL}/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success) {
          const prodsArray = Array.isArray(prodData.data) ? prodData.data : (prodData.data?.products || []);
          const mappedProds = prodsArray.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || `GP-${p.id}`,
            price: Number(p.price),
            comparePrice: p.originalPrice || undefined,
            categoryId: p.category,
            image: p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
            stock: p.stock || 0,
            status: p.stock > 0 ? "Active" : "Out of Stock",
            description: p.description || "",
            discountPercentage: p.discountPercent || undefined,
            weightUnit: p.unit || "500g",
            isFeatured: !!p.popular,
            isFlashDeal: !!p.isFlashDeal
          }));
          setProducts(mappedProds);
        }
      }

      // 3. Fetch admin orders
      const token = localStorage.getItem("zippi_admin_token");
      if (token) {
        const orderRes = await apiFetch("/admin/orders");
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData.success && Array.isArray(orderData.data)) {
            const mappedOrders = orderData.data.map((o: any) => ({
              id: o.orderNumber || o.id,
              customerName: o.customer?.name || o.deliveryAddress?.label || "Guest",
              customerEmail: o.customer?.email || "",
              customerPhone: o.customer?.phone || "",
              address: o.deliveryAddress?.details || (typeof o.deliveryAddress === 'string' ? o.deliveryAddress : ""),
              date: o.createdAt || new Date().toISOString(),
              total: Number(o.total),
              status: o.status,
              paymentMethod: o.paymentMethod === 'CARD' ? 'Card' : 'COD',
              items: (o.items || []).map((it: any) => ({
                productId: it.productId,
                name: it.product?.name || "Product Item",
                quantity: it.quantity,
                price: Number(it.price)
              })),
              assignedRiderId: o.riderId || undefined
            }));
            setOrders(mappedOrders);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to sync with backend API. Running in offline fallback.");
    }
  };

  useEffect(() => {
    const initPortal = async () => {
      try {
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "0771234567", password: "admin123" })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          if (loginData.success && loginData.data?.token) {
            localStorage.setItem("zippi_admin_token", loginData.data.token);
            console.log("Authenticated successfully with Express Backend.");
          }
        }
      } catch (err) {
        console.warn("Express backend server offline or unreachable. Running offline mode.");
      }
      await refreshData();
    };
    initPortal();
  }, []);

  // --- Core Operations ---

  // Categories
  const addCategory = async (cat: Omit<Category, "id" | "productCount">) => {
    try {
      const res = await apiFetch("/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon: "Sparkles",
          is_active: true
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}`,
      productCount: 0
    };
    setCategories(prev => [newCat, ...prev]);
  };

  const updateCategory = async (cat: Category) => {
    try {
      const res = await apiFetch(`/admin/categories/${cat.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          is_active: cat.status === "Active"
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await apiFetch(`/admin/categories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const reorderCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  // Products
  const addProduct = async (prod: Omit<Product, "id">) => {
    try {
      const res = await apiFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: prod.name,
          description: prod.description || "",
          category_slug: prod.categoryId,
          price: prod.price,
          original_price: prod.comparePrice || null,
          discount_percent: prod.discountPercentage || null,
          unit: prod.weightUnit || "500g",
          image_url: prod.image,
          popular: !!prod.isFeatured,
          is_flash_deal: !!prod.isFlashDeal,
          stock: prod.stock || 10
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    const newProd: Product = {
      ...prod,
      id: `prod_${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = async (prod: Product) => {
    try {
      const res = await apiFetch(`/admin/products/${prod.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: prod.name,
          description: prod.description,
          category_slug: prod.categoryId,
          price: prod.price,
          original_price: prod.comparePrice || null,
          discount_percent: prod.discountPercentage || null,
          unit: prod.weightUnit,
          image_url: prod.image,
          popular: !!prod.isFeatured,
          is_flash_deal: !!prod.isFlashDeal,
          stock: prod.stock
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await apiFetch(`/admin/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Orders
  const updateOrder = (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, status };
        let notifyMessage = `Order ${orderId} has been updated to ${status}.`;
        
        if (status === "preparing") {
          notifyMessage = `Kitchen confirmed Order ${orderId} for ${o.customerName}`;
        } else if (status === "dispatched") {
          notifyMessage = `Order ${orderId} has been dispatched & is on the way!`;
        } else if (status === "arriving") {
          notifyMessage = `Rider is arriving soon with Order ${orderId}!`;
        } else if (status === "delivered") {
          notifyMessage = `Order ${orderId} successfully delivered to ${o.customerName}!`;
          if (o.assignedRiderId) {
            setRiders(rPrev => rPrev.map(r => r.id === o.assignedRiderId ? {
              ...r,
              todayDeliveries: r.todayDeliveries + 1,
              todayEarnings: r.todayEarnings + 450 + (o.total * 0.05),
              status: "Online"
            } : r));
          }
        }

        const newAlert: NotificationAlert = {
          id: `not_${Date.now()}`,
          title: `Order Status: ${status.toUpperCase()}`,
          message: notifyMessage,
          time: "Just now",
          read: false,
          type: "order"
        };
        setNotifications(nPrev => [newAlert, ...nPrev]);

        return updatedOrder;
      }
      return o;
    }));
  };

  const assignRiderToOrder = async (orderId: string, riderId: string) => {
    try {
      const res = await apiFetch(`/admin/orders/${orderId}/assign-rider`, {
        method: "PATCH",
        body: JSON.stringify({ riderId })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const targetRider = riders.find(r => r.id === riderId);
        
        const newAlert: NotificationAlert = {
          id: `not_${Date.now()}`,
          title: "Rider Assigned",
          message: `Rider ${targetRider?.name || "Partner"} assigned to Order ${orderId}.`,
          time: "Just now",
          read: false,
          type: "rider"
        };
        setNotifications(nPrev => [newAlert, ...nPrev]);

        setRiders(rPrev => rPrev.map(r => r.id === riderId ? { ...r, status: "On Delivery" } : r));

        return { ...o, assignedRiderId: riderId, status: o.status === "pending" ? "preparing" : o.status };
      }
      return o;
    }));
  };

  // Riders
  const addRider = (rider: Omit<Rider, "id" | "todayDeliveries" | "todayEarnings" | "lat" | "lng">) => {
    const newRider: Rider = {
      ...rider,
      id: `rider_${Date.now()}`,
      todayDeliveries: 0,
      todayEarnings: 0,
      lat: 6.9271 + (Math.random() - 0.5) * 0.05,
      lng: 79.8612 + (Math.random() - 0.5) * 0.05
    };
    setRiders(prev => [newRider, ...prev]);

    const newAlert: NotificationAlert = {
      id: `not_${Date.now()}`,
      title: "Rider Registered",
      message: `Rider ${rider.name} has been successfully onboarded.`,
      time: "Just now",
      read: false,
      type: "rider"
    };
    setNotifications(nPrev => [newAlert, ...nPrev]);
  };

  const updateRider = (rider: Rider) => {
    setRiders(prev => prev.map(r => r.id === rider.id ? rider : r));
  };

  const deleteRider = (id: string) => {
    setRiders(prev => prev.filter(r => r.id !== id));
  };

  // Customers
  const addCustomer = (customer: Omit<Customer, "id" | "joinedDate" | "orderCount" | "totalSpent">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      joinedDate: new Date().toISOString().split("T")[0],
      orderCount: 0,
      totalSpent: 0
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  };

  // Promotions
  const addPromotion = (promo: Omit<Promotion, "id" | "useCount">) => {
    const newPromo: Promotion = {
      ...promo,
      id: `promo_${Date.now()}`,
      useCount: 0
    };
    setPromotions(prev => [newPromo, ...prev]);

    const newAlert: NotificationAlert = {
      id: `not_${Date.now()}`,
      title: "Promotion Created",
      message: `New discount coupon '${promo.code}' is now live!`,
      time: "Just now",
      read: false,
      type: "promotion"
    };
    setNotifications(nPrev => [newAlert, ...nPrev]);
  };

  const updatePromotion = (promo: Promotion) => {
    setPromotions(prev => prev.map(p => p.id === promo.id ? promo : p));
  };

  const deletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  // Banners
  const addBanner = async (banner: Omit<Banner, "id">) => {
    try {
      const res = await apiFetch("/admin/banners", {
        method: "POST",
        body: JSON.stringify({
          title: banner.title,
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          sort_order: banner.sortOrder || 0,
          is_active: banner.status === "Active"
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    const newBanner: Banner = {
      ...banner,
      id: `ban_${Date.now()}`
    };
    setBanners(prev => [newBanner, ...prev]);
  };

  const updateBanner = async (banner: Banner) => {
    try {
      const res = await apiFetch(`/admin/banners/${banner.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: banner.title,
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          sort_order: banner.sortOrder,
          is_active: banner.status === "Active"
        })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
  };

  const deleteBanner = async (id: string) => {
    try {
      const res = await apiFetch(`/admin/banners/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn("API Error, using fallback.");
    }
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const reorderBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
  };

  // Settings
  const updateSettings = (s: PortalSettings) => {
    setSettings(s);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <PortalContext.Provider value={{
      categories, products, orders, riders, customers, promotions, banners, settings, notifications,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addProduct, updateProduct, deleteProduct,
      updateOrder, updateOrderStatus, assignRiderToOrder,
      addRider, updateRider, deleteRider,
      addCustomer, updateCustomer,
      addPromotion, updatePromotion, deletePromotion,
      addBanner, updateBanner, deleteBanner, reorderBanners,
      updateSettings,
      markNotificationRead, clearNotifications
    }}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};
