import htmlPdf from 'html-pdf-node';
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
 * Fast PDF Generation Service for Admin Reports
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
  timeout: 10000, // 10 second timeout maximum
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

/**
 * Generate Financial Report PDF - FAST VERSION
 */
export const generateFastFinancialPDF = async (data, title, period, status) => {
  try {
    console.log("Starting FAST Financial PDF generation...");
    const startTime = Date.now();

    const htmlContent = generateFinancialReportHTML(data, title, period, status);
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    const endTime = Date.now();
    console.log(`FAST Financial PDF generated in ${endTime - startTime}ms`);

    return pdfBuffer;
  } catch (error) {
    console.error('Fast Financial PDF generation failed:', error);
    throw new Error(`Fast Financial PDF generation failed: ${error.message}`);
  }
};

/**
 * Generate Users Report PDF - FAST VERSION
 */
export const generateFastUsersPDF = async (data, title) => {
  try {
    console.log("Starting FAST Users PDF generation...");
    const startTime = Date.now();

    const htmlContent = generateUsersReportHTML(data, title);
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    const endTime = Date.now();
    console.log(`FAST Users PDF generated in ${endTime - startTime}ms`);

    return pdfBuffer;
  } catch (error) {
    console.error('Fast Users PDF generation failed:', error);
    throw new Error(`Fast Users PDF generation failed: ${error.message}`);
  }
};

/**
 * Generate Customers Report PDF - FAST VERSION
 */
export const generateFastCustomersPDF = async (data, title) => {
  try {
    console.log("Starting FAST Customers PDF generation...");
    const startTime = Date.now();

    const htmlContent = generateCustomersReportHTML(data, title);
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    const endTime = Date.now();
    console.log(`FAST Customers PDF generated in ${endTime - startTime}ms`);

    return pdfBuffer;
  } catch (error) {
    console.error('Fast Customers PDF generation failed:', error);
    throw new Error(`Fast Customers PDF generation failed: ${error.message}`);
  }
};

/**
 * Generate Bookings Report PDF - FAST VERSION
 */
export const generateFastBookingsPDF = async (data, title) => {
  try {
    console.log("Starting FAST Bookings PDF generation...");
    const startTime = Date.now();

    const htmlContent = generateBookingsReportHTML(data, title);
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    const endTime = Date.now();
    console.log(`FAST Bookings PDF generated in ${endTime - startTime}ms`);

    return pdfBuffer;
  } catch (error) {
    console.error('Fast Bookings PDF generation failed:', error);
    throw new Error(`Fast Bookings PDF generation failed: ${error.message}`);
  }
};

// HTML Templates for different report types

