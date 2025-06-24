// Backend Fix Script for Pending Payments
// This script uses the existing backend infrastructure

const mongoose = require('mongoose');
require('dotenv').config();

// Import your existing models
const Appointment = require('./models/Appointment');
const Payment = require('./models/Payment');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.cyan}🔧 ${msg}${colors.reset}\n`)
};

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_appointment_db';
    
    log.info('Connecting to MongoDB...');
    log.info(`Database URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`);
    
    await mongoose.connect(mongoUri);
    log.success('Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    log.error(`Failed to connect to MongoDB: ${error.message}`);
    return false;
  }
}

async function diagnosePendingPayments() {
  try {
    log.title('DIAGNOSTIC: Checking Payment Status');
    
    // Count appointments by status
    const pendingCount = await Appointment.countDocuments({ status: 'pending_payment' });
    const confirmedCount = await Appointment.countDocuments({ status: 'confirmed' });
    const totalAppointments = await Appointment.countDocuments({});
    
    // Count payments by status
    const completedPayments = await Payment.countDocuments({ paymentStatus: 'completed' });
    const pendingPayments = await Payment.countDocuments({ paymentStatus: 'pending' });
    const totalPayments = await Payment.countDocuments({});
    
    console.log(`
📊 CURRENT STATUS:
==================
Appointments:
  📅 Total: ${totalAppointments}
  ⏳ Pending Payment: ${pendingCount}
  ✅ Confirmed: ${confirmedCount}

Payments:
  💳 Total: ${totalPayments}
  ✅ Completed: ${completedPayments}
  ⏳ Pending: ${pendingPayments}
    `);
    
    if (pendingCount > 0) {
      log.warning(`Found ${pendingCount} appointments stuck in pending_payment status`);
      
      // Show sample pending appointments
      const samplePending = await Appointment.find({ status: 'pending_payment' })
        .populate('patientId', 'name email')
        .populate('doctorId')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name'
          }
        })
        .limit(5)
        .sort({ createdAt: -1 });
      
      if (samplePending.length > 0) {
        console.log(`\n📋 SAMPLE PENDING APPOINTMENTS:`);
        console.log('=====================================');
        samplePending.forEach((apt, index) => {
          console.log(`${index + 1}. ID: ${apt._id}`);
          console.log(`   Patient: ${apt.patientId?.name || 'Unknown'} (${apt.patientId?.email || 'No email'})`);
          console.log(`   Doctor: Dr. ${apt.doctorId?.userId?.name || 'Unknown'}`);
          console.log(`   Date: ${apt.appointmentDate?.toLocaleDateString()}`);
          console.log(`   Fee: LKR ${apt.consultationFee || 0}`);
          console.log(`   Created: ${apt.createdAt?.toLocaleString()}`);
          console.log('');
        });
      }
    } else {
      log.success('No pending payment issues found!');
    }
    
    return { pendingCount, confirmedCount, completedPayments, pendingPayments };
  } catch (error) {
    log.error(`Diagnostic failed: ${error.message}`);
    return null;
  }
}

async function fixPendingPayments() {
  try {
    log.title('FIXING: Updating Pending Payments');
    
    // Find all appointments with pending payment status
    const pendingAppointments = await Appointment.find({ status: 'pending_payment' })
      .populate('patientId', 'name email')
      .populate('doctorId');
    
    if (pendingAppointments.length === 0) {
      log.success('No pending payments to fix!');
      return { fixed: 0, total: 0 };
    }
    
    log.info(`Found ${pendingAppointments.length} appointments to fix...`);
    
    let fixedCount = 0;
    const results = [];
    
    for (const appointment of pendingAppointments) {
      try {
        log.info(`Processing appointment: ${appointment._id}`);
        
        // Update appointment status
        appointment.status = 'confirmed';
        appointment.paymentStatus = 'paid';
        appointment.updatedAt = new Date();
        await appointment.save();
        
        // Find or create payment record
        let payment = await Payment.findOne({ appointmentId: appointment._id });
        
        if (!payment) {
          // Create new payment record
          payment = new Payment({
            appointmentId: appointment._id,
            patientId: appointment.patientId._id,
            doctorId: appointment.doctorId._id,
            amount: appointment.consultationFee || 0,
            paymentStatus: 'completed',
            paymentReference: `BACKENDFIX-${Date.now()}-${appointment._id}`,
            paymentDate: new Date(),
            paymentGatewayResponse: {
              note: 'Backend fix script - resolved stuck pending payment'
            }
          });
          await payment.save();
          log.success(`Created payment record for appointment ${appointment._id}`);
        } else {
          // Update existing payment
          payment.paymentStatus = 'completed';
          payment.paymentReference = payment.paymentReference || `BACKENDFIX-${Date.now()}-${appointment._id}`;
          payment.paymentDate = payment.paymentDate || new Date();
          payment.updatedAt = new Date();
          await payment.save();
          log.success(`Updated payment record for appointment ${appointment._id}`);
        }
        
        fixedCount++;
        results.push({
          appointmentId: appointment._id,
          patientName: appointment.patientId?.name || 'Unknown',
          status: 'fixed',
          paymentId: payment._id
        });
        
        log.success(`✅ Fixed appointment ${appointment._id} for ${appointment.patientId?.name || 'Unknown'}`);
        
      } catch (error) {
        log.error(`Failed to fix appointment ${appointment._id}: ${error.message}`);
        results.push({
          appointmentId: appointment._id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log(`\n🎯 FIX RESULTS:`);
    console.log('===============');
    console.log(`📋 Total appointments processed: ${pendingAppointments.length}`);
    console.log(`✅ Successfully fixed: ${fixedCount}`);
    console.log(`❌ Failed: ${pendingAppointments.length - fixedCount}`);
    
    if (fixedCount > 0) {
      log.success(`\n🎉 SUCCESS! Fixed ${fixedCount} appointments!`);
      log.info('🔄 Please refresh your frontend to see the updated status.');
    }
    
    return { fixed: fixedCount, total: pendingAppointments.length, results };
    
  } catch (error) {
    log.error(`Fix operation failed: ${error.message}`);
    return { fixed: 0, total: 0, error: error.message };
  }
}

async function runFix() {
  log.title('BACKEND PAYMENT STATUS FIX UTILITY');
  log.info('This script will fix appointments stuck in "pending_payment" status');
  console.log('');
  
  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    log.error('Cannot proceed without database connection');
    process.exit(1);
  }
  
  try {
    // Run diagnostic
    const diagnostic = await diagnosePendingPayments();
    
    if (!diagnostic) {
      log.error('Diagnostic failed, cannot proceed');
      process.exit(1);
    }
    
    // If there are pending payments, offer to fix them
    if (diagnostic.pendingCount > 0) {
      console.log('');
      log.warning('PENDING PAYMENTS DETECTED!');
      log.info('Starting automatic fix...');
      console.log('');
      
      // Run the fix
      const fixResult = await fixPendingPayments();
      
      if (fixResult.fixed > 0) {
        console.log('');
        log.success('🎊 FIX COMPLETED SUCCESSFULLY!');
        log.info('Your appointments should now show "confirmed" status');
        log.info('PDF receipts should download properly');
        console.log('');
        log.info('Next steps:');
        console.log('1. Refresh your frontend dashboard');
        console.log('2. Test downloading a receipt');
        console.log('3. Verify appointment statuses are correct');
      } else {
        log.warning('No appointments were fixed. Check the error messages above.');
      }
    } else {
      log.success('🎉 No issues found! All appointments have correct payment status.');
    }
    
  } catch (error) {
    log.error(`Script execution failed: ${error.message}`);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Run the fix
runFix().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
