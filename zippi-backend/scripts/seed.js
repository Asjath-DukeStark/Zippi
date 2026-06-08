const { supabase } = require('../src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isPlaceholder = !process.env.SUPABASE_URL || 
                      process.env.SUPABASE_URL.includes('your-project') ||
                      !process.env.SUPABASE_SERVICE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY.includes('your-service-role');

const CATEGORIES = [
  // Main Categories
  { name: 'Grocery', slug: 'grocery', icon: 'ShoppingBag', parent_slug: null },
  { name: 'Pharmacy', slug: 'pharmacy', icon: 'HeartPulse', parent_slug: null },
  { name: 'Baby Care', slug: 'baby-care', icon: 'Smile', parent_slug: null },
  { name: 'Meat', slug: 'meat', icon: 'Beef', parent_slug: null },
  { name: 'Bakery', slug: 'bakery-main', icon: 'Croissant', parent_slug: null },
  { name: 'Fancy & Cosmetics', slug: 'fancy-cosmetics', icon: 'Sparkles', parent_slug: null },
  { name: 'Masala', slug: 'masala', icon: 'Flame', parent_slug: null },
  { name: 'Car Rental', slug: 'car-rental', icon: 'Car', parent_slug: null },

  // Subcategories of Grocery
  { name: 'Fruits & Vegetables', slug: 'fruits-veggies', icon: 'Leaf', parent_slug: 'grocery' },
  { name: 'Dairy & Eggs', slug: 'dairy', icon: 'Milk', parent_slug: 'grocery' },
  { name: 'Pantry & Staples', slug: 'pantry', icon: 'Sparkles', parent_slug: 'grocery' },
  { name: 'Snacks & Sweets', slug: 'snacks', icon: 'Cookie', parent_slug: 'grocery' },
  { name: 'Beverages', slug: 'beverages', icon: 'Coffee', parent_slug: 'grocery' },
  { name: 'Frozen Food', slug: 'frozen', icon: 'Sparkles', parent_slug: 'grocery' },
  { name: 'Cleaning & Home', slug: 'cleaning', icon: 'Sparkles', parent_slug: 'grocery' },

  // Subcategories of Pharmacy
  { name: 'Medicines', slug: 'medicines', icon: 'HeartPulse', parent_slug: 'pharmacy' },
  { name: 'Wellness & Supplements', slug: 'wellness', icon: 'Sparkles', parent_slug: 'pharmacy' },
  { name: 'First Aid', slug: 'first-aid', icon: 'HeartPulse', parent_slug: 'pharmacy' },
  { name: 'Personal Care', slug: 'personal-care', icon: 'Smile', parent_slug: 'pharmacy' },

  // Subcategories of Baby Care
  { name: 'Diapers & Wipes', slug: 'diapers', icon: 'Smile', parent_slug: 'baby-care' },
  { name: 'Baby Food', slug: 'baby-food', icon: 'Milk', parent_slug: 'baby-care' },
  { name: 'Baby Toiletries', slug: 'baby-toiletries', icon: 'Smile', parent_slug: 'baby-care' },
  { name: 'Toys & Accessories', slug: 'baby-toys', icon: 'Sparkles', parent_slug: 'baby-care' },

  // Subcategories of Meat
  { name: 'Chicken', slug: 'chicken', icon: 'Beef', parent_slug: 'meat' },
  { name: 'Beef & Mutton', slug: 'beef-mutton', icon: 'Beef', parent_slug: 'meat' },
  { name: 'Seafood', slug: 'seafood', icon: 'Beef', parent_slug: 'meat' },
  { name: 'Sausage & Cold Cuts', slug: 'cold-cuts', icon: 'Beef', parent_slug: 'meat' },

  // Subcategories of Bakery
  { name: 'Breads & Buns', slug: 'bread-buns', icon: 'Croissant', parent_slug: 'bakery-main' },
  { name: 'Cakes & Pastries', slug: 'cakes-pastries', icon: 'Croissant', parent_slug: 'bakery-main' },
  { name: 'Cookies & Savories', slug: 'cookies-savories', icon: 'Cookie', parent_slug: 'bakery-main' },

  // Subcategories of Fancy & Cosmetics
  { name: 'Makeup', slug: 'makeup', icon: 'Sparkles', parent_slug: 'fancy-cosmetics' },
  { name: 'Skincare', slug: 'skincare', icon: 'Sparkles', parent_slug: 'fancy-cosmetics' },
  { name: 'Haircare', slug: 'haircare', icon: 'Sparkles', parent_slug: 'fancy-cosmetics' },
  { name: 'Fragrances', slug: 'fragrances', icon: 'Sparkles', parent_slug: 'fancy-cosmetics' },
  { name: 'Accessories', slug: 'fancy-accessories', icon: 'Sparkles', parent_slug: 'fancy-cosmetics' },

  // Subcategories of Masala
  { name: 'Spices & Powders', slug: 'spices-powders', icon: 'Flame', parent_slug: 'masala' },
  { name: 'Whole Spices', slug: 'whole-spices', icon: 'Flame', parent_slug: 'masala' },
  { name: 'Curry Pastes', slug: 'curry-pastes', icon: 'Flame', parent_slug: 'masala' },
  { name: 'Herbs & Seasonings', slug: 'herbs-seasoning', icon: 'Leaf', parent_slug: 'masala' },

  // Subcategories of Car Rental
  { name: 'Hatchback', slug: 'hatchback', icon: 'Car', parent_slug: 'car-rental' },
  { name: 'Sedan', slug: 'sedan', icon: 'Car', parent_slug: 'car-rental' },
  { name: 'SUV', slug: 'suv', icon: 'Car', parent_slug: 'car-rental' },
  { name: 'Luxury Cars', slug: 'luxury-cars', icon: 'Car', parent_slug: 'car-rental' },
  { name: 'Vans & Buses', slug: 'vans-buses', icon: 'Car', parent_slug: 'car-rental' },
];

const PRODUCTS = [
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
    reviews_count: 142
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
    reviews_count: 88
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
    reviews_count: 61
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
    reviews_count: 104
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
    reviews_count: 215
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
    reviews_count: 312
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
    reviews_count: 183
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
    reviews_count: 520
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
    reviews_count: 412
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
    reviews_count: 98
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
    reviews_count: 34
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
    reviews_count: 57
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
    reviews_count: 22
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
    reviews_count: 140
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
    reviews_count: 76
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
    reviews_count: 12
  }
];

