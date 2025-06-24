const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { generateInvoicePDF, generateBookingConfirmationPDF } = require('../utils/pdfGenerator');
const { sendEmail, testEmailConfig, appointmentConfirmationEmail, paymentConfirmationEmail, invoiceEmail, sendAppointmentConfirmationEmail } = require('../utils/email');

const crypto = require('crypto');

// PayHere Configuration
const PayHereConfig = {
  getMerchantId() {
    if (!process.env.PAYHERE_MERCHANT_ID) {
      throw new Error('PAYHERE_MERCHANT_ID environment variable is not set');
    }
    return process.env.PAYHERE_MERCHANT_ID;
  },

  getMerchantSecret() {
    if (!process.env.PAYHERE_MERCHANT_SECRET) {
      throw new Error('PAYHERE_MERCHANT_SECRET environment variable is not set');
    }
    return process.env.PAYHERE_MERCHANT_SECRET;
  },

  isSandbox() {
    return process.env.PAYHERE_SANDBOX === 'true';
  },

  getPaymentUrl() {
    return this.isSandbox() 
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';
  },

  validate() {
    try {
      this.getMerchantId();
      this.getMerchantSecret();
      console.log('PayHere configuration validated successfully');
      console.log('Environment:', this.isSandbox() ? 'Sandbox' : 'Live');
      console.log('Merchant ID:', this.getMerchantId());
      console.log('Merchant Secret (first 10 chars):', this.getMerchantSecret().substring(0, 10) + '...');
      return true;
    } catch (error) {
      console.error('PayHere configuration validation failed:', error.message);
      throw error;
    }
  }
};

// PayHere utility functions
const PayHereUtils = {
  // Generate hash for payment initiation
  generatePaymentHash(merchant_id, order_id, amount, currency, merchant_secret) {
    try {
      // Ensure amount is formatted to 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);
      
      // PayHere hash: UPPER(MD5(merchant_id + order_id + amount + currency + UPPER(MD5(merchant_secret))))
      const hashedSecret = crypto
        .createHash('md5')
        .update(merchant_secret)
        .digest('hex')
        .toUpperCase();

      const hashString = merchant_id + order_id + formattedAmount + currency + hashedSecret;
      
      const hash = crypto
        .createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      console.log('PayHere Payment Hash Generation:');
      console.log('Merchant ID:', merchant_id);
      console.log('Order ID:', order_id);
      console.log('Amount:', formattedAmount);
      console.log('Currency:', currency);
      console.log('Hash String (first 50 chars):', hashString.substring(0, 50) + '...');
      console.log('Final Hash:', hash);

      return hash;
    } catch (error) {
      console.error('Error generating payment hash:', error);
      throw error;
    }
  },

  // Generate hash for notification verification
  generateNotificationHash(merchant_id, order_id, amount, currency, status_code, merchant_secret) {
    try {
      // Ensure amount is formatted to 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);
      
      // PayHere notification hash: UPPER(MD5(merchant_id + order_id + amount + currency + status_code + UPPER(MD5(merchant_secret))))
      const hashedSecret = crypto
        .createHash('md5')
        .update(merchant_secret)
        .digest('hex')
        .toUpperCase();
        
      const hashString = merchant_id + order_id + formattedAmount + currency + status_code + hashedSecret;
      
      const hash = crypto
        .createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      console.log('PayHere Notification Hash Verification:');
      console.log('Hash String (first 50 chars):', hashString.substring(0, 50) + '...');
      console.log('Generated Hash:', hash);

      return hash;
    } catch (error) {
      console.error('Error generating notification hash:', error);
      throw error;
    }
  }
};

