const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  contact: {
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be 10 digits'
      }
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    website: String
  },
  facilities: [{
    type: String,
    enum: [
      'Emergency', 'ICU', 'Operation Theater', 'X-Ray', 'MRI', 'CT Scan',
      'Laboratory', 'Pharmacy', 'Blood Bank', 'Ambulance', 'Parking'
    ]
  }],
  departments: [{
    name: String,
    head: String,
    description: String
  }],
  operatingHours: {
    weekdays: {
      open: String,
      close: String
    },
    weekends: {
      open: String,
      close: String
    },
    is24x7: {
      type: Boolean,
      default: false
    }
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDoctors: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for location-based queries
hospitalSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);