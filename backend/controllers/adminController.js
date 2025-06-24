const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Count statistics
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Recent appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd }
    });

    // Appointment status distribution
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly appointment trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top specializations
    const topSpecializations = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalAppointments,
        todayAppointments,
        appointmentStats,
        monthlyTrends,
        topSpecializations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all doctors for admin
// @route   GET /api/admin/doctors
// @access  Private (Admin)
const getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};
    if (search) {
      // First find users matching the search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ],
        role: 'doctor'
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.userId = { $in: userIds };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar phone createdAt')
      .populate('hospitals', 'name address')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(startIndex);

    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Verify doctor
// @route   PUT /api/admin/verify-doctor/:id
// @access  Private (Admin)
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.isVerified = !doctor.isVerified;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.isVerified ? 'verified' : 'unverified'} successfully`,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Create hospital
// @route   POST /api/admin/hospitals
// @access  Private (Admin)
const createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update hospital
// @route   PUT /api/admin/hospitals/:id
// @access  Private (Admin)
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/admin/hospitals/:id
// @access  Private (Admin)
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    await hospital.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAppointments = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add consultation type filter
    if (type) {
      query.consultationType = type;
    }
    
    // Add search filter (search in patient name or doctor name)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find users (patients and doctors) matching the search
      const matchingUsers = await User.find({
        name: searchRegex
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      // Find doctors whose userId matches
      const matchingDoctors = await Doctor.find({
        userId: { $in: userIds }
      }).select('_id');
      
      const doctorIds = matchingDoctors.map(doctor => doctor._id);
      
      query.$or = [
        { patientId: { $in: userIds } },
        { doctorId: { $in: doctorIds } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    console.log('🔍 Admin appointments query:', query);

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .populate('hospitalId', 'name address contact')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(startIndex);

    const total = await Appointment.countDocuments(query);

    console.log(`✅ Admin found ${appointments.length} appointments (total: ${total})`);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: appointments
    });
  } catch (error) {
    console.error('❌ Admin appointments fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update appointment status (admin)
// @route   PUT /api/admin/appointments/:id/status
// @access  Private (Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const appointmentId = req.params.id;

    console.log(`🔧 Admin updating appointment ${appointmentId} to status: ${status}`);

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    const oldStatus = appointment.status;
    appointment.status = status;
    
    if (status === 'cancelled' && reason) {
      appointment.cancellationReason = reason;
      appointment.cancelledBy = 'admin';
    }
    
    appointment.updatedAt = new Date();
    await appointment.save();

    console.log(`✅ Appointment ${appointmentId} status updated from ${oldStatus} to ${status}`);

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    console.error('❌ Admin appointment status update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getDoctors,
  verifyDoctor,
  createHospital,
  updateHospital,
  deleteHospital,
  getAppointments,
  updateAppointmentStatus
};