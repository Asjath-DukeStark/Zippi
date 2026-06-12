/**
 * Smoke test: boots the Express app with an in-memory Supabase stub and
 * exercises the main API flows (auth, catalog, admin CRUD, rider flow).
 * Run: node test/smoke.js   (no real database needed)
 */
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://stub.local';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'stub';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

const path = require('path');
const bcrypt = require('bcryptjs');

/* ---------------- In-memory Supabase stub ---------------- */
const db = {
  users: [], categories: [], products: [], banners: [],
  orders: [], order_items: [], rider_profiles: [], settings: [], order_events: [], promotions: []
};
let idSeq = 1;
const genId = () => `00000000-0000-4000-8000-${String(idSeq++).padStart(12, '0')}`;

class Query {
  constructor(table) { this.table = table; this.filters = []; this.op = 'select'; this._limit = null; this._single = false; this._maybe = false; this._count = false; }
  select(cols, opts) { if (this.op === 'select') this.op = 'select'; this._wantRows = true; if (opts?.count) this._count = true; if (opts?.head) this._head = true; return this; }
  insert(rows) { this.op = 'insert'; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
  update(patch) { this.op = 'update'; this.payload = patch; return this; }
  upsert(row) { this.op = 'upsert'; this.payload = row; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(col, val) { this.filters.push((r) => r[col] === val); return this; }
  neq(col, val) { this.filters.push((r) => r[col] !== val); return this; }
  in(col, vals) { this.filters.push((r) => vals.includes(r[col])); return this; }
  gte(col, val) { this.filters.push((r) => r[col] >= val); return this; }
  ilike(col, pat) { const re = new RegExp(pat.replace(/%/g, '.*'), 'i'); this.filters.push((r) => re.test(r[col] || '')); return this; }
  or(expr) { const parts = expr.split(',').map((p) => { const [col, , pat] = p.split('.'); const re = new RegExp(pat.replace(/%/g, '.*'), 'i'); return (r) => re.test(r[col] || ''); }); this.filters.push((r) => parts.some((f) => f(r))); return this; }
  order() { return this; }
  range(from, to) { this._range = [from, to]; return this; }
  limit(n) { this._limit = n; return this; }
  single() { this._single = true; return this; }
  maybeSingle() { this._maybe = true; return this; }
  _rows() { return db[this.table].filter((r) => this.filters.every((f) => f(r))); }
  _resolve() {
    try {
      if (this.op === 'insert') {
        const inserted = this.payload.map((r) => {
          const row = { id: genId(), created_at: new Date().toISOString(), ...r };
          db[this.table].push(row);
          return row;
        });
        return { data: this._single ? inserted[0] : inserted, error: null, count: inserted.length };
      }
      if (this.op === 'update') {
        const rows = this._rows();
        rows.forEach((r) => Object.assign(r, this.payload));
        if (this._single || this._maybe) return { data: rows[0] || null, error: rows.length || this._maybe ? null : { message: 'No rows' }, count: rows.length };
        return { data: rows, error: null, count: rows.length };
      }
      if (this.op === 'upsert') {
        const key = this.table === 'settings' ? 'key' : this.table === 'rider_profiles' ? 'user_id' : 'id';
        const existing = db[this.table].find((r) => r[key] === this.payload[key]);
        let row;
        if (existing) { Object.assign(existing, this.payload); row = existing; }
        else { row = { ...this.payload }; db[this.table].push(row); }
        return { data: this._single ? row : [row], error: null, count: 1 };
      }
      if (this.op === 'delete') {
        const rows = this._rows();
        db[this.table] = db[this.table].filter((r) => !rows.includes(r));
        return { data: null, error: null, count: rows.length };
      }
      let rows = this._rows();
      const count = rows.length;
      if (this._range) rows = rows.slice(this._range[0], this._range[1] + 1);
      if (this._limit) rows = rows.slice(0, this._limit);
      if (this._single) return rows.length ? { data: rows[0], error: null, count } : { data: null, error: { message: 'No rows found' }, count };
      if (this._maybe) return { data: rows[0] || null, error: null, count };
      return { data: this._head ? null : rows, error: null, count };
    } catch (e) { return { data: null, error: { message: e.message }, count: 0 }; }
  }
  then(res, rej) { return Promise.resolve(this._resolve()).then(res, rej); }
}

const stub = {
  from: (table) => new Query(table),
  storage: {
    getBucket: async () => ({ data: { name: 'stub' } }),
    createBucket: async () => ({ error: null }),
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: (p) => ({ data: { publicUrl: `http://stub.local/storage/${p}` } }),
      remove: async () => ({ error: null })
    })
  }
};

// Inject stub before app loads
const supabasePath = path.resolve(__dirname, '../src/config/supabase.js');
require.cache[supabasePath] = { id: supabasePath, filename: supabasePath, loaded: true, exports: stub };

