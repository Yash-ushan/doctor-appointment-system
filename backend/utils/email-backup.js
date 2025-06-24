const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME || 'Doctor Appointment System'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent: ' + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Appointment confirmation email template
const appointmentConfirmationEmail = (appointmentData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmation</h2>
      <p>Dear ${appointmentData.patientName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> Dr. ${appointmentData.doctorName}</p>
        <p><strong>Specialization:</strong> ${appointmentData.specialization}</p>
        <p><strong>Date:</strong> ${appointmentData.date}</p>
        <p><strong>Time:</strong> ${appointmentData.time}</p>
        <p><strong>Type:</strong> ${appointmentData.type}</p>
        ${appointmentData.hospital ? `<p><strong>Hospital:</strong> ${appointmentData.hospital}</p>` : ''}
        <p><strong>Fee:</strong> LKR ${appointmentData.fee}</p>
      </div>
      <p>Please arrive 15 minutes before your scheduled appointment time.</p>
      <p>Thank you for choosing our service!</p>
      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply to this email.
      </p>
    </div>
  `;
};

// Appointment reminder email template
const appointmentReminderEmail = (appointmentData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Appointment Reminder</h2>
      <p>Dear ${appointmentData.patientName},</p>
      <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> Dr. ${appointmentData.doctorName}</p>
        <p><strong>Date:</strong> ${appointmentData.date}</p>
        <p><strong>Time:</strong> ${appointmentData.time}</p>
        <p><strong>Type:</strong> ${appointmentData.type}</p>
        ${appointmentData.hospital ? `<p><strong>Hospital:</strong> ${appointmentData.hospital}</p>` : ''}
      </div>
      <p>Please ensure you arrive on time for your appointment.</p>
      <p>Thank you!</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  appointmentConfirmationEmail,
  appointmentReminderEmail
};