const BANNERS = [
  {
    title: 'Super Fresh Deals',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    link_url: '/category/veggies',
    sort_order: 1
  },
  {
    title: 'Up to 40% Off on Beverages',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    link_url: '/category/beverages',
    sort_order: 2
  }
];

async function seed() {
  if (isPlaceholder) {
    console.log('💡 SEED: Running in offline mock database fallback mode. Mock data is already pre-seeded in memory.');
    console.log('💡 SEED: To seed a real Supabase database, configure valid credentials in .env first.');
    return;
  }

  console.log('🚀 SEED: Starting database seeding to Supabase...');
  try {
    // 1. Seed Categories
    console.log('Seeding categories...');
    const { error: catErr } = await supabase.from('categories').upsert(CATEGORIES, { onConflict: 'slug' });
    if (catErr) throw catErr;
    console.log('✅ Categories seeded successfully.');

    // 2. Seed Products
    console.log('Seeding products...');
    const { error: prodErr } = await supabase.from('products').upsert(PRODUCTS, { onConflict: 'id' });
    if (prodErr) throw prodErr;
    console.log('✅ Products seeded successfully.');

    // 3. Seed Banners
    console.log('Seeding banners...');
    // Delete existing banners to avoid duplicates
    await supabase.from('banners').delete().neq('title', 'placeholder_sentinel_val');
    const { error: bannerErr } = await supabase.from('banners').insert(BANNERS);
    if (bannerErr) throw bannerErr;
    console.log('✅ Banners seeded successfully.');

    // 4. Seed Default Users
    console.log('Seeding default users (admin, rider, customer)...');
    
    const adminUser = {
      phone: '0771234567',
      name: 'Zippi Admin',
      email: 'admin@zippi.com',
      password: 'admin123',
      role: 'admin'
    };

    const riderUser = {
      phone: '0777654321',
      name: 'Zippi Rider 01',
      email: 'rider@zippi.com',
      password: 'rider123',
      role: 'rider'
    };

    const customerUser = {
      phone: '0771111111',
      name: 'Zippi Customer 01',
      email: 'customer@zippi.com',
      password: 'user123',
      role: 'customer'
    };

    const usersToSeed = [adminUser, riderUser, customerUser];

    const formatE164 = (phone) => {
      if (!phone) return phone;
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '94' + cleaned.substring(1);
      }
      if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
      }
      return cleaned;
    };

    for (const usr of usersToSeed) {
      // Check if user exists in custom users table first
      const { data: existing } = await supabase.from('users').select('id').eq('phone', usr.phone).maybeSingle();
      
      if (!existing) {
        // Create auth user
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email: usr.email,
          phone: formatE164(usr.phone),
          password: usr.password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { name: usr.name }
        });

        if (authErr) {
          console.warn(`Could not seed auth user ${usr.phone}:`, authErr.message);
          continue;
        }

        const userId = authData.user.id;
        const passwordHash = await bcrypt.hash(usr.password, 10);

        // Save in public.users
        const { error: userErr } = await supabase.from('users').insert({
          id: userId,
          phone: usr.phone,
          name: usr.name,
          email: usr.email,
          role: usr.role,
          password_hash: passwordHash
        });

        if (userErr) {
          console.warn(`Could not seed user record for ${usr.phone}:`, userErr.message);
          await supabase.auth.admin.deleteUser(userId);
          continue;
        }

        // Rider Profile
        if (usr.role === 'rider') {
          await supabase.from('rider_profiles').insert({
            user_id: userId,
            latitude: 6.9271,
            longitude: 79.8612,
            is_online: true
          });
        }
      }
    }

    console.log('✅ Default accounts seeded successfully.');
    console.log('🎉 Database seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }
}

seed();
