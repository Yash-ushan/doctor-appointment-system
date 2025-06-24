const axios = require('axios');

const testCompleteFlow = async () => {
  console.log('🧪 TESTING COMPLETE APPOINTMENT BOOKING FLOW...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    const healthCheck = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Backend is running:', healthCheck.data.message);
    
    // Test 2: Check if you can get doctors
    console.log('\n2️⃣ Testing doctors API...');
    try {
      const doctorsResponse = await axios.get(`${baseURL}/api/doctors`);
      console.log(`✅ Found ${doctorsResponse.data.data?.length || 0} doctors`);
    } catch (error) {
      console.log('❌ Doctors API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 3: Check environment settings
    console.log('\n3️⃣ Environment Check:');
    console.log('   Backend URL:', baseURL);
    console.log('   PayHere Sandbox:', process.env.PAYHERE_SANDBOX);
    console.log('   PayHere Merchant ID:', process.env.PAYHERE_MERCHANT_ID);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Make sure both frontend and backend are running');
    console.log('2. Try to book an appointment through the website');
    console.log('3. Check browser console for errors during booking');
    console.log('4. Use ngrok to make webhook accessible to PayHere');
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Backend server is not running');
    console.log('2. Backend is running on different port');
    console.log('3. Database connection issues');
    console.log('\nSolution: Start backend with: npm run dev');
  }
};

testCompleteFlow()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
  });
