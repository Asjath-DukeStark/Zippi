import { Category, Product, Order, Rider, Customer, Promotion, Banner, PortalSettings, NotificationAlert } from "./types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "veggies",
    name: "Fresh Produce",
    slug: "veggies",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=640",
    productCount: 4,
    status: "Active"
  },
  {
    id: "dairy",
    name: "Dairy & Eggs",
    slug: "dairy",
    image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?q=80&w=640",
    productCount: 4,
    status: "Active"
  },
  {
    id: "meats",
    name: "Meat & Seafood",
    slug: "meats",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=640",
    productCount: 2,
    status: "Active"
  },
  {
    id: "bakery",
    name: "Bakery & Bread",
    slug: "bakery",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=640",
    productCount: 2,
    status: "Active"
  },
  {
    id: "beverages",
    name: "Beverages",
    slug: "beverages",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=640",
    productCount: 4,
    status: "Active"
  },
  {
    id: "snacks",
    name: "Snacks & Sweets",
    slug: "snacks",
    image: "https://images.unsplash.com/photo-1511125341079-05a909dd6802?q=80&w=640",
    productCount: 3,
    status: "Active"
  },
  {
    id: "frozen",
    name: "Frozen Food",
    slug: "frozen",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=640",
    productCount: 2,
    status: "Active"
  },
  {
    id: "cleaning",
    name: "Cleaning & Home",
    slug: "cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=640",
    productCount: 2,
    status: "Active"
  },
  {
    id: "pantry",
    name: "Pantry & Staples",
    slug: "pantry",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=640",
    productCount: 3,
    status: "Active"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "f1",
    name: "Sri Lankan Organic Cavendish Bananas",
    sku: "GP-BN-01",
    price: 360,
    comparePrice: 450,
    categoryId: "veggies",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
    stock: 25,
    status: "Active",
    description: "Sweet, rich, and chemically-free grown local Cavendish bananas. Highly nutritious and perfect for daily energy boost.",
    discountPercentage: 20,
    weightUnit: "1 kg",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "f2",
    name: "Premium Red Seedless Grapes",
    sku: "GP-GR-02",
    price: 1890,
    comparePrice: 2200,
    categoryId: "veggies",
    image: "https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?w=500&auto=format&fit=crop&q=80",
    stock: 12,
    status: "Active",
    description: "Crisp, plump, and ultra-sweet red seedless grapes imported from elite vineyards. Hand-picked and thoroughly washed.",
    discountPercentage: 14,
    weightUnit: "500g pack",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "f3",
    name: "Fresh Colombo Local Papaya",
    sku: "GP-PP-03",
    price: 490,
    categoryId: "veggies",
    image: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80",
    stock: 18,
    status: "Active",
    description: "Rich, orange-fleshed local papaya, harvested early this morning. Creamy texture and extremely sweet wellness aid.",
    weightUnit: "1.2 kg - 1.5 kg",
    isFeatured: false,
    isFlashDeal: false
  },
  {
    id: "v1",
    name: "Nuwara Eliya Fresh Carrots",
    sku: "GP-CR-04",
    price: 420,
    comparePrice: 480,
    categoryId: "veggies",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80",
    stock: 30,
    status: "Active",
    description: "Crispy, sweet, premium carrots straight from the cold valley hills of Nuwara Eliya. High beta-carotene and completely direct-source.",
    discountPercentage: 12,
    weightUnit: "500g",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "d1",
    name: "Kotmale Pure Sri Lankan Salted Butter",
    sku: "GP-BT-05",
    price: 980,
    categoryId: "dairy",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
    stock: 19,
    status: "Active",
    description: "Premium quality golden butter crafted from pure cows milk sourced from up-country dairy farms in Sri Lanka. Rich and savory.",
    weightUnit: "200g block",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "d2",
    name: "Fresh Farm White Eggs (10 Pack)",
    sku: "GP-EG-06",
    price: 520,
    comparePrice: 580,
    categoryId: "dairy",
    image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80",
    stock: 40,
    status: "Active",
    description: "Guaranteed fresh, clean farm eggs. Sourced from high-standard sanitary poultry farms with veterinary approval.",
    discountPercentage: 10,
    weightUnit: "10 Pack",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "d3",
    name: "Pelwatte Full Cream Liquid Milk",
    sku: "GP-MK-07",
    price: 490,
    categoryId: "dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80",
    stock: 55,
    status: "Active",
    description: "100% natural, pasture-grazed fresh milk sterilized for long life. Absolutely no additives, preservatives or added sugars.",
    weightUnit: "1 L Tetrapack",
    isFeatured: false,
    isFlashDeal: false
  },
  {
    id: "b1",
    name: "Artisanal Sourdough Bread",
    sku: "GP-BD-08",
    price: 850,
    categoryId: "bakery",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80",
    stock: 8,
    status: "Active",
    description: "Traditionally baked naturally-fermented sourdough bread. Featuring a blistered thick caramelized crust and soft, airy interior.",
    weightUnit: "600g loaf",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "b2",
    name: "Soft French Chocolate Croissants",
    sku: "GP-CR-09",
    price: 680,
    comparePrice: 800,
    categoryId: "bakery",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    stock: 14,
    status: "Active",
    description: "Golden flaky pastries made with layers of buttery laminated dough and filled with decadent gourmet dark chocolate batons.",
    discountPercentage: 15,
    weightUnit: "2 Pack",
    isFeatured: false,
    isFlashDeal: false
  },
  {
    id: "m1",
    name: "Fresh Skinless Antibiotic-Free Chicken Breast",
    sku: "GP-CH-10",
    price: 1350,
    comparePrice: 1600,
    categoryId: "meats",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80",
    stock: 16,
    status: "Active",
    description: "Premium choice double chicken outer breast portions. Sourced from high-welfare, cage-free poultry environments.",
    discountPercentage: 15,
    weightUnit: "500g pack",
    isFeatured: true,
    isFlashDeal: false
  },
  {
    id: "fd_milo",
    name: "⚡ Milo 400g Tin",
    sku: "GP-ML-11",
    price: 890,
    comparePrice: 1490,
    categoryId: "beverages",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80",
    stock: 15,
    status: "Active",
    description: "Active-go chocolate malt energy beverage. Complete with crucial proteins and essential minerals.",
    discountPercentage: 40,
    weightUnit: "400g Tin",
    isFeatured: true,
    isFlashDeal: true
  },
  {
    id: "fd_nestomalt",
    name: "⚡ Nestomalt 400g",
    sku: "GP-NM-12",
    price: 720,
    comparePrice: 1100,
    categoryId: "beverages",
    image: "https://images.unsplash.com/photo-1595981267035-7b04ec4162d2?w=500&auto=format&fit=crop&q=80",
    stock: 20,
    status: "Active",
    description: "Sri Lankas favorite golden power malt mix. Perfect daily tea-match energy boost.",
    discountPercentage: 35,
    weightUnit: "400g Box",
    isFeatured: true,
    isFlashDeal: true
  }
];

