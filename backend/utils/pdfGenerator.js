const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate Invoice PDF
const generateInvoicePDF = async (invoice, appointment, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const invoicesDir = path.join(__dirname, '../uploads/invoices');
      ensureDirectoryExists(invoicesDir);
      
      const filename = `invoice-${invoice._id}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 50);
      doc.fontSize(12).font('Helvetica').text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 95);
      
      // Clinic/Hospital Info
      doc.fontSize(14).font('Helvetica-Bold').text('DoctorCare Medical Center', 400, 50);
      doc.fontSize(10).font('Helvetica')
         .text('123 Health Street', 400, 70)
         .text('Colombo, Sri Lanka', 400, 85)
         .text('Phone: +94 11 123 4567', 400, 100)
         .text('Email: info@doctorcare.lk', 400, 115);

      // Patient Info
      doc.fontSize(14).font('Helvetica-Bold').text('Bill To:', 50, 150);
      doc.fontSize(10).font('Helvetica')
         .text(`${appointment.patientId.name}`, 50, 170)
         .text(`${appointment.patientId.email}`, 50, 185)
         .text(`${appointment.patientId.phone}`, 50, 200);

      // Doctor Info
      doc.fontSize(14).font('Helvetica-Bold').text('Service Provider:', 300, 150);
      doc.fontSize(10).font('Helvetica')
         .text(`Dr. ${doctor.userId.name}`, 300, 170)
         .text(`${doctor.specialization}`, 300, 185)
         .text(`${doctor.experience} years experience`, 300, 200);

      // Table Header
      const tableTop = 250;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Unit Price', 350, tableTop);
      doc.text('Total', 450, tableTop);
      
      // Draw line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Invoice Items
      let currentY = tableTop + 30;
      doc.fontSize(10).font('Helvetica');
      
      invoice.items.forEach(item => {
        doc.text(item.description, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY);
        doc.text(`LKR ${item.unitPrice.toFixed(2)}`, 350, currentY);
        doc.text(`LKR ${item.total.toFixed(2)}`, 450, currentY);
        currentY += 20;
      });

      // Totals
      const totalsY = currentY + 30;
      doc.moveTo(350, totalsY - 10).lineTo(550, totalsY - 10).stroke();
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Subtotal:', 350, totalsY);
      doc.text(`LKR ${invoice.subtotal.toFixed(2)}`, 450, totalsY);
      
      if (invoice.tax > 0) {
        doc.text('Tax:', 350, totalsY + 15);
        doc.text(`LKR ${invoice.tax.toFixed(2)}`, 450, totalsY + 15);
      }
      
      if (invoice.discount > 0) {
        doc.text('Discount:', 350, totalsY + 30);
        doc.text(`-LKR ${invoice.discount.toFixed(2)}`, 450, totalsY + 30);
      }
      
      doc.fontSize(12).font('Helvetica-Bold');
      const finalY = totalsY + (invoice.tax > 0 ? 45 : invoice.discount > 0 ? 45 : 15);
      doc.text('Total:', 350, finalY);
      doc.text(`LKR ${invoice.totalAmount.toFixed(2)}`, 450, finalY);

      // Payment Status
      doc.fontSize(14).font('Helvetica-Bold')
         .fillColor(invoice.status === 'paid' ? 'green' : 'red')
         .text(`Status: ${invoice.status.toUpperCase()}`, 50, finalY + 40);

      // Footer
      doc.fontSize(8).fillColor('gray')
         .text('Thank you for choosing DoctorCare Medical Center', 50, 700)
         .text('This is a computer generated invoice', 50, 715);

      doc.end();

      doc.on('end', () => {
        resolve(filepath);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
// Generate Booking Confirmation PDF
const generateBookingConfirmationPDF = async (appointment, doctor, payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const confirmationsDir = path.join(__dirname, '../uploads/confirmations');
      ensureDirectoryExists(confirmationsDir);
      
      const filename = `booking-${appointment._id}.pdf`;
      const filepath = path.join(confirmationsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(24).font('Helvetica-Bold').fillColor('blue').text('APPOINTMENT CONFIRMED', 50, 50);
      
      // Confirmation Details Box
      doc.rect(50, 100, 500, 300).stroke();
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor('black').text('Appointment Details', 70, 120);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Confirmation ID: ${appointment._id}`, 70, 150);
      doc.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 70, 170);
      doc.text(`Time: ${appointment.appointmentTime}`, 70, 190);
      doc.text(`Type: ${appointment.consultationType}`, 70, 210);
      
      doc.fontSize(14).font('Helvetica-Bold').text('Doctor Information', 70, 240);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: Dr. ${doctor.userId.name}`, 70, 260);
      doc.text(`Specialization: ${doctor.specialization}`, 70, 280);
      doc.text(`Experience: ${doctor.experience} years`, 70, 300);
      
      doc.fontSize(14).font('Helvetica-Bold').text('Patient Information', 70, 330);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: ${appointment.patientId.name}`, 70, 350);
      doc.text(`Email: ${appointment.patientId.email}`, 70, 370);
      
      // Payment Information
      if (payment) {
        doc.fontSize(14).font('Helvetica-Bold').text('Payment Information', 70, 420);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Amount Paid: LKR ${payment.amount.toFixed(2)}`, 70, 440);
        doc.text(`Payment ID: ${payment.paymentReference}`, 70, 460);
        doc.text(`Payment Date: ${new Date(payment.paymentDate).toLocaleString()}`, 70, 480);
      }

      // Hospital Information
      if (appointment.hospitalId) {
        doc.fontSize(14).font('Helvetica-Bold').text('Hospital Information', 70, 520);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Name: ${appointment.hospitalId.name}`, 70, 540);
        doc.text(`Address: ${appointment.hospitalId.address.street}, ${appointment.hospitalId.address.city}`, 70, 560);
        doc.text(`Phone: ${appointment.hospitalId.contact.phone}`, 70, 580);
      }

      // Important Notes
      doc.fontSize(14).font('Helvetica-Bold').fillColor('red').text('Important Notes:', 50, 620);
      doc.fontSize(10).font('Helvetica').fillColor('black');
      doc.text('• Please arrive 15 minutes before your appointment time', 50, 640);
      doc.text('• Bring a valid ID and any relevant medical records', 50, 655);
      doc.text('• For online consultations, ensure stable internet connection', 50, 670);
      doc.text('• Cancellations must be made at least 2 hours in advance', 50, 685);

      // Footer
      doc.fontSize(8).fillColor('gray')
         .text('Generated on: ' + new Date().toLocaleString(), 50, 720)
         .text('DoctorCare Medical Center - Your Health, Our Priority', 50, 735);

      doc.end();

      doc.on('end', () => {
        resolve(filepath);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
// Generate Appointment Receipt PDF
const generateAppointmentReceiptPDF = async (appointment, payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const receiptsDir = path.join(__dirname, '../uploads/receipts');
      ensureDirectoryExists(receiptsDir);
      
      const filename = `appointment-receipt-${appointment._id}.pdf`;
      const filepath = path.join(receiptsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header with green success color
      doc.fontSize(24).font('Helvetica-Bold').fillColor('green').text('✓ PAYMENT SUCCESSFUL', 50, 50);
      doc.fontSize(18).fillColor('black').text('Appointment Receipt', 50, 80);
      
      // Receipt Box
      doc.rect(50, 120, 500, 400).stroke();
      
      // Receipt Details
      doc.fontSize(14).font('Helvetica-Bold').text('Receipt Details', 70, 140);
      doc.fontSize(12).font('Helvetica');
      
      const receiptDate = new Date().toLocaleString();
      doc.text(`Receipt Date: ${receiptDate}`, 70, 165);
      doc.text(`Appointment ID: ${appointment._id}`, 70, 185);
      
      if (payment) {
        doc.text(`Payment Reference: ${payment.paymentReference || 'N/A'}`, 70, 205);
        doc.text(`Order ID: PAY-${payment._id}`, 70, 225);
      }
      
      // Appointment Information
      doc.fontSize(14).font('Helvetica-Bold').text('Appointment Information', 70, 260);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 70, 285);
      doc.text(`Time: ${appointment.appointmentTime}`, 70, 305);
      doc.text(`Type: ${appointment.consultationType}`, 70, 325);
      doc.text(`Status: ${appointment.status.toUpperCase()}`, 70, 345);
      
      // Patient Information
      doc.fontSize(14).font('Helvetica-Bold').text('Patient Information', 70, 380);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: ${appointment.patientId.name}`, 70, 405);
      doc.text(`Email: ${appointment.patientId.email}`, 70, 425);
      
      // Payment Information
      if (payment) {
        doc.fontSize(14).font('Helvetica-Bold').text('Payment Information', 70, 460);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Amount: LKR ${payment.amount.toFixed(2)}`, 70, 485);
        doc.text(`Payment Status: ${payment.paymentStatus.toUpperCase()}`, 70, 505);
        doc.text(`Payment Method: PayHere`, 70, 525);
      }
      
      // Success Message
      doc.fontSize(16).font('Helvetica-Bold').fillColor('green');
      doc.text('Thank you for your payment!', 50, 560);
      doc.text('Your appointment has been confirmed.', 50, 580);
      
      // Footer
      doc.fontSize(10).fillColor('gray');
      doc.text('This is a computer-generated receipt', 50, 720);
      doc.text('DoctorCare Medical Center - Your Health, Our Priority', 50, 735);

      doc.end();

      doc.on('end', () => {
        console.log('✅ PDF receipt generated:', filepath);
        resolve(filepath);
      });

      doc.on('error', (err) => {
        console.error('❌ PDF receipt generation failed:', err);
        reject(err);
      });
    } catch (error) {
      console.error('❌ PDF receipt error:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
  generateBookingConfirmationPDF,
  generateAppointmentReceiptPDF
};