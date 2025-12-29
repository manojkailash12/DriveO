import htmlPdf from 'html-pdf-node';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { getDistanceBetweenCities } from './distanceService.js';

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
 * Fast PDF Generation Service - Generates PDFs in under 2 seconds
 * Uses html-pdf-node which is much faster than Puppeteer
 */

// PDF generation options for speed
const pdfOptions = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '10mm',
    right: '10mm',
    bottom: '10mm',
    left: '10mm'
  },
  timeout: 5000, // 5 second timeout maximum
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

/**
 * Generate booking receipt PDF - FAST VERSION
 */
export const generateFastBookingPDF = async (bookingDetails, vehicleDetails, userDetails) => {
  try {
    console.log("Starting FAST PDF generation...");
    const startTime = Date.now();

    const pickupDate = new Date(bookingDetails.pickupDate);
    const dropOffDate = new Date(bookingDetails.dropOffDate);
    const bookingDate = new Date(bookingDetails.createdAt);

    // Generate minimal, fast-loading HTML
    const htmlContent = generateMinimalHTML(bookingDetails, vehicleDetails, userDetails, pickupDate, dropOffDate, bookingDate);

    // Create PDF buffer directly in memory (no file system writes)
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    console.log(`FAST PDF generated successfully in ${generationTime}ms`);

    return {
      success: true,
      buffer: pdfBuffer,
      generationTime: generationTime,
      size: pdfBuffer.length
    };

  } catch (error) {
    console.error('Fast PDF generation failed:', error);
    throw new Error(`Fast PDF generation failed: ${error.message}`);
  }
};

/**
 * Generate minimal HTML for fast PDF conversion
 */
