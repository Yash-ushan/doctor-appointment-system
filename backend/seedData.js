const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Hospital = require('./models/Hospital');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Cleared existing data');

    // Create admin 
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123', 
      phone: '9999999999',
      role: 'admin'
    });
    console.log('Created admin user');

    // Create patients
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient@demo.com',
      password: 'password123', 
      phone: '9999999998',
      role: 'patient',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      address: {
        street: '123 Patient Street',
        city: 'Colombo',
        state: 'Western',
        zipCode: '00100',
        country: 'Sri Lanka'
      }
    });

    const patient2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@demo.com',
      password: 'password123', 
      phone: '9999999997',
      role: 'patient',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'female'
    });
    console.log('Created patient users');

    // Create hospitals
    const hospital1 = await Hospital.create({
      name: 'City General Hospital',
      address: {
        street: '123 Main Street',
        city: 'Trincomalee',
        state: 'Eastern',
        zipCode: '31000',
        country: 'Sri Lanka'
      },
      contact: {
        phone: '0262222222',
        email: 'info@citygeneral.com'
      },
      facilities: ['Emergency', 'ICU', 'X-Ray', 'Laboratory', 'Pharmacy'],
      operatingHours: {
        weekdays: { open: '06:00', close: '22:00' },
        weekends: { open: '08:00', close: '20:00' }
      },
      coordinates: {
        latitude: 8.5874,
        longitude: 81.2152
      }
    });

    const hospital2 = await Hospital.create({
      name: 'Apollo Hospitals',
      address: {
        street: '456 Healthcare Avenue',
        city: 'Battaramulla',
        state: 'Western',
        zipCode: '10120',
        country: 'Sri Lanka'
      },
      contact: {
        phone: '0112345678',
        email: 'info@apollo.lk'
      },
      facilities: ['Emergency', 'ICU', 'MRI', 'CT Scan', 'Laboratory'],
      operatingHours: {
        weekdays: { open: '00:00', close: '23:59' },
        weekends: { open: '00:00', close: '23:59' },
        is24x7: true
      },
      coordinates: {
        latitude: 6.8964,
        longitude: 79.8842
      }
    });
    console.log('Created hospitals');

    // Create doctor users 
    const doctorUsers = await User.insertMany([
      {
        name: 'Dr. Sarah Smith',
        email: 'doctor@demo.com',
        password: 'password123', 
        phone: '0771234567',
        role: 'doctor'
      },
      {
        name: 'Dr. Michael Johnson',
        email: 'michael@demo.com',
        password: 'password123', 
        phone: '0772345678',
        role: 'doctor'
      },
      {
        name: 'Dr. Emily Brown',
        email: 'emily@demo.com',
        password: 'password123', 
        phone: '0773456789',
        role: 'doctor'
      },
      {
        name: 'Dr. David Wilson',
        email: 'david@demo.com',
        password: 'password123', 
        phone: '0774567890',
        role: 'doctor'
      }
    ]);
    console.log('Created doctor users');

    // Create doctor profiles
    const doctors = await Doctor.insertMany([
      {
        userId: doctorUsers[0]._id,
        specialization: 'Cardiology',
        experience: 10,
        licenseNumber: 'SLMC123456',
        hospitals: [hospital1._id, hospital2._id],
        consultationFees: {
          physical: 3500,
          online: 2500
        },
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
          { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
        ],
        rating: 4.8,
        totalRatings: 45,
        isVerified: true,
        bio: 'Experienced cardiologist with 10+ years of practice in treating heart conditions. Specialized in interventional cardiology and preventive heart care.',
        qualifications: [
          { degree: 'MBBS', institution: 'University of Colombo', year: 2010 },
          { degree: 'MD Cardiology', institution: 'University of Peradeniya', year: 2014 }
        ],
        reviews: [
          {
            patientId: patient1._id,
            rating: 5,
            comment: 'Excellent doctor! Very thorough and caring.',
            date: new Date('2024-01-15')
          },
          {
            patientId: patient2._id,
            rating: 4,
            comment: 'Great experience. Doctor explained everything clearly.',
            date: new Date('2024-02-10')
          }
        ]
      },
      {
        userId: doctorUsers[1]._id,
        specialization: 'Dermatology',
        experience: 8,
        licenseNumber: 'SLMC789012',
        hospitals: [hospital1._id],
        consultationFees: {
          physical: 3000,
          online: 2000
        },
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Saturday', startTime: '10:00', endTime: '14:00', isAvailable: false },
          { day: 'Sunday', startTime: '10:00', endTime: '14:00', isAvailable: false }
        ],
        rating: 4.6,
        totalRatings: 32,
        isVerified: true,
        bio: 'Dermatologist specializing in skin disorders, cosmetic dermatology, and laser treatments.',
        qualifications: [
          { degree: 'MBBS', institution: 'University of Sri Jayewardenepura', year: 2012 },
          { degree: 'MD Dermatology', institution: 'University of Kelaniya', year: 2016 }
        ]
      },
      {
        userId: doctorUsers[2]._id,
        specialization: 'Pediatrics',
        experience: 12,
        licenseNumber: 'SLMC345678',
        hospitals: [hospital2._id],
        consultationFees: {
          physical: 2800,
          online: 1800
        },
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Saturday', startTime: '08:00', endTime: '12:00', isAvailable: true },
          { day: 'Sunday', startTime: '08:00', endTime: '12:00', isAvailable: false }
        ],
        rating: 4.9,
        totalRatings: 67,
        isVerified: true,
        bio: 'Pediatrician with expertise in child development, vaccination, and adolescent medicine.',
        qualifications: [
          { degree: 'MBBS', institution: 'University of Ruhuna', year: 2008 },
          { degree: 'MD Pediatrics', institution: 'University of Colombo', year: 2012 }
        ]
      },
      {
        userId: doctorUsers[3]._id,
        specialization: 'General Medicine',
        experience: 6,
        licenseNumber: 'SLMC901234',
        hospitals: [hospital1._id],
        consultationFees: {
          physical: 2500,
          online: 1500
        },
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
          { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
        ],
        rating: 4.4,
        totalRatings: 28,
        isVerified: true,
        bio: 'General physician providing comprehensive primary healthcare services.',
        qualifications: [
          { degree: 'MBBS', institution: 'University of Peradeniya', year: 2016 }
        ]
      }
    ]);

    console.log('Sample data created successfully!');
    console.log('\n Login credentials:');
    console.log(' Admin: admin@demo.com / password123');
    console.log(' Doctor: doctor@demo.com / password123');
    console.log('👨 Patient: patient@demo.com / password123');
    console.log('\n Summary:');
    console.log(`- ${doctorUsers.length} doctors created`);
    console.log(`- 2 patients created`);
    console.log(`- 2 hospitals created`);
    console.log(`- 1 admin created`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    console.log('Error details:', error.message);
    process.exit(1);
  }
};

seedData();