const generateFinancialReportHTML = (data, title, period, status) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
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
                border-bottom: 3px solid #3174ad;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .company-name {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 24px;
                font-weight: bold;
                color: #3174ad;
                margin-bottom: 5px;
            }
            .company-logo {
                width: 30px;
                height: 30px;
                object-fit: contain;
            }
            .report-title {
                font-size: 18px;
                color: #666;
                margin-bottom: 8px;
            }
            .report-date {
                font-size: 12px;
                color: #888;
            }
            .summary-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .summary-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #3174ad;
                width: 23%;
                text-align: center;
            }
            .summary-label {
                font-size: 10px;
                color: #666;
                margin-bottom: 5px;
            }
            .summary-value {
                font-size: 16px;
                font-weight: bold;
                color: #333;
            }
            .filters {
                background: #e9ecef;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                font-size: 11px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 10px;
            }
            .table th,
            .table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #3174ad;
                color: white;
                font-weight: bold;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">
                <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" class="company-logo" />
                <span>DriveO</span>
            </div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="filters">
            <strong>Report Filters:</strong> Period: ${period || 'All Time'} | Status: ${status || 'All Status'}
        </div>

        <div class="summary-section">
            <div class="summary-card">
                <div class="summary-label">Total Earnings</div>
                <div class="summary-value">₹${(data.totalEarnings || 0).toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Orders</div>
                <div class="summary-value">${data.totalOrders || 0}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Transactions</div>
                <div class="summary-value">${data.totalTransactions || 0}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Pending Payments</div>
                <div class="summary-value">₹${(data.pendingPayments || 0).toLocaleString()}</div>
            </div>
        </div>

        ${data.monthlyEarnings && data.monthlyEarnings.length > 0 ? `
        <h3 style="margin-bottom: 10px; color: #3174ad;">Monthly Earnings Breakdown</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Earnings</th>
                </tr>
            </thead>
            <tbody>
                ${data.monthlyEarnings.map(month => `
                    <tr>
                        <td>${month.month}</td>
                        <td>₹${month.earnings.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="footer">
            <p>This report was generated automatically by DriveO Management System</p>
            <p>For any queries, please contact the administration team</p>
        </div>
    </body>
    </html>
  `;
};

const generateUsersReportHTML = (data, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
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
                border-bottom: 3px solid #3174ad;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .company-name {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 24px;
                font-weight: bold;
                color: #3174ad;
                margin-bottom: 5px;
            }
            .company-logo {
                width: 30px;
                height: 30px;
                object-fit: contain;
            }
            .report-title {
                font-size: 18px;
                color: #666;
                margin-bottom: 8px;
            }
            .summary-stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .stat-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                border-left: 4px solid #3174ad;
                width: 23%;
            }
            .stat-number {
                font-size: 18px;
                font-weight: bold;
                color: #3174ad;
            }
            .stat-label {
                font-size: 10px;
                color: #666;
                margin-top: 5px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 10px;
            }
            .table th, .table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #3174ad;
                color: white;
                font-weight: bold;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .role-badge {
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: bold;
            }
            .role-admin { background-color: #ffebee; color: #d32f2f; }
            .role-vendor { background-color: #e3f2fd; color: #1976d2; }
            .role-user { background-color: #e8f5e8; color: #2e7d32; }
            .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">
                <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" class="company-logo" />
                <span>DriveO</span>
            </div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.length : 0}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.filter(u => !u.isAdmin && !u.isVendor).length : 0}</div>
                <div class="stat-label">Regular Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.filter(u => u.isVendor).length : 0}</div>
                <div class="stat-label">Vendors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.filter(u => u.isAdmin).length : 0}</div>
                <div class="stat-label">Admins</div>
            </div>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                </tr>
            </thead>
            <tbody>
                ${Array.isArray(data) ? data.map(user => {
                  const role = user.isAdmin ? 'Admin' : user.isVendor ? 'Vendor' : 'User';
                  const roleClass = `role-${role.toLowerCase()}`;
                  const status = user.isActive !== false ? 'Active' : 'Inactive';
                  return `
                    <tr>
                        <td>${user.username || user.name || 'Unknown'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.phoneNumber || 'N/A'}</td>
                        <td><span class="role-badge ${roleClass}">${role}</span></td>
                        <td>${status}</td>
                        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="6">No users available</td></tr>'}
            </tbody>
        </table>

        <div class="footer">
            <p>This report was generated automatically by DriveO Management System</p>
        </div>
    </body>
    </html>
  `;
};

const generateCustomersReportHTML = (data, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
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
                border-bottom: 3px solid #3174ad;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .company-name {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 24px;
                font-weight: bold;
                color: #3174ad;
                margin-bottom: 5px;
            }
            .company-logo {
                width: 30px;
                height: 30px;
                object-fit: contain;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
            }
            .table th, .table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #3174ad;
                color: white;
                font-weight: bold;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">
                <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" class="company-logo" />
                <span>DriveO</span>
            </div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Total Bookings</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${Array.isArray(data) ? data.map(customer => `
                    <tr>
                        <td>${customer.name || customer.username || 'N/A'}</td>
                        <td>${customer.email || 'N/A'}</td>
                        <td>${customer.phoneNumber || 'N/A'}</td>
                        <td>${customer.totalBookings || 0}</td>
                        <td>₹${(customer.totalSpent || 0).toLocaleString()}</td>
                        <td>${customer.status || 'Active'}</td>
                    </tr>
                `).join('') : '<tr><td colspan="6">No data available</td></tr>'}
            </tbody>
        </table>

        <div class="footer">
            <p>This report was generated automatically by DriveO Management System</p>
        </div>
    </body>
    </html>
  `;
};

const generateBookingsReportHTML = (data, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
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
                border-bottom: 3px solid #3174ad;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .company-name {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 24px;
                font-weight: bold;
                color: #3174ad;
                margin-bottom: 5px;
            }
            .company-logo {
                width: 30px;
                height: 30px;
                object-fit: contain;
            }
            .summary-stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .stat-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                border-left: 4px solid #3174ad;
                width: 30%;
            }
            .stat-number {
                font-size: 18px;
                font-weight: bold;
                color: #3174ad;
            }
            .stat-label {
                font-size: 10px;
                color: #666;
                margin-top: 5px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9px;
            }
            .table th, .table td {
                padding: 6px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #3174ad;
                color: white;
                font-weight: bold;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .status-badge {
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: bold;
            }
            .status-booked { background-color: #e3f2fd; color: #1976d2; }
            .status-completed { background-color: #e8f5e8; color: #2e7d32; }
            .status-cancelled { background-color: #ffebee; color: #d32f2f; }
            .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">
                <img src="data:image/png;base64,${logoBase64}" alt="DriveO Logo" class="company-logo" />
                <span>DriveO</span>
            </div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.length : 0}</div>
                <div class="stat-label">Total Bookings</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Array.isArray(data) ? data.filter(b => b.status === 'booked' || b.bookingStatus === 'booked').length : 0}</div>
                <div class="stat-label">Active Bookings</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">₹${Array.isArray(data) ? data.reduce((sum, b) => sum + (b.totalAmount || b.totalPrice || 0), 0).toLocaleString() : '0'}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Pickup</th>
                    <th>Pickup Date</th>
                    <th>Dropoff</th>
                    <th>Status</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${Array.isArray(data) ? data.map(booking => {
                  const status = booking.status || booking.bookingStatus || 'pending';
                  const statusClass = `status-${status.toLowerCase()}`;
                  return `
                    <tr>
                        <td>${booking._id?.toString().slice(-8) || 'N/A'}</td>
                        <td>${booking.userId?.name || booking.userId?.username || 'Unknown'}</td>
                        <td>${booking.vehicleDetails?.company || booking.vehicleId?.company || 'Unknown'} ${booking.vehicleDetails?.name || booking.vehicleDetails?.model || booking.vehicleId?.name || booking.vehicleId?.model || 'Vehicle'}</td>
                        <td>${booking.pickUpLocation || booking.pickupLocation || 'N/A'}</td>
                        <td>${booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : 'N/A'}</td>
                        <td>${booking.dropOffLocation || 'N/A'}</td>
                        <td><span class="status-badge ${statusClass}">${status.toUpperCase()}</span></td>
                        <td>₹${(booking.totalAmount || booking.totalPrice || 0).toLocaleString()}</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="8">No bookings available</td></tr>'}
            </tbody>
        </table>

        <div class="footer">
            <p>This report was generated automatically by DriveO Management System</p>
        </div>
    </body>
    </html>
  `;
};

export default {
  generateFastFinancialPDF,
  generateFastUsersPDF,
  generateFastCustomersPDF,
  generateFastBookingsPDF
};