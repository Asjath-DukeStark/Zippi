const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function makeRequest(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
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
          resolve(JSON.parse(data));
        } catch (err) {
          resolve({ success: false, raw: data, status: res.statusCode });
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

async function run() {
  try {
    console.log('🔑 Logging in as default customer...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      phone: '0771111111',
      password: 'user123'
    });

    if (!loginRes.success || !loginRes.data?.token) {
      console.error('❌ Login failed:', loginRes);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Customer logged in successfully. Token acquired.');

    console.log('📦 Placing order...');
    const orderRes = await makeRequest('/api/orders', 'POST', {
      items: [
        { productId: 'f1', quantity: 2 },
        { productId: 'fd_milo', quantity: 1 }
      ],
      delivery_address: 'Penthouse Apartment B, No 45, Alfred House Gardens, Colombo 03',
      payment_method: 'Card',
      special_instructions: 'Deliver to front door please'
    }, token);

    if (orderRes.success) {
      console.log('🎉 Order placed successfully!');
      console.log('Order Details:', JSON.stringify(orderRes.data, null, 2));
    } else {
      console.error('❌ Failed to place order:', orderRes);
    }
  } catch (err) {
    console.error('❌ Error occurred:', err.message);
  }
}

run();
