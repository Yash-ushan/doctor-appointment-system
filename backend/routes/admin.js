const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getDoctors,  
  verifyDoctor,
  createHospital,
  updateHospital,
  deleteHospital,
  getAppointments,
  updateAppointmentStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/doctors', getDoctors);  
router.get('/appointments', getAppointments);
router.put('/verify-doctor/:id', verifyDoctor);
router.put('/appointments/:id/status', updateAppointmentStatus);

router.route('/hospitals')
  .post(createHospital);

router.route('/hospitals/:id')
  .put(updateHospital)
  .delete(deleteHospital);

module.exports = router;