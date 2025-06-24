const Payment = require('./models/Payment');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const checkAllPayments = async () => {
  try {
    console.log('🔍 CHECKING ALL PAYMENTS IN DATABASE...\n');
    
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');
    
    // Get ALL payments
    const allPayments = await Payment.find({})
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate('doctorId')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Total payments in database: ${allPayments.length}\n`);
    
    if (allPayments.length === 0) {
      console.log('❌ NO PAYMENTS FOUND IN DATABASE');
      console.log('\nThis means:');
      console.log('1. No payment attempts have been made');
      console.log('2. Payment creation is failing');
      console.log('3. Database connection issues');
      console.log('\nNext steps:');
      console.log('1. Try making a test appointment and payment');
      console.log('2. Check server logs during payment creation');
      console.log('3. Verify PayHere integration is working');
      return;
    }
    
    // Group payments by status
    const statusGroups = {};
    allPayments.forEach(payment => {
      const status = payment.paymentStatus;
      if (!statusGroups[status]) statusGroups[status] = [];
      statusGroups[status].push(payment);
    });
    
    console.log('📊 PAYMENT STATUS BREAKDOWN:');
    Object.keys(statusGroups).forEach(status => {
      console.log(`   ${status.toUpperCase()}: ${statusGroups[status].length} payments`);
    });
    
    console.log('\n📋 ALL PAYMENTS:');
    allPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
      console.log(`   Status: ${payment.paymentStatus}`);
      console.log(`   Amount: LKR ${payment.amount}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log(`   Patient: ${payment.patientId?.name || 'Unknown'}`);
      console.log(`   Email: ${payment.patientId?.email || 'Unknown'}`);
      console.log(`   Payment Reference: ${payment.paymentReference || 'Not set'}`);
      
      if (payment.appointmentId) {
        console.log(`   Appointment Status: ${payment.appointmentId.status}`);
        console.log(`   Appointment Payment Status: ${payment.appointmentId.paymentStatus}`);
      }
      
      if (payment.paymentGatewayResponse) {
        console.log(`   Gateway Response: ✅ Received`);
      } else {
        console.log(`   Gateway Response: ❌ Not received`);
      }
    });
    
    // Check appointments
    const allAppointments = await Appointment.find({}).sort({ createdAt: -1 });
    console.log(`\n📅 Total appointments in database: ${allAppointments.length}`);
    
    if (allAppointments.length > 0) {
      console.log('\n📋 RECENT APPOINTMENTS:');
      allAppointments.slice(0, 5).forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt._id} - Status: ${apt.status} - Payment: ${apt.paymentStatus}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

checkAllPayments();
