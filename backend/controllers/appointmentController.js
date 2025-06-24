const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Chat = require('../models/Chat');
const { sendEmail, appointmentConfirmationEmail, appointmentReminderEmail } = require('../utils/email');
const { isValidAppointmentDate, formatDate, formatTime } = require('../utils/helpers');

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reason,
      symptoms,
      status = 'pending_payment' // Default status for payment flow
    } = req.body;

    // Validate appointment date
    if (!isValidAppointmentDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Get doctor details
    const doctor = await Doctor.findById(doctorId).populate('userId');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Get consultation fee
    const consultationFee = consultationType === 'physical' 
      ? doctor.consultationFees.physical 
      : doctor.consultationFees.online;

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      hospitalId: consultationType === 'physical' ? hospitalId : undefined,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      consultationType,
      reason,
      symptoms: symptoms || [],
      consultationFee,
      status: status || 'pending_payment', // Support payment flow
      paymentStatus: status === 'pending_payment' ? 'pending' : 'not_required'
    });

    // Populate appointment details for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('hospitalId', 'name address');

    // Send confirmation email only if not pending payment
    if (status !== 'pending_payment') {
      try {
        const emailData = {
          patientName: req.user.name,
          doctorName: doctor.userId.name,
          specialization: doctor.specialization,
          date: formatDate(appointmentDate),
          time: formatTime(appointmentTime),
          type: consultationType,
          hospital: consultationType === 'physical' && hospitalId ? 
            (await Hospital.findById(hospitalId))?.name : null,
          fee: consultationFee
        };

        await sendEmail({
          email: req.user.email,
          subject: 'Appointment Confirmation',
          html: appointmentConfirmationEmail(emailData)
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    // Emit real-time notification
    if (req.io) {
      req.io.emit('appointment_notification', {
        type: 'new_appointment',
        appointment: populatedAppointment
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Send appointment confirmation email
// @route   POST /api/appointments/send-confirmation
// @access  Private
const sendConfirmation = async (req, res) => {
  try {
    const {
      appointmentId,
      patientEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      consultationType,
      amount
    } = req.body;

    // Generate email content
    const emailData = {
      patientName: req.user?.name || 'Patient',
      doctorName,
      appointmentDate: new Date(appointmentDate).toLocaleDateString(),
      appointmentTime,
      consultationType,
      amount,
      appointmentId
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏥 MediLink</h1>
          <h2 style="margin: 10px 0 0 0;">Appointment Confirmed!</h2>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h3 style="color: #333; margin-bottom: 20px;">Dear ${emailData.patientName},</h3>
          
          <p style="color: #666; line-height: 1.6;">
            Your appointment has been successfully confirmed and payment has been processed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${emailData.doctorName}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${emailData.appointmentDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${emailData.appointmentTime}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${emailData.consultationType}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Amount Paid:</strong></td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">LKR ${emailData.amount}</td></tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #333; margin-top: 0;">💳 Payment Confirmed</h4>
            <p style="margin: 5px 0; color: #666;">Payment Status: <span style="color: #28a745; font-weight: bold;">Completed</span></p>
            <p style="margin: 5px 0; color: #666;">Appointment ID: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${emailData.appointmentId}</code></p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #333; margin-top: 0;">📋 What's Next?</h4>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li>You'll receive a reminder 24 hours before your appointment</li>
              <li>Download your receipt from the patient dashboard</li>
              <li>For online consultations, the video link will be sent 30 minutes before</li>
              <li>Please arrive 15 minutes early for physical consultations</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for choosing MediLink!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    `;

    // Send email
    await sendEmail({
      email: patientEmail,
      subject: 'Appointment Confirmed - Payment Successful',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send confirmation email'
    });
  }
};

// @desc    Download appointment receipt
// @route   GET /api/appointments/:id/receipt
// @access  Private
const downloadReceipt = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('hospitalId', 'name address');

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

    // Generate simple text receipt for now
    const receiptText = `
MEDILINK APPOINTMENT RECEIPT
============================

Receipt #: ${appointment._id}
Date Generated: ${new Date().toLocaleString()}

PATIENT INFORMATION
-------------------
Name: ${appointment.patientId.name}
Email: ${appointment.patientId.email}
Phone: ${appointment.patientId.phone || 'N/A'}

DOCTOR INFORMATION
------------------
Doctor: Dr. ${appointment.doctorId.userId?.name || appointment.doctorId.name}
Specialization: ${appointment.doctorId.specialization}

APPOINTMENT DETAILS
-------------------
Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}
Time: ${appointment.appointmentTime}
Type: ${appointment.consultationType}
Status: ${appointment.status}
${appointment.hospitalId ? `Hospital: ${appointment.hospitalId.name}` : ''}

PAYMENT DETAILS
---------------
Consultation Fee: LKR ${appointment.consultationFee}
Payment Status: ${appointment.paymentStatus || 'Paid'}
Payment Date: ${new Date().toLocaleDateString()}

ADDITIONAL INFORMATION
----------------------
Reason: ${appointment.reason}
${appointment.symptoms && appointment.symptoms.length > 0 ? `Symptoms: ${appointment.symptoms.join(', ')}` : ''}

============================
Thank you for choosing MediLink!
For support, contact: support@medilink.lk
============================
`;

    // Set headers for download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="appointment-receipt-${appointmentId}.txt"`);
    
    res.send(receiptText);
  } catch (error) {
    console.error('Receipt download error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate receipt'
    });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    // Build query based on user role
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile) {
        query.doctorId = doctorProfile._id;
      }
    }

    // Add filters
    if (status) {
      query.status = status;
    }
    if (type) {
      query.consultationType = type;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

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
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limitNum)
      .skip(startIndex);

    const total = await Appointment.countDocuments(query);

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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone avatar address')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .populate('hospitalId', 'name address contact facilities');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      appointment.patientId._id.toString() === req.user.id ||
      appointment.doctorId.userId._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const appointmentId = req.params.id;

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

    // Check authorization
    const isPatient = appointment.patientId._id.toString() === req.user.id;
    const isDoctor = appointment.doctorId.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update appointment
    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancellationReason = cancellationReason;
      appointment.cancelledBy = req.user.role;
    }

    await appointment.save();

    // Emit real-time notification
    if (req.io) {
      req.io.emit('appointment_notification', {
        type: 'status_update',
        appointment,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Add prescription
// @route   PUT /api/appointments/:id/prescription
// @access  Private (Doctor)
const addPrescription = async (req, res) => {
  try {
    const { medicines, diagnosis, notes, followUp } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctorId.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription'
      });
    }

    // Update prescription
    appointment.prescription = {
      medicines: medicines || [],
      diagnosis,
      notes,
      followUp: followUp ? new Date(followUp) : undefined
    };

    // Mark appointment as completed if not already
    if (appointment.status === 'confirmed') {
      appointment.status = 'completed';
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Prescription added successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isPatient = appointment.patientId.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor';

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Validate new date
    if (!isValidAppointmentDate(newDate)) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date must be in the future'
      });
    }

    // Check if new slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: { $nin: ['cancelled'] },
      _id: { $ne: appointmentId }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'The new time slot is already booked'
      });
    }

    // Update appointment
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.isRescheduled = true;
    appointment.status = 'scheduled';

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Functions continue below...

// @desc    Download appointment receipt as PDF
// @route   GET /api/appointments/:id/receipt
// @access  Private
const downloadAppointmentReceiptPDF = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    console.log('📋 Generating PDF receipt for appointment:', appointmentId);
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('hospitalId', 'name address');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user owns this appointment or is the doctor
    const hasAccess = appointment.patientId._id.toString() === req.user.id || 
                     (req.user.role === 'doctor' && appointment.doctorId.userId._id.toString() === req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this receipt'
      });
    }

    // Find associated payment or create mock payment data
    const Payment = require('../models/Payment');
    let payment = await Payment.findOne({ appointmentId: appointmentId });
    
    // If no payment found, create mock payment data for PDF generation
    if (!payment) {
      payment = {
        amount: appointment.consultationFee,
        paymentStatus: appointment.paymentStatus || 'completed',
        paymentReference: `REF-${appointmentId}`,
        paymentDate: appointment.updatedAt || new Date(),
        _id: appointmentId
      };
      console.log('⚠️ No payment record found, using appointment data for receipt');
    }

    // Generate PDF receipt using the updated generator
    const { generateAppointmentReceiptPDF } = require('../utils/pdfGenerator');
    const pdfPath = await generateAppointmentReceiptPDF(appointment, payment);
    
    console.log('✅ PDF receipt generated at:', pdfPath);
    
    // Send PDF file
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="appointment-receipt-${appointmentId}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Use res.sendFile for better error handling
      res.sendFile(path.resolve(pdfPath), (err) => {
        if (err) {
          console.error('📄 PDF stream error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error streaming PDF file'
            });
          }
        } else {
          console.log('✅ PDF receipt sent successfully');
        }
      });
    } else {
      console.error('📄 PDF file not found:', pdfPath);
      res.status(500).json({
        success: false,
        message: 'PDF file not found'
      });
    }
    
  } catch (error) {
    console.error('📄 PDF receipt generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF receipt'
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  addPrescription,
  rescheduleAppointment,
  sendConfirmation,
  downloadReceipt,
  downloadAppointmentReceiptPDF
};