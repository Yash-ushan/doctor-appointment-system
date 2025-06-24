const { testEmailConfig, sendEmail } = require('./utils/email');
require('dotenv').config();

const testEmailSetup = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Test 1: Check environment variables
  console.log('📋 Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[SET]' : '[NOT SET]');
  console.log('FROM_NAME:', process.env.FROM_NAME);
  console.log('');

  // Test 2: Test email configuration
  console.log('🔧 Testing email transporter...');
  const configTest = await testEmailConfig();
  if (!configTest.success) {
    console.error('❌ Email configuration failed:', configTest.error);
    return;
  }

  // Test 3: Send test email
  console.log('📧 Sending test email...');
  const testEmailResult = await sendEmail({
    email: process.env.EMAIL_USER, // Send to same email for testing
    subject: 'Test Email - Doctor Appointment System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Email Test Successful!</h2>
        <p>This is a test email from your Doctor Appointment System.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you receive this email, your email configuration is working correctly.</p>
      </div>
    `
  });

  if (testEmailResult.success) {
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testEmailResult.messageId);
  } else {
    console.error('❌ Test email failed:', testEmailResult.error);
  }
};

// Run the test
testEmailSetup()
  .then(() => {
    console.log('\n🏁 Email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Email test failed:', error);
    process.exit(1);
  });
