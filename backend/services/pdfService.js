import puppeteer from 'puppeteer';

/**
 * Generate Invoice PDF - MANDATORY OPERATION
 * This function generates a PDF invoice using Puppeteer.
 * PDF generation is compulsory and any failure will cause the booking process to fail.
 * No fallback mechanisms are provided - Puppeteer must be available and functional.
 */
/**
 * Generate Invoice PDF with timeout protection
 * This function generates a PDF invoice using Puppeteer with improved error handling.
 * If PDF generation fails, the booking will still succeed.
 */
export const generateInvoicePDF = async (bookingDetails, vehicleDetails, userDetails) => {
  // Wrap the entire PDF generation in a timeout
  return Promise.race([
    generateInvoicePDFInternal(bookingDetails, vehicleDetails, userDetails),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PDF generation timeout after 90 seconds')), 90000)
    )
  ]);
};

const generateInvoicePDFInternal = async (bookingDetails, vehicleDetails, userDetails) => {
  let browser;
  try {
    console.log("Starting PDF generation...");
    
    browser = await puppeteer.launch({
      headless: "new", // Use new headless mode to avoid warnings
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      timeout: 60000 // Increase browser launch timeout to 60 seconds
    });
    
    const page = await browser.newPage();
    
    // Set longer timeout for page operations
    page.setDefaultTimeout(60000); // 60 seconds
    page.setDefaultNavigationTimeout(60000); // 60 seconds
    
    const pickupDate = new Date(bookingDetails.pickupDate);
    const dropOffDate = new Date(bookingDetails.dropOffDate);
    const bookingDate = new Date(bookingDetails.createdAt);
    
    console.log("Generating HTML content for PDF...");
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Invoice - ${bookingDetails.invoiceNumber}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
              }
              .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                  padding: 30px;
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 20px;
              }
              .company-name {
                  font-size: 32px;
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 5px;
              }
              .invoice-title {
                  font-size: 24px;
                  color: #666;
                  margin-bottom: 10px;
              }
              .invoice-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
              }
              .invoice-details, .customer-details {
                  width: 48%;
              }
              .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  color: #333;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
              }
              .detail-row {
                  margin-bottom: 8px;
              }
              .label {
                  font-weight: bold;
                  display: inline-block;
                  width: 140px;
              }
              .trip-section, .vehicle-section {
                  margin-bottom: 25px;
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 5px;
              }
              .amount-section {
                  background-color: #e8f5e8;
                  padding: 20px;
                  text-align: center;
                  margin: 25px 0;
                  border-radius: 5px;
              }
              .total-amount {
                  font-size: 28px;
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 10px;
              }
              .payment-status {
                  font-size: 16px;
                  color: #666;
              }
              .payment-pending {
                  color: #f57c00;
                  font-weight: bold;
              }
              .payment-paid {
                  color: #2e7d32;
                  font-weight: bold;
              }
              .notes {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #fff3e0;
                  border-left: 4px solid #ff9800;
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
                  margin-bottom: 5px;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
              }
              @media print {
                  body { margin: 0; }
                  .invoice-container { border: none; }
              }
          </style>
      </head>
      <body>
          <div class="invoice-container">
              <div class="header">
                  <div class="company-name">RENT-A-RIDE</div>
                  <div class="invoice-title">BOOKING INVOICE</div>
              </div>
              
              <div class="invoice-info">
                  <div class="invoice-details">
                      <div class="section-title">Invoice Details</div>
                      <div class="detail-row">
                          <span class="label">Invoice Number:</span>
                          <span>${bookingDetails.invoiceNumber}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Booking ID:</span>
                          <span>${bookingDetails.bookingId || bookingDetails._id}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Booking Date:</span>
                          <span>${bookingDate.toLocaleDateString('en-IN')}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Payment Method:</span>
                          <span>${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</span>
                      </div>
                  </div>
                  
                  <div class="customer-details">
                      <div class="section-title">Customer Details</div>
                      <div class="detail-row">
                          <span class="label">Name:</span>
                          <span>${userDetails?.username || userDetails?.name || 'Customer'}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Email:</span>
                          <span>${userDetails?.email || 'N/A'}</span>
                      </div>
                      <div class="detail-row">
                          <span class="label">Phone:</span>
                          <span>${userDetails?.phoneNumber || userDetails?.phone || 'N/A'}</span>
                      </div>
                  </div>
              </div>
              
              <div class="trip-section">
                  <div class="section-title">Trip Information</div>
                  <div class="detail-row">
                      <span class="label">Pickup Location:</span>
                      <span>${bookingDetails.pickUpLocation}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Pickup Date:</span>
                      <span>${pickupDate.toLocaleDateString('en-IN')} at ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Drop-off Location:</span>
                      <span>${bookingDetails.dropOffLocation}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Drop-off Date:</span>
                      <span>${dropOffDate.toLocaleDateString('en-IN')} at ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
              </div>
              
              <div class="vehicle-section">
                  <div class="section-title">Vehicle Details</div>
                  <div class="detail-row">
                      <span class="label">Vehicle Number:</span>
                      <span>${vehicleDetails.registeration_number}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Make & Model:</span>
                      <span>${vehicleDetails.company} ${vehicleDetails.name || vehicleDetails.model}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Vehicle Type:</span>
                      <span>${vehicleDetails.car_type}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Seating:</span>
                      <span>${vehicleDetails.seats} Seats</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Fuel Type:</span>
                      <span>${vehicleDetails.fuel_type}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Transmission:</span>
                      <span>${vehicleDetails.transmition}</span>
                  </div>
                  <div class="detail-row">
                      <span class="label">Year:</span>
                      <span>${vehicleDetails.year_made}</span>
                  </div>
              </div>
              
              <div class="amount-section">
                  <div class="total-amount">Total Amount: ₹${bookingDetails.totalPrice}</div>
                  <div class="payment-status ${bookingDetails.paymentStatus === 'completed' ? 'payment-paid' : 'payment-pending'}">
                      ${bookingDetails.paymentStatus === 'completed' ? 'Payment Completed' : 'Payment Due at Pickup'}
                  </div>
              </div>
              
              <div class="notes">
                  <h4>Important Notes:</h4>
                  <ul>
                      <li>Please carry a valid driving license and government-issued ID proof</li>
                      <li>Vehicle inspection will be conducted before handover</li>
                      ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 
                          '<li>Payment must be made in cash at the time of vehicle pickup</li>' : 
                          '<li>Payment has been processed online successfully</li>'
                      }
                      <li>Any damages to the vehicle will be charged separately</li>
                      <li>Late return charges may apply as per terms and conditions</li>
                      <li>For support, contact us at support@rentaride.com</li>
                  </ul>
              </div>
              
              <div class="footer">
                  <p>Thank you for choosing Rent-a-Ride!</p>
                  <p>This is a computer-generated invoice and does not require a signature.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    console.log("Setting HTML content...");
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded', // Faster than networkidle0
      timeout: 45000 // 45 seconds timeout for content loading
    });
    
    console.log("Generating PDF...");
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
    
    console.log("PDF generated successfully, size:", pdfBuffer.length, "bytes");
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation failed:", error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError.message);
      }
    }
    // Re-throw the error so the calling function can handle it
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};