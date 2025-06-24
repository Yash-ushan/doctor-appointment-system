const Payment = require('./models/Payment');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const checkPaymentStatuses = async () => {
  try {
    console.log('🔍 CHECKING PAYMENT AND APPOINTMENT STATUSES...\n');
    
    // Get all payments from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    console.log('📅 Looking for payments since:', oneDayAgo.toISOString());
    
    const recentPayments = await Payment.find({
      createdAt: { $gte: oneDayAgo }
    })
    .populate('appointmentId')
    .populate('patientId', 'name email')
    .populate('doctorId')
    .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${recentPayments.length} recent payments:\n`);
    
    if (recentPayments.length === 0) {
      console.log('❌ No recent payments found. Try making a test payment first.\n');
      return;
    }
    
    recentPayments.forEach((payment, index) => {
      console.log(`💳 Payment ${index + 1}:`);
      console.log('   ID:', payment._id);
      console.log('   Status:', payment.paymentStatus);
      console.log('   Amount:', payment.amount);
      console.log('   Created:', payment.createdAt);
      console.log('   Payment Reference:', payment.paymentReference || 'Not set');
      console.log('   Patient:', payment.patientId?.name || 'Unknown');
      console.log('   Patient Email:', payment.patientId?.email || 'Unknown');
      
      if (payment.appointmentId) {
        console.log('   📅 Appointment Status:', payment.appointmentId.status);
        console.log('   📅 Payment Status:', payment.appointmentId.paymentStatus);
        console.log('   📅 Appointment Date:', payment.appointmentId.appointmentDate);
      } else {
        console.log('   ❌ No appointment linked');
      }
      
      if (payment.paymentGatewayResponse) {
        console.log('   🌐 Gateway Response Received: ✅');
        console.log('   🌐 Gateway Status Code:', payment.paymentGatewayResponse.status_code);
      } else {
        console.log('   🌐 Gateway Response: ❌ NOT RECEIVED');
      }
      
      console.log('   ---');
    });
    
    // Check for pending payments that should be completed
    const pendingPayments = recentPayments.filter(p => p.paymentStatus === 'pending');
    const completedPayments = recentPayments.filter(p => p.paymentStatus === 'completed');
    
    console.log('\n📊 SUMMARY:');
    console.log(`   Pending Payments: ${pendingPayments.length}`);
    console.log(`   Completed Payments: ${completedPayments.length}`);
    
    if (pendingPayments.length > 0) {
      console.log('\n⚠️  PENDING PAYMENTS DETECTED:');
      console.log('   This suggests PayHere webhooks are not reaching your server.');
      console.log('   Possible causes:');
      console.log('   1. Webhook URL is localhost (not accessible from internet)');
      console.log('   2. Server is not running when PayHere tries to send notification');
      console.log('   3. Firewall blocking incoming webhook requests');
      console.log('   4. PayHere webhook URL not configured correctly');
    }
    
    if (completedPayments.length > 0) {
      console.log('\n✅ COMPLETED PAYMENTS:');
      completedPayments.forEach((payment, index) => {
        const hasAppointmentUpdated = payment.appointmentId?.status === 'confirmed';
        console.log(`   ${index + 1}. Payment ${payment._id.toString().slice(-6)}: ${hasAppointmentUpdated ? '✅ Appointment Confirmed' : '❌ Appointment NOT Confirmed'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking payment statuses:', error);
  }
};

// Connect to MongoDB and check
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  return checkPaymentStatuses();
})
.then(() => {
  console.log('\n🏁 Payment status check completed');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
