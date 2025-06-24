const express = require('express');
const {
  getDoctors,
  getDoctor,
  getDoctorAvailability,
  addReview,
  updateDoctorProfile,
  blockTimeSlot
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/availability', getDoctorAvailability);

// Private routes
router.post('/:id/reviews', protect, authorize('patient'), addReview);

// Doctor only routes
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.post('/block-slot', protect, authorize('doctor'), blockTimeSlot);

module.exports = router;