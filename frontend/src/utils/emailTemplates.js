// Email Templates for Appointment Confirmations
// These templates can be used by the backend email service

export const appointmentConfirmationTemplate = (data) => {
  const {
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    consultationType,
    amount,
    paymentId,
    appointmentId,
    receiptNumber
  } = data;

  return {
    subject: 'Appointment Confirmed - MediLink Healthcare',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px 20px; }
        .success-badge { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px; border-left: 4px solid #28a745; }
        .details-card { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e9ecef; }
        .details-title { font-size: 18px; font-weight: 600; color: #495057; margin-bottom: 15px; display: flex; align-items: center; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6c757d; font-weight: 500; }
        .detail-value { font-weight: 600; color: #495057; }
        .payment-amount { color: #28a745; font-size: 18px; font-weight: bold; }
        .next-steps { background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .next-steps h3 { color: #1976d2; margin-top: 0; }
        .next-steps ul { margin: 0; padding-left: 20px; }
        .next-steps li { margin: 5px 0; color: #1565c0; }
        .footer { background-color: #495057; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
        .contact-info { font-size: 14px; opacity: 0.9; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .button:hover { background-color: #0056b3; }
        .receipt-info { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .receipt-info strong { color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MediLink Healthcare</h1>
            <p>Your Health, Our Priority</p>
        </div>
        
        <div class="content">
            <div class="success-badge">
                <strong>✅ Appointment Confirmed Successfully!</strong>
            </div>
            
            <p>Dear <strong>${patientName}</strong>,</p>
            
            <p>Great news! Your appointment has been successfully confirmed and payment has been processed. Here are your appointment details:</p>
            
            <div class="details-card">
                <div class="details-title">
                    📅 Appointment Information
                </div>
                <div class="detail-row">
                    <span class="detail-label">Doctor:</span>
                    <span class="detail-value">Dr. ${doctorName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${appointmentTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${consultationType === 'online' ? '💻 Online Consultation' : '🏥 Physical Consultation'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Appointment ID:</span>
                    <span class="detail-value">${appointmentId}</span>
                </div>
            </div>
            
            <div class="details-card">
                <div class="details-title">
                    💳 Payment Information
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value payment-amount">LKR ${amount?.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value" style="color: #28a745;">✅ Confirmed</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Receipt Number:</span>
                    <span class="detail-value">${receiptNumber}</span>
                </div>
            </div>
            
            <div class="receipt-info">
                <strong>📄 Receipt Available:</strong> You can download your payment receipt from your patient dashboard at any time.
            </div>
            
            <div class="next-steps">
                <h3>📋 What's Next?</h3>
                <ul>
                    <li>You'll receive a reminder 24 hours before your appointment</li>
                    <li>${consultationType === 'online' 
                        ? 'Video consultation link will be sent 30 minutes before your appointment' 
                        : 'Please arrive 15 minutes early at the hospital'}</li>
                    <li>Download your receipt from the patient dashboard</li>
                    <li>Prepare any medical documents or previous reports</li>
                    <li>Note down any questions you'd like to ask the doctor</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
                    View Dashboard
                </a>
            </div>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
                <p><strong>Need to reschedule or cancel?</strong></p>
                <p>You can manage your appointments from your dashboard. Please note that cancellations must be made at least 2 hours before the scheduled time.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>MediLink Healthcare</strong></p>
            <div class="contact-info">
                <p>📧 Email: support@medilink.com | 📞 Phone: +94 11 234 5678</p>
                <p>🌐 Website: www.medilink.com</p>
                <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `,
    text: `
APPOINTMENT CONFIRMATION - MediLink Healthcare

Dear ${patientName},

Your appointment has been successfully confirmed!

APPOINTMENT DETAILS:
- Doctor: Dr. ${doctorName}
- Date: ${new Date(appointmentDate).toLocaleDateString()}
- Time: ${appointmentTime}
- Type: ${consultationType}
- Appointment ID: ${appointmentId}

PAYMENT INFORMATION:
- Amount Paid: LKR ${amount?.toLocaleString()}
- Payment ID: ${paymentId}
- Receipt Number: ${receiptNumber}
- Status: Confirmed

WHAT'S NEXT:
- You'll receive a reminder 24 hours before your appointment
- ${consultationType === 'online' 
    ? 'Video consultation link will be sent 30 minutes before your appointment' 
    : 'Please arrive 15 minutes early at the hospital'}
- Download your receipt from the patient dashboard

Thank you for choosing MediLink Healthcare!

Contact: support@medilink.com | +94 11 234 5678
Website: www.medilink.com
    `
  };
};

export const appointmentReminderTemplate = (data) => {
  const {
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    consultationType,
    appointmentId
  } = data;

  return {
    subject: 'Appointment Reminder - Tomorrow at ' + appointmentTime,
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .reminder-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .appointment-details { background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🔔 Appointment Reminder</h2>
        
        <div class="reminder-box">
            <strong>Don't forget!</strong> You have an appointment tomorrow.
        </div>
        
        <p>Dear ${patientName},</p>
        
        <p>This is a friendly reminder about your upcoming appointment:</p>
        
        <div class="appointment-details">
            <strong>Doctor:</strong> Dr. ${doctorName}<br>
            <strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}<br>
            <strong>Time:</strong> ${appointmentTime}<br>
            <strong>Type:</strong> ${consultationType}<br>
            <strong>Appointment ID:</strong> ${appointmentId}
        </div>
        
        ${consultationType === 'online' 
            ? '<p><strong>For online consultations:</strong> You\'ll receive the video link 30 minutes before your appointment.</p>'
            : '<p><strong>For physical consultations:</strong> Please arrive 15 minutes early at the hospital.</p>'
        }
        
        <p>If you need to reschedule or cancel, please do so at least 2 hours before your appointment time.</p>
        
        <p>Thank you,<br>MediLink Healthcare Team</p>
    </div>
</body>
</html>
    `,
    text: `
APPOINTMENT REMINDER

Dear ${patientName},

Don't forget! You have an appointment tomorrow.

APPOINTMENT DETAILS:
- Doctor: Dr. ${doctorName}
- Date: ${new Date(appointmentDate).toLocaleDateString()}
- Time: ${appointmentTime}
- Type: ${consultationType}
- Appointment ID: ${appointmentId}

${consultationType === 'online' 
    ? 'For online consultations: You\'ll receive the video link 30 minutes before your appointment.'
    : 'For physical consultations: Please arrive 15 minutes early at the hospital.'
}

If you need to reschedule or cancel, please do so at least 2 hours before your appointment time.

Thank you,
MediLink Healthcare Team
    `
  };
};

// Usage example for backend:
/*
const emailData = {
  patientName: 'John Doe',
  doctorName: 'Sarah Wilson',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00 AM',
  consultationType: 'online',
  amount: 1500,
  paymentId: 'PAY_123456789',
  appointmentId: 'APT_987654321',
  receiptNumber: 'REC-123456'
};

const emailTemplate = appointmentConfirmationTemplate(emailData);

// Send email using your preferred email service
await emailService.send({
  to: patientEmail,
  subject: emailTemplate.subject,
  html: emailTemplate.html,
  text: emailTemplate.text
});
*/