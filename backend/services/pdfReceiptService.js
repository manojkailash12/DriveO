import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load logo as base64
let logoBase64 = '';
try {
  const logoPath = path.join(__dirname, '../assets/driveo-logo.png');
  const logoBuffer = await fs.readFile(logoPath);
  logoBase64 = logoBuffer.toString('base64');
} catch (error) {
  console.warn('Logo not found, using text only');
}

/**
 * Enhanced PDF Receipt Service for Car Rental Bookings
 * Generates professional PDF receipts with booking details
 */
export class PDFReceiptService {
  constructor() {
    this.pdfDirectory = path.join(__dirname, '../offline-pdfs');
    this.ensurePdfDirectory();
  }

  async ensurePdfDirectory() {
    try {
      await fs.access(this.pdfDirectory);
    } catch (error) {
      await fs.mkdir(this.pdfDirectory, { recursive: true });
    }
  }

  /**
   * Generate PDF receipt for booking
   */
  async generateBookingReceipt(bookingDetails, vehicleDetails, userDetails) {
    let browser;
    try {
      console.log("Starting PDF receipt generation...");
      
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      const htmlContent = this.generateReceiptHTML(bookingDetails, vehicleDetails, userDetails);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      // Save PDF to file system
      const fileName = `receipt_${bookingDetails.bookingId || bookingDetails._id}_${Date.now()}.pdf`;
      const filePath = path.join(this.pdfDirectory, fileName);
      
      await fs.writeFile(filePath, pdfBuffer);
      
      console.log(`PDF receipt generated successfully: ${fileName}`);
      
      return {
        success: true,
        fileName,
        filePath,
        buffer: pdfBuffer
      };
      
    } catch (error) {
      console.error('Error generating PDF receipt:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML content for the receipt
   */
  generateReceiptHTML(bookingDetails, vehicleDetails, userDetails) {
    const pickupDate = new Date(bookingDetails.pickupDate);
    const dropOffDate = new Date(bookingDetails.dropOffDate || bookingDetails.dropoffDate);
    const bookingDate = new Date(bookingDetails.createdAt || Date.now());
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Booking Receipt - ${bookingDetails.bookingId || 'DriveO'}</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f8f9fa;
              }
              
              .receipt-container {
                  max-width: 800px;
                  margin: 20px auto;
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                  overflow: hidden;
              }
              
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
              }
              
              .company-name {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 15px;
                  font-size: 36px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              
              .company-logo {
                  width: 50px;
                  height: 50px;
                  object-fit: contain;
              }
              
              .receipt-title {
                  font-size: 20px;
                  opacity: 0.9;
                  margin-bottom: 5px;
              }
              
              .receipt-number {
                  font-size: 16px;
                  opacity: 0.8;
                  font-weight: normal;
              }
              
              .content {
                  padding: 40px;
              }
              
              .info-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                  gap: 30px;
              }
              
              .info-block {
                  flex: 1;
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #667eea;
              }
              
              .info-block h3 {
                  color: #667eea;
                  font-size: 16px;
                  margin-bottom: 15px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .info-item {
                  margin-bottom: 8px;
                  display: flex;
                  justify-content: space-between;
              }
              
              .info-label {
                  font-weight: 600;
                  color: #555;
                  min-width: 120px;
              }
              
              .info-value {
                  color: #333;
                  text-align: right;
              }
              
              .trip-details {
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                  color: white;
                  padding: 25px;
                  border-radius: 10px;
                  margin: 30px 0;
              }
              
              .trip-details h3 {
                  font-size: 20px;
                  margin-bottom: 20px;
                  text-align: center;
              }
              
              .trip-route {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 15px;
              }
              
              .location {
                  text-align: center;
                  flex: 1;
              }
              
              .location-name {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 5px;
              }
              
              .location-date {
                  font-size: 14px;
                  opacity: 0.9;
              }
              
              .route-arrow {
                  font-size: 24px;
                  margin: 0 20px;
              }
              
              .vehicle-section {
                  background: #e8f5e8;
                  padding: 25px;
                  border-radius: 10px;
                  margin: 30px 0;
                  border: 2px solid #4caf50;
              }
              
              .vehicle-section h3 {
                  color: #2e7d32;
                  font-size: 20px;
                  margin-bottom: 20px;
                  text-align: center;
              }
              
              .vehicle-details {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 15px;
              }
              
              .cost-breakdown {
                  background: #fff3cd;
                  border: 2px solid #ffc107;
                  border-radius: 10px;
                  padding: 25px;
                  margin: 30px 0;
              }
              
              .cost-breakdown h3 {
                  color: #856404;
                  font-size: 20px;
                  margin-bottom: 20px;
                  text-align: center;
              }
              
              .cost-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #f0f0f0;
              }
              
              .cost-item:last-child {
                  border-bottom: none;
                  font-weight: bold;
                  font-size: 18px;
                  color: #2e7d32;
                  border-top: 2px solid #2e7d32;
                  padding-top: 15px;
                  margin-top: 10px;
              }
              
              .payment-info {
                  background: #e3f2fd;
                  border: 2px solid #2196f3;
                  border-radius: 10px;
                  padding: 25px;
                  margin: 30px 0;
              }
              
              .payment-info h3 {
                  color: #1565c0;
                  font-size: 20px;
                  margin-bottom: 20px;
                  text-align: center;
              }
              
              .status-badge {
                  display: inline-block;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .status-confirmed {
                  background: #4caf50;
                  color: white;
              }
              
              .status-pending {
                  background: #ff9800;
                  color: white;
              }
              
              .footer {
                  background: #f8f9fa;
                  padding: 30px;
                  text-align: center;
                  border-top: 1px solid #e0e0e0;
              }
              
              .footer-text {
                  color: #666;
                  font-size: 14px;
                  margin-bottom: 10px;
              }
              
              .contact-info {
                  color: #667eea;
                  font-weight: 600;
              }
              
              .terms {
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  font-size: 12px;
                  color: #888;
                  line-height: 1.4;
              }
              
              @media print {
                  body {
                      background-color: white;
                  }
                  
                  .receipt-container {
                      box-shadow: none;
                      margin: 0;
                  }
              }
          </style>
      </head>
      <body>
          <div class="receipt-container">
              <div class="header">
                  <div class="company-name">
                      <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" class="company-logo" />
                      <span>DriveO</span>
                  </div>
                  <div class="receipt-title">Booking Receipt</div>
                  <div class="receipt-number">Receipt #${bookingDetails.bookingId || `BK${bookingDetails._id?.slice(-6) || '000000'}`}</div>
              </div>
              
              <div class="content">
                  <div class="info-section">
                      <div class="info-block">
                          <h3>Customer Details</h3>
                          <div class="info-item">
                              <span class="info-label">Name:</span>
                              <span class="info-value">${userDetails?.name || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Email:</span>
                              <span class="info-value">${userDetails?.email || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Phone:</span>
                              <span class="info-value">${userDetails?.phone || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Address:</span>
                              <span class="info-value">${userDetails?.address || 'N/A'}</span>
                          </div>
                      </div>
                      
                      <div class="info-block">
                          <h3>Booking Information</h3>
                          <div class="info-item">
                              <span class="info-label">Booking ID:</span>
                              <span class="info-value">${bookingDetails.bookingId || `BK${bookingDetails._id?.slice(-6) || '000000'}`}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Booking Date:</span>
                              <span class="info-value">${bookingDate.toLocaleDateString('en-IN')}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Duration:</span>
                              <span class="info-value">${bookingDetails.totalDays || 1} days</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Status:</span>
                              <span class="info-value">
                                  <span class="status-badge ${bookingDetails.bookingStatus === 'Confirmed' ? 'status-confirmed' : 'status-pending'}">
                                      ${bookingDetails.bookingStatus || 'Pending'}
                                  </span>
                              </span>
                          </div>
                      </div>
                  </div>
                  
                  <div class="trip-details">
                      <h3>Trip Details</h3>
                      <div class="trip-route">
                          <div class="location">
                              <div class="location-name">${bookingDetails.pickupLocation || 'N/A'}</div>
                              <div class="location-date">${pickupDate.toLocaleDateString('en-IN')} at ${bookingDetails.pickupTime || '10:00'}</div>
                              <div style="font-size: 12px; margin-top: 5px;">Pickup Location</div>
                          </div>
                          <div class="route-arrow">→</div>
                          <div class="location">
                              <div class="location-name">${bookingDetails.dropoffLocation || bookingDetails.dropOffLocation || 'N/A'}</div>
                              <div class="location-date">${dropOffDate.toLocaleDateString('en-IN')} at ${bookingDetails.dropoffTime || bookingDetails.dropOffTime || '10:00'}</div>
                              <div style="font-size: 12px; margin-top: 5px;">Drop-off Location</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="vehicle-section">
                      <h3>Vehicle Information</h3>
                      <div class="vehicle-details">
                          <div class="info-item">
                              <span class="info-label">Vehicle:</span>
                              <span class="info-value">${vehicleDetails?.company || 'N/A'} ${vehicleDetails?.name || vehicleDetails?.model || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Model:</span>
                              <span class="info-value">${vehicleDetails?.model || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Seating:</span>
                              <span class="info-value">${vehicleDetails?.seat || 'N/A'} Seater</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Fuel Type:</span>
                              <span class="info-value">${vehicleDetails?.fuel_type || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Transmission:</span>
                              <span class="info-value">${vehicleDetails?.transmition_type || 'N/A'}</span>
                          </div>
                          <div class="info-item">
                              <span class="info-label">Registration:</span>
                              <span class="info-value">${vehicleDetails?.registeration_number || 'N/A'}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div class="cost-breakdown">
                      <h3>Cost Breakdown</h3>
                      <div class="cost-item">
                          <span>Base Rental (${bookingDetails.totalDays || 1} days × ₹${vehicleDetails?.price || 0})</span>
                          <span>₹${(bookingDetails.totalDays || 1) * (vehicleDetails?.price || 0)}</span>
                      </div>
                      <div class="cost-item">
                          <span>Service Fee</span>
                          <span>₹50</span>
                      </div>
                      ${bookingDetails.discount ? `
                      <div class="cost-item">
                          <span>Discount</span>
                          <span>-₹${bookingDetails.discount}</span>
                      </div>
                      ` : ''}
                      <div class="cost-item">
                          <span>Total Amount</span>
                          <span>₹${bookingDetails.totalAmount || 0}</span>
                      </div>
                  </div>
                  
                  <div class="payment-info">
                      <h3>Payment Information</h3>
                      <div class="info-item">
                          <span class="info-label">Payment Method:</span>
                          <span class="info-value">${bookingDetails.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Payment Status:</span>
                          <span class="info-value">
                              <span class="status-badge ${bookingDetails.paymentStatus === 'Paid' ? 'status-confirmed' : 'status-pending'}">
                                  ${bookingDetails.paymentStatus || (bookingDetails.paymentMethod === 'online' ? 'Paid' : 'Pending')}
                              </span>
                          </span>
                      </div>
                      ${bookingDetails.transactionId ? `
                      <div class="info-item">
                          <span class="info-label">Transaction ID:</span>
                          <span class="info-value">${bookingDetails.transactionId}</span>
                      </div>
                      ` : ''}
                  </div>
              </div>
              
              <div class="footer">
                  <div class="footer-text">Thank you for choosing DriveO!</div>
                  <div class="contact-info">
                      Email: support@driveo.com | Phone: +91-9876543210
                  </div>
                  <div class="terms">
                      <strong>Terms & Conditions:</strong><br>
                      • Valid driving license required at the time of pickup<br>
                      • Vehicle must be returned in the same condition<br>
                      • Late return charges: ₹100 per hour<br>
                      • Fuel should be at the same level as pickup<br>
                      • Any damages will be charged separately<br>
                      • Cancellation allowed up to 24 hours before pickup
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Clean up old PDF files (older than 30 days)
   */
  async cleanupOldPDFs() {
    try {
      const files = await fs.readdir(this.pdfDirectory);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.pdfDirectory, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < thirtyDaysAgo) {
            await fs.unlink(filePath);
            console.log(`Cleaned up old PDF: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old PDFs:', error);
    }
  }

  /**
   * Get PDF file path
   */
  getPDFPath(fileName) {
    return path.join(this.pdfDirectory, fileName);
  }

  /**
   * Check if PDF exists
   */
  async pdfExists(fileName) {
    try {
      await fs.access(path.join(this.pdfDirectory, fileName));
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const pdfReceiptService = new PDFReceiptService();

// Export the service and main function
export default pdfReceiptService;

export const generateBookingReceipt = (bookingDetails, vehicleDetails, userDetails) => {
  return pdfReceiptService.generateBookingReceipt(bookingDetails, vehicleDetails, userDetails);
};

// Auto-cleanup old PDFs on service start (disabled for serverless)
// pdfReceiptService.cleanupOldPDFs();