const express = require('express');
const {
  getHospitals,
  getHospital,
  getHospitalsByCity
} = require('../controllers/hospitalController');

const router = express.Router();

// Public routes
router.get('/', getHospitals);
router.get('/:id', getHospital);
router.get('/city/:city', getHospitalsByCity);

module.exports = router;