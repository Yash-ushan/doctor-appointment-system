const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  paymentMethod: {
    type: String,
    enum: ['payhere', 'cash', 'card'],
    default: 'payhere'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: String, // PayHere payment ID
  transactionId: String,
  paymentDate: Date,
  refundDate: Date,
  refundAmount: Number,
  paymentGatewayResponse: Object, // Store PayHere response
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);