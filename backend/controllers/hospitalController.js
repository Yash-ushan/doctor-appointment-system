const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const { city, facilities, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (facilities) {
      const facilitiesArray = facilities.split(',');
      query.facilities = { $in: facilitiesArray };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    const hospitals = await Hospital.find(query)
      .sort({ name: 1 })
      .limit(limitNum)
      .skip(startIndex);

    const total = await Hospital.countDocuments(query);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get doctors associated with this hospital
    const doctors = await Doctor.find({ 
      hospitals: hospital._id, 
      isVerified: true 
    })
    .populate('userId', 'name avatar')
    .select('specialization rating totalRatings consultationFees userId');

    res.status(200).json({
      success: true,
      data: {
        hospital,
        doctors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get hospitals by city
// @route   GET /api/hospitals/city/:city
// @access  Public
const getHospitalsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const hospitals = await Hospital.find({
      'address.city': { $regex: city, $options: 'i' },
      isActive: true
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getHospitals,
  getHospital,
  getHospitalsByCity
};