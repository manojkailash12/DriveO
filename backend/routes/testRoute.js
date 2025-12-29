import express from 'express';
import { sendBookingNotification, generateOTP } from '../services/emailService.js';
import { generateFastBookingPDF } from '../services/fastPdfService.js';

const router = express.Router();

// Test email functionality
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Test OTP generation and sending
    const otp = generateOTP();
    
    // Mock booking details for testing
    const mockBookingDetails = {
      _id: 'test-booking-123',
      invoiceNumber: 'INV-TEST-001',
      pickUpLocation: 'Test Pickup Location',
      dropOffLocation: 'Test Dropoff Location',
      pickupDate: new Date(),
      dropOffDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      totalPrice: 5000,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'completed',
      travelType: 'local',
      estimatedDistance: 50
    };

    const mockVehicleDetails = {
      company: 'Test Company',
      name: 'Test Vehicle',
      model: 'Test Model'
    };

    const mockUserDetails = {
      name: 'Test User',
      email: email,
      phone: '9876543210'
    };

    // Generate test PDF
    const pdfResult = await generateFastBookingPDF(mockBookingDetails, mockVehicleDetails, mockUserDetails);
    
    // Send test email with PDF
    const emailResult = await sendBookingNotification(
      email,
      mockBookingDetails,
      mockVehicleDetails,
      mockUserDetails,
      pdfResult.buffer
    );

    res.json({
      success: true,
      message: 'Test email sent successfully',
      otp: otp,
      emailResult: emailResult,
      pdfGenerated: pdfResult.success,
      pdfSize: pdfResult.size
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Test PDF generation only
router.post('/test-pdf', async (req, res) => {
  try {
    // Mock booking details for testing
    const mockBookingDetails = {
      _id: 'test-booking-123',
      invoiceNumber: 'INV-TEST-001',
      pickUpLocation: 'Test Pickup Location',
      dropOffLocation: 'Test Dropoff Location',
      pickupDate: new Date(),
      dropOffDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      totalPrice: 5000,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'completed',
      travelType: 'local',
      estimatedDistance: 50,
      createdAt: new Date()
    };

    const mockVehicleDetails = {
      company: 'Test Company',
      name: 'Test Vehicle',
      model: 'Test Model',
      registeration_number: 'TEST-1234'
    };

    const mockUserDetails = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210'
    };

    // Generate test PDF
    const pdfResult = await generateFastBookingPDF(mockBookingDetails, mockVehicleDetails, mockUserDetails);
    
    if (pdfResult.success) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=test-receipt.pdf');
      res.send(pdfResult.buffer);
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF'
      });
    }

  } catch (error) {
    console.error('Test PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test PDF',
      error: error.message
    });
  }
});

export default router;