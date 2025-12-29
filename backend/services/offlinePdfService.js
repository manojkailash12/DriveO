import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OFFLINE_PDF_DIR = path.join(__dirname, '../offline-pdfs');

// Ensure offline PDF directory exists
const ensurePdfDir = async () => {
  try {
    await fs.access(OFFLINE_PDF_DIR);
  } catch {
    await fs.mkdir(OFFLINE_PDF_DIR, { recursive: true });
  }
};

// Generate PDF without Puppeteer (HTML-based fallback)
export const generateOfflinePDF = async (bookingDetails, vehicleDetails, userDetails) => {
  try {
    await ensurePdfDir();
    
    const pickupDate = new Date(bookingDetails.pickupDate);
    const dropOffDate = new Date(bookingDetails.dropOffDate);
    const bookingDate = new Date(bookingDetails.createdAt);
    
    // Generate HTML content that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Invoice - ${bookingDetails.invoiceNumber}</title>
          <style>
              @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
              }
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                  line-height: 1.4;
              }
              .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 2px solid #333;
                  padding: 30px;
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 3px solid #333;
                  padding-bottom: 20px;
              }
              .company-name {
                  font-size: 36px;
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 5px;
              }
              .invoice-title {
                  font-size: 28px;
                  color: #666;
                  margin-bottom: 10px;
              }
              .offline-badge {
                  background-color: #e3f2fd;
                  color: #1976d2;
                  padding: 5px 15px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: bold;
                  display: inline-block;
                  margin-top: 10px;
              }
              .invoice-info {
                  display: table;
                  width: 100%;
                  margin-bottom: 30px;
              }
              .invoice-details, .customer-details {
                  display: table-cell;
                  width: 48%;
                  vertical-align: top;
                  padding-right: 20px;
              }
              .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 15px;
                  color: #333;
                  border-bottom: 2px solid #eee;
                  padding-bottom: 5px;
              }
              .detail-row {
                  margin-bottom: 10px;
                  border-bottom: 1px dotted #ccc;
                  padding-bottom: 5px;
              }
              .label {
                  font-weight: bold;
                  display: inline-block;
                  width: 140px;
              }
              .value {
                  color: #555;
              }
              .trip-section, .vehicle-section {
                  margin-bottom: 25px;
                  background-color: #f9f9f9;
                  padding: 20px;
                  border: 1px solid #ddd;
              }
              .amount-section {
                  background-color: #e8f5e8;
                  padding: 25px;
                  text-align: center;
                  margin: 25px 0;
                  border: 2px solid #2e7d32;
              }
              .total-amount {
                  font-size: 32px;
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 10px;
              }
              .payment-status {
                  font-size: 18px;
                  color: #666;
                  font-weight: bold;
              }
              .payment-pending {
                  color: #f57c00;
              }
              .payment-paid {
                  color: #2e7d32;
              }
              .notes {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #fff3e0;
                  border-left: 5px solid #ff9800;
              }
              .notes h4 {
                  margin-top: 0;
                  color: #e65100;
              }
              .notes ul {
                  margin: 10px 0;
                  padding-left: 20px;
              }
              .notes li {
                  margin-bottom: 8px;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #ddd;
                  color: #666;
              }
              .print-instructions {
                  background-color: #e8f5e8;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 5px;
                  border: 1px solid #4caf50;
              }
          </style>
      </head>
      <body>
          <div class="invoice-container">
              <div class="header">
                  <div class="company-name">🚗 RENT-A-RIDE</div>
                  <div class="invoice-title">BOOKING INVOICE</div>
                  <div class="offline-badge">📱 OFFLINE GENERATED</div>
              </div>
              
              <div class="print-instructions no-print">
                  <strong>📄 Print Instructions:</strong> Use Ctrl+P (Windows) or Cmd+P (Mac) to print this invoice as PDF or on paper.
              </div>
              
              <div class="invoice-info">
                  <div class="invoice-details">
                      <div class="section-title">📋 Invoice Details</div>
                      <div class="detail-row">
                          <span class="label">Invoice Number:</span>
                          <span class="value">${bookingDetails.invoiceNumber}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Booking ID:</span>
                          <span class="value">${bookingDetails._id}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Booking Date:</span>
                          <span class="value">${bookingDate.toLocaleDateString('en-IN')}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Payment Method:</span>
                          <span class="value">${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</span>
                      </div>
                  </div>
                  
                  <div class="customer-details">
                      <div class="section-title">👤 Customer Details</div>
                      <div class="detail-row">
                          <span class="label">Name:</span>
                          <span class="value">${userDetails?.username || userDetails?.name || 'Customer'}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Email:</span>
                          <span class="value">${userDetails?.email || 'N/A'}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Phone:</span>
                          <span class="value">${userDetails?.phoneNumber || userDetails?.phone || 'N/A'}</span>
                      </div>
                  </div>
              </div>
              
              <div class="trip-section">
                  <div class="section-title">🗺️ Trip Information</div>
                  <div class="detail-row">
                      <span class="label">Pickup Location:</span>
                      <span class="value">${bookingDetails.pickUpLocation}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Pickup Date:</span>
                      <span class="value">${pickupDate.toLocaleDateString('en-IN')} at ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Drop-off Location:</span>
                      <span class="value">${bookingDetails.dropOffLocation}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Drop-off Date:</span>
                      <span class="value">${dropOffDate.toLocaleDateString('en-IN')} at ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
              </div>
              
              <div class="vehicle-section">
                  <div class="section-title">🚗 Vehicle Details</div>
                  <div class="detail-row">
                      <span class="label">Vehicle Number:</span>
                      <span class="value">${vehicleDetails.registeration_number}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Make & Model:</span>
                      <span class="value">${vehicleDetails.company} ${vehicleDetails.name || vehicleDetails.model}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Vehicle Type:</span>
                      <span class="value">${vehicleDetails.car_type}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Seating:</span>
                      <span class="value">${vehicleDetails.seats} Seats</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Fuel Type:</span>
                      <span class="value">${vehicleDetails.fuel_type}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Transmission:</span>
                      <span class="value">${vehicleDetails.transmition}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Year:</span>
                      <span class="value">${vehicleDetails.year_made}</span>
                  </div>
              </div>
              
              <div class="amount-section">
                  <div class="total-amount">💰 Total Amount: ₹${bookingDetails.totalPrice}</div>
                  <div class="payment-status ${bookingDetails.paymentStatus === 'completed' ? 'payment-paid' : 'payment-pending'}">
                      ${bookingDetails.paymentStatus === 'completed' ? '✅ Payment Completed' : '⏳ Payment Due at Pickup'}
                  </div>
              </div>
              
              <div class="notes">
                  <h4>📝 Important Notes:</h4>
                  <ul>
                      <li>Please carry a valid driving license and government-issued ID proof</li>
                      <li>Vehicle inspection will be conducted before handover</li>
                      ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 
                          '<li><strong>Payment must be made in cash at the time of vehicle pickup</strong></li>' : 
                          '<li>Payment has been processed online successfully</li>'
                      }
                      <li>Any damages to the vehicle will be charged separately</li>
                      <li>Late return charges may apply as per terms and conditions</li>
                      <li>For support, contact us at support@rentaride.com</li>
                      <li><strong>📱 This invoice was generated offline and will be synced when internet is available</strong></li>
                  </ul>
              </div>
              
              <div class="footer">
                  <p><strong>Thank you for choosing Rent-a-Ride!</strong></p>
                  <p>This is a computer-generated invoice and does not require a signature.</p>
                  <p style="font-size: 12px; margin-top: 15px;">Generated offline on: ${new Date().toLocaleString()}</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    // Save HTML file for offline access
    const fileName = `invoice-${bookingDetails.invoiceNumber}-${Date.now()}.html`;
    const filePath = path.join(OFFLINE_PDF_DIR, fileName);
    
    await fs.writeFile(filePath, htmlContent);
    
    console.log('Offline PDF HTML generated:', filePath);
    
    return {
      htmlContent,
      filePath,
      fileName,
      size: htmlContent.length,
      type: 'offline-html'
    };
    
  } catch (error) {
    console.error('Error generating offline PDF:', error);
    throw error;
  }
};

// Get offline PDF by filename
export const getOfflinePDF = async (fileName) => {
  try {
    const filePath = path.join(OFFLINE_PDF_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading offline PDF:', error);
    throw error;
  }
};

// List all offline PDFs
export const listOfflinePDFs = async () => {
  try {
    await ensurePdfDir();
    const files = await fs.readdir(OFFLINE_PDF_DIR);
    const pdfFiles = files.filter(file => file.endsWith('.html'));
    
    const fileDetails = await Promise.all(
      pdfFiles.map(async (file) => {
        const filePath = path.join(OFFLINE_PDF_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          fileName: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
    );
    
    return fileDetails;
  } catch (error) {
    console.error('Error listing offline PDFs:', error);
    return [];
  }
};

// Clean up old offline PDFs (older than 30 days)
export const cleanupOfflinePDFs = async () => {
  try {
    const files = await listOfflinePDFs();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.created < thirtyDaysAgo) {
        const filePath = path.join(OFFLINE_PDF_DIR, file.fileName);
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old offline PDF files`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up offline PDFs:', error);
    return 0;
  }
};