export const INITIAL_RIDERS: Rider[] = [
  {
    id: "rider_pradeep",
    name: "Pradeep Silva",
    phone: "+94 77 982 4511",
    vehicleType: "Bike",
    vehicleNumber: "WP-BBL-2015",
    status: "Online",
    rating: 4.85,
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pradeep",
    todayDeliveries: 0,
    todayEarnings: 0,
    lat: 6.9271,
    lng: 79.8612
  },
  {
    id: "rider_1",
    name: "Nuwan Perera",
    phone: "+94 77 123 4567",
    vehicleType: "Bike",
    vehicleNumber: "WP BHI-9872",
    status: "Online",
    rating: 4.9,
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Nuwan",
    todayDeliveries: 12,
    todayEarnings: 4200,
    lat: 6.9271,
    lng: 79.8612
  },
  {
    id: "rider_2",
    name: "Mohamed Salman",
    phone: "+94 76 987 6543",
    vehicleType: "Scooter",
    vehicleNumber: "WP ME-5510",
    status: "On Delivery",
    rating: 4.7,
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Salman",
    todayDeliveries: 8,
    todayEarnings: 2950,
    lat: 6.9319,
    lng: 79.8475
  },
  {
    id: "rider_3",
    name: "Janith Bandara",
    phone: "+94 71 444 8822",
    vehicleType: "Three-Wheeler",
    vehicleNumber: "WP QX-3391",
    status: "Online",
    rating: 4.8,
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Janith",
    todayDeliveries: 15,
    todayEarnings: 6800,
    lat: 6.8912,
    lng: 79.8733
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust_1",
    name: "Asjath Ahamed",
    email: "asjathahamed0@gmail.com",
    phone: "+94 77 888 9900",
    joinedDate: "2025-11-12",
    orderCount: 18,
    totalSpent: 28950,
    status: "Active"
  },
  {
    id: "cust_2",
    name: "Priyantha Jayasuriya",
    email: "priyantha.j@gmail.lk",
    phone: "+94 76 222 3344",
    joinedDate: "2026-01-20",
    orderCount: 8,
    totalSpent: 12450,
    status: "Active"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ZIP-88219",
    customerName: "Asjath Ahamed",
    customerEmail: "asjathahamed0@gmail.com",
    customerPhone: "+94 77 888 9900",
    address: "Penthouse Apartment B, No 45, Alfred House Gardens, Colombo 03",
    date: "2026-06-07T09:12:00Z",
    total: 1750,
    status: "pending",
    paymentMethod: "Card",
    items: [
      { productId: "f1", name: "Sri Lankan Organic Cavendish Bananas", quantity: 2, price: 360 },
      { productId: "fd_milo", name: "⚡ Milo 400g Tin", quantity: 1, price: 890 }
    ]
  },
  {
    id: "ZIP-88218",
    customerName: "Priyantha Jayasuriya",
    customerEmail: "priyantha.j@gmail.lk",
    customerPhone: "+94 76 222 3344",
    address: "No 18/4, High Level Road, Nugegoda",
    date: "2026-06-07T08:45:00Z",
    total: 2170,
    status: "preparing",
    paymentMethod: "COD",
    items: [
      { productId: "d2", name: "Fresh Farm White Eggs (10 Pack)", quantity: 1, price: 520 },
      { productId: "m1", name: "Fresh Skinless Chicken Breast", quantity: 1, price: 1350 }
    ]
  },
  {
    id: "ZIP-88217",
    customerName: "Priyantha Jayasuriya",
    customerEmail: "priyantha.j@gmail.lk",
    customerPhone: "+94 76 222 3344",
    address: "No 18/4, High Level Road, Nugegoda",
    date: "2026-06-07T08:15:00Z",
    total: 4650,
    status: "dispatched",
    paymentMethod: "Card",
    items: [
      { productId: "f2", name: "Premium Red Seedless Grapes", quantity: 2, price: 1890 },
      { productId: "fd_nestomalt", name: "⚡ Nestomalt 400g", quantity: 1, price: 720 }
    ],
    assignedRiderId: "rider_2"
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "promo_1",
    code: "FIRSTZIPPI",
    title: "New User Welcome Discount",
    discountType: "Percentage",
    discountValue: 20,
    minOrderAmount: 1500,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Active",
    useCount: 342
  },
  {
    id: "promo_2",
    code: "FRESHVEG",
    title: "Fresh Veggie Off",
    discountType: "Fixed",
    discountValue: 150,
    minOrderAmount: 1200,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "Active",
    useCount: 118
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: "ban_1",
    title: "Super Fresh Deals",
    subtitle: "Deliciously fresh produce directly from Nuwara Eliya farms in under 25 mins.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    linkUrl: "/category/veggies",
    status: "Active",
    slot: "Home Hero"
  },
  {
    id: "ban_2",
    title: "Up to 40% Off on Beverages",
    subtitle: "Quench your thirst with premium local tea and king coconut water.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
    linkUrl: "/category/beverages",
    status: "Active",
    slot: "Category Offer"
  }
];

export const INITIAL_SETTINGS: PortalSettings = {
  onlineStatus: true,
  baseDeliveryFee: 150, // LKR
  commissionRate: 15,
  operatingRadius: 12,
  autoAssignRiders: true,
  supportPhone: "+94 11 255 1212",
  appName: "Zippi Grocery Delivery",
  tagline: "Ultra-fast grocery delivery system across Colombo",
  logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop",
  contactEmail: "ops@zippi.lk",
  contactPhone: "+94 11 255 1212",
  minOrderAmount: 500,
  freeDeliveryAbove: 3000,
  estDeliveryTime: 30,
  openTime: "08:00",
  closeTime: "23:00",
  operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  orderConfirmedSms: "Zippi Order Alert! Your order {orderId} of Rs.{total} has been confirmed. Processing has begun!",
  orderOutForDeliverySms: "Zippi Status update! Rider {riderName} is on their way with your groceries. Order {orderId}"
};

export const INITIAL_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: "not_1",
    title: "New Incoming Order",
    message: "Pending Order ZIP-88219 has been placed by Asjath Ahamed (Rs. 1,750)",
    time: "3 mins ago",
    read: false,
    type: "order"
  }
];
