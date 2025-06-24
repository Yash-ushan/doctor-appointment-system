// Debug endpoint for testing PDF generation
// @route   POST /api/debug/test-pdf
// @access  Public (for debugging)
const testPDFGeneration = async (req, res) => {
  try {
    console.log('🧪 Testing PDF Generation...');
    
    const path = require('path');
    const { generateInvoicePDF } = require('../utils/pdfGenerator');
    
    // Create test data
    const testInvoice = {
      _id: 'test-invoice-' + Date.now(),
      invoiceNumber: 'TEST-INV-001',
      createdAt: new Date(),
      subtotal: 1800,
      totalAmount: 1800,
      tax: 0,
      discount: 0,
      status: 'paid',
      items: [{
        description: 'Test Medical Consultation',
        quantity: 1,
        unitPrice: 1800,
        total: 1800
      }]
    };
    
    const testAppointment = {
      patientId: {
        name: 'John Doe Test',
        email: 'test@example.com',
        phone: '+94771234567'
      },
      consultationType: 'General Consultation'
    };
    
    const testDoctor = {
      userId: {
        name: 'Dr. Jane Smith'
      },
      specialization: 'General Medicine',
      experience: 10
    };
    
    console.log('📝 Generating test PDF...');
    
    // Test PDF generation
    const pdfPath = await generateInvoicePDF(testInvoice, testAppointment, testDoctor);
    
    console.log('✅ Test PDF generated at:', pdfPath);
    
    // Check if file exists
    const fs = require('fs');
    const fileExists = fs.existsSync(pdfPath);
    const fileSize = fileExists ? fs.statSync(pdfPath).size : 0;
    
    console.log('📊 File check:', { fileExists, fileSize });
    
    res.json({
      success: true,
      message: 'PDF generation test completed',
      results: {
        pdfPath,
        fileExists,
        fileSize,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
    res.status(500).json({
      success: false,
      message: 'PDF generation test failed: ' + error.message,
      error: error.stack
    });
  }
};

// Debug endpoint for checking PDF directories
// @route   GET /api/debug/pdf-directories
// @access  Public (for debugging)
const checkPDFDirectories = async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const invoicesDir = path.join(uploadsDir, 'invoices');
    const confirmationsDir = path.join(uploadsDir, 'confirmations');
    const receiptsDir = path.join(uploadsDir, 'receipts');
    
    const checkDir = (dirPath) => {
      try {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          return { exists: false, created: true, files: [] };
        }
        
        const files = fs.readdirSync(dirPath);
        const fileDetails = files.map(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        });
        
        return { 
          exists: true, 
          created: false, 
          files: fileDetails,
          count: files.length 
        };
      } catch (error) {
        return { 
          exists: false, 
          created: false, 
          error: error.message,
          files: [] 
        };
      }
    };
    
    const directoryStatus = {
      uploads: checkDir(uploadsDir),
      invoices: checkDir(invoicesDir),
      confirmations: checkDir(confirmationsDir),
      receipts: checkDir(receiptsDir)
    };
    
    console.log('📁 Directory Status:', directoryStatus);
    
    res.json({
      success: true,
      directoryStatus,
      paths: {
        uploads: uploadsDir,
        invoices: invoicesDir,
        confirmations: confirmationsDir,
        receipts: receiptsDir
      }
    });
    
  } catch (error) {
    console.error('❌ Directory check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Directory check failed: ' + error.message
    });
  }
};

module.exports = {
  testPDFGeneration,
  checkPDFDirectories
};