// @desc    Generate PayHere hash
// @route   POST /api/payments/generate-hash
// @access  Public (for demo purposes)
const generateHash = async (req, res) => {
  try {
    PayHereConfig.validate(); // Validate configuration

    const {
      merchant_id,
      order_id,
      amount,
      currency
    } = req.body;

    // Validate required fields
    if (!merchant_id || !order_id || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: merchant_id, order_id, amount, currency'
      });
    }

    const hash = PayHereUtils.generatePaymentHash(
      merchant_id,
      order_id,
      amount,
      currency,
      PayHereConfig.getMerchantSecret()
    );

    res.status(200).json({
      success: true,
      hash,
      debug: {
        merchant_id,
        order_id,
        amount: parseFloat(amount).toFixed(2),
        currency,
        environment: PayHereConfig.isSandbox() ? 'sandbox' : 'live'
      }
    });
  } catch (error) {
    console.error('Hash generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Hash generation failed'
    });
  }
};
// @desc    Initiate PayHere payment
// @route   POST /api/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    PayHereConfig.validate(); // Validate configuration

    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId')
      .populate('hospitalId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user owns this appointment
    if (appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      appointmentId,
      patientId: req.user.id,
      doctorId: appointment.doctorId._id,
      amount: appointment.consultationFee,
      paymentStatus: 'pending'
    });

    // PayHere configuration
    const merchant_id = PayHereConfig.getMerchantId();
    const order_id = `PAY-${payment._id}`;
    const amount = appointment.consultationFee.toFixed(2);
    const currency = 'LKR';

    // Generate hash using utility function
    const hash = PayHereUtils.generatePaymentHash(
      merchant_id,
      order_id,
      amount,
      currency,
      PayHereConfig.getMerchantSecret()
    );

    const paymentData = {
      merchant_id,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      notify_url: `${process.env.SERVER_URL}/api/payments/notify`,
      order_id,
      items: `Consultation with Dr. ${appointment.doctorId.userId.name}`,
      currency,
      amount,
      first_name: appointment.patientId.name.split(' ')[0],
      last_name: appointment.patientId.name.split(' ').slice(1).join(' ') || 'Patient',
      email: appointment.patientId.email,
      phone: appointment.patientId.phone || '',
      address: appointment.patientId.address?.street || '',
      city: appointment.patientId.address?.city || 'Colombo',
      country: 'Sri Lanka',
      hash
    };

    console.log('Payment initiation data:', {
      order_id,
      amount,
      environment: PayHereConfig.isSandbox() ? 'sandbox' : 'live',
      payment_url: PayHereConfig.getPaymentUrl()
    });

    res.status(200).json({
      success: true,
      paymentData,
      paymentId: payment._id,
      environment: PayHereConfig.isSandbox() ? 'sandbox' : 'live',
      paymentUrl: PayHereConfig.getPaymentUrl()
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
// @desc    Handle PayHere notification
// @route   POST /api/payments/notify
// @access  Public
const handlePaymentNotification = async (req, res) => {
  try {
    console.log('🔔 PayHere notification received:', req.body);
    console.log('🕐 Timestamp:', new Date().toISOString());

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

    // Validate required fields
    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      console.error('❌ Missing required notification fields:', {
        merchant_id: !!merchant_id,
        order_id: !!order_id,
        payhere_amount: !!payhere_amount,
        payhere_currency: !!payhere_currency,
        status_code: !!status_code,
        md5sig: !!md5sig
      });
      return res.status(400).send('Missing required fields');
    }

    console.log('📋 Payment notification details:', {
      merchant_id,
      order_id,
      payment_id,
      amount: payhere_amount,
      currency: payhere_currency,
      status_code,
      status_message
    });

    // Verify hash using utility function
    const local_md5sig = PayHereUtils.generateNotificationHash(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      PayHereConfig.getMerchantSecret()
    );

    console.log('🔐 Hash verification:');
    console.log('   Received Hash:', md5sig);
    console.log('   Calculated Hash:', local_md5sig);
    console.log('   Hash Match:', local_md5sig === md5sig);

    if (local_md5sig !== md5sig) {
      console.error('❌ Hash verification failed - possible fraud attempt');
      return res.status(400).send('Invalid hash');
    }

    console.log('✅ Hash verification successful');

    // Extract payment ID from order_id
    const paymentId = order_id.replace('PAY-', '');
    console.log('🔍 Looking for payment ID:', paymentId);
    
    const payment = await Payment.findById(paymentId)
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate('doctorId');

    if (!payment) {
      console.error('❌ Payment not found in database:', paymentId);
      return res.status(404).send('Payment not found');
    }

    console.log('📄 Payment found:', {
      id: payment._id,
      appointmentId: payment.appointmentId._id,
      currentStatus: payment.paymentStatus,
      amount: payment.amount
    });

    // Update payment status based on status_code
    if (status_code === '2') { // Success
      console.log('✅ Payment successful - updating status');
      
      payment.paymentStatus = 'completed';
      payment.paymentReference = payment_id;
      payment.paymentDate = new Date();
      payment.paymentGatewayResponse = req.body;
      await payment.save();

      console.log('💾 Payment record updated successfully');

      // Update appointment payment status
      const appointment = await Appointment.findById(payment.appointmentId._id);
      if (appointment) {
        console.log('📅 Updating appointment status:', {
          appointmentId: appointment._id,
          currentStatus: appointment.status,
          currentPaymentStatus: appointment.paymentStatus
        });

        appointment.status = 'confirmed';
        appointment.paymentStatus = 'paid';
        appointment.updatedAt = new Date();
        await appointment.save();

        console.log('✅ Appointment status updated successfully:', {
          appointmentId: appointment._id,
          newStatus: appointment.status,
          newPaymentStatus: appointment.paymentStatus
        });

        // Send confirmation email
        try {
          console.log('📧 Preparing to send appointment confirmation email...');
          const emailData = {
            patientName: payment.patientId?.name || 'Patient',
            patientEmail: payment.patientId?.email || 'patient@example.com',
            doctorName: payment.doctorId?.userId?.name || 'Doctor',
            appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
            appointmentTime: appointment.appointmentTime,
            consultationType: appointment.consultationType,
            amount: payment.amount,
            appointmentId: appointment._id
          };

          console.log('📧 Email data prepared:', {
            patientEmail: emailData.patientEmail,
            patientName: emailData.patientName,
            doctorName: emailData.doctorName,
            appointmentDate: emailData.appointmentDate
          });

          const emailResult = await sendAppointmentConfirmationEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Confirmation email sent successfully to:', emailData.patientEmail);
          } else {
            console.error('❌ Failed to send confirmation email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('💥 Email sending error:', emailError.message);
          console.error('💥 Email error stack:', emailError.stack);
        }

      } else {
        console.error('❌ Appointment not found for payment:', payment.appointmentId._id);
      }

      console.log('🎉 Payment processing completed successfully:', payment_id);
    } else if (status_code === '0') {
      console.log('⏳ Payment pending');
      payment.paymentStatus = 'pending';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else if (status_code === '-1') {
      console.log('❌ Payment cancelled by user');
      payment.paymentStatus = 'cancelled';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else if (status_code === '-2') {
      console.log('❌ Payment failed');
      payment.paymentStatus = 'failed';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    } else {
      console.log('❓ Unknown payment status:', status_code, status_message);
      payment.paymentStatus = 'unknown';
      payment.paymentGatewayResponse = req.body;
      await payment.save();
    }

    console.log('💾 Final payment status saved:', payment.paymentStatus);
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ PayHere notification processing error:', error);
    res.status(500).send('Error processing payment');
  }
};

// @desc    Verify payment completion and update appointment
// @route   POST /api/payments/verify
// @access  Public 
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const paymentId = orderId.replace('PAY-', '');
    
    console.log('🔍 Verifying payment:', { orderId, paymentId });
    
    const payment = await Payment.findById(paymentId)
      .populate('appointmentId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is completed but appointment status isn't updated, fix it
    if (payment.paymentStatus === 'completed' && payment.appointmentId) {
      const appointment = await Appointment.findById(payment.appointmentId._id)
        .populate('patientId', 'name email')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name'
          }
        });
        
      if (appointment && appointment.status !== 'confirmed') {
        appointment.status = 'confirmed';
        appointment.paymentStatus = 'paid';
        await appointment.save();
        console.log('✅ Fixed appointment status for:', appointment._id);
      }

      // Return appointment data for frontend
      const receiptData = {
        orderId: orderId,
        amount: payment.amount,
        paymentReference: payment.paymentReference,
        date: payment.paymentDate || new Date(),
        status: payment.paymentStatus,
        appointment: appointment
      };

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        receipt: receiptData,
        appointment: appointment
      });
    }

    const receiptData = {
      orderId: orderId,
      amount: payment.amount,
      paymentReference: payment.paymentReference,
      date: payment.paymentDate || new Date(),
      status: payment.paymentStatus
    };

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      receipt: receiptData
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