const generateMinimalHTML = (booking, vehicle, user, pickupDate, dropOffDate, bookingDate) => {
  const isInterstate = booking.travelType === 'interstate';
  
  // Calculate exact distance between cities - enhanced lookup
  let exactDistance = booking.estimatedDistance;
  
  if (!exactDistance) {
    // Try multiple combinations to find distance
    exactDistance = getDistanceBetweenCities(booking.pickUpLocation, booking.dropOffLocation) ||
                   getDistanceBetweenCities(booking.pickUpCity, booking.dropOffCity) ||
                   getDistanceBetweenCities(booking.pickUpLocation, booking.dropOffCity) ||
                   getDistanceBetweenCities(booking.pickUpCity, booking.dropOffLocation);
  }
  
  // If still not found, use travel type estimation
  if (!exactDistance) {
    const travelType = booking.travelType || (booking.isInterstate ? 'interstate' : 'local');
    exactDistance = travelType === 'interstate' ? 450 : 120;
  }
  
  console.log(`PDF Distance: ${booking.pickUpLocation} to ${booking.dropOffLocation} = ${exactDistance} km`);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Receipt</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            line-height: 1.4; 
            color: #333;
            padding: 20px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #2e7d32;
            padding-bottom: 10px;
        }
        .logo { 
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        .logo img {
            width: 40px;
            height: 40px;
            object-fit: contain;
        }
        .logo-text {
            font-size: 24px; 
            font-weight: bold; 
            color: #2e7d32;
        }
        .receipt-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 10px;
        }
        .section { 
            margin-bottom: 15px; 
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .section-title { 
            font-weight: bold; 
            font-size: 14px; 
            margin-bottom: 8px;
            color: #2e7d32;
        }
        .row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px;
        }
        .label { font-weight: bold; }
        .value { text-align: right; }
        .total { 
            background-color: #f5f5f5; 
            padding: 10px; 
            border-radius: 5px;
            margin-top: 10px;
        }
        .total-amount { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2e7d32;
        }
        .interstate-badge {
            background-color: #ff5722;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .local-badge {
            background-color: #4caf50;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" />
            <span class="logo-text">DriveO</span>
        </div>
        <div class="receipt-title">Booking Receipt</div>
        <div>Generated: ${bookingDate.toLocaleDateString('en-IN')} ${bookingDate.toLocaleTimeString('en-IN')}</div>
    </div>

    <div class="section">
        <div class="section-title">Booking Information</div>
        <div class="row">
            <span class="label">Booking ID:</span>
            <span class="value">${booking.bookingId || booking._id}</span>
        </div>
        <div class="row">
            <span class="label">Invoice Number:</span>
            <span class="value">${booking.invoiceNumber || 'N/A'}</span>
        </div>
        <div class="row">
            <span class="label">Travel Type:</span>
            <span class="value">
                <span class="${isInterstate ? 'interstate-badge' : 'local-badge'}">
                    ${isInterstate ? 'INTERSTATE' : 'LOCAL'}
                </span>
            </span>
        </div>
        <div class="row">
            <span class="label">Status:</span>
            <span class="value">${booking.status || 'Confirmed'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="row">
            <span class="label">Name:</span>
            <span class="value">${user.name || user.username || 'N/A'}</span>
        </div>
        <div class="row">
            <span class="label">Email:</span>
            <span class="value">${user.email || 'N/A'}</span>
        </div>
        <div class="row">
            <span class="label">Phone:</span>
            <span class="value">${user.phone || user.phoneNumber || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Vehicle Details</div>
        <div class="row">
            <span class="label">Vehicle:</span>
            <span class="value">${vehicle.company} ${vehicle.name || vehicle.model}</span>
        </div>
        <div class="row">
            <span class="label">Registration:</span>
            <span class="value">${vehicle.registeration_number}</span>
        </div>
        <div class="row">
            <span class="label">Type:</span>
            <span class="value">${vehicle.car_type || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="row">
            <span class="label">Pickup Location:</span>
            <span class="value">${booking.pickUpLocation}</span>
        </div>
        ${booking.pickUpCity ? `
        <div class="row">
            <span class="label">Pickup City:</span>
            <span class="value">${booking.pickUpCity}, ${booking.pickUpState || ''}</span>
        </div>
        ` : ''}
        <div class="row">
            <span class="label">Pickup Date & Time:</span>
            <span class="value">${pickupDate.toLocaleDateString('en-IN')} ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
        </div>
        <div class="row">
            <span class="label">Drop-off Location:</span>
            <span class="value">${booking.dropOffLocation}</span>
        </div>
        ${booking.dropOffCity ? `
        <div class="row">
            <span class="label">Drop-off City:</span>
            <span class="value">${booking.dropOffCity}, ${booking.dropOffState || ''}</span>
        </div>
        ` : ''}
        <div class="row">
            <span class="label">Drop-off Date & Time:</span>
            <span class="value">${dropOffDate.toLocaleDateString('en-IN')} ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
        </div>
        <div class="row">
            <span class="label">Duration:</span>
            <span class="value">${booking.totalDays || 1} day(s)</span>
        </div>
        ${exactDistance ? `
        <div class="row">
            <span class="label">Distance:</span>
            <span class="value" style="font-weight: bold; color: #2e7d32;">${exactDistance} km</span>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="row">
            <span class="label">Base Price:</span>
            <span class="value">₹${booking.basePrice || 0}</span>
        </div>
        ${booking.driverAllowance > 0 ? `
        <div class="row">
            <span class="label">Interstate Allowance:</span>
            <span class="value">₹${booking.driverAllowance}</span>
        </div>
        ` : ''}
        <div class="row">
            <span class="label">Payment Method:</span>
            <span class="value">${booking.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</span>
        </div>
        <div class="row">
            <span class="label">Payment Status:</span>
            <span class="value" style="color: ${booking.paymentStatus === 'completed' ? '#28a745' : '#ffc107'}; font-weight: bold;">
                ${booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
            </span>
        </div>
        <div class="total">
            <div class="row">
                <span class="label total-amount">Total Amount:</span>
                <span class="value total-amount">₹${booking.totalPrice}</span>
            </div>
            <div style="margin-top: 5px; font-size: 10px; color: #666;">
                ${booking.paymentStatus === 'completed' ? 'Payment completed' : 'To be paid at pickup'}
            </div>
        </div>
    </div>

    ${booking.specialRequests ? `
    <div class="section">
        <div class="section-title">Special Requests</div>
        <div>${booking.specialRequests}</div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>Important:</strong> Please carry valid driving license and government ID proof</p>
        <p>For support: support@driveo.com | Thank you for choosing DriveO!</p>
        <p>This is a computer-generated receipt.</p>
    </div>
</body>
</html>`;
};

export default { generateFastBookingPDF };