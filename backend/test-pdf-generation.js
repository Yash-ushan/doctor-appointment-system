// Simple PDF test to verify PDFKit is working
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PDF Generation...');

try {
  const doc = new PDFDocument();
  const testDir = path.join(__dirname, 'test-pdf');
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const filepath = path.join(testDir, 'test-receipt.pdf');
  
  doc.pipe(fs.createWriteStream(filepath));
  
  // Simple test content
  doc.fontSize(20).text('PDF Generation Test', 50, 50);
  doc.fontSize(12).text('If you can see this, PDF generation is working!', 50, 100);
  doc.text('Date: ' + new Date().toLocaleString(), 50, 130);
  
  doc.end();
  
  doc.on('end', () => {
    console.log('✅ PDF test successful! File created at:', filepath);
    process.exit(0);
  });
  
  doc.on('error', (err) => {
    console.error('❌ PDF test failed:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ PDF test error:', error);
  process.exit(1);
}