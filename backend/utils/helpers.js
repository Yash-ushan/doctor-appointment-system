const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for display
const formatTime = (time) => {
  const [hour, minute] = time.split(':');
  const hr = parseInt(hour);
  const period = hr >= 12 ? 'PM' : 'AM';
  const displayHour = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${displayHour}:${minute} ${period}`;
};

// Generate time slots
const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  while (start < end) {
    const timeString = start.toTimeString().slice(0, 5);
    slots.push(timeString);
    start.setMinutes(start.getMinutes() + duration);
  }
  
  return slots;
};

// Check if time slot is available
const isSlotAvailable = (appointments, date, time) => {
  return !appointments.some(appointment => 
    appointment.appointmentDate.toDateString() === new Date(date).toDateString() &&
    appointment.appointmentTime === time &&
    appointment.status !== 'cancelled'
  );
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Validate appointment date (should be in future)
const isValidAppointmentDate = (date) => {
  const appointmentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);
  return appointmentDate >= today;
};

// Generate unique appointment ID
const generateAppointmentId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `APT${timestamp}${randomStr}`.toUpperCase();
};

module.exports = {
  generateToken,
  formatDate,
  formatTime,
  generateTimeSlots,
  isSlotAvailable,
  calculateAge,
  isValidAppointmentDate,
  generateAppointmentId
};