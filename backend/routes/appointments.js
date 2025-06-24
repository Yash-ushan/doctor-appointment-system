const express = require('express');
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  addPrescription,
  rescheduleAppointment,
  sendConfirmation,
  downloadReceipt,
  downloadAppointmentReceiptPDF
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are private
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('patient'), bookAppointment);

router.get('/:id', getAppointment);
router.get('/:id/receipt', downloadAppointmentReceiptPDF); // Use PDF receipt instead of text
router.get('/:id/receipt-text', downloadReceipt); // Keep text receipt as alternative
router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);
router.post('/send-confirmation', sendConfirmation); // Send email confirmation

// Doctor only routes
router.put('/:id/prescription', authorize('doctor'), addPrescription);

module.exports = router;