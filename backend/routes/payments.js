const express = require('express');
const {
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
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes (for PayHere webhooks)
router.post('/generate-hash', generateHash);
router.post('/notify', handlePaymentNotification);
router.post('/verify', verifyPayment);
router.post('/verify-success', verifySuccess);

// Test webhook endpoint
router.post('/test-webhook', (req, res) => {
  console.log('🧪 Test webhook called:', req.body);
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🌐 Headers:', req.headers);
  res.status(200).json({
    success: true,
    message: 'Webhook test successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Debug routes
router.post('/debug/payment-form', debugPaymentForm);

// Protected routes
router.use(protect);
router.post('/initiate', initiatePayment);
router.get('/', getPayments);
router.get('/invoices', getInvoices);
router.get('/invoice/:id/download', downloadInvoice);

// Admin/Manual fix routes
router.post('/fix-pending', fixPendingPayments); // Fix all pending payments
router.post('/manual-update/:appointmentId', manualPaymentUpdate); // Manually update specific payment

module.exports = router;
