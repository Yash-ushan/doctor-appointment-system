const { sendAppointmentConfirmationEmail, testEmailConfig } = require('./utils/email');
require('dotenv').config();

const testAppointmentConfirmationEmail = async () => {
  console.log('🧪 Testing Appointment Confirmation Email...\n');
  
  // Test email configuration first
  console.log('🔧 Testing email configuration...');
  const configTest = await testEmailConfig();
  if (!configTest.success) {
    console.error('❌ Email configuration failed:', configTest.error);
    return;
  }
  console.log('✅ Email configuration valid\n');

  // Test appointment confirmation email
  console.log('📧 Testing appointment confirmation email...');
  
  const testAppointmentData = {
    patientName: 'John Doe',
    patientEmail: process.env.EMAIL_USER, // Send to your own email for testing
    doctorName: 'Dr. Sarah Wilson',
    appointmentDate: new Date().toLocaleDateString(),
    appointmentTime: '10:30 AM',
    consultationType: 'General Consultation',
    amount: '2500.00',
    appointmentId: 'TEST123456'
  };

  console.log('📋 Test appointment data:', {
    patientEmail: testAppointmentData.patientEmail,
    patientName: testAppointmentData.patientName,
    doctorName: testAppointmentData.doctorName,
    appointmentDate: testAppointmentData.appointmentDate
  });

  const emailResult = await sendAppointmentConfirmationEmail(testAppointmentData);
  
  if (emailResult.success) {
    console.log('\n✅ SUCCESS! Appointment confirmation email sent successfully!');
    console.log('📧 Message ID:', emailResult.messageId);
    console.log('📮 Email sent to:', testAppointmentData.patientEmail);
    console.log('\n🎉 Email functionality is working correctly!');
  } else {
    console.log('\n❌ FAILED! Could not send appointment confirmation email');
    console.error('Error:', emailResult.error);
  }
};

// Run the test
testAppointmentConfirmationEmail()
  .then(() => {
    console.log('\n🏁 Appointment email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Appointment email test failed:', error);
    process.exit(1);
  });
