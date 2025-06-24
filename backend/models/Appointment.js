const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: function() {
      return this.consultationType === 'physical';
    }
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['physical', 'online'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending_payment', 'scheduled', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  symptoms: [String],
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'not_required'],
    default: 'pending'
  },
  paymentId: String,
  paymentAmount: Number,
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    diagnosis: String,
    notes: String,
    followUp: Date
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  isRescheduled: {
    type: Boolean,
    default: false
  },
  originalAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  chatRoomId: String,
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

// Pre-save middleware to generate chat room ID for online consultations
appointmentSchema.pre('save', function(next) {
  if (this.consultationType === 'online' && !this.chatRoomId) {
    this.chatRoomId = `${this.patientId}_${this.doctorId}_${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);