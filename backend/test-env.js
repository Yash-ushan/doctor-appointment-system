// Create this file as test-env.js in your backend folder
require('dotenv').config();

console.log('🔍 Environment Variables Test');
console.log('================================');

const merchantId = process.env.PAYHERE_MERCHANT_ID;
const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
const sandbox = process.env.PAYHERE_SANDBOX;

console.log('Merchant ID:', `"${merchantId}"`);
console.log('Merchant ID length:', merchantId?.length);
console.log('Merchant ID correct:', merchantId === '1211149' ? '✅' : '❌');

console.log('\nMerchant Secret:', `"${merchantSecret?.substring(0, 20)}..."`);
console.log('Merchant Secret length:', merchantSecret?.length);
console.log('Merchant Secret starts with:', merchantSecret?.substring(0, 5));
console.log('Merchant Secret ends with:', merchantSecret?.substring(-5));
console.log('Has quotes:', merchantSecret?.includes('"') || merchantSecret?.includes("'") ? '❌' : '✅');
console.log('Has spaces:', merchantSecret?.trim() !== merchantSecret ? '❌' : '✅');

console.log('\nSandbox setting:', `"${sandbox}"`);
console.log('Sandbox is true:', sandbox === 'true' ? '✅' : '❌');

// Expected values
console.log('\n📋 Expected Values:');
console.log('Merchant ID should be: "1211149"');
console.log('Merchant Secret should start with: "MzE5M"');
console.log('Merchant Secret should end with: "NTA=="');
console.log('Sandbox should be: "true"');

// Test the merchant secret format
const expectedSecret = 'MzE5MzI1MzI5MzE3MjAzNjAyMjQ3MjI4NzQ1MjQzNzE2NTg5NjY1MA==';
console.log('\n🧪 Merchant Secret Comparison:');
console.log('Your secret matches expected:', merchantSecret === expectedSecret ? '✅' : '❌');

if (merchantSecret !== expectedSecret) {
  console.log('❌ Your secret:', JSON.stringify(merchantSecret));
  console.log('✅ Expected secret:', JSON.stringify(expectedSecret));
}

console.log('\n🚀 Ready to test:', 
  merchantId === '1211149' && 
  merchantSecret === expectedSecret && 
  sandbox === 'true' ? '✅ YES' : '❌ NO'
);