// @desc    Handle PayHere success callback
// @route   POST /api/payments/verify-success
// @access  Public
const verifySuccess = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    console.log('Payment success callback:', { orderId, paymentId });
    
    res.status(200).json({
      success: true,
      message: 'Payment successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
// @desc    Get payment history
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .populate('appointmentId')
      .populate('doctorId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get invoices
// @route   GET /api/payments/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patientId: req.user.id })
      .populate('appointmentId')
      .populate('doctorId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/payments/invoice/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    console.log('📥 PDF Download Request:', {
      invoiceId: req.params.id,
      userId: req.user.id
    });

    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      console.log('❌ Invoice not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('📄 Invoice found:', {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      pdfPath: invoice.pdfPath,
      status: invoice.status
    });

    // Check if user owns this invoice
    if (invoice.patientId.toString() !== req.user.id) {
      console.log('❌ Unauthorized access attempt');
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if PDF path exists in database
    if (!invoice.pdfPath) {
      console.log('❌ PDF path not found, regenerating...');
      
      try {
        const appointment = await Appointment.findById(invoice.appointmentId)
          .populate('patientId')
          .populate('doctorId')
          .populate('hospitalId');
        
        const doctor = await Doctor.findById(invoice.doctorId).populate('userId');
        
        if (appointment && doctor) {
          const { generateInvoicePDF } = require('../utils/pdfGenerator');
          const pdfPath = await generateInvoicePDF(invoice, appointment, doctor);
          invoice.pdfPath = pdfPath;
          await invoice.save();
          console.log('✅ PDF regenerated successfully');
        }
      } catch (regenerateError) {
        console.error('❌ PDF regeneration failed:', regenerateError);
        return res.status(500).json({
          success: false,
          message: 'PDF regeneration failed'
        });
      }
    }

    // Check if file actually exists on filesystem
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(invoice.pdfPath)) {
      console.log('❌ PDF file not found on filesystem, regenerating...');
      
      try {
        const appointment = await Appointment.findById(invoice.appointmentId)
          .populate('patientId')
          .populate('doctorId')
          .populate('hospitalId');
        
        const doctor = await Doctor.findById(invoice.doctorId).populate('userId');
        
        const { generateInvoicePDF } = require('../utils/pdfGenerator');
        const pdfPath = await generateInvoicePDF(invoice, appointment, doctor);
        invoice.pdfPath = pdfPath;
        await invoice.save();
        console.log('✅ Missing PDF regenerated');
      } catch (error) {
        console.error('❌ Failed to regenerate missing PDF:', error);
        return res.status(500).json({
          success: false,
          message: 'PDF file not found and regeneration failed'
        });
      }
    }

    console.log('📤 Serving PDF file:', invoice.pdfPath);

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Use res.sendFile for better error handling
    res.sendFile(path.resolve(invoice.pdfPath), (err) => {
      if (err) {
        console.error('❌ Error sending PDF file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error sending PDF file'
          });
        }
      } else {
        console.log('✅ PDF file sent successfully');
      }
    });

  } catch (error) {
    console.error('❌ PDF download error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
// Helper functions
const generateInvoiceForPayment = async (payment) => {
  try {
    const appointment = await Appointment.findById(payment.appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('hospitalId');

    const doctor = await Doctor.findById(payment.doctorId).populate('userId');
    
    const invoice = await Invoice.create({
      appointmentId: payment.appointmentId,
      patientId: payment.patientId,
      doctorId: payment.doctorId,
      hospitalId: appointment.hospitalId?._id,
      items: [{
        description: `${appointment.consultationType} consultation with Dr. ${doctor.userId.name}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      totalAmount: payment.amount,
      status: 'paid',
      paidDate: new Date()
    });

    const pdfPath = await generateInvoicePDF(invoice, appointment, doctor);
    invoice.pdfPath = pdfPath;
    await invoice.save();

    return invoice;
  } catch (error) {
    console.error('Error generating invoice:', error);
  }
};

const generateBookingConfirmation = async (payment) => {
  try {
    const appointment = await Appointment.findById(payment.appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('hospitalId');

    const doctor = await Doctor.findById(payment.doctorId).populate('userId');
    
    const pdfPath = await generateBookingConfirmationPDF(appointment, doctor, payment);
    
    appointment.confirmationPdfPath = pdfPath;
    await appointment.save();

    return pdfPath;
  } catch (error) {
    console.error('Error generating booking confirmation:', error);
  }
};

const sendPaymentConfirmationEmail = async (payment) => {
  try {
    const appointment = await Appointment.findById(payment.appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('hospitalId');

    const doctor = await Doctor.findById(payment.doctorId).populate('userId');

    const emailData = {
      patientName: payment.patientId.name,
      doctorName: doctor.userId.name,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      amount: payment.amount,
      paymentId: payment.paymentReference,
      consultationType: appointment.consultationType
    };

    await sendEmail({
      email: payment.patientId.email,
      subject: 'Payment Confirmation & Booking Details',
      html: paymentConfirmationEmail(emailData)
    });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};
// @desc    Debug PayHere payment form
// @route   POST /api/debug/payment-form
// @access  Public (for debugging)
const debugPaymentForm = async (req, res) => {
  try {
    console.log('🔍 === PAYHERE FORM DEBUG SESSION ===');
    
    PayHereConfig.validate();
    
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId is required'
      });
    }

    // Test appointment data
    const testAppointment = {
      _id: appointmentId,
      consultationFee: 1800,
      patientId: {
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '0771234567',
        address: { street: 'Test Street', city: 'Colombo' }
      },
      doctorId: {
        userId: { name: 'Test Doctor' }
      }
    };

    const testPayment = { _id: 'test-payment-id-' + Date.now() };

    // Generate payment data
    const merchant_id = PayHereConfig.getMerchantId();
    const order_id = `PAY-${testPayment._id}`;
    const amount = testAppointment.consultationFee.toFixed(2);
    const currency = 'LKR';

    const hash = PayHereUtils.generatePaymentHash(
      merchant_id,
      order_id,
      amount,
      currency,
      PayHereConfig.getMerchantSecret()
    );

    const paymentData = {
      merchant_id,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      notify_url: `${process.env.SERVER_URL}/api/payments/notify`,
      order_id,
      items: `Consultation with Dr. ${testAppointment.doctorId.userId.name}`,
      currency,
      amount,
      first_name: 'Test',
      last_name: 'Patient',
      email: 'test@example.com',
      phone: '0771234567',
      address: 'Test Address',
      city: 'Colombo',
      country: 'Sri Lanka',
      hash
    };

    // Validate fields
    const requiredFields = [
      'merchant_id', 'order_id', 'amount', 'currency', 'items',
      'first_name', 'last_name', 'email', 'phone', 'address', 
      'city', 'country', 'return_url', 'cancel_url', 'notify_url', 'hash'
    ];

    const validation = {
      allFieldsPresent: true,
      missingFields: [],
      invalidFields: []
    };

    requiredFields.forEach(field => {
      const value = paymentData[field];
      if (!value || value === '') {
        validation.missingFields.push(field);
        validation.allFieldsPresent = false;
      }
    });

    // Format validations
    if (!/^\d+\.\d{2}$/.test(paymentData.amount)) {
      validation.invalidFields.push(`Amount format invalid: "${paymentData.amount}"`);
    }
    
    if (paymentData.currency !== 'LKR') {
      validation.invalidFields.push(`Currency should be "LKR", got "${paymentData.currency}"`);
    }
    
    if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
      validation.invalidFields.push(`Invalid email format: "${paymentData.email}"`);
    }

    if (paymentData.hash.length !== 32) {
      validation.invalidFields.push(`Hash length should be 32, got ${paymentData.hash.length}`);
    }

    console.log('📋 Complete Payment Data:', JSON.stringify(paymentData, null, 2));
    console.log('✅ Validation Result:', validation);

    res.json({
      success: true,
      paymentData,
      validation,
      environment: PayHereConfig.isSandbox() ? 'sandbox' : 'live',
      payhereUrl: PayHereConfig.getPaymentUrl(),
      instructions: 'Use this data to debug PayHere form submission'
    });

  } catch (error) {
    console.error('❌ Debug payment form error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Fix all pending payments (Manual administrative function)
// @route   POST /api/payments/fix-pending
// @access  Private (Admin recommended)
const fixPendingPayments = async (req, res) => {
  try {
    console.log('🔧 Starting manual fix for pending payments...');
    
    // Find all pending payments
    const pendingPayments = await Payment.find({ 
      paymentStatus: 'pending' 
    }).populate('appointmentId');
    
    console.log(`📋 Found ${pendingPayments.length} pending payments to check`);
    
    let fixedCount = 0;
    let results = [];
    
    for (const payment of pendingPayments) {
      try {
        if (payment.appointmentId) {
          const appointment = await Appointment.findById(payment.appointmentId._id);
          
          if (appointment) {
            // Check if this looks like it should be confirmed
            // (created more than 5 minutes ago, has payment record)
            const timeDiff = Date.now() - payment.createdAt.getTime();
            const shouldBeConfirmed = timeDiff > (5 * 60 * 1000); // 5 minutes
            
            if (shouldBeConfirmed) {
              // Update payment status
              payment.paymentStatus = 'completed';
              payment.paymentReference = payment.paymentReference || `MANUAL-${payment._id}`;
              payment.paymentDate = payment.paymentDate || new Date();
              await payment.save();
              
              // Update appointment status
              appointment.status = 'confirmed';
              appointment.paymentStatus = 'paid';
              await appointment.save();
              
              fixedCount++;
              results.push({
                paymentId: payment._id,
                appointmentId: appointment._id,
                status: 'fixed',
                patientEmail: appointment.patientId?.email || 'unknown'
              });
              
              console.log(`✅ Fixed payment ${payment._id} for appointment ${appointment._id}`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error fixing payment ${payment._id}:`, error);
        results.push({
          paymentId: payment._id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log(`🎯 Manual fix completed: ${fixedCount} payments fixed`);
    
    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} pending payments`,
      totalPending: pendingPayments.length,
      fixed: fixedCount,
      results
    });
    
  } catch (error) {
    console.error('❌ Fix pending payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fix pending payments'
    });
  }
};

// @desc    Manually update specific payment status
// @route   POST /api/payments/manual-update/:appointmentId
// @access  Private
const manualPaymentUpdate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentStatus = 'completed', paymentReference } = req.body;
    
    console.log(`🔧 Manual update for appointment: ${appointmentId}`);
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Find or create payment record
    let payment = await Payment.findOne({ appointmentId });
    
    if (!payment) {
      // Create payment record if it doesn't exist
      payment = await Payment.create({
        appointmentId,
        patientId: appointment.patientId._id,
        doctorId: appointment.doctorId,
        amount: appointment.consultationFee,
        paymentStatus: 'completed',
        paymentReference: paymentReference || `MANUAL-${appointmentId}`,
        paymentDate: new Date()
      });
      console.log(`✅ Created new payment record: ${payment._id}`);
    } else {
      // Update existing payment
      payment.paymentStatus = paymentStatus;
      payment.paymentReference = paymentReference || payment.paymentReference || `MANUAL-${appointmentId}`;
      payment.paymentDate = payment.paymentDate || new Date();
      await payment.save();
      console.log(`✅ Updated existing payment record: ${payment._id}`);
    }
    
    // Update appointment status
    if (paymentStatus === 'completed') {
      appointment.status = 'confirmed';
      appointment.paymentStatus = 'paid';
      await appointment.save();
      console.log(`✅ Updated appointment status to confirmed: ${appointmentId}`);
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        appointment: {
          id: appointment._id,
          status: appointment.status,
          paymentStatus: appointment.paymentStatus
        },
        payment: {
          id: payment._id,
          status: payment.paymentStatus,
          reference: payment.paymentReference
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Manual payment update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment status'
    });
  }
};

module.exports = {
  initiatePayment,
  handlePaymentNotification,
  getPayments,
  getInvoices,
  downloadInvoice,
  generateHash,
  verifyPayment,
  verifySuccess,
  debugPaymentForm,
  fixPendingPayments,
  manualPaymentUpdate
};