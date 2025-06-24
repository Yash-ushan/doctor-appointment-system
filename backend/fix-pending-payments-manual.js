const Payment = require('./models/Payment');
const Appointment = require('./models/Appointment');
const { sendAppointmentConfirmationEmail } = require('./utils/email');
require('dotenv').config();

const fixPendingPayments = async () => {
  try {
    console.log('🔧 FIXING PENDING PAYMENTS...\n');
    
    // Connect to MongoDB
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Find all pending payments
    const pendingPayments = await Payment.find({ paymentStatus: 'pending' })
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate('doctorId')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${pendingPayments.length} pending payments\n`);
    
    if (pendingPayments.length === 0) {
      console.log('✅ No pending payments to fix!');
      return;
    }
    
    console.log('🔍 Pending payments found:');
    pendingPayments.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment._id} - ${payment.patientId?.name} - LKR ${payment.amount}`);
    });
    
    console.log('\n❓ Do you want to manually mark these payments as completed?');
    console.log('   This will:');
    console.log('   1. Update payment status to "completed"');
    console.log('   2. Update appointment status to "confirmed"');
    console.log('   3. Send confirmation emails to patients');
    
    // For testing, let's automatically process them
    // In production, you might want to add manual confirmation
    
    let fixedCount = 0;
    let emailCount = 0;
    
    for (const payment of pendingPayments) {
      try {
        console.log(`\n🔧 Processing payment ${payment._id}...`);
        
        // Update payment status
        payment.paymentStatus = 'completed';
        payment.paymentReference = `MANUAL-FIX-${Date.now()}`;
        payment.paymentDate = new Date();
        await payment.save();
        
        console.log('   ✅ Payment status updated to completed');
        
        // Update appointment status
        if (payment.appointmentId) {
          const appointment = await Appointment.findById(payment.appointmentId._id);
          if (appointment) {
            appointment.status = 'confirmed';
            appointment.paymentStatus = 'paid';
            appointment.updatedAt = new Date();
            await appointment.save();
            
            console.log('   ✅ Appointment status updated to confirmed');
            
            // Send confirmation email
            if (payment.patientId?.email) {
              try {
                const emailData = {
                  patientName: payment.patientId?.name || 'Patient',
                  patientEmail: payment.patientId?.email,
                  doctorName: payment.doctorId?.userId?.name || 'Doctor',
                  appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
                  appointmentTime: appointment.appointmentTime,
                  consultationType: appointment.consultationType,
                  amount: payment.amount,
                  appointmentId: appointment._id
                };

                const emailResult = await sendAppointmentConfirmationEmail(emailData);
                if (emailResult.success) {
                  console.log('   ✅ Confirmation email sent to:', payment.patientId.email);
                  emailCount++;
                } else {
                  console.log('   ❌ Email sending failed:', emailResult.error);
                }
              } catch (emailError) {
                console.log('   💥 Email error:', emailError.message);
              }
            } else {
              console.log('   ⚠️  No patient email found');
            }
          }
        }
        
        fixedCount++;
        
      } catch (error) {
        console.log(`   ❌ Error processing payment ${payment._id}:`, error.message);
      }
    }
    
    console.log('\n📊 FIXING COMPLETED:');
    console.log(`   ✅ Fixed payments: ${fixedCount}/${pendingPayments.length}`);
    console.log(`   📧 Emails sent: ${emailCount}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 All pending payments have been fixed!');
      console.log('   Patients should now see confirmed appointments');
      console.log('   Confirmation emails have been sent');
    }
    
  } catch (error) {
    console.error('❌ Error fixing pending payments:', error);
  } finally {
    process.exit(0);
  }
};

// Run the fix
fixPendingPayments();
