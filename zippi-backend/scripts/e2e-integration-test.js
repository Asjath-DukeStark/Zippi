const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function makeRequest(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ success: true, status: res.statusCode, body: JSON.parse(data) });
        } catch (err) {
          resolve({ success: false, status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => { reject(err); });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  console.log('🏁 Starting End-to-End API Integration Verification Test...\n');
  try {
    // 1. Admin login
    console.log('🔄 Step 1: Logging in as Admin...');
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      phone: '0771234567',
      password: 'admin123'
    });
    if (adminLogin.status !== 200 || !adminLogin.body?.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }
    const adminToken = adminLogin.body.data.token;
    console.log('✅ Admin logged in. Token acquired.');

    // 2. Fetch Admin Orders and find our seeded order
    console.log('\n🔄 Step 2: Fetching pending orders for admin...');
    const adminOrders = await makeRequest('/api/admin/orders', 'GET', null, adminToken);
    if (adminOrders.status !== 200 || !adminOrders.body?.success) {
      throw new Error(`Fetching admin orders failed: ${JSON.stringify(adminOrders.body)}`);
    }
    const orders = adminOrders.body.data;
    const pendingOrder = orders.find(o => o.status === 'pending');
    if (!pendingOrder) {
      throw new Error('No pending order found. Please run the seed order script first.');
    }
    const orderId = pendingOrder.id;
    console.log(`✅ Found pending order: ID = ${orderId}, Order Number = ${pendingOrder.orderNumber}`);

    // 3. Rider login (Zippi Rider 01)
    console.log('\n🔄 Step 3: Logging in as Rider (Zippi Rider 01)...');
    const riderLogin = await makeRequest('/api/auth/login', 'POST', {
      phone: '0777654321',
      password: 'rider123'
    });
    if (riderLogin.status !== 200 || !riderLogin.body?.success) {
      throw new Error(`Rider login failed: ${JSON.stringify(riderLogin.body)}`);
    }
    const riderToken = riderLogin.body.data.token;
    const riderUserId = riderLogin.body.data.user.id;
    console.log(`✅ Rider logged in. ID = ${riderUserId}, Name = ${riderLogin.body.data.user.name}`);

    // 4. Set Rider to ONLINE
    console.log('\n🔄 Step 4: Toggling Rider status to ONLINE...');
    const statusUpdate = await makeRequest('/api/riders/status', 'PATCH', { is_online: true }, riderToken);
    if (statusUpdate.status !== 200 || !statusUpdate.body?.success) {
      throw new Error(`Updating rider status failed: ${JSON.stringify(statusUpdate.body)}`);
    }
    console.log('✅ Rider is now ONLINE.');

    // 5. Admin assigns order to Rider
    console.log(`\n🔄 Step 5: Admin assigning order ${orderId} to Rider ${riderUserId}...`);
    const assignment = await makeRequest(`/api/admin/orders/${orderId}/assign-rider`, 'PATCH', {
      riderId: riderUserId
    }, adminToken);
    if (assignment.status !== 200 || !assignment.body?.success) {
      throw new Error(`Assigning rider failed: ${JSON.stringify(assignment.body)}`);
    }
    console.log('✅ Rider assigned successfully. Order status automatically set to "preparing".');

    // 6. Rider polls active-order
    console.log('\n🔄 Step 6: Rider polling for active assigned order...');
    const activeOrderPoll = await makeRequest('/api/riders/active-order', 'GET', null, riderToken);
    if (activeOrderPoll.status !== 200 || !activeOrderPoll.body?.success) {
      throw new Error(`Polling active order failed: ${JSON.stringify(activeOrderPoll.body)}`);
    }
    const activeOrder = activeOrderPoll.body.data;
    if (!activeOrder || activeOrder.id !== orderId) {
      throw new Error(`Active order mismatch or not found: ${JSON.stringify(activeOrder)}`);
    }
    console.log(`✅ Rider received active task successfully. Order: ${activeOrder.orderNumber}, Status: ${activeOrder.status}`);

    // 7. Rider accepts/picks up order -> transitions to 'dispatched'
    console.log('\n🔄 Step 7: Rider marking order as picked up ("dispatched")...');
    const updateDispatched = await makeRequest(`/api/orders/${orderId}/status`, 'PATCH', {
      status: 'dispatched'
    }, riderToken);
    if (updateDispatched.status !== 200 || !updateDispatched.body?.success) {
      throw new Error(`Failed to update to dispatched: ${JSON.stringify(updateDispatched.body)}`);
    }
    console.log('✅ Order marked as "dispatched" (picked up and on the way).');

    // 8. Rider coordinates updates -> transitions to 'arriving'
    console.log('\n🔄 Step 8: Rider updating coordinates and transitioning to "arriving"...');
    // Simulate updating location
    const locationUpdate = await makeRequest('/api/riders/location', 'PATCH', {
      latitude: 6.9120,
      longitude: 79.8540,
      status: 'ONLINE'
    }, riderToken);
    if (locationUpdate.status !== 200 || !locationUpdate.body?.success) {
      throw new Error(`Failed to patch rider location: ${JSON.stringify(locationUpdate.body)}`);
    }
    console.log('✅ Rider location updated.');

    const updateArriving = await makeRequest(`/api/orders/${orderId}/status`, 'PATCH', {
      status: 'arriving'
    }, riderToken);
    if (updateArriving.status !== 200 || !updateArriving.body?.success) {
      throw new Error(`Failed to update to arriving: ${JSON.stringify(updateArriving.body)}`);
    }
    console.log('✅ Order status updated to "arriving".');

    // 9. Rider completes delivery -> transitions to 'delivered'
    console.log('\n🔄 Step 9: Rider completing delivery ("delivered")...');
    const updateDelivered = await makeRequest(`/api/orders/${orderId}/status`, 'PATCH', {
      status: 'delivered'
    }, riderToken);
    if (updateDelivered.status !== 200 || !updateDelivered.body?.success) {
      throw new Error(`Failed to update to delivered: ${JSON.stringify(updateDelivered.body)}`);
    }
    console.log('✅ Order status updated to "delivered".');

    // 10. Admin verifies order is 'delivered'
    console.log('\n🔄 Step 10: Admin verifying order final status...');
    const finalOrderCheck = await makeRequest(`/api/admin/orders`, 'GET', null, adminToken);
    const finalOrder = finalOrderCheck.body.data.find(o => o.id === orderId);
    if (!finalOrder || finalOrder.status !== 'delivered') {
      throw new Error(`Final status check failed: ${JSON.stringify(finalOrder)}`);
    }
    console.log(`✅ Order status verified on Admin Portal. Final status: "${finalOrder.status}"`);

    console.log('\n🏆 E2E API INTEGRATION VERIFICATION PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ E2E Verification failed:', err.message);
  }
}

runTest();
