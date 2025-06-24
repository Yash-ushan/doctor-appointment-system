// Enhanced webhook endpoint with comprehensive logging
const handlePaymentNotificationWithLogging = async (req, res) => {
  const logTimestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`🔔 PAYHERE WEBHOOK NOTIFICATION RECEIVED`);
  console.log(`📅 Timestamp: ${logTimestamp}`);
  console.log('='.repeat(80));
  
  try {
    // Log raw request data
    console.log('📥 RAW REQUEST DATA:');
    console.log('   Method:', req.method);
    console.log('   URL:', req.url);
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   User-Agent:', req.headers['user-agent']);
    console.log('   IP Address:', req.ip || req.connection.remoteAddress);
    
    console.log('\n📋 REQUEST BODY:');
    console.log('   Raw Body:', JSON.stringify(req.body, null, 2));
    
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message,
      method,
      card_holder_name,
      card_no
    } = req.body;

    // Log extracted payment data
    console.log('\n💳 EXTRACTED PAYMENT DATA:');
    console.log('   Merchant ID:', merchant_id);
    console.log('   Order ID:', order_id);
    console.log('   Payment ID:', payment_id);
    console.log('   Amount:', payhere_amount);
    console.log('   Currency:', payhere_currency);
    console.log('   Status Code:', status_code);
    console.log('   Status Message:', status_message);
    console.log('   Method:', method);
    console.log('   Card Holder:', card_holder_name);
    console.log('   Card No:', card_no);
    console.log('   Hash:', md5sig);

    // Validate required fields
    const requiredFields = ['merchant_id', 'order_id', 'payhere_amount', 'payhere_currency', 'status_code', 'md5sig'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('\n❌ VALIDATION FAILED:');
      console.log('   Missing required fields:', missingFields);
      console.log('   Available fields:', Object.keys(req.body));
      return res.status(400).send('Missing required fields: ' + missingFields.join(', '));
    }

    console.log('\n✅ FIELD VALIDATION PASSED');

    // Verify PayHere configuration
    console.log('\n🔧 PAYHERE CONFIGURATION:');
    console.log('   Environment:', process.env.PAYHERE_SANDBOX === 'true' ? 'Sandbox' : 'Live');
    console.log('   Expected Merchant ID:', process.env.PAYHERE_MERCHANT_ID);
    console.log('   Received Merchant ID:', merchant_id);
    console.log('   Merchant ID Match:', process.env.PAYHERE_MERCHANT_ID === merchant_id);

    if (process.env.PAYHERE_MERCHANT_ID !== merchant_id) {
      console.log('\n❌ MERCHANT ID MISMATCH - Possible security issue!');
      return res.status(400).send('Invalid merchant ID');
    }

    // Verify hash
    const crypto = require('crypto');
    const hashedSecret = crypto
      .createHash('md5')
      .update(process.env.PAYHERE_MERCHANT_SECRET)
      .digest('hex')
      .toUpperCase();

    const hashString = merchant_id + order_id + parseFloat(payhere_amount).toFixed(2) + payhere_currency + status_code + hashedSecret;
    const local_md5sig = crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    console.log('\n🔐 HASH VERIFICATION:');
    console.log('   Hash String (first 50 chars):', hashString.substring(0, 50) + '...');
    console.log('   Received Hash:', md5sig);
    console.log('   Calculated Hash:', local_md5sig);
    console.log('   Hash Match:', local_md5sig === md5sig);

    if (local_md5sig !== md5sig) {
      console.log('\n❌ HASH VERIFICATION FAILED - Possible fraud attempt!');
      return res.status(400).send('Invalid hash');
    }

    console.log('\n✅ HASH VERIFICATION PASSED');

    // Find payment record
    const paymentId = order_id.replace('PAY-', '');
    console.log('\n🔍 FINDING PAYMENT RECORD:');
    console.log('   Extracted Payment ID:', paymentId);
    
    const Payment = require('../models/Payment');
    const Appointment = require('../models/Appointment');
    
    const payment = await Payment.findById(paymentId)
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate('doctorId');

    if (!payment) {
      console.log('\n❌ PAYMENT RECORD NOT FOUND IN DATABASE');
      console.log('   Searched for ID:', paymentId);
      return res.status(404).send('Payment not found');
    }

    console.log('\n✅ PAYMENT RECORD FOUND:');
    console.log('   Payment ID:', payment._id);
    console.log('   Current Status:', payment.paymentStatus);
    console.log('   Amount:', payment.amount);
    console.log('   Patient:', payment.patientId?.name);
    console.log('   Patient Email:', payment.patientId?.email);
    console.log('   Appointment ID:', payment.appointmentId?._id);

    // Process payment based on status code
    console.log('\n⚙️  PROCESSING PAYMENT STATUS:');
    console.log('   Status Code:', status_code);
    
    const oldStatus = payment.paymentStatus;
    const oldAppointmentStatus = payment.appointmentId?.status;
    
    if (status_code === '2') { // Success
      console.log('   ✅ Payment Successful - Updating to completed');
      
      payment.paymentStatus = 'completed';
      payment.paymentReference = payment_id;
      payment.paymentDate = new Date();
      payment.paymentGatewayResponse = req.body;
      await payment.save();

      console.log('   💾 Payment record updated successfully');

      // Update appointment
      if (payment.appointmentId) {
        const appointment = await Appointment.findById(payment.appointmentId._id);
        if (appointment) {
          appointment.status = 'confirmed';
          appointment.paymentStatus = 'paid';
          appointment.updatedAt = new Date();
          await appointment.save();
          
          console.log('   📅 Appointment updated to confirmed');

          // Send confirmation email
          try {
            const { sendAppointmentConfirmationEmail } = require('../utils/email');
            
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

            console.log('   📧 Sending confirmation email to:', emailData.patientEmail);
            const emailResult = await sendAppointmentConfirmationEmail(emailData);
            
            if (emailResult.success) {
              console.log('   ✅ Confirmation email sent successfully');
            } else {
              console.log('   ❌ Email sending failed:', emailResult.error);
            }
          } catch (emailError) {
            console.log('   💥 Email error:', emailError.message);
          }
        }
      }
      
    } else if (status_code === '0') {
      console.log('   ⏳ Payment Pending');
      payment.paymentStatus = 'pending';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else if (status_code === '-1') {
      console.log('   ❌ Payment Cancelled by User');
      payment.paymentStatus = 'cancelled';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else if (status_code === '-2') {
      console.log('   ❌ Payment Failed');
      payment.paymentStatus = 'failed';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else {
      console.log('   ❓ Unknown Status Code:', status_code);
      payment.paymentStatus = 'unknown';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    }

    console.log('\n📊 FINAL STATUS:');
    console.log('   Payment Status: ' + oldStatus + ' → ' + payment.paymentStatus);
    if (payment.appointmentId) {
      console.log('   Appointment Status: ' + oldAppointmentStatus + ' → confirmed');
    }

    console.log('\n✅ WEBHOOK PROCESSING COMPLETED SUCCESSFULLY');
    console.log('🔔 Responding with OK to PayHere');
    console.log('='.repeat(80) + '\n');
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.log('\n💥 WEBHOOK PROCESSING ERROR:');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
    console.log('='.repeat(80) + '\n');
    res.status(500).send('Error processing payment');
  }
};

module.exports = { handlePaymentNotificationWithLogging };