const app = require('../src/app');

/* ---------------- Seed data ---------------- */
const seed = async () => {
  const hash = await bcrypt.hash('secret123', 4);
  db.users.push(
    { id: genId(), phone: '0500000001', name: 'Admin', role: 'admin', password_hash: hash, is_active: true },
    { id: genId(), phone: '0500000002', name: 'Rider', role: 'rider', password_hash: hash, is_active: true },
    { id: genId(), phone: '0500000003', name: 'Customer', role: 'customer', password_hash: hash, is_active: true }
  );
  db.categories.push({ id: genId(), name: 'Fruits', slug: 'fruits', is_active: true, sort_order: 0 });
  db.products.push({ id: 'p1', name: 'Banana', category_slug: 'fruits', price: 5.5, unit: '1 kg', stock: 50, is_active: true, popular: true, is_flash_deal: false, rating: 5, reviews_count: 0 });
  db.banners.push({ id: genId(), title: 'Sale', image_url: 'http://x/img.png', sort_order: 0, is_active: true });
  db.settings.push({ key: 'delivery', value: { deliveryFee: 4.99, freeDeliveryAbove: 99, etaMinutes: 30 } });
};

/* ---------------- Test runner ---------------- */
let passed = 0, failed = 0;
const check = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  ✔ ${name}`); }
  else { failed++; console.log(`  ✘ ${name} ${extra}`); }
};

const run = async () => {
  await seed();
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;
  const req = async (method, p, body, token) => {
    const res = await fetch(base + p, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: res.status, json: await res.json() };
  };

  console.log('Auth:');
  let r = await req('POST', '/api/auth/login', { phone: '0500000001', password: 'secret123' });
  check('admin login', r.status === 200 && r.json.data.token && r.json.data.user.role === 'admin');
  const adminToken = r.json.data?.token;

  r = await req('POST', '/api/auth/login', { phone: '0500000001', password: 'wrong' });
  check('wrong password rejected (401)', r.status === 401 && r.json.success === false);

  r = await req('POST', '/api/auth/register', { phone: '0500000009', name: 'New User', password: 'secret123' });
  check('customer registration', r.status === 201 && r.json.data.user.role === 'customer');
  const custToken = r.json.data?.token;

  r = await req('POST', '/api/auth/register', { phone: '0500000009', name: 'Dup', password: 'secret123' });
  check('duplicate phone rejected (409)', r.status === 409);

  r = await req('POST', '/api/auth/register', { phone: '05', name: 'x', password: '1' });
  check('validation errors (422)', r.status === 422 && r.json.error === 'VALIDATION_ERROR');

  console.log('Public catalog (web-app contract):');
  r = await req('GET', '/api/products');
  check('GET /products envelope', r.json.success === true && Array.isArray(r.json.data.products) && r.json.data.pagination);
  check('product camelCase fields', r.json.data.products[0].categorySlug === 'fruits' && r.json.data.products[0].isActive === true);

  r = await req('GET', '/api/categories');
  check('GET /categories returns array', r.json.success === true && Array.isArray(r.json.data) && r.json.data[0].slug === 'fruits');

  r = await req('GET', '/api/banners');
  check('GET /banners returns array', r.json.success === true && Array.isArray(r.json.data) && r.json.data[0].imageUrl);

  r = await req('GET', '/api/settings');
  check('GET /settings', r.json.success === true && r.json.data.delivery.deliveryFee === 4.99);

  console.log('Authorization guards:');
  r = await req('GET', '/api/admin/users');
  check('admin route blocked without token (401)', r.status === 401);
  r = await req('GET', '/api/admin/users', null, custToken);
  check('admin route blocked for customer (403)', r.status === 403);
  r = await req('GET', '/api/rider/orders', null, custToken);
  check('rider route blocked for customer (403)', r.status === 403);

  console.log('Admin:');
  r = await req('GET', '/api/admin/analytics/summary', null, adminToken);
  check('analytics summary', r.status === 200 && typeof r.json.data.totalOrders === 'number');

  r = await req('POST', '/api/admin/products', { name: 'Apple', price: 7.25, unit: '1 kg', categorySlug: 'fruits', stock: 10 }, adminToken);
  check('create product', r.status === 201 && r.json.data.product.name === 'Apple');
  const productId = r.json.data?.product?.id;

  r = await req('PATCH', `/api/admin/products/${productId}`, { price: 6.75 }, adminToken);
  check('update product', r.status === 200 && Number(r.json.data.product.price) === 6.75);

  r = await req('POST', '/api/admin/products', { name: 'X' }, adminToken);
  check('product validation (422)', r.status === 422);

  r = await req('POST', '/api/admin/categories', { name: 'Dairy & Eggs' }, adminToken);
  check('create category (auto slug)', r.status === 201 && r.json.data.category.slug === 'dairy-eggs');

  r = await req('POST', '/api/admin/banners', { title: 'Promo', imageUrl: 'http://x/b.png' }, adminToken);
  check('create banner', r.status === 201);

  r = await req('POST', '/api/admin/users', { phone: '0500000010', name: 'Rider 2', role: 'rider', password: 'secret123' }, adminToken);
  check('create rider user', r.status === 201 && r.json.data.user.role === 'rider');

  r = await req('PUT', '/api/admin/settings/delivery', { deliveryFee: 6 }, adminToken);
  check('update settings', r.status === 200 && r.json.data.value.deliveryFee === 6);

  console.log('Promotions:');
  r = await req('POST', '/api/admin/promotions', { code: 'save10', type: 'percent', value: 10, minOrder: 5 }, adminToken);
  check('create promo (code uppercased)', r.status === 201 && r.json.data.promotion.code === 'SAVE10');

  r = await req('POST', '/api/promotions/validate', { code: 'SAVE10', subtotal: 100 });
  check('validate promo → 10% discount', r.json.data.valid === true && r.json.data.discount === 10);

  r = await req('POST', '/api/promotions/validate', { code: 'SAVE10', subtotal: 2 });
  check('promo below min order rejected', r.json.data.valid === false);

  r = await req('POST', '/api/promotions/validate', { code: 'NOPE', subtotal: 50 });
  check('unknown promo invalid', r.json.data.valid === false);

  console.log('Order flow:');
  r = await req('POST', '/api/orders', {
    items: [{ productId: 'p1', quantity: 2 }],
    deliveryAddress: { label: 'Home', area: 'Marina', city: 'Dubai' },
    paymentMethod: 'COD',
    promoCode: 'save10'
  }, custToken);
  check('place order with promo', r.status === 201 && r.json.data.order.orderNumber, JSON.stringify(r.json));
  const orderId = r.json.data?.order?.id;
  // subtotal 11, fee 6, promo 10% of 11 = 1.1 → total 15.9
  check('order totals + promo computed server-side',
    Number(r.json.data?.order?.subtotal) === 11 && Number(r.json.data?.order?.discount) === 1.1 && Number(r.json.data?.order?.total) === 15.9);

  r = await req('POST', '/api/orders', {
    items: [{ productId: 'p1', quantity: 1 }],
    deliveryAddress: { label: 'Home' }, paymentMethod: 'COD', promoCode: 'BAD'
  }, custToken);
  check('invalid promo blocks order (422)', r.status === 422 && r.json.error === 'INVALID_PROMO');

  const riderLogin = await req('POST', '/api/auth/login', { phone: '0500000002', password: 'secret123' });
  const riderToken = riderLogin.json.data?.token;
  const riderId = riderLogin.json.data?.user?.id;

  r = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'preparing' }, adminToken);
  check('admin: status → preparing', r.status === 200);
  r = await req('PATCH', `/api/admin/orders/${orderId}/assign`, { riderId }, adminToken);
  check('admin: assign rider', r.status === 200);
  r = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'dispatched' }, adminToken);
  check('admin: status → dispatched', r.status === 200);

  r = await req('GET', '/api/rider/orders', null, riderToken);
  check('rider sees assigned order', r.json.data.orders.length === 1);

  r = await req('PATCH', `/api/rider/orders/${orderId}/status`, { status: 'delivered' }, riderToken);
  check('rider: invalid transition blocked (422)', r.status === 422 && r.json.error === 'INVALID_TRANSITION');

  r = await req('PATCH', `/api/rider/orders/${orderId}/status`, { status: 'arriving' }, riderToken);
  check('rider: dispatched -> arriving', r.status === 200);
  r = await req('PATCH', `/api/rider/orders/${orderId}/status`, { status: 'delivered' }, riderToken);
  check('rider: arriving -> delivered', r.status === 200 && r.json.data.order.deliveredAt);

  r = await req('PATCH', '/api/rider/status', { isOnline: true, latitude: 25.2, longitude: 55.27 }, riderToken);
  check('rider: go online', r.status === 200 && r.json.data.profile.isOnline === true);

  r = await req('GET', '/api/rider/me', null, riderToken);
  check('rider: stats', r.status === 200 && r.json.data.stats.totalDeliveries === 1);

  r = await req('GET', `/api/orders/${orderId}`, null, custToken);
  check('customer: order detail + events timeline', r.status === 200 && (r.json.data.order.events || []).length >= 4);

  console.log('Misc:');
  r = await req('GET', '/api/nope');
  check('404 handler', r.status === 404 && r.json.error === 'ROUTE_NOT_FOUND');

  server.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
};

run().catch((e) => { console.error(e); process.exit(1); });
