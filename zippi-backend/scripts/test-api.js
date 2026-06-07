const http = require('http');
const app = require('../src/server');

const PORT = 3005;
let serverInstance;
let customerToken = '';
let adminToken = '';
let riderToken = '';
let testOrderId = '';
let testOrderNumber = '';
let newProductId = '';

function startServer() {
  return new Promise((resolve) => {
    serverInstance = app.listen(PORT, () => {
      console.log(`\n🧪 Verification Server started on port ${PORT}\n`);
      resolve();
    });
  });
}

function stopServer() {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('\n🧪 Verification Server stopped.\n');
    });
  }
}

// Helper to make HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({
            statusCode: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: responseBody
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  try {
    await startServer();

    console.log('--- 🛡️ AUTHENTICATION TESTS ---');
    
    // 1. Health Check
    let res = await request('GET', '/');
    assert(res.statusCode === 200 && res.body.success, 'Health check failed');
    console.log('✅ Health check passed');

    // 2. Register customer
    const userPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
    res = await request('POST', '/api/auth/register', {
      phone: userPhone,
      name: 'Test Customer',
      email: `test-${Date.now()}@zippi.com`,
      password: 'password123'
    });
    assert(res.statusCode === 201 && res.body.success, 'Registration failed');
    console.log(`✅ Customer Registration passed (Phone: ${userPhone})`);

    // 3. Login customer
    res = await request('POST', '/api/auth/login', {
      phone: userPhone,
      password: 'password123'
    });
    assert(res.statusCode === 200 && res.body.success && res.body.data.token, 'Customer login failed');
    customerToken = res.body.data.token;
    console.log('✅ Customer Login passed');

    // 4. Login Admin (pre-seeded account)
    res = await request('POST', '/api/auth/login', {
      phone: '0771234567',
      password: 'admin123'
    });
    assert(res.statusCode === 200 && res.body.success && res.body.data.token, 'Admin login failed');
    adminToken = res.body.data.token;
    console.log('✅ Admin Login passed');

    // 5. Login Rider (pre-seeded account)
    res = await request('POST', '/api/auth/login', {
      phone: '0777654321',
      password: 'rider123'
    });
    assert(res.statusCode === 200 && res.body.success && res.body.data.token, 'Rider login failed');
    riderToken = res.body.data.token;
    console.log('✅ Rider Login passed');

    console.log('\n--- 📂 CATALOG BROWSING TESTS ---');

    // 6. Get Categories
    res = await request('GET', '/api/categories');
    assert(res.statusCode === 200 && res.body.success && Array.isArray(res.body.data), 'Get categories failed');
    console.log(`✅ Get Categories passed (${res.body.data.length} categories found)`);

    // 7. Get Category Products
    res = await request('GET', '/api/categories/veggies/products');
    assert(res.statusCode === 200 && res.body.success && res.body.data.products, 'Get category products failed');
    console.log(`✅ Get Veggies Products passed (${res.body.data.products.length} products found)`);

    // 8. Get Products (search & sort)
    res = await request('GET', '/api/products?search=banana&sort=price_asc');
    assert(res.statusCode === 200 && res.body.success && res.body.data.products, 'Product search failed');
    console.log('✅ Product Search & Sort passed');

    // 9. Get Featured Products
    res = await request('GET', '/api/products/featured');
    assert(res.statusCode === 200 && res.body.success, 'Get featured failed');
    console.log('✅ Get Featured Products passed');

    // 10. Get Flash Deals
    res = await request('GET', '/api/products/flash-deals');
    assert(res.statusCode === 200 && res.body.success, 'Get flash deals failed');
    console.log('✅ Get Flash Deals passed');

    // 11. Get Single Product detail
    res = await request('GET', '/api/products/f1');
    assert(res.statusCode === 200 && res.body.success && res.body.data.id === 'f1', 'Get single product failed');
    console.log('✅ Get Single Product Details passed');

    console.log('\n--- 🛒 ORDER LIFECYCLE TESTS ---');

    // 12. Create Order (Customer)
    res = await request('POST', '/api/orders', {
      items: [
        { product_id: 'f1', quantity: 2 },
        { product_id: 'd1', quantity: 1 }
      ],
      delivery_address: {
        label: 'Home',
        details: '10, Park Street, Colombo'
      },
      payment_method: 'COD',
      special_instructions: 'Deliver after 5 PM'
    }, customerToken);
    assert(res.statusCode === 201 && res.body.success && res.body.data.id, 'Create order failed');
    testOrderId = res.body.data.id;
    testOrderNumber = res.body.data.order_number;
    console.log(`✅ Create Order passed (Order Number: ${testOrderNumber}, Total: LKR ${res.body.data.total})`);

    // 13. Get Customer Orders
    res = await request('GET', '/api/orders', null, customerToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.length > 0, 'Get customer orders failed');
    console.log('✅ Get Customer Orders list passed');

    // 14. Get Single Order Details (Customer)
    res = await request('GET', `/api/orders/${testOrderId}`, null, customerToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.id === testOrderId, 'Get order details failed');
    console.log('✅ Get Order Details passed');

    // 15. Unauthorized Order Details Check (Rogue Customer)
    const anotherUserPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
    await request('POST', '/api/auth/register', { phone: anotherUserPhone, name: 'Rogue Customer', password: '123' });
    const rogueLogin = await request('POST', '/api/auth/login', { phone: anotherUserPhone, password: '123' });
    const rogueToken = rogueLogin.body.data.token;
    res = await request('GET', `/api/orders/${testOrderId}`, null, rogueToken);
    assert(res.statusCode === 403, 'Rogue customer bypass order details check');
    console.log('✅ Access Control: Unauthorized order details view blocked successfully');

    console.log('\n--- 🚴 RIDER TELEMETRY TESTS ---');

    // 16. Update Rider Coordinates
    res = await request('PATCH', '/api/riders/location', { latitude: 6.9114, longitude: 79.8519 }, riderToken);
    assert(res.statusCode === 200 && res.body.success, 'Update rider location failed');
    console.log('✅ Update Rider Location coordinates passed');

    // 17. Update Rider Status
    res = await request('PATCH', '/api/riders/status', { is_online: true }, riderToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.is_online === true, 'Update rider status failed');
    console.log('✅ Update Rider Availability status passed');

    // 18. Get Rider Active Order (should be empty initially)
    res = await request('GET', '/api/riders/active-order', null, riderToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data === null, 'Get rider active order failed');
    console.log('✅ Get Rider Active Order (Unassigned) passed');

    console.log('\n--- ⚙️ ADMIN CRUD & ANALYTICS TESTS ---');

    // 19. Add Product (Admin)
    res = await request('POST', '/api/admin/products', {
      name: 'Verifying Strawberry Pack',
      description: 'Super sweet highland organic strawberries.',
      category_slug: 'veggies',
      price: 1200,
      original_price: 1500,
      discount_percent: 20,
      unit: '250g pack',
      stock: 50
    }, adminToken);
    assert(res.statusCode === 201 && res.body.success && res.body.data.id, 'Admin create product failed');
    newProductId = res.body.data.id;
    console.log('✅ Admin Create Product passed');

    // 20. Update Product (Admin)
    res = await request('PATCH', `/api/admin/products/${newProductId}`, {
      price: 1100,
      stock: 45
    }, adminToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.price === 1100, 'Admin update product failed');
    console.log('✅ Admin Update Product passed');

    // 21. Delete Product (Admin)
    res = await request('DELETE', `/api/admin/products/${newProductId}`, null, adminToken);
    assert(res.statusCode === 200 && res.body.success, 'Admin delete product failed');
    console.log('✅ Admin Delete Product (soft delete) passed');

    // 22. Get Banners
    res = await request('GET', '/api/banners');
    assert(res.statusCode === 200 && res.body.success, 'Get banners failed');
    console.log('✅ Get Marketing Banners list passed');

    // 23. Admin Orders check
    res = await request('GET', '/api/admin/orders?status=pending', null, adminToken);
    assert(res.statusCode === 200 && res.body.success && Array.isArray(res.body.data), 'Get admin orders list failed');
    console.log('✅ Admin Get Orders list with filter passed');

    // 24. Assign Rider to Order
    const riderProfile = await request('POST', '/api/auth/login', { phone: '0777654321', password: 'rider123' });
    const riderId = riderProfile.body.data.user.id;
    res = await request('PATCH', `/api/admin/orders/${testOrderId}/assign-rider`, { rider_id: riderId }, adminToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.rider_id === riderId, 'Assign rider failed');
    console.log('✅ Admin Assign Rider to Order passed');

    // 25. Rider Active Order (should now be the assigned one)
    res = await request('GET', '/api/riders/active-order', null, riderToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.id === testOrderId, 'Get rider assigned active order failed');
    console.log('✅ Rider Active Order (Assigned) updated successfully');

    // 26. Rider Transit Status updates order status
    res = await request('PATCH', `/api/orders/${testOrderId}/status`, { status: 'dispatched' }, riderToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.status === 'dispatched', 'Rider status update failed');
    console.log('✅ Rider Status update to "dispatched" passed');

    // 27. Sales reports
    res = await request('GET', '/api/admin/reports/sales?period=today', null, adminToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.total_orders > 0, 'Sales report failed');
    console.log(`✅ Admin Sales Report passed (Today sales total: LKR ${res.body.data.total_revenue})`);

    // 28. Dashboard statistics
    res = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(res.statusCode === 200 && res.body.success && res.body.data.active_orders > 0, 'Dashboard statistics failed');
    console.log('✅ Admin Dashboard summary stats passed');

    console.log('\n🎉 ALL 28 API VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ Verification test failed with error:', error);
  } finally {
    stopServer();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

runTests();
