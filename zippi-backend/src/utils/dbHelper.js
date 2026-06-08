const { supabase } = require('../config/db');
const InMemoryDb = require('./inMemoryDb');
const bcrypt = require('bcryptjs');

const isPlaceholder = !process.env.SUPABASE_URL || 
                      process.env.SUPABASE_URL.includes('your-project') ||
                      !process.env.SUPABASE_SERVICE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY.includes('your-service-role');

if (isPlaceholder) {
  console.log('\x1b[33m%s\x1b[0m', '💡 DB_ADAPTER: Supabase keys are unconfigured. Running in-memory offline fallback mode.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '🚀 DB_ADAPTER: Supabase configuration found. Connecting to database.');
}

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

const db = {
  users: {
    create: async (userData) => {
      if (isPlaceholder) {
        return InMemoryDb.users.create(userData);
      }
      try {
        // 1. Create in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email || undefined,
          phone: formatE164(userData.phone),
          password: userData.password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { name: userData.name }
        });

        if (authError) {
          throw authError;
        }

        const userId = authData.user.id;
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // 2. Create in public.users table
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .insert({
            id: userId,
            phone: userData.phone,
            name: userData.name,
            email: userData.email || null,
            role: userData.role || 'customer',
            password_hash: passwordHash
          })
          .select()
          .single();

        if (dbError) {
          // Clean up auth user if DB insert fails
          await supabase.auth.admin.deleteUser(userId);
          throw dbError;
        }

        // 3. Create rider profile if rider
        if (userData.role === 'rider') {
          await supabase.from('rider_profiles').insert({
            user_id: userId,
            latitude: 6.9271,
            longitude: 79.8612,
            is_online: false
          });
        }

        return dbUser;
      } catch (err) {
        console.error('Supabase users.create error, falling back to local:', err.message);
        return InMemoryDb.users.create(userData);
      }
    },
    findByPhone: async (phone) => {
      if (isPlaceholder) {
        return InMemoryDb.users.findByPhone(phone);
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', phone)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase users.findByPhone error, falling back:', err.message);
        return InMemoryDb.users.findByPhone(phone);
      }
    },
    findById: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.users.findById(id);
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase users.findById error, falling back:', err.message);
        return InMemoryDb.users.findById(id);
      }
    },
    update: async (id, data) => {
      if (isPlaceholder) {
        return InMemoryDb.users.update(id, data);
      }
      try {
        const { data: updated, error } = await supabase
          .from('users')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } catch (err) {
        console.error('Supabase users.update error, falling back:', err.message);
        return InMemoryDb.users.update(id, data);
      }
    }
  },

  categories: {
    findAll: async () => {
      if (isPlaceholder) {
        return InMemoryDb.categories.findAll();
      }
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase categories.findAll error, falling back:', err.message);
        return InMemoryDb.categories.findAll();
      }
    },
    findBySlug: async (slug) => {
      if (isPlaceholder) {
        return InMemoryDb.categories.findBySlug(slug);
      }
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase categories.findBySlug error, falling back:', err.message);
        return InMemoryDb.categories.findBySlug(slug);
      }
    },
    create: async (catData) => {
      if (isPlaceholder) {
        return InMemoryDb.categories.create(catData);
      }
      try {
        const slug = catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: catData.name,
            slug,
            icon: catData.icon || 'Sparkles',
            is_active: catData.is_active !== undefined ? catData.is_active : true
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase categories.create error, falling back:', err.message);
        return InMemoryDb.categories.create(catData);
      }
    },
    update: async (id, catData) => {
      if (isPlaceholder) {
        return InMemoryDb.categories.update(id, catData);
      }
      try {
        const { data, error } = await supabase
          .from('categories')
          .update(catData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase categories.update error, falling back:', err.message);
        return InMemoryDb.categories.update(id, catData);
      }
    },
    delete: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.categories.delete(id);
      }
      try {
        // Soft delete
        const { data, error } = await supabase
          .from('categories')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase categories.delete error, falling back:', err.message);
        return InMemoryDb.categories.delete(id);
      }
    }
  },

  products: {
    findAll: async ({ category, search, sort, isFlashDeal, popular, limit = 20, offset = 0 }) => {
      if (isPlaceholder) {
        return InMemoryDb.products.findAll({ category, search, sort, isFlashDeal, popular, limit, offset });
      }
      try {
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('is_active', true);

        if (category && category !== 'all') {
          query = query.eq('category_slug', category);
        }

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        if (isFlashDeal !== undefined) {
          query = query.eq('is_flash_deal', isFlashDeal);
        }

        if (popular !== undefined) {
          query = query.eq('popular', popular);
        }

        if (sort === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sort === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else if (sort === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { products: data, total: count || 0 };
      } catch (err) {
        console.error('Supabase products.findAll error, falling back:', err.message);
        return InMemoryDb.products.findAll({ category, search, sort, isFlashDeal, popular, limit, offset });
      }
    },
    findById: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.products.findById(id);
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase products.findById error, falling back:', err.message);
        return InMemoryDb.products.findById(id);
      }
    },
    create: async (prodData) => {
      if (isPlaceholder) {
        return InMemoryDb.products.create(prodData);
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: prodData.name,
            description: prodData.description || '',
            category_slug: prodData.category_slug || 'all',
            price: Number(prodData.price),
            original_price: prodData.original_price ? Number(prodData.original_price) : null,
            discount_percent: prodData.discount_percent ? Number(prodData.discount_percent) : null,
            unit: prodData.unit,
            image_url: prodData.image_url,
            popular: !!prodData.popular,
            is_flash_deal: !!prodData.is_flash_deal,
            stock: prodData.stock !== undefined ? Number(prodData.stock) : 0,
            rating: 5.0,
            reviews_count: 0
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase products.create error, falling back:', err.message);
        return InMemoryDb.products.create(prodData);
      }
    },
    update: async (id, prodData) => {
      if (isPlaceholder) {
        return InMemoryDb.products.update(id, prodData);
      }
      try {
        const updates = { ...prodData };
        if (updates.price !== undefined) updates.price = Number(updates.price);
        if (updates.original_price !== undefined) updates.original_price = updates.original_price ? Number(updates.original_price) : null;
        if (updates.discount_percent !== undefined) updates.discount_percent = updates.discount_percent ? Number(updates.discount_percent) : null;
        if (updates.stock !== undefined) updates.stock = Number(updates.stock);

        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase products.update error, falling back:', err.message);
        return InMemoryDb.products.update(id, prodData);
      }
    },
    delete: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.products.delete(id);
      }
      try {
        // Soft delete
        const { data, error } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase products.delete error, falling back:', err.message);
        return InMemoryDb.products.delete(id);
      }
    }
  },

  orders: {
    create: async (orderData, items) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.create(orderData, items);
      }
      try {
        // 1. Validate stocks and fetch prices
        const productIds = items.map(it => it.product_id);
        const { data: dbProds, error: fetchError } = await supabase
          .from('products')
          .select('id, name, stock, price')
          .in('id', productIds);

        if (fetchError) throw fetchError;

        for (const item of items) {
          const prod = dbProds.find(p => p.id === item.product_id);
          if (!prod) throw new Error(`Product ${item.product_id} not found`);
          if (prod.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${prod.name}`);
          }
        }

        // 2. Create Order in transactions
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderData.order_number,
            user_id: orderData.user_id,
            subtotal: Number(orderData.subtotal),
            delivery_fee: Number(orderData.delivery_fee),
            discount: Number(orderData.discount || 0),
            total: Number(orderData.total),
            delivery_address: orderData.delivery_address,
            payment_method: (orderData.payment_method || 'COD').toUpperCase().includes('CARD') ? 'CARD' : 'COD',
            special_instructions: orderData.special_instructions || '',
            delivery_eta_min: orderData.delivery_eta_min || 30
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 3. Insert items and decrement stocks
        const itemsToInsert = items.map(item => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) {
          // Cascade will delete items, but we should delete the order manually just in case
          await supabase.from('orders').delete().eq('id', newOrder.id);
          throw itemsError;
        }

        // Decrement stock for each product
        for (const item of items) {
          const prod = dbProds.find(p => p.id === item.product_id);
          await supabase
            .from('products')
            .update({ stock: prod.stock - item.quantity })
            .eq('id', item.product_id);
        }

        return { ...newOrder, items: itemsToInsert };
      } catch (err) {
        console.error('Supabase orders.create error, falling back:', err.message);
        return InMemoryDb.orders.create(orderData, items);
      }
    },
    findByUserId: async (userId) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.findByUserId(userId);
      }
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (id, name, unit, image_url, price)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Format items to match types.ts CartItem
        return dbOrders.map(o => {
          const items = (o.order_items || []).map(oi => ({
            id: oi.id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            price: oi.price,
            product: oi.products
          }));
          return { ...o, items, order_items: undefined };
        });
      } catch (err) {
        console.error('Supabase orders.findByUserId error, falling back:', err.message);
        return InMemoryDb.orders.findByUserId(userId);
      }
    },
    findById: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.findById(id);
      }
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (id, name, unit, image_url, price)
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!order) return null;

        const items = (order.order_items || []).map(oi => ({
          id: oi.id,
          product_id: oi.product_id,
          quantity: oi.quantity,
          price: oi.price,
          product: oi.products
        }));

        let rider = null;
        if (order.rider_id) {
          const { data: riderUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', order.rider_id)
            .single();

          const { data: riderLoc } = await supabase
            .from('rider_profiles')
            .select('*')
            .eq('user_id', order.rider_id)
            .maybeSingle();

          if (riderUser) {
            rider = {
              id: riderUser.id,
              name: riderUser.name,
              phone: riderUser.phone,
              location: riderLoc || null
            };
          }
        }

        return { ...order, items, rider, order_items: undefined };
      } catch (err) {
        console.error('Supabase orders.findById error, falling back:', err.message);
        return InMemoryDb.orders.findById(id);
      }
    },
    findAll: async ({ status, date }) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.findAll({ status, date });
      }
      try {
        let query = supabase
          .from('orders')
          .select(`
            *,
            users:users!user_id (id, name, phone, email),
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (id, name, unit, image_url)
            )
          `);

        if (status) {
          query = query.eq('status', status);
        }

        if (date) {
          // Range check for date day
          const start = new Date(date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(date);
          end.setHours(23, 59, 59, 999);
          query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data: dbOrders, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        return dbOrders.map(o => {
          const items = (o.order_items || []).map(oi => ({
            id: oi.id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            price: oi.price,
            product: oi.products
          }));
          return {
            ...o,
            items,
            customer: o.users,
            users: undefined,
            order_items: undefined
          };
        });
      } catch (err) {
        console.error('Supabase orders.findAll error, falling back:', err.message);
        return InMemoryDb.orders.findAll({ status, date });
      }
    },
    updateStatus: async (id, status) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.updateStatus(id, status);
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase orders.updateStatus error, falling back:', err.message);
        return InMemoryDb.orders.updateStatus(id, status);
      }
    },
    assignRider: async (id, riderId) => {
      if (isPlaceholder) {
        return InMemoryDb.orders.assignRider(id, riderId);
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ rider_id: riderId, status: 'preparing' })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase orders.assignRider error, falling back:', err.message);
        return InMemoryDb.orders.assignRider(id, riderId);
      }
    },
    getSalesReport: async (period) => {
      // Direct SQL calculations on database side or fall back
      // Since complex report logic via REST can be verbose, we fall back to InMemory calculations 
      // or implement local database aggregations. Let's do memory aggregation of DB orders for robustness:
      if (isPlaceholder) {
        return InMemoryDb.orders.getSalesReport(period);
      }
      try {
        const { data: dbOrders, error: err1 } = await supabase
          .from('orders')
          .select('*')
          .neq('status', 'cancelled');

        const { data: dbItems, error: err2 } = await supabase
          .from('order_items')
          .select('*, products(id, name, price)');

        if (err1 || err2) throw (err1 || err2);

        // Standard JS local aggregation over DB datasets
        let filtered = [...dbOrders];
        const now = new Date();

        if (period === 'today') {
          filtered = filtered.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
        } else if (period === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(o => new Date(o.created_at) >= weekAgo);
        } else if (period === 'month') {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(o => new Date(o.created_at) >= monthAgo);
        }

        const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filtered.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const orderIds = filtered.map(o => o.id);
        const relevantItems = dbItems.filter(item => orderIds.includes(item.order_id));

        const productCounts = {};
        relevantItems.forEach(oi => {
          productCounts[oi.product_id] = (productCounts[oi.product_id] || 0) + oi.quantity;
        });

        const topProducts = Object.keys(productCounts)
          .map(pid => {
            const item = relevantItems.find(oi => oi.product_id === pid);
            const prodName = item && item.products ? item.products.name : 'Unknown';
            const prodPrice = item && item.products ? item.products.price : 0;
            return {
              id: pid,
              name: prodName,
              quantity: productCounts[pid],
              revenue: productCounts[pid] * prodPrice
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
      } catch (err) {
        console.error('Supabase orders.getSalesReport error, falling back:', err.message);
        return InMemoryDb.orders.getSalesReport(period);
      }
    },
    getDashboardStats: async () => {
      if (isPlaceholder) {
        return InMemoryDb.orders.getDashboardStats();
      }
      try {
        const { data: dbOrders, error: err1 } = await supabase.from('orders').select('*');
        const { count: prodCount } = await supabase.from('products').select('*', { head: true, count: 'exact' });
        const { count: userCount } = await supabase.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'customer');
        const { count: riderCount } = await supabase.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'rider');

        if (err1) throw err1;

        const activeOrdersCount = dbOrders.filter(o => ['pending', 'preparing', 'dispatched', 'arriving'].includes(o.status)).length;
        const totalSales = dbOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);

        // Fetch user profiles for recent 5 orders
        const recentRaw = dbOrders.slice(-5).reverse();
        const recentOrders = [];
        for (const o of recentRaw) {
          const { data: usr } = await supabase.from('users').select('name').eq('id', o.user_id).maybeSingle();
          recentOrders.push({
            id: o.id,
            order_number: o.order_number,
            customer_name: usr ? usr.name : 'Guest',
            total: o.total,
            status: o.status,
            created_at: o.created_at
          });
        }

        return {
          active_orders: activeOrdersCount,
          total_sales: totalSales,
          total_products: prodCount || 0,
          total_customers: userCount || 0,
          total_riders: riderCount || 0,
          recent_orders: recentOrders
        };
      } catch (err) {
        console.error('Supabase orders.getDashboardStats error, falling back:', err.message);
        return InMemoryDb.orders.getDashboardStats();
      }
    }
  },

  banners: {
    findAll: async (all = false) => {
      if (isPlaceholder) {
        return InMemoryDb.banners.findAll(all);
      }
      try {
        let query = supabase.from('banners').select('*');
        if (!all) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query.order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase banners.findAll error, falling back:', err.message);
        return InMemoryDb.banners.findAll(all);
      }
    },
    create: async (bannerData) => {
      if (isPlaceholder) {
        return InMemoryDb.banners.create(bannerData);
      }
      try {
        const { data, error } = await supabase
          .from('banners')
          .insert({
            title: bannerData.title,
            image_url: bannerData.image_url,
            link_url: bannerData.link_url || '',
            sort_order: bannerData.sort_order !== undefined ? Number(bannerData.sort_order) : 0,
            is_active: bannerData.is_active !== undefined ? bannerData.is_active : true
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase banners.create error, falling back:', err.message);
        return InMemoryDb.banners.create(bannerData);
      }
    },
    update: async (id, bannerData) => {
      if (isPlaceholder) {
        return InMemoryDb.banners.update(id, bannerData);
      }
      try {
        const updates = { ...bannerData };
        if (updates.sort_order !== undefined) updates.sort_order = Number(updates.sort_order);

        const { data, error } = await supabase
          .from('banners')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase banners.update error, falling back:', err.message);
        return InMemoryDb.banners.update(id, bannerData);
      }
    },
    delete: async (id) => {
      if (isPlaceholder) {
        return InMemoryDb.banners.delete(id);
      }
      try {
        // Soft delete
        const { data, error } = await supabase
          .from('banners')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase banners.delete error, falling back:', err.message);
        return InMemoryDb.banners.delete(id);
      }
    }
  },

  riders: {
    updateLocation: async (userId, lat, lng) => {
      if (isPlaceholder) {
        return InMemoryDb.riders.updateLocation(userId, lat, lng);
      }
      try {
        const { data, error } = await supabase
          .from('rider_profiles')
          .upsert({
            user_id: userId,
            latitude: Number(lat),
            longitude: Number(lng),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase riders.updateLocation error, falling back:', err.message);
        return InMemoryDb.riders.updateLocation(userId, lat, lng);
      }
    },
    updateStatus: async (userId, isOnline) => {
      if (isPlaceholder) {
        return InMemoryDb.riders.updateStatus(userId, isOnline);
      }
      try {
        const { data, error } = await supabase
          .from('rider_profiles')
          .upsert({
            user_id: userId,
            is_online: !!isOnline,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase riders.updateStatus error, falling back:', err.message);
        return InMemoryDb.riders.updateStatus(userId, isOnline);
      }
    },
    findActiveOrder: async (userId) => {
      if (isPlaceholder) {
        return InMemoryDb.riders.findActiveOrder(userId);
      }
      try {
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (id, name, unit, image_url, price)
            )
          `)
          .eq('rider_id', userId)
          .not('status', 'in', '("delivered","cancelled")')
          .maybeSingle();

        if (error) throw error;
        if (!ordersData) return null;

        const items = (ordersData.order_items || []).map(oi => ({
          id: oi.id,
          product_id: oi.product_id,
          quantity: oi.quantity,
          price: oi.price,
          product: oi.products
        }));

        const { data: customer } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', ordersData.user_id)
          .single();

        return {
          ...ordersData,
          items,
          customer: customer ? { name: customer.name, phone: customer.phone, address: ordersData.delivery_address } : null,
          order_items: undefined
        };
      } catch (err) {
        console.error('Supabase riders.findActiveOrder error, falling back:', err.message);
        return InMemoryDb.riders.findActiveOrder(userId);
      }
    }
  }
};

module.exports = db;
