const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Simple webhook test server
const app = express();
const PORT = 5001; // Different port for testing

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================\n');
  next();
});

// Test webhook endpoint - exactly like your main app
app.post('/api/payments/notify', (req, res) => {
  console.log('🔔 WEBHOOK NOTIFICATION RECEIVED!');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('🌐 Headers:', JSON.stringify(req.headers, null, 2));
  
  // Extract PayHere data
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    status_message
  } = req.body;
  
  console.log('\n📊 PAYMENT DATA:');
  console.log('Merchant ID:', merchant_id);
  console.log('Order ID:', order_id);
  console.log('Payment ID:', payment_id);
  console.log('Amount:', payhere_amount);
  console.log('Currency:', payhere_currency);
  console.log('Status Code:', status_code);
  console.log('Status Message:', status_message);
  console.log('Hash:', md5sig);
  
  // Respond to PayHere
  res.status(200).send('OK');
  console.log('✅ Responded with OK to PayHere\n');
});

// Test endpoint to verify server is working
app.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Webhook test server is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to simulate webhook call
app.post('/simulate-webhook', (req, res) => {
  console.log('🧪 SIMULATING WEBHOOK CALL');
  
  const testData = {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    order_id: 'PAY-TEST123',
    payment_id: 'TEST_PAYMENT_123',
    payhere_amount: '2500.00',
    payhere_currency: 'LKR',
    status_code: '2', // Success
    status_message: 'Successfully completed',
    md5sig: 'test_hash'
  };
  
  console.log('📤 Sending test data to webhook...');
  
  // Call our own webhook
  fetch(`http://localhost:${PORT}/api/payments/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(testData)
  })
  .then(() => {
    console.log('✅ Test webhook call completed');
    res.json({ success: true, message: 'Test webhook call sent' });
  })
  .catch(error => {
    console.error('❌ Test webhook call failed:', error);
    res.status(500).json({ success: false, error: error.message });
  });
});

app.listen(PORT, () => {
  console.log('🚀 Webhook Test Server running on http://localhost:' + PORT);
  console.log('📡 Webhook URL: http://localhost:' + PORT + '/api/payments/notify');
  console.log('🧪 Test URL: http://localhost:' + PORT + '/test');
  console.log('🔄 Simulate webhook: POST http://localhost:' + PORT + '/simulate-webhook');
  console.log('\n⏰ Waiting for webhook notifications...\n');
});
