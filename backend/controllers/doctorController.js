const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const {
      specialization,
      hospital,
      city,
      minRating,
      maxFee,
      sortBy = 'rating',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { isVerified: true };
    
    if (specialization) {
      query.specialization = specialization;
    }
    
    if (hospital) {
      query.hospitals = hospital;
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'experience':
        sortOptions.experience = -1;
        break;
      case 'name':
        sortOptions['userId.name'] = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar')
      .populate('hospitals', 'name address city')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(startIndex);

    // Filter by city if specified
    let filteredDoctors = doctors;
    if (city) {
      filteredDoctors = doctors.filter(doctor => 
        doctor.hospitals.some(hospital => 
          hospital.address.city.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    // Filter by max fee if specified
    if (maxFee) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.consultationFees.physical <= parseFloat(maxFee) ||
        doctor.consultationFees.online <= parseFloat(maxFee)
      );
    }

    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredDoctors.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: filteredDoctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email avatar phone')
      .populate('hospitals', 'name address contact facilities operatingHours')
      .populate('reviews.patientId', 'name avatar');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.id;

    console.log('Getting availability for doctor:', doctorId, 'on date:', date);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get day of week from the requested date
    const requestedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[requestedDate.getDay()];

    console.log('Day of week:', dayOfWeek);

    // Get doctor's availability for the day
    const dayAvailability = doctor.availability.find(av => av.day === dayOfWeek);
    
    console.log('Doctor availability for', dayOfWeek, ':', dayAvailability);

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Doctor is not available on ${dayOfWeek}`,
        slots: []
      });
    }

    // Generate time slots (30-minute intervals)
    const generateTimeSlots = (startTime, endTime) => {
      const slots = [];
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      
      while (start < end) {
        const timeString = start.toTimeString().slice(0, 5);
        slots.push(timeString);
        start.setMinutes(start.getMinutes() + 30); // 30-minute slots
      }
      
      return slots;
    };

    const allSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime);
    console.log('Generated time slots:', allSlots);

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $nin: ['cancelled'] }
    });

    console.log('Existing appointments:', existingAppointments.length);

    // Get blocked slots for the date
    const blockedSlots = doctor.blockedSlots ? doctor.blockedSlots.filter(slot => 
      slot.date.toDateString() === requestedDate.toDateString()
    ) : [];

    console.log('Blocked slots:', blockedSlots.length);

    // Filter available slots
    const availableSlots = allSlots.filter(slot => {
      // Check if slot is not booked
      const isBooked = existingAppointments.some(app => app.appointmentTime === slot);
      
      // Check if slot is not blocked
      const isBlocked = blockedSlots.some(blocked => {
        const slotTime = new Date(`2000-01-01 ${slot}`);
        const blockStart = new Date(`2000-01-01 ${blocked.startTime}`);
        const blockEnd = new Date(`2000-01-01 ${blocked.endTime}`);
        return slotTime >= blockStart && slotTime < blockEnd;
      });

      return !isBooked && !isBlocked;
    });

    console.log('Available slots:', availableSlots);

    res.status(200).json({
      success: true,
      available: availableSlots.length > 0,
      slots: availableSlots,
      bookedSlots: existingAppointments.map(app => app.appointmentTime),
      dayAvailability,
      totalSlots: allSlots.length
    });
  } catch (error) {
    console.error('Error in getDoctorAvailability:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Add review for doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.id;
    const patientId = req.user.id;

    // Check if patient has completed appointment with this doctor
    const completedAppointment = await Appointment.findOne({
      patientId,
      doctorId,
      status: 'completed'
    });

    if (!completedAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You can only review doctors after completing an appointment'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if user already reviewed this doctor
    const existingReview = doctor.reviews.find(
      review => review.patientId.toString() === patientId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this doctor'
      });
    }

    // Add review
    doctor.reviews.push({
      patientId,
      rating,
      comment
    });

    // Calculate new average rating
    doctor.calculateAverageRating();
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: doctor.reviews[doctor.reviews.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update doctor profile (for doctors only)
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const updateFields = {
      bio: req.body.bio,
      consultationFees: req.body.consultationFees,
      availability: req.body.availability,
      hospitals: req.body.hospitals
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorProfile._id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Block time slot
// @route   POST /api/doctors/block-slot
// @access  Private (Doctor)
const blockTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;

    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Add blocked slot
    doctorProfile.blockedSlots.push({
      date: new Date(date),
      startTime,
      endTime,
      reason
    });

    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: 'Time slot blocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  getDoctorAvailability,
  addReview,
  updateDoctorProfile,
  blockTimeSlot
};