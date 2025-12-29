import nodemailer from 'nodemailer';
import { queueEmail, checkInternetConnection } from './offlineQueueService.js';
import { generateBookingReceipt } from './pdfReceiptService.js';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email with offline support
const sendEmailWithOfflineSupport = async (mailOptions, emailType = 'general') => {
  try {
    // Check if online
    const isOnline = await checkInternetConnection();
    
    if (isOnline) {
      // Send immediately if online
      const transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`${emailType} email sent immediately:`, info.response);
      return { success: true, messageId: info.messageId, method: 'immediate' };
    } else {
      // Queue for later if offline
      const queueId = await queueEmail({
        type: emailType,
        mailOptions: mailOptions,
        timestamp: new Date().toISOString()
      });
      
      console.log(`${emailType} email queued for offline processing:`, queueId);
      return { success: true, queueId: queueId, method: 'queued' };
    }
  } catch (error) {
    console.error(`Error sending ${emailType} email:`, error);
    
    // If sending fails, try to queue it
    try {
      const queueId = await queueEmail({
        type: emailType,
        mailOptions: mailOptions,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      console.log(`${emailType} email queued after send failure:`, queueId);
      return { success: true, queueId: queueId, method: 'queued_after_failure' };
    } catch (queueError) {
      console.error('Failed to queue email:', queueError);
      throw error;
    }
  }
};

// Send booking notification email
export const sendBookingNotification = async (email, bookingDetails, vehicleDetails, userDetails, pdfBuffer = null) => {
  const pickupDate = new Date(bookingDetails.pickupDate);
  const dropOffDate = new Date(bookingDetails.dropOffDate);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - DriveO</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #fff7ed;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(251, 146, 60, 0.15);
                border: 2px solid #fed7aa;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #f97316, #ea580c);
                padding: 20px;
                border-radius: 10px;
                margin: -30px -30px 30px -30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .success-message {
                background: linear-gradient(135deg, #fed7aa, #fdba74);
                padding: 25px;
                text-align: center;
                border-radius: 12px;
                margin: 20px 0;
                border: 2px solid #fb923c;
            }
            .booking-details {
                background-color: #fff7ed;
                padding: 25px;
                border-radius: 12px;
                margin: 20px 0;
                border: 2px solid #fed7aa;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #fed7aa;
            }
            .label {
                font-weight: bold;
                color: #c2410c;
            }
            .value {
                color: #9a3412;
                font-weight: 600;
            }
            .amount {
                background: linear-gradient(135deg, #fed7aa, #fdba74);
                padding: 20px;
                text-align: center;
                border-radius: 12px;
                margin: 20px 0;
                border: 2px solid #fb923c;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #fed7aa;
                color: #9a3412;
                font-size: 14px;
                background-color: #fff7ed;
                padding: 20px;
                border-radius: 10px;
            }
            .highlight {
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                padding: 3px 8px;
                border-radius: 6px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚗 DriveO</div>
                <p style="color: white; margin: 0; font-size: 16px;">Your Premium Car Rental Service</p>
            </div>
            
            <div class="success-message">
                <h2 style="color: #c2410c; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h2>
                <p style="margin: 10px 0; color: #9a3412; font-weight: 600;">Your vehicle has been successfully booked</p>
            </div>
            
            <div class="booking-details">
                <h3 style="color: #c2410c; margin-top: 0; font-size: 20px;">📋 Booking Details</h3>
                <div class="detail-row">
                    <span class="label">Booking ID:</span>
                    <span class="value highlight">${bookingDetails._id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Invoice Number:</span>
                    <span class="value">${bookingDetails.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Vehicle:</span>
                    <span class="value">${vehicleDetails.company} ${vehicleDetails.name || vehicleDetails.model}</span>
                </div>
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
                ${bookingDetails.estimatedDistance ? `
                <div class="detail-row">
                    <span class="label">Distance:</span>
                    <span class="value highlight">${bookingDetails.estimatedDistance} km</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="label">Travel Type:</span>
                    <span class="value">${bookingDetails.travelType === 'interstate' ? '🛣️ Interstate' : '🏙️ Local'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span class="value">${bookingDetails.totalDays || 1} day(s)</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Method:</span>
                    <span class="value">${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
            </div>
            
            <div class="amount">
                <h3 style="margin: 0; color: #c2410c; font-size: 24px;">💰 Total Amount: ₹${bookingDetails.totalPrice}</h3>
                <p style="margin: 5px 0; color: #9a3412; font-weight: 600;">
                    ${bookingDetails.paymentMethod === 'cash_on_delivery' ? '💵 To be paid at pickup' : '✅ Payment completed'}
                </p>
            </div>
            
            <div class="footer">
                <p><strong style="color: #c2410c;">🚀 Next Steps:</strong></p>
                <p style="line-height: 1.6;">
                    🆔 Carry valid driving license and ID proof<br>
                    ⏰ Arrive on time for vehicle pickup<br>
                    ${bookingDetails.paymentMethod === 'cash_on_delivery' ? '💰 Keep cash ready for payment<br>' : ''}
                    📞 Contact us for any queries
                </p>
                <p style="margin-top: 20px; font-size: 16px; font-weight: bold; color: #c2410c;">
                    🙏 Thank you for choosing DriveO!
                </p>
                <p style="margin-top: 15px; font-size: 12px; color: #9a3412;">
                    📧 This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🚗 Booking Confirmed - DriveO",
    html: htmlContent,
  };

  // Add PDF attachment if provided
  if (pdfBuffer) {
    mailOptions.attachments = [{
      filename: `Receipt-${bookingDetails.invoiceNumber || bookingDetails._id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];
  }

  return await sendEmailWithOfflineSupport(mailOptions, 'Booking Notification');
};

// Send OTP email for registration verification
export const sendVerificationOTP = async (email, otp, username, isAdmin = false) => {
  const userType = isAdmin ? 'Admin' : 'User';
  const welcomeMessage = isAdmin ? 
    'Thank you for registering as an admin with DriveO!' : 
    'Thank you for registering with DriveO!';
  
  const adminNotice = isAdmin ? `
    <div style="background-color: #fff7ed; padding: 15px; margin: 20px 0; border-left: 4px solid #f97316; border-radius: 4px;">
      <p><strong>🔐 Admin Registration:</strong></p>
      <p>You are registering as an administrator. This account will have full access to manage the DriveO system including vehicles, bookings, and user management.</p>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Email Verification - DriveO ${userType}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #fff7ed;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(251, 146, 60, 0.15);
                border: 2px solid #fed7aa;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #f97316, #ea580c);
                padding: 20px;
                border-radius: 10px;
                margin: -30px -30px 30px -30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .title {
                font-size: 24px;
                color: white;
                margin-bottom: 20px;
            }
            .otp-container {
                background: linear-gradient(135deg, #fed7aa, #fdba74);
                padding: 25px;
                text-align: center;
                border-radius: 12px;
                margin: 20px 0;
                border: 2px solid #fb923c;
            }
            .otp-code {
                font-size: 42px;
                font-weight: bold;
                color: #c2410c;
                letter-spacing: 8px;
                margin: 15px 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .message {
                color: #9a3412;
                line-height: 1.6;
                margin-bottom: 20px;
                font-weight: 500;
            }
            .warning {
                background-color: #fff7ed;
                padding: 20px;
                border-left: 4px solid #f97316;
                margin: 20px 0;
                border-radius: 8px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #fed7aa;
                color: #9a3412;
                font-size: 14px;
                background-color: #fff7ed;
                padding: 20px;
                border-radius: 10px;
            }
            .admin-badge {
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                padding: 8px 20px;
                border-radius: 25px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 15px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚗 DriveO</div>
                ${isAdmin ? '<div class="admin-badge">🔐 ADMIN REGISTRATION</div>' : ''}
                <div class="title">📧 Email Verification</div>
            </div>
            
            <div class="message">
                <p>Hello <strong style="color: #c2410c;">${username}</strong>,</p>
                <p>${welcomeMessage} To complete your ${userType.toLowerCase()} account setup, please verify your email address using the OTP code below:</p>
            </div>
            
            ${adminNotice}
            
            <div class="otp-container">
                <p style="margin: 0; color: #c2410c; font-weight: bold; font-size: 16px;">🔑 Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #9a3412; font-size: 14px; font-weight: 600;">⏰ Valid for 5 minutes</p>
            </div>
            
            <div class="message">
                <p>Enter this code in the verification page to activate your ${userType.toLowerCase()} account and start ${isAdmin ? 'managing the DriveO system' : 'booking vehicles'}.</p>
            </div>
            
            <div class="warning">
                <p style="color: #c2410c;"><strong>🔒 Security Note:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #9a3412;">
                    <li>This OTP is valid for 5 minutes only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                    ${isAdmin ? '<li><strong>Admin accounts have full system access - keep credentials secure</strong></li>' : ''}
                </ul>
            </div>
            
            <div class="footer">
                <p style="font-weight: bold; color: #c2410c; font-size: 16px;">🙏 Thank you for choosing DriveO!</p>
                <p>If you have any questions, contact our support team.</p>
                <p style="margin-top: 15px; font-size: 12px;">📧 This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🚗 DriveO - ${userType} Email Verification Code`,
    html: htmlContent,
  };

  // Send immediately without offline queue for OTP emails
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}:`, info.response);
    return { success: true, messageId: info.messageId, method: 'immediate' };
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw error;
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, username, isAdmin = false) => {
  try {
    const transporter = createTransporter();
    
    const userType = isAdmin ? 'Admin' : 'User';
    const welcomeTitle = isAdmin ? 'Welcome to DriveO Admin Panel!' : 'Welcome to DriveO!';
    const features = isAdmin ? [
      '🚗 Manage vehicle inventory and availability',
      '📊 View and manage all bookings',
      '👥 User account management',
      '📈 Access analytics and reports',
      '⚙️ System configuration and settings',
      '📞 Priority admin support'
    ] : [
      '🚗 Browse and book from our wide range of vehicles',
      '📱 Manage your bookings easily',
      '📄 Get instant PDF invoices via email',
      '💳 Choose between online payment or cash on delivery',
      '⭐ Rate and review your rental experience',
      '📞 24/7 customer support'
    ];

    const nextSteps = isAdmin ? 
      'Ready to manage the system? Log in to your admin account and access the admin dashboard!' :
      'Ready to start your journey? Log in to your account and explore our available vehicles!';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Welcome to DriveO ${userType}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 10px;
              }
              .welcome-message {
                  background-color: ${isAdmin ? '#e3f2fd' : '#e8f5e8'};
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .message {
                  color: #666;
                  line-height: 1.6;
                  margin-bottom: 20px;
              }
              .features {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
              }
              .admin-badge {
                  background-color: #1976d2;
                  color: white;
                  padding: 5px 15px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: bold;
                  display: inline-block;
                  margin-bottom: 10px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">DriveO</div>
                  ${isAdmin ? '<div class="admin-badge">ADMIN ACCOUNT</div>' : ''}
              </div>
              
              <div class="welcome-message">
                  <h2 style="color: ${isAdmin ? '#1976d2' : '#2e7d32'}; margin: 0;">${welcomeTitle}</h2>
                  <p style="margin: 10px 0; color: #666;">Your ${userType.toLowerCase()} account has been successfully verified</p>
              </div>
              
              <div class="message">
                  <p>Hello <strong>${username}</strong>,</p>
                  <p>Congratulations! Your email has been verified and your DriveO ${userType.toLowerCase()} account is now active. You can now enjoy all our ${isAdmin ? 'administrative' : ''} services:</p>
              </div>
              
              <div class="features">
                  <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
                  <ul style="color: #666; line-height: 1.8;">
                      ${features.map(feature => `<li>${feature}</li>`).join('')}
                  </ul>
              </div>
              
              <div class="message">
                  <p>${nextSteps}</p>
              </div>
              
              <div class="footer">
                  <p>Thank you for choosing DriveO!</p>
                  <p>For support, contact us at support@driveo.com</p>
                  ${isAdmin ? '<p><strong>Admin Support:</strong> admin@driveo.com</p>' : ''}
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to DriveO ${isAdmin ? 'Admin Panel' : ''} - Account Verified!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userType}:`, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending welcome email to ${userType}:`, error);
    throw error;
  }
};

// Send queued email (called by queue processor)
export const sendQueuedEmail = async (emailData) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail(emailData.mailOptions);
  console.log('Queued email sent:', info.response);
  return { success: true, messageId: info.messageId };
};

// Send password reset OTP email
export const sendPasswordResetOTP = async (email, otp, username) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset - DriveO</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2e7d32;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
            }
            .otp-container {
                background-color: #fff3e0;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #ff9800;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #f57c00;
                letter-spacing: 5px;
                margin: 10px 0;
            }
            .message {
                color: #666;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .warning {
                background-color: #ffebee;
                padding: 15px;
                border-left: 4px solid #f44336;
                margin: 20px 0;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DriveO</div>
                <h1 class="title">🔐 Password Reset Request</h1>
            </div>
            
            <p class="message">Hello <strong>${username}</strong>,</p>
            
            <p class="message">
                We received a request to reset your password for your DriveO account. 
                Use the verification code below to reset your password:
            </p>
            
            <div class="otp-container">
                <p style="margin: 0; color: #f57c00; font-weight: bold;">Your Password Reset Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">This code expires in 5 minutes</p>
            </div>
            
            <p class="message">
                Enter this code in the password reset form to create a new password for your account.
            </p>
            
            <div class="warning">
                <p style="margin: 0; color: #d32f2f;"><strong>⚠️ Security Notice:</strong></p>
                <p style="margin: 5px 0 0 0; color: #666;">
                    If you didn't request this password reset, please ignore this email. 
                    Your account remains secure and no changes will be made.
                </p>
            </div>
            
            <div class="footer">
                <p>This is an automated message from DriveO.</p>
                <p>For security reasons, please do not share this code with anyone.</p>
                <p style="margin-top: 20px;">Need help? Contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Password Reset Code - DriveO",
    html: htmlContent,
  };

  // Send immediately without offline queue for OTP emails
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent successfully to ${email}:`, info.response);
    return { success: true, messageId: info.messageId, method: 'immediate' };
  } catch (error) {
    console.error(`Error sending password reset OTP email to ${email}:`, error);
    throw error;
  }
};

// Export the offline support function
export { sendEmailWithOfflineSupport };