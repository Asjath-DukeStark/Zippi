const bcrypt = require('bcryptjs');

// Pre-seeded Categories
const categories = [
  // Main Categories
  { id: 'grocery', name: 'Grocery', slug: 'grocery', icon: 'ShoppingBag', parent_slug: null, is_active: true },
  { id: 'pharmacy', name: 'Pharmacy', slug: 'pharmacy', icon: 'HeartPulse', parent_slug: null, is_active: true },
  { id: 'baby-care', name: 'Baby Care', slug: 'baby-care', icon: 'Smile', parent_slug: null, is_active: true },
  { id: 'meat', name: 'Meat', slug: 'meat', icon: 'Beef', parent_slug: null, is_active: true },
  { id: 'bakery-main', name: 'Bakery', slug: 'bakery-main', icon: 'Croissant', parent_slug: null, is_active: true },
  { id: 'fancy-cosmetics', name: 'Fancy & Cosmetics', slug: 'fancy-cosmetics', icon: 'Sparkles', parent_slug: null, is_active: true },
  { id: 'masala', name: 'Masala', slug: 'masala', icon: 'Flame', parent_slug: null, is_active: true },
  { id: 'car-rental', name: 'Car Rental', slug: 'car-rental', icon: 'Car', parent_slug: null, is_active: true },

  // Subcategories of Grocery
  { id: 'fruits-veggies', name: 'Fruits & Vegetables', slug: 'fruits-veggies', icon: 'Leaf', parent_slug: 'grocery', is_active: true },
  { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', icon: 'Milk', parent_slug: 'grocery', is_active: true },
  { id: 'pantry', name: 'Pantry & Staples', slug: 'pantry', icon: 'Sparkles', parent_slug: 'grocery', is_active: true },
  { id: 'snacks', name: 'Snacks & Sweets', slug: 'snacks', icon: 'Cookie', parent_slug: 'grocery', is_active: true },
  { id: 'beverages', name: 'Beverages', slug: 'beverages', icon: 'Coffee', parent_slug: 'grocery', is_active: true },
  { id: 'frozen', name: 'Frozen Food', slug: 'frozen', icon: 'Sparkles', parent_slug: 'grocery', is_active: true },
  { id: 'cleaning', name: 'Cleaning & Home', slug: 'cleaning', icon: 'Sparkles', parent_slug: 'grocery', is_active: true },

  // Subcategories of Pharmacy
  { id: 'medicines', name: 'Medicines', slug: 'medicines', icon: 'HeartPulse', parent_slug: 'pharmacy', is_active: true },
  { id: 'wellness', name: 'Wellness & Supplements', slug: 'wellness', icon: 'Sparkles', parent_slug: 'pharmacy', is_active: true },
  { id: 'first-aid', name: 'First Aid', slug: 'first-aid', icon: 'HeartPulse', parent_slug: 'pharmacy', is_active: true },
  { id: 'personal-care', name: 'Personal Care', slug: 'personal-care', icon: 'Smile', parent_slug: 'pharmacy', is_active: true },

  // Subcategories of Baby Care
  { id: 'diapers', name: 'Diapers & Wipes', slug: 'diapers', icon: 'Smile', parent_slug: 'baby-care', is_active: true },
  { id: 'baby-food', name: 'Baby Food', slug: 'baby-food', icon: 'Milk', parent_slug: 'baby-care', is_active: true },
  { id: 'baby-toiletries', name: 'Baby Toiletries', slug: 'baby-toiletries', icon: 'Smile', parent_slug: 'baby-care', is_active: true },
  { id: 'baby-toys', name: 'Toys & Accessories', slug: 'baby-toys', icon: 'Sparkles', parent_slug: 'baby-care', is_active: true },

  // Subcategories of Meat
  { id: 'chicken', name: 'Chicken', slug: 'chicken', icon: 'Beef', parent_slug: 'meat', is_active: true },
  { id: 'beef-mutton', name: 'Beef & Mutton', slug: 'beef-mutton', icon: 'Beef', parent_slug: 'meat', is_active: true },
  { id: 'seafood', name: 'Seafood', slug: 'seafood', icon: 'Beef', parent_slug: 'meat', is_active: true },
  { id: 'cold-cuts', name: 'Sausage & Cold Cuts', slug: 'cold-cuts', icon: 'Beef', parent_slug: 'meat', is_active: true },

  // Subcategories of Bakery
  { id: 'bread-buns', name: 'Breads & Buns', slug: 'bread-buns', icon: 'Croissant', parent_slug: 'bakery-main', is_active: true },
  { id: 'cakes-pastries', name: 'Cakes & Pastries', slug: 'cakes-pastries', icon: 'Croissant', parent_slug: 'bakery-main', is_active: true },
  { id: 'cookies-savories', name: 'Cookies & Savories', slug: 'cookies-savories', icon: 'Cookie', parent_slug: 'bakery-main', is_active: true },

  // Subcategories of Fancy & Cosmetics
  { id: 'makeup', name: 'Makeup', slug: 'makeup', icon: 'Sparkles', parent_slug: 'fancy-cosmetics', is_active: true },
  { id: 'skincare', name: 'Skincare', slug: 'skincare', icon: 'Sparkles', parent_slug: 'fancy-cosmetics', is_active: true },
  { id: 'haircare', name: 'Haircare', slug: 'haircare', icon: 'Sparkles', parent_slug: 'fancy-cosmetics', is_active: true },
  { id: 'fragrances', name: 'Fragrances', slug: 'fragrances', icon: 'Sparkles', parent_slug: 'fancy-cosmetics', is_active: true },
  { id: 'fancy-accessories', name: 'Accessories', slug: 'fancy-accessories', icon: 'Sparkles', parent_slug: 'fancy-cosmetics', is_active: true },

  // Subcategories of Masala
  { id: 'spices-powders', name: 'Spices & Powders', slug: 'spices-powders', icon: 'Flame', parent_slug: 'masala', is_active: true },
  { id: 'whole-spices', name: 'Whole Spices', slug: 'whole-spices', icon: 'Flame', parent_slug: 'masala', is_active: true },
  { id: 'curry-pastes', name: 'Curry Pastes', slug: 'curry-pastes', icon: 'Flame', parent_slug: 'masala', is_active: true },
  { id: 'herbs-seasoning', name: 'Herbs & Seasonings', slug: 'herbs-seasoning', icon: 'Leaf', parent_slug: 'masala', is_active: true },

  // Subcategories of Car Rental
  { id: 'hatchback', name: 'Hatchback', slug: 'hatchback', icon: 'Car', parent_slug: 'car-rental', is_active: true },
  { id: 'sedan', name: 'Sedan', slug: 'sedan', icon: 'Car', parent_slug: 'car-rental', is_active: true },
  { id: 'suv', name: 'SUV', slug: 'suv', icon: 'Car', parent_slug: 'car-rental', is_active: true },
  { id: 'luxury-cars', name: 'Luxury Cars', slug: 'luxury-cars', icon: 'Car', parent_slug: 'car-rental', is_active: true },
  { id: 'vans-buses', name: 'Vans & Buses', slug: 'vans-buses', icon: 'Car', parent_slug: 'car-rental', is_active: true },
];

// Pre-seeded Products (from frontend data.ts)
const products = [
  {
    id: 'f1',
    name: 'Sri Lankan Organic Cavendish Bananas',
    description: 'Sweet, rich, and chemically-free grown local Cavendish bananas. Highly nutritious and perfect for daily energy boost.',
    category_slug: 'fruits-veggies',
    price: 360,
    original_price: 450,
    discount_percent: 20,
    unit: '1 kg',
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 25,
    rating: 4.8,
    reviews_count: 142,
    is_active: true,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f2',
    name: 'Premium Red Seedless Grapes',
    description: 'Crisp, plump, and ultra-sweet red seedless grapes imported from elite vineyards. Hand-picked and thoroughly washed.',
    category_slug: 'fruits-veggies',
    price: 1890,
    original_price: 2200,
    discount_percent: 14,
    unit: '500g pack',
    image_url: 'https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 12,
    rating: 4.9,
    reviews_count: 88,
    is_active: true,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f3',
    name: 'Fresh Colombo Local Papaya',
    description: 'Rich, orange-fleshed local papaya, harvested early this morning. Creamy texture and extremely sweet wellness aid.',
    category_slug: 'fruits-veggies',
    price: 490,
    unit: '1.2 kg - 1.5 kg',
    image_url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80',
    popular: false,
    is_flash_deal: false,
    stock: 18,
    rating: 4.6,
    reviews_count: 61,
    is_active: true,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v1',
    name: 'Nuwara Eliya Fresh Carrots',
    description: 'Crispy, sweet, premium carrots straight from the cold valley hills of Nuwara Eliya. High beta-carotene and completely direct-source.',
    category_slug: 'fruits-veggies',
    price: 420,
    original_price: 480,
    discount_percent: 12,
    unit: '500g',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 30,
    rating: 4.7,
    reviews_count: 104,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd1',
    name: 'Kotmale Pure Sri Lankan Salted Butter',
    description: 'Premium quality golden butter crafted from pure cows milk sourced from up-country dairy farms in Sri Lanka. Rich and savory.',
    category_slug: 'dairy',
    price: 980,
    unit: '200g block',
    image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 19,
    rating: 4.9,
    reviews_count: 215,
    is_active: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd2',
    name: 'Fresh Farm White Eggs (10 Pack)',
    description: 'Guaranteed fresh, clean farm eggs. Sourced from high-standard sanitary poultry farms with veterinary approval.',
    category_slug: 'dairy',
    price: 520,
    original_price: 580,
    discount_percent: 10,
    unit: '10 Pack',
    image_url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 40,
    rating: 4.8,
    reviews_count: 312,
    is_active: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm1',
    name: 'Fresh Skinless Antibiotic-Free Chicken Breast',
    description: 'Premium choice double chicken outer breast portions. Sourced from high-welfare, cage-free poultry environments.',
    category_slug: 'chicken',
    price: 1350,
    original_price: 1600,
    discount_percent: 15,
    unit: '500g pack',
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 16,
    rating: 4.8,
    reviews_count: 183,
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fd_milo',
    name: '⚡ Milo 400g Tin',
    description: 'Active-go chocolate malt energy beverage. Complete with crucial proteins and essential minerals.',
    category_slug: 'beverages',
    price: 890,
    original_price: 1490,
    discount_percent: 40,
    unit: '400g Tin',
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: true,
    stock: 15,
    rating: 4.9,
    reviews_count: 520,
    is_active: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fd_nestomalt',
    name: '⚡ Nestomalt 400g',
    description: 'Sri Lankas favorite golden power malt mix. Perfect daily tea-match energy boost.',
    category_slug: 'beverages',
    price: 720,
    original_price: 1100,
    discount_percent: 35,
    unit: '400g Box',
    image_url: 'https://images.unsplash.com/photo-1595981267035-7b04ec4162d2?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: true,
    stock: 20,
    rating: 4.8,
    reviews_count: 412,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Pharmacy Products
  {
    id: 'med_panadol',
    name: 'Panadol 500mg',
    description: 'Relieves mild to moderate pain including headache, migraine, muscle ache, sore throat, and toothache.',
    category_slug: 'medicines',
    price: 150,
    unit: '12 Tablets',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 100,
    rating: 4.9,
    reviews_count: 98,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'med_vitc',
    name: 'Premium Vitamin C 1000mg',
    description: 'Supports standard immune health and antioxidant cellular defense. Made from organic extracts.',
    category_slug: 'wellness',
    price: 1850,
    unit: '30 Tablets',
    image_url: 'https://images.unsplash.com/photo-1616679911721-ebd6eec18fcd?w=500&auto=format&fit=crop&q=80',
    popular: false,
    is_flash_deal: false,
    stock: 25,
    rating: 4.7,
    reviews_count: 34,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Baby Care Products
  {
    id: 'baby_diapers',
    name: 'Huggies Dry Diapers Size 3',
    description: 'Offers overnight leakage lock with super absorbent core. Premium soft skin design.',
    category_slug: 'diapers',
    price: 2950,
    unit: '24 Pack',
    image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 15,
    rating: 4.8,
    reviews_count: 57,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Bakery Products
  {
    id: 'bak_cake',
    name: 'Zippi Fresh Butter Cake',
    description: 'Freshly baked traditional moist rich butter cake. Perfect with evening milk tea.',
    category_slug: 'cakes-pastries',
    price: 950,
    unit: '500g',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
    popular: false,
    is_flash_deal: false,
    stock: 10,
    rating: 4.6,
    reviews_count: 22,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Fancy & Cosmetics
  {
    id: 'cos_moisturizer',
    name: 'Cetaphil Hydrating Moisturizer',
    description: 'Dermatologist recommended daily facial and body moisturizer for dry, sensitive skin.',
    category_slug: 'skincare',
    price: 3450,
    unit: '100ml',
    image_url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 18,
    rating: 4.9,
    reviews_count: 140,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Masala Products
  {
    id: 'mas_curry',
    name: 'Jaffna Roasted Curry Powder',
    description: 'Authentic rich roasted blend of pure Sri Lankan spices. Perfect for meats and curries.',
    category_slug: 'spices-powders',
    price: 380,
    unit: '200g',
    image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80',
    popular: true,
    is_flash_deal: false,
    stock: 45,
    rating: 4.8,
    reviews_count: 76,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Car Rental
  {
    id: 'car_alto',
    name: 'Suzuki Alto (Self-Drive)',
    description: 'Efficient, compact hatchback car for easy city travel. Unlimited mileage daily options.',
    category_slug: 'hatchback',
    price: 6500,
    unit: 'Per Day',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
    popular: false,
    is_flash_deal: false,
    stock: 5,
    rating: 4.5,
    reviews_count: 12,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Pre-seeded Banners
const banners = [
  {
    id: 'b1',
    title: 'Super Fresh Deals',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    link_url: '/category/veggies',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'b2',
    title: 'Up to 40% Off on Beverages',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    link_url: '/category/beverages',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Pre-seeded Users (Default roles)
const users = [];

// Seed default accounts
const salt = bcrypt.genSaltSync(10);
users.push({
  id: 'admin-uuid-1111-2222-333333333333',
  phone: '0771234567',
  name: 'Zippi Admin',
  email: 'admin@zippi.com',
  role: 'admin',
  password_hash: bcrypt.hashSync('admin123', salt),
  created_at: new Date().toISOString()
});
users.push({
  id: 'rider-uuid-1111-2222-333333333333',
  phone: '0777654321',
  name: 'Zippi Rider 01',
  email: 'rider@zippi.com',
  role: 'rider',
  password_hash: bcrypt.hashSync('rider123', salt),
  created_at: new Date().toISOString()
});
users.push({
  id: 'rider_pradeep',
  phone: '+94 77 982 4511',
  name: 'Pradeep Silva',
  email: 'pradeep@zippi.com',
  role: 'rider',
  password_hash: bcrypt.hashSync('zippi123', salt),
  created_at: new Date().toISOString()
});
users.push({
  id: 'customer-uuid-1111-2222-333333333333',
  phone: '0771111111',
  name: 'Zippi Customer 01',
  email: 'customer@zippi.com',
  role: 'customer',
  password_hash: bcrypt.hashSync('user123', salt),
  created_at: new Date().toISOString()
});

// Rider Profiles
const riderProfiles = {
  'rider-uuid-1111-2222-333333333333': {
    user_id: 'rider-uuid-1111-2222-333333333333',
    latitude: 6.9271, // Colombo default
    longitude: 79.8612,
    is_online: true,
    updated_at: new Date().toISOString()
  },
  'rider_pradeep': {
    user_id: 'rider_pradeep',
    latitude: 6.9271,
    longitude: 79.8612,
    is_online: true,
    updated_at: new Date().toISOString()
  }
};

// Orders Store
const orders = [];
const orderItems = [];

// In-Memory Helper Functions
const InMemoryDb = {
  users: {
    create: async (user) => {
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        password_hash: user.password_hash || bcrypt.hashSync(user.password || '123456', salt),
        created_at: new Date().toISOString()
      };
      
      // Check duplicate phone
      if (users.some(u => u.phone === newUser.phone)) {
        throw new Error('Phone number already exists');
      }
      users.push(newUser);
      
      // If it's a rider, create profile
      if (newUser.role === 'rider') {
        riderProfiles[newUser.id] = {
          user_id: newUser.id,
          latitude: 6.9271,
          longitude: 79.8612,
          is_online: false,
          updated_at: new Date().toISOString()
        };
      }
      
      return newUser;
    },
    findByPhone: async (phone) => {
      return users.find(u => u.phone === phone) || null;
    },
    findById: async (id) => {
      return users.find(u => u.id === id) || null;
    },
    update: async (id, data) => {
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('User not found');
      users[idx] = { ...users[idx], ...data };
      return users[idx];
    }
  },

  categories: {
    findAll: async () => {
      return categories.filter(c => c.is_active);
    },
    findBySlug: async (slug) => {
      return categories.find(c => c.slug === slug && c.is_active) || null;
    },
    create: async (category) => {
      const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (categories.some(c => c.slug === slug)) {
        throw new Error('Category slug already exists');
      }
      const newCat = {
        id: `cat-${Date.now()}`,
        name: category.name,
        slug,
        icon: category.icon || 'Sparkles',
        is_active: category.is_active !== undefined ? category.is_active : true,
        created_at: new Date().toISOString()
      };
      categories.push(newCat);
      return newCat;
    },
    update: async (id, data) => {
      const idx = categories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      
      // Handle slug unique constraint if slug is changing
      if (data.slug && data.slug !== categories[idx].slug) {
        if (categories.some(c => c.slug === data.slug)) {
          throw new Error('Category slug already exists');
        }
      }
      
      categories[idx] = { ...categories[idx], ...data };
      return categories[idx];
    },
    delete: async (id) => {
      const idx = categories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      const deleted = categories[idx];
      // Instead of hard delete, we set is_active = false
      categories[idx].is_active = false;
      return deleted;
    }
  },

  products: {
    findAll: async ({ category, search, sort, isFlashDeal, popular, limit = 20, offset = 0 }) => {
      let filtered = [...products].filter(p => p.is_active);

      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category_slug === category);
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
      }

      if (isFlashDeal !== undefined) {
        filtered = filtered.filter(p => p.is_flash_deal === isFlashDeal);
      }

      if (popular !== undefined) {
        filtered = filtered.filter(p => p.popular === popular);
      }

      // Sort
      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      return { products: paginated, total };
    },
    findById: async (id) => {
      return products.find(p => p.id === id && p.is_active) || null;
    },
    create: async (product) => {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: product.name,
        description: product.description || '',
        category_slug: product.category_slug || 'all',
        price: Number(product.price),
        original_price: product.original_price ? Number(product.original_price) : null,
        discount_percent: product.discount_percent ? Number(product.discount_percent) : null,
        unit: product.unit || '1 unit',
        image_url: product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        popular: !!product.popular,
        is_flash_deal: !!product.is_flash_deal,
        stock: product.stock !== undefined ? Number(product.stock) : 10,
        rating: 5.0,
        reviews_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
      };
      products.push(newProd);
      return newProd;
    },
    update: async (id, data) => {
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      
      const updated = { ...products[idx] };
      for (const key in data) {
        if (data[key] !== undefined) {
          updated[key] = data[key];
        }
      }
      
      // Ensure numeric conversions
      if (data.price !== undefined) updated.price = Number(data.price);
      if (data.original_price !== undefined) updated.original_price = data.original_price ? Number(data.original_price) : null;
      if (data.discount_percent !== undefined) updated.discount_percent = data.discount_percent ? Number(data.discount_percent) : null;
      if (data.stock !== undefined) updated.stock = Number(data.stock);
      
      products[idx] = updated;
      return updated;
    },
    delete: async (id) => {
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      const deleted = products[idx];
      products[idx].is_active = false; // soft delete
      return deleted;
    }
  },

  orders: {
    create: async (orderData, items) => {
      // Validate and deduct stock
      for (const item of items) {
        const prod = products.find(p => p.id === item.product_id);
        if (!prod) throw new Error(`Product ${item.product_id} not found`);
        if (prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${prod.name}`);
        }
      }

      // Deduct stock
      for (const item of items) {
        const prod = products.find(p => p.id === item.product_id);
        prod.stock -= item.quantity;
      }

      const orderId = `order-${Date.now()}`;
      const newOrder = {
        id: orderId,
        order_number: orderData.order_number,
        user_id: orderData.user_id,
        subtotal: Number(orderData.subtotal),
        delivery_fee: Number(orderData.delivery_fee),
        discount: Number(orderData.discount || 0),
        total: Number(orderData.total),
        delivery_address: orderData.delivery_address,
        payment_method: orderData.payment_method,
        status: 'pending',
        delivery_eta_min: orderData.delivery_eta_min || 30,
        special_instructions: orderData.special_instructions || '',
        rider_id: null,
        created_at: new Date().toISOString()
      };

      orders.push(newOrder);

      const savedItems = items.map(item => {
        const newItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        };
        orderItems.push(newItem);
        return newItem;
      });

      return { ...newOrder, items: savedItems };
    },
    findByUserId: async (userId) => {
      const userOrders = orders.filter(o => o.user_id === userId);
      // Attach items
      return userOrders.map(o => {
        const items = orderItems.filter(oi => oi.order_id === o.id).map(oi => {
          const prod = products.find(p => p.id === oi.product_id);
          return { ...oi, product: prod };
        });
        return { ...o, items };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    findById: async (id) => {
      const order = orders.find(o => o.id === id);
      if (!order) return null;
      
      const items = orderItems.filter(oi => oi.order_id === order.id).map(oi => {
        const prod = products.find(p => p.id === oi.product_id);
        return { ...oi, product: prod };
      });

      // Attach rider if assigned
      let rider = null;
      if (order.rider_id) {
        const riderUser = users.find(u => u.id === order.rider_id);
        if (riderUser) {
          rider = {
            id: riderUser.id,
            name: riderUser.name,
            phone: riderUser.phone,
            location: riderProfiles[riderUser.id] || null
          };
        }
      }

      return { ...order, items, rider };
    },
    findAll: async ({ status, date }) => {
      let filtered = [...orders];

      if (status) {
        filtered = filtered.filter(o => o.status === status);
      }

      if (date) {
        const queryDateStr = new Date(date).toDateString();
        filtered = filtered.filter(o => new Date(o.created_at).toDateString() === queryDateStr);
      }

      // Attach items and user details
      return filtered.map(o => {
        const items = orderItems.filter(oi => oi.order_id === o.id).map(oi => {
          const prod = products.find(p => p.id === oi.product_id);
          return { ...oi, product: prod };
        });
        const user = users.find(u => u.id === o.user_id);
        return {
          ...o,
          items,
          customer: user ? { name: user.name, phone: user.phone, email: user.email } : null
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    updateStatus: async (id, status) => {
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      order.status = status;
      return order;
    },
    assignRider: async (id, riderId) => {
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      const rider = users.find(u => u.id === riderId && u.role === 'rider');
      if (!rider) throw new Error('Valid rider not found');
      order.rider_id = riderId;
      order.status = 'preparing'; // Auto transit to preparing when rider is assigned
      return order;
    },
    getSalesReport: async (period) => {
      let filtered = [...orders].filter(o => o.status !== 'cancelled');
      const now = new Date();

      if (period === 'today') {
        const todayStr = now.toDateString();
        filtered = filtered.filter(o => new Date(o.created_at).toDateString() === todayStr);
      } else if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(o => new Date(o.created_at) >= oneWeekAgo);
      } else if (period === 'month') {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(o => new Date(o.created_at) >= oneMonthAgo);
      }

      const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = filtered.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top products calculation
      const productCounts = {};
      filtered.forEach(o => {
        const items = orderItems.filter(oi => oi.order_id === o.id);
        items.forEach(oi => {
          productCounts[oi.product_id] = (productCounts[oi.product_id] || 0) + oi.quantity;
        });
      });

      const topProducts = Object.keys(productCounts)
        .map(pid => {
          const prod = products.find(p => p.id === pid);
          return {
            id: pid,
            name: prod ? prod.name : 'Unknown Product',
            quantity: productCounts[pid],
            revenue: productCounts[pid] * (prod ? prod.price : 0)
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order_value: Number(avgOrderValue.toFixed(2)),
        top_products: topProducts
      };
    },
    getDashboardStats: async () => {
      const activeOrdersCount = orders.filter(o => ['pending', 'preparing', 'dispatched', 'arriving'].includes(o.status)).length;
      const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
      const productsCount = products.filter(p => p.is_active).length;
      const customersCount = users.filter(u => u.role === 'customer').length;
      const ridersCount = users.filter(u => u.role === 'rider').length;

      // Recent orders
      const recentOrders = orders.slice(-5).map(o => {
        const u = users.find(usr => usr.id === o.user_id);
        return {
          id: o.id,
          order_number: o.order_number,
          customer_name: u ? u.name : 'Guest',
          total: o.total,
          status: o.status,
          created_at: o.created_at
        };
      }).reverse();

      return {
        active_orders: activeOrdersCount,
        total_sales: totalRevenue,
        total_products: productsCount,
        total_customers: customersCount,
        total_riders: ridersCount,
        recent_orders: recentOrders
      };
    }
  },

  banners: {
    findAll: async (all = false) => {
      const list = all ? banners : banners.filter(b => b.is_active);
      return list.sort((a, b) => a.sort_order - b.sort_order);
    },
    create: async (banner) => {
      const newBanner = {
        id: `banner-${Date.now()}`,
        title: banner.title,
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        sort_order: banner.sort_order !== undefined ? Number(banner.sort_order) : 0,
        is_active: banner.is_active !== undefined ? banner.is_active : true,
        created_at: new Date().toISOString()
      };
      banners.push(newBanner);
      return newBanner;
    },
    update: async (id, data) => {
      const idx = banners.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Banner not found');
      
      const updated = { ...banners[idx] };
      for (const key in data) {
        if (data[key] !== undefined) {
          updated[key] = data[key];
        }
      }
      if (data.sort_order !== undefined) updated.sort_order = Number(data.sort_order);
      
      banners[idx] = updated;
      return updated;
    },
    delete: async (id) => {
      const idx = banners.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Banner not found');
      const deleted = banners[idx];
      banners[idx].is_active = false; // soft delete
      return deleted;
    }
  },

  riders: {
    updateLocation: async (userId, lat, lng) => {
      if (!riderProfiles[userId]) {
        riderProfiles[userId] = { user_id: userId };
      }
      riderProfiles[userId].latitude = Number(lat);
      riderProfiles[userId].longitude = Number(lng);
      riderProfiles[userId].updated_at = new Date().toISOString();
      return riderProfiles[userId];
    },
    updateStatus: async (userId, isOnline) => {
      if (!riderProfiles[userId]) {
        riderProfiles[userId] = { user_id: userId, latitude: 6.9271, longitude: 79.8612 };
      }
      riderProfiles[userId].is_online = !!isOnline;
      riderProfiles[userId].updated_at = new Date().toISOString();
      return riderProfiles[userId];
    },
    findActiveOrder: async (userId) => {
      // Find orders assigned to this rider that are not delivered or cancelled
      const activeOrder = orders.find(o => 
        o.rider_id === userId && 
        !['delivered', 'cancelled'].includes(o.status)
      );

      if (!activeOrder) return null;

      const items = orderItems.filter(oi => oi.order_id === activeOrder.id).map(oi => {
        const prod = products.find(p => p.id === oi.product_id);
        return { ...oi, product: prod };
      });
      const customer = users.find(u => u.id === activeOrder.user_id);

      return {
        ...activeOrder,
        items,
        customer: customer ? { name: customer.name, phone: customer.phone, address: activeOrder.delivery_address } : null
      };
    }
  }
};

module.exports = InMemoryDb;
