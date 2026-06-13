const XLSX = require('xlsx');
const path = require('path');

const tables = {
  users: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Unique user identifier.' },
    { name: 'phone', type: 'TEXT', key: 'UNIQUE, NOT NULL', default: '', description: 'Primary login and contact number.' },
    { name: 'name', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Full name of the user.' },
    { name: 'email', type: 'TEXT', key: 'UNIQUE', default: '', description: 'Email address (optional).' },
    { name: 'role', type: 'TEXT', key: "NOT NULL, CHECK (role IN ('customer', 'rider', 'admin'))", default: "'customer'", description: 'Defines user privileges.' },
    { name: 'password_hash', type: 'TEXT', key: '', default: '', description: 'Salted password hash.' },
    { name: 'is_active', type: 'BOOLEAN', key: '', default: 'TRUE', description: 'Soft delete / status flag.' },
    { name: 'avatar_url', type: 'TEXT', key: '', default: '', description: 'Profile picture URL.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Timestamp when the user registered.' }
  ],
  categories: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Category identifier.' },
    { name: 'name', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Display name of the category.' },
    { name: 'slug', type: 'TEXT', key: 'UNIQUE, NOT NULL', default: '', description: 'Clean URL-friendly identifier.' },
    { name: 'icon', type: 'TEXT', key: '', default: '', description: 'Icon identifier/name.' },
    { name: 'image_url', type: 'TEXT', key: '', default: '', description: 'Banner or display image.' },
    { name: 'parent_slug', type: 'TEXT', key: 'REFERENCES public.categories(slug) ON UPDATE CASCADE', default: '', description: 'Self-referencing link for hierarchy.' },
    { name: 'sort_order', type: 'INTEGER', key: '', default: '0', description: 'Determines manual display order.' },
    { name: 'is_active', type: 'BOOLEAN', key: '', default: 'TRUE', description: 'Availability flag.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Creation timestamp.' }
  ],
  products: [
    { name: 'id', type: 'TEXT', key: 'PRIMARY KEY', default: 'gen_random_uuid()::text', description: 'Product identifier (text-based).' },
    { name: 'name', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Display name of the item.' },
    { name: 'description', type: 'TEXT', key: '', default: '', description: 'Long description of the product.' },
    { name: 'category_slug', type: 'TEXT', key: 'REFERENCES public.categories(slug) ON UPDATE CASCADE', default: '', description: 'Foreign key link to category.' },
    { name: 'price', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Default price.' },
    { name: 'original_price', type: 'NUMERIC', key: '', default: '', description: 'Pre-discount price (for strike-through).' },
    { name: 'discount_percent', type: 'NUMERIC', key: '', default: '', description: 'Calculated or set discount percentage.' },
    { name: 'unit', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Default packing unit (e.g. "500g", "1kg").' },
    { name: 'image_url', type: 'TEXT', key: '', default: '', description: 'Main product image path.' },
    { name: 'popular', type: 'BOOLEAN', key: '', default: 'FALSE', description: 'Featured flag.' },
    { name: 'is_flash_deal', type: 'BOOLEAN', key: '', default: 'FALSE', description: 'Flash sale promotion flag.' },
    { name: 'stock', type: 'INTEGER', key: '', default: '0', description: 'Quantity available in store.' },
    { name: 'variants', type: 'JSONB', key: '', default: "'[]'::jsonb", description: "Array of alternative sizes/units (ProductVariant)." },
    { name: 'rating', type: 'NUMERIC', key: '', default: '5.0', description: 'Product star rating.' },
    { name: 'reviews_count', type: 'INTEGER', key: '', default: '0', description: 'Total review count.' },
    { name: 'is_active', type: 'BOOLEAN', key: '', default: 'TRUE', description: 'Availability flag.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Insertion timestamp.' }
  ],
  orders: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Unique order ID.' },
    { name: 'order_number', type: 'TEXT', key: 'UNIQUE, NOT NULL', default: '', description: 'Human-readable order number.' },
    { name: 'user_id', type: 'UUID', key: 'REFERENCES public.users(id) ON DELETE SET NULL', default: '', description: 'Buyer identifier.' },
    { name: 'subtotal', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Combined price of all items.' },
    { name: 'delivery_fee', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Fee charged for shipping.' },
    { name: 'discount', type: 'NUMERIC', key: '', default: '0', description: 'Discount applied via coupon code.' },
    { name: 'total', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Final charge (subtotal + delivery_fee - discount).' },
    { name: 'delivery_address', type: 'JSONB', key: 'NOT NULL', default: '', description: 'Serialized address object (Address).' },
    { name: 'payment_method', type: 'TEXT', key: "NOT NULL, CHECK (payment_method IN ('COD', 'CARD'))", default: '', description: 'Code defining payment form.' },
    { name: 'status', type: 'TEXT', key: "NOT NULL, CHECK (status IN ('pending', 'preparing', 'dispatched', 'arriving', 'delivered', 'cancelled'))", default: "'pending'", description: 'Current order status (OrderStatus).' },
    { name: 'delivery_eta_min', type: 'INTEGER', key: '', default: '30', description: 'Estimated delivery time in minutes.' },
    { name: 'special_instructions', type: 'TEXT', key: '', default: '', description: 'Customer delivery notes.' },
    { name: 'rider_id', type: 'UUID', key: 'REFERENCES public.users(id) ON DELETE SET NULL', default: '', description: 'Assigned rider user ID.' },
    { name: 'delivered_at', type: 'TIMESTAMPTZ', key: '', default: '', description: 'Actual delivery completion time.' },
    { name: 'promo_code', type: 'TEXT', key: '', default: '', description: 'Promo code used for this order.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Timestamp when order was placed.' }
  ],
  order_items: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Line item ID.' },
    { name: 'order_id', type: 'UUID', key: 'REFERENCES public.orders(id) ON DELETE CASCADE', default: '', description: 'Associated order.' },
    { name: 'product_id', type: 'TEXT', key: 'REFERENCES public.products(id) ON DELETE SET NULL', default: '', description: 'Associated product.' },
    { name: 'quantity', type: 'INTEGER', key: 'NOT NULL, CHECK (quantity > 0)', default: '', description: 'Number of units purchased.' },
    { name: 'price', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Unit price at purchase time.' }
  ],
  rider_profiles: [
    { name: 'user_id', type: 'UUID', key: 'PRIMARY KEY, REFERENCES public.users(id) ON DELETE CASCADE', default: '', description: 'Link to rider user account.' },
    { name: 'latitude', type: 'NUMERIC', key: '', default: '', description: 'Realtime latitude coord.' },
    { name: 'longitude', type: 'NUMERIC', key: '', default: '', description: 'Realtime longitude coord.' },
    { name: 'is_online', type: 'BOOLEAN', key: '', default: 'FALSE', description: 'Active status for order allocation.' },
    { name: 'vehicle_type', type: 'TEXT', key: '', default: "'bike'", description: "Driver vehicle class (e.g. 'bike', 'car')." },
    { name: 'rating', type: 'NUMERIC', key: '', default: '4.0', description: 'Average customer review rating.' },
    { name: 'updated_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Timestamp of last location update.' }
  ],
  promotions: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Promotion identifier.' },
    { name: 'code', type: 'TEXT', key: 'UNIQUE, NOT NULL', default: '', description: 'Code entered by customer (e.g. WELCOME10).' },
    { name: 'description', type: 'TEXT', key: '', default: '', description: 'Information summary of the discount.' },
    { name: 'type', type: 'TEXT', key: "NOT NULL, CHECK (type IN ('percent', 'fixed'))", default: "'percent'", description: 'Type of discount logic.' },
    { name: 'value', type: 'NUMERIC', key: 'NOT NULL', default: '', description: 'Percent or fixed currency offset.' },
    { name: 'min_order', type: 'NUMERIC', key: '', default: '0', description: 'Minimum order amount to qualify.' },
    { name: 'max_discount', type: 'NUMERIC', key: '', default: '', description: 'Cap on maximum discount.' },
    { name: 'starts_at', type: 'TIMESTAMPTZ', key: '', default: '', description: 'Date/time promotion goes live.' },
    { name: 'expires_at', type: 'TIMESTAMPTZ', key: '', default: '', description: 'Expiration limit.' },
    { name: 'usage_limit', type: 'INTEGER', key: '', default: '', description: 'Global maximum redemptions.' },
    { name: 'used_count', type: 'INTEGER', key: '0', default: '0', description: 'Tracking redemptions.' },
    { name: 'is_active', type: 'BOOLEAN', key: '', default: 'TRUE', description: 'Administrative status flag.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Insertion time.' }
  ],
  settings: [
    { name: 'key', type: 'TEXT', key: 'PRIMARY KEY', default: '', description: "Setting name/key (e.g., 'store')." },
    { name: 'value', type: 'JSONB', key: 'NOT NULL', default: "'{}'::jsonb", description: 'Payload with target settings.' },
    { name: 'updated_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Modified tracking time.' }
  ],
  order_events: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Audit event ID.' },
    { name: 'order_id', type: 'UUID', key: 'REFERENCES public.orders(id) ON DELETE CASCADE', default: '', description: 'Parent order record.' },
    { name: 'status', type: 'TEXT', key: 'NOT NULL', default: '', description: "Transition status (e.g., 'dispatched')." },
    { name: 'actor_id', type: 'UUID', key: 'REFERENCES public.users(id) ON DELETE SET NULL', default: '', description: 'User ID triggering update (admin/rider).' },
    { name: 'note', type: 'TEXT', key: '', default: '', description: 'Optional text log details.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Event timestamp.' }
  ],
  banners: [
    { name: 'id', type: 'UUID', key: 'PRIMARY KEY', default: 'gen_random_uuid()', description: 'Banner ID.' },
    { name: 'title', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Display header text.' },
    { name: 'image_url', type: 'TEXT', key: 'NOT NULL', default: '', description: 'Image path for the banner graphic.' },
    { name: 'link_url', type: 'TEXT', key: '', default: '', description: 'Optional navigation path on click.' },
    { name: 'sort_order', type: 'INTEGER', key: '', default: '0', description: 'Sequence positioning priority.' },
    { name: 'is_active', type: 'BOOLEAN', key: '', default: 'TRUE', description: 'Active visibility flag.' },
    { name: 'created_at', type: 'TIMESTAMPTZ', key: '', default: 'NOW()', description: 'Insertion time.' }
  ]
};

const promoCodes = [
  // 1. Welcome & Onboarding Codes
  { category: 'Welcome & Onboarding', code: 'WELCOME50', name: 'New User Welcome', discount: '50% off', condition: 'First order only', notes: 'Tied to phone number. Expires 7 days after signup.' },
  { category: 'Welcome & Onboarding', code: 'WELCOME100', name: 'Welcome Flat Off', discount: 'Rs. 100 flat', condition: 'Min order Rs. 500', notes: 'Better for smaller AOVs.' },
  { category: 'Welcome & Onboarding', code: 'ZIPPIAPP', name: 'App Download Bonus', discount: 'Rs. 100 + free delivery', condition: 'First app order only', notes: 'Encourages mobile app adoption over web.' },
  { category: 'Welcome & Onboarding', code: 'REF-XXXXX', name: 'Referral Code', discount: '30% off (referee) + Rs. 200 credit (referrer)', condition: 'New users only', notes: 'Unique code per user. Both sides rewarded.' },

  // 2. Category-wise Codes
  { category: 'Category-wise', code: 'FRESHAKP', name: 'Grocery', discount: '20% off', condition: 'Min Rs. 1,000', notes: 'Phase 1 launch code. Core category.' },
  { category: 'Category-wise', code: 'VEGGIES15', name: 'Fruits & Vegetables', discount: '15% off', condition: 'No minimum', notes: 'Sub-category of grocery.' },
  { category: 'Category-wise', code: 'HEALTH15', name: 'Pharmacy / Health', discount: '15% off', condition: 'Min Rs. 500, cap Rs. 300', notes: 'Activate when pharmacy goes live.' },
  { category: 'Category-wise', code: 'EATOUT25', name: 'Restaurants / Food', discount: '25% off', condition: 'Min Rs. 800', notes: 'Excludes delivery fee.' },
  { category: 'Category-wise', code: 'TECHDEALS', name: 'Electronics', discount: 'Rs. 500 flat', condition: 'Min Rs. 5,000', notes: 'Limited redemptions per campaign.' },
  { category: 'Category-wise', code: 'BEAUTY20', name: 'Beauty & Personal Care', discount: '20% off', condition: 'Min Rs. 700', notes: 'Can be tied to brand partnerships.' },

  // 3. Product-wise Codes
  { category: 'Product-wise', code: 'MILK10', name: 'Single SKU', discount: 'Rs. 10 off', condition: 'Anchor Milk 1L', notes: 'Works on any quantity.' },
  { category: 'Product-wise', code: 'BUNDLE3', name: 'Bundle / BOGO', discount: 'Buy 3 get 1 free', condition: 'Curated SKU list', notes: 'SKU IDs defined in admin.' },
  { category: 'Product-wise', code: 'ZIPPIPICK', name: 'Weekly Feature', discount: 'Varies weekly', condition: 'Rotating product', notes: 'Refreshed every Monday by admin.' },
  { category: 'Product-wise', code: 'BRAND20', name: 'Brand Sponsored', discount: '20% off', condition: 'All products of brand X', notes: 'Funded by vendor/supplier.' },
  { category: 'Product-wise', code: 'CLEAROUT', name: 'Clearance / Expiry', discount: '30–50% off', condition: 'Tagged near-expiry SKUs', notes: 'Helps reduce inventory waste.' },

  // 4. Time-based Codes
  { category: 'Time-based', code: 'FLASH2H', name: 'Flash Sale', discount: '40% off', condition: '2-hour window', notes: 'Countdown timer in app. Limited redemptions.' },
  { category: 'Time-based', code: 'MORNING20', name: 'Happy Hour (AM)', discount: '20% off', condition: '7 AM – 10 AM daily', notes: 'Auto-activates by time. Drives off-peak orders.' },
  { category: 'Time-based', code: 'LUNCH15', name: 'Happy Hour (Midday)', discount: '15% off', condition: '12 PM – 2 PM daily', notes: 'Targets lunch-hour orders.' },
  { category: 'Time-based', code: 'WEEKEND15', name: 'Weekend Deal', discount: '15% off', condition: 'Sat & Sun all day', notes: 'Auto-applied at checkout. No code entry needed.' },
  { category: 'Time-based', code: 'AVURUDU30', name: 'Seasonal / Holiday', discount: '30% off', condition: 'Apr 13–14 (Avurudu)', notes: 'Geo-targeted to AKP. One use per account.' },
  { category: 'Time-based', code: 'RAMADAN20', name: 'Ramadan Special', discount: '20% off', condition: 'Entire Ramadan month (5 PM – 7 PM)', notes: 'Active during Iftar window only.' },

  // 5. Delivery-based Codes
  { category: 'Delivery-based', code: 'FREEDEL', name: 'Free Delivery', discount: 'Delivery fee waived', condition: 'Any order', notes: 'Stackable with other discount codes.' },
  { category: 'Delivery-based', code: 'FREEDEL500', name: 'Free Delivery (Min)', discount: 'Delivery fee waived', condition: 'Min order Rs. 500', notes: 'Better for maintaining AOV.' },
  { category: 'Delivery-based', code: 'FASTDEL', name: 'Priority Delivery', discount: 'Express slot free', condition: 'Available zones only', notes: 'Upgrades order to express slot at no charge.' },

  // 6. Loyalty & Retention Codes
  { category: 'Loyalty & Retention', code: 'LOYAL10', name: 'Milestone Reward', discount: 'Rs. 200 credit', condition: 'After 10 orders', notes: 'Auto-issued to account. No manual entry.' },
  { category: 'Loyalty & Retention', code: 'COMEBACK30', name: 'Win-back', discount: '30% off', condition: 'Inactive 30+ days', notes: 'Sent via SMS to lapsed users. One-time use.' },
  { category: 'Loyalty & Retention', code: 'BDAY25', name: 'Birthday Reward', discount: '25% off', condition: "User's birthday week", notes: 'Auto-triggered from profile DOB. 7-day validity.' },
  { category: 'Loyalty & Retention', code: 'STREAK5', name: 'Order Streak', discount: 'Free delivery', condition: '5 orders in 7 days', notes: 'Gamified retention. Unlocks automatically.' },

  // 7. Payment Method Codes
  { category: 'Payment Method', code: 'CARD5', name: 'Card on Delivery', discount: '5% extra off', condition: 'Pay by card', notes: 'Encourages card over cash.' },
  { category: 'Payment Method', code: 'CASH10', name: 'Cash on Delivery', discount: 'Rs. 10 off', condition: 'Pay by cash', notes: 'Incentivizes COD for easier change handling.' },

  // 8. Partner / Vendor Codes
  { category: 'Partner / Vendor', code: 'STORE20', name: 'Single Store', discount: '20% off', condition: 'One merchant only', notes: 'Merchant-funded. Applied on that store\'s orders only.' },
  { category: 'Partner / Vendor', code: 'PARTNER15', name: 'Partner Network', discount: '15% off', condition: 'All partner stores', notes: 'Applies across all stores in a partner group or chain.' },
  { category: 'Partner / Vendor', code: 'COLLAB25', name: 'Brand Collab', discount: '25% off', condition: 'Co-branded campaign', notes: 'Joint promo with external brand. Time-limited.' }
];

const wb = XLSX.utils.book_new();

// 1. Overview sheet
const overviewData = Object.keys(tables).map(tableName => {
  return {
    'Table Name': tableName,
    'Columns Count': tables[tableName].length,
    'Description': getTableDescription(tableName)
  };
});

// Append Promo Codes to Overview list
overviewData.push({
  'Table Name': 'Promo Code Library',
  'Columns Count': 6,
  'Description': 'Comprehensive list of onboarding, category, product, time, delivery, payment and partner promo codes.'
});

function getTableDescription(name) {
  const desc = {
    users: 'Stores user accounts (customers, riders, administrators).',
    categories: 'Product categories hierarchy (slugs, parent categories).',
    products: 'Inventory items, prices, variants, stock levels.',
    orders: 'Customer transactions and order delivery information.',
    order_items: 'Line-items referencing products inside a specific order.',
    rider_profiles: 'Rider details including real-time coordinates, online status, vehicle.',
    promotions: 'Configurable promo/coupon codes with usage limits.',
    settings: 'Key-value JSON configurations for store-wide settings.',
    order_events: 'Logs history of state transitions of orders for auditing.',
    banners: 'Marketing banners for home page display.'
  };
  return desc[name] || '';
}

const wsOverview = XLSX.utils.json_to_sheet(overviewData);
wsOverview['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 70 }];
XLSX.utils.book_append_sheet(wb, wsOverview, 'Database Overview');

// 2. Table schemas sheets
for (const [tableName, columns] of Object.entries(tables)) {
  const wsData = columns.map(c => ({
    'Column Name': c.name,
    'Data Type': c.type,
    'Constraints / Keys': c.key,
    'Default Value': c.default,
    'Description': c.description
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  
  const maxNameLen = Math.max(...columns.map(c => c.name.length), 11);
  const maxTypeLen = Math.max(...columns.map(c => c.type.length), 9);
  const maxKeyLen = Math.max(...columns.map(c => (c.key || '').length), 18);
  const maxDefaultLen = Math.max(...columns.map(c => (c.default || '').length), 13);
  const maxDescLen = Math.max(...columns.map(c => (c.description || '').length), 11);
  
  ws['!cols'] = [
    { wch: maxNameLen + 2 },
    { wch: maxTypeLen + 2 },
    { wch: maxKeyLen + 2 },
    { wch: maxDefaultLen + 2 },
    { wch: maxDescLen + 2 }
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, tableName);
}

// 3. Promo Codes Sheet
const wsPromos = XLSX.utils.json_to_sheet(promoCodes.map(p => ({
  'Category': p.category,
  'Code': p.code,
  'Name / Scope': p.name,
  'Discount Value': p.discount,
  'Condition / Trigger': p.condition,
  'Implementation Notes': p.notes
})));

wsPromos['!cols'] = [
  { wch: 25 }, // Category
  { wch: 15 }, // Code
  { wch: 25 }, // Name
  { wch: 25 }, // Discount Value
  { wch: 30 }, // Condition
  { wch: 55 }  // Notes
];

XLSX.utils.book_append_sheet(wb, wsPromos, 'Promo Code Library');

// Write workbook in workspace root
const outputPath = path.join(__dirname, '..', '..', 'zippi_database_schema.xlsx');
try {
  XLSX.writeFile(wb, outputPath);
  console.log('Database schema Excel file successfully generated at:', outputPath);
} catch (err) {
  if (err.code === 'EBUSY') {
    const fallbackPath = path.join(__dirname, '..', '..', 'zippi_database_schema_updated.xlsx');
    XLSX.writeFile(wb, fallbackPath);
    console.log('Primary file was locked. Generated Excel file at fallback path:', fallbackPath);
  } else {
    throw err;
  }
}
