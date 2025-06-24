const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `${process.env.FROM_NAME || 'MediLink Healthcare'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    console.log('📧 Attempting to send email to:', options.email);
    const info = await transporter.sendMail(message);
    console.log('✅ Email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
// Appointment confirmation email template
const appointmentConfirmationEmail = (appointmentData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🏥 MediLink Healthcare</h1>
        <h2 style="margin: 10px 0 0 0;">Appointment Confirmation</h2>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h3 style="color: #333; margin-bottom: 20px;">Dear ${appointmentData.patientName},</h3>
        
        <p style="color: #666; line-height: 1.6;">
          Your appointment has been confirmed with the following details:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${appointmentData.doctorName}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.date}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.time}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.type}</td></tr>
            ${appointmentData.hospital ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Hospital:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.hospital}</td></tr>` : ''}
            <tr><td style="padding: 8px 0;"><strong>Fee:</strong></td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">LKR ${appointmentData.fee}</td></tr>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h4 style="color: #333; margin-top: 0;">📋 Important Information</h4>
          <p style="margin: 5px 0; color: #666;">Please arrive 15 minutes before your scheduled appointment time.</p>
          <p style="margin: 5px 0; color: #666;">Appointment ID: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${appointmentData.appointmentId || 'N/A'}</code></p>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Thank you for choosing MediLink Healthcare!</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `;
};
// Payment confirmation email template  
const paymentConfirmationEmail = (paymentData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🏥 MediLink Healthcare</h1>
        <h2 style="margin: 10px 0 0 0;">Payment Confirmed!</h2>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h3 style="color: #333; margin-bottom: 20px;">Dear ${paymentData.patientName},</h3>
        
        <p style="color: #666; line-height: 1.6;">
          Your payment has been successfully processed and your appointment has been confirmed.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${paymentData.doctorName}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentData.appointmentDate}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentData.appointmentTime}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentData.consultationType}</td></tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="color: #333; margin-top: 0;">💳 Payment Information</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #28a745; font-weight: bold;">LKR ${paymentData.amount}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentData.paymentId}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Status:</strong></td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">✅ Confirmed</td></tr>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h4 style="color: #333; margin-top: 0;">✅ Next Steps</h4>
          <p style="margin: 5px 0; color: #666;">• You'll receive a reminder 24 hours before your appointment</p>
          <p style="margin: 5px 0; color: #666;">• Please arrive 15 minutes early</p>
          <p style="margin: 5px 0; color: #666;">• Bring any relevant medical documents</p>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Thank you for choosing MediLink Healthcare!</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
      </div>
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

// Invoice email template
const invoiceEmail = (invoiceData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Invoice</h2>
      <p>Dear ${invoiceData.patientName},</p>
      <p>Please find your invoice attached for the recent appointment.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
        <p><strong>Amount:</strong> LKR ${invoiceData.amount}</p>
        <p><strong>Date:</strong> ${invoiceData.date}</p>
      </div>
      <p>Thank you for your business!</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  testEmailConfig,
  appointmentConfirmationEmail,
  paymentConfirmationEmail,
  appointmentReminderEmail,
  invoiceEmail
};// Enhanced appointment confirmation email with better error handling
const sendAppointmentConfirmationEmail = async (appointmentData) => {
  try {
    console.log('📧 Preparing appointment confirmation email for:', appointmentData.patientEmail);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏥 ${process.env.FROM_NAME || 'MediLink Healthcare'}</h1>
          <h2 style="margin: 10px 0 0 0;">Appointment Confirmed!</h2>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h3 style="color: #333; margin-bottom: 20px;">Dear ${appointmentData.patientName},</h3>
          
          <p style="color: #666; line-height: 1.6;">
            Your payment has been successfully processed and your appointment has been confirmed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">Dr. ${appointmentData.doctorName}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.appointmentDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.appointmentTime}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.consultationType}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Amount Paid:</strong></td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">LKR ${appointmentData.amount}</td></tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #333; margin-top: 0;">💳 Payment Confirmed</h4>
            <p style="margin: 5px 0; color: #666;">Payment Status: <span style="color: #28a745; font-weight: bold;">Completed</span></p>
            <p style="margin: 5px 0; color: #666;">Appointment ID: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${appointmentData.appointmentId}</code></p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #333; margin-top: 0;">📋 Important Reminders</h4>
            <p style="margin: 5px 0; color: #666;">• Please arrive 15 minutes before your scheduled appointment time</p>
            <p style="margin: 5px 0; color: #666;">• Bring any relevant medical documents or previous reports</p>
            <p style="margin: 5px 0; color: #666;">• You'll receive a reminder 24 hours before your appointment</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for choosing ${process.env.FROM_NAME || 'MediLink Healthcare'}!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    `;

    const emailOptions = {
      email: appointmentData.patientEmail,
      subject: `Appointment Confirmed - ${appointmentData.doctorName} | ${appointmentData.appointmentDate}`,
      html: emailHtml
    };

    console.log('📤 Sending appointment confirmation email to:', appointmentData.patientEmail);
    const result = await sendEmail(emailOptions);
    
    if (result.success) {
      console.log('✅ Appointment confirmation email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send appointment confirmation email:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error in sendAppointmentConfirmationEmail:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  testEmailConfig,
  appointmentConfirmationEmail,
  paymentConfirmationEmail,
  appointmentReminderEmail,
  invoiceEmail,
  sendAppointmentConfirmationEmail  // Export the new function
};