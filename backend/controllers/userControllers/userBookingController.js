import mongoose from "mongoose";
import Booking from "../../models/BookingModel.js";
import { errorHandler } from "../../utils/error.js";
import Razorpay from "razorpay";
import { availableAtDate, isVehicleAvailable, updateVehicleBookingStatus } from "../../services/checkAvailableVehicle.js";
import Vehicle from "../../models/vehicleModel.js";
import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
import { generateInvoicePDF } from "../../services/pdfService.js";
import { sendBookingNotification } from "../../services/emailService.js";
import { generateBookingReceipt } from "../../services/pdfReceiptService.js";
import { generateFastBookingPDF } from "../../services/fastPdfService.js";
import { getDistanceBetweenCities, estimateDistance } from "../../services/distanceService.js";

// Simplified cross-state booking with admin pricing + ₹400 interstate allowance
export const simplifiedCrossStateBooking = async (req, res, next) => {
  try {
    const {
      userId,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      pickupCity,
      pickupState,
      dropoffCity,
      dropoffState,
      pickupDate,
      dropoffDate,
      pickupTime,
      dropoffTime,
      totalDays,
      specialRequests,
      paymentMethod = "cash_on_delivery",
      bookingStatus = "Pending",
      isInterstate,
      travelType
    } = req.body;

    // Validate required fields
    if (!userId || !vehicleId || !pickupLocation || !dropoffLocation || 
        !pickupDate || !dropoffDate) {
      return next(errorHandler(400, "All required fields must be provided"));
    }

    // Check if vehicle is available for the selected dates
    const availabilityCheck = await isVehicleAvailable(vehicleId, pickupDate, dropoffDate);
    
    if (!availabilityCheck.available) {
      return next(errorHandler(400, availabilityCheck.reason));
    }

    // Get vehicle details to calculate pricing
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    // Use frontend-provided interstate detection or fallback to backend calculation
    const finalIsInterstate = isInterstate !== undefined ? isInterstate : 
                             (pickupState && dropoffState && pickupState !== dropoffState);
    const finalTravelType = travelType || (finalIsInterstate ? 'interstate' : 'local');
    
    // Calculate pricing - admin price per day × total days + interstate allowance
    const basePricePerDay = vehicle.price || 0;
    const totalDaysCount = totalDays || 1;
    const basePrice = basePricePerDay * totalDaysCount;
    const interstateAllowance = finalIsInterstate ? 400 : 0;
    const totalAmount = basePrice + interstateAllowance;

    // Create simplified booking
    // Calculate real distance between cities - try multiple approaches
    let realDistance = null;
    
    // Try exact city names first
    realDistance = getDistanceBetweenCities(pickupLocation, dropoffLocation);
    
    // If not found, try with city names if available
    if (!realDistance && pickupCity && dropoffCity) {
      realDistance = getDistanceBetweenCities(pickupCity, dropoffCity);
    }
    
    // If still not found, try with location and city combinations
    if (!realDistance) {
      realDistance = getDistanceBetweenCities(pickupLocation, dropoffCity) ||
                    getDistanceBetweenCities(pickupCity, dropoffLocation);
    }
    
    // Final fallback to estimation
    if (!realDistance) {
      realDistance = estimateDistance(pickupLocation, dropoffLocation, finalTravelType);
    }
    
    console.log(`Distance calculation: ${pickupLocation} to ${dropoffLocation} = ${realDistance} km`);

    const bookingData = {
      userId,
      vehicleId,
      pickUpLocation: pickupLocation,
      dropOffLocation: dropoffLocation,
      pickUpCity: pickupCity,
      pickUpState: pickupState,
      dropOffCity: dropoffCity,
      dropOffState: dropoffState,
      pickupDate: new Date(`${pickupDate}T${pickupTime || '10:00'}`),
      dropOffDate: new Date(`${dropoffDate}T${dropoffTime || '10:00'}`),
      basePrice: basePrice,
      crossStateCharges: 0, // No additional cross-state charges
      tollCharges: 0, // No toll charges
      driverAllowance: interstateAllowance, // Only ₹400 for interstate
      totalPrice: totalAmount,
      totalDays: totalDays || 1,
      travelType: finalTravelType,
      isInterstate: finalIsInterstate,
      estimatedDistance: realDistance, // Add real distance
      specialRequests,
      paymentMethod,
      status: bookingStatus,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "completed" : "completed",
      bookingType: "simplified_cross_state",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    // Update vehicle booking status
    await updateVehicleBookingStatus(vehicleId, true);

    // Get user details for email
    const userDetails = await User.findById(userId);

    // Generate PDF invoice (MANDATORY - FAST VERSION - Under 2 seconds)
    let pdfBuffer = null;
    const enablePDFGeneration = process.env.ENABLE_PDF_GENERATION !== 'false';
    
    if (enablePDFGeneration) {
      try {
        console.log("Starting FAST PDF generation (target: <2 seconds)...");
        const pdfStartTime = Date.now();
        
        // Use fast PDF generation instead of slow Puppeteer
        const pdfResult = await generateFastBookingPDF(savedBooking, vehicle, userDetails);
        
        const pdfEndTime = Date.now();
        const pdfGenerationTime = pdfEndTime - pdfStartTime;
        
        if (pdfResult.success) {
          pdfBuffer = pdfResult.buffer;
          console.log(`✅ FAST PDF generated successfully in ${pdfGenerationTime}ms (${pdfResult.generationTime}ms internal)`);
        } else {
          throw new Error("Fast PDF generation returned failure");
        }
        
        // Fail if PDF takes longer than 3 seconds (should be under 2)
        if (pdfGenerationTime > 3000) {
          console.warn(`⚠️ PDF generation took ${pdfGenerationTime}ms - longer than expected`);
        }
        
      } catch (pdfError) {
        console.error("CRITICAL: Fast PDF generation failed:", pdfError.message);
        // If PDF generation fails, we should fail the booking
        return next(errorHandler(500, `Failed to generate booking receipt: ${pdfError.message}`));
      }
    } else {
      console.log("PDF generation is disabled via environment variable");
      return next(errorHandler(500, "PDF generation is required for bookings but is currently disabled."));
    }

    // Send confirmation email with PDF attachment (MANDATORY)
    let emailSent = false;
    if (userDetails?.email && pdfBuffer) {
      try {
        console.log("Sending confirmation email with PDF attachment...");
        const emailStartTime = Date.now();
        
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userDetails.email,
          subject: `🎉 ${finalIsInterstate ? 'Interstate' : 'Local'} Booking Confirmed - DriveO`,
          html: generateSimplifiedBookingEmailHtml(savedBooking, vehicle, userDetails),
          attachments: [{
            filename: `Receipt-${savedBooking.invoiceNumber || savedBooking._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }]
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
        
        const emailEndTime = Date.now();
        const emailTime = emailEndTime - emailStartTime;
        console.log(`✅ Confirmation email sent successfully in ${emailTime}ms`);
        
      } catch (emailError) {
        console.error("CRITICAL: Email sending failed:", emailError.message);
        // If email fails, we should fail the booking
        return next(errorHandler(500, `Failed to send booking confirmation email: ${emailError.message}`));
      }
    } else {
      console.error("CRITICAL: Missing email or PDF for booking confirmation");
      return next(errorHandler(500, "Unable to send booking confirmation. Please ensure your email is valid."));
    }

    res.status(200).json({
      success: true,
      message: `${finalIsInterstate ? 'Interstate' : 'Local'} booking confirmed successfully!`,
      booking: {
        ...savedBooking.toObject(),
        invoiceNumber: savedBooking.invoiceNumber,
        bookingId: savedBooking.bookingId,
        isInterstate: finalIsInterstate,
        interstateAllowance: interstateAllowance
      },
      emailSent,
      pdfGenerated: !!pdfBuffer,
      pricing: {
        basePrice: basePrice,
        interstateAllowance: interstateAllowance,
        totalAmount: totalAmount,
        isInterstate: isInterstate
      }
    });

  } catch (error) {
    console.error("Simplified cross-state booking error:", error);
    next(errorHandler(500, "Failed to create booking"));
  }
};

// Generate simplified booking email HTML
const generateSimplifiedBookingEmailHtml = (booking, vehicle, user) => {
  const pickupDate = new Date(booking.pickupDate);
  const dropOffDate = new Date(booking.dropOffDate);
  const isInterstate = booking.travelType === 'interstate';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${isInterstate ? '#e74c3c 0%, #c0392b 100%' : '#667eea 0%, #764ba2 100%'}); color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚗 DriveO</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          ${isInterstate ? '🌍 Interstate' : '📍 Local'} Car Rental Service
        </p>
      </div>

      <!-- Success Message -->
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; margin: 0; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">🎉 Booking Confirmed!</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your ${isInterstate ? 'interstate' : 'local'} car rental has been successfully booked</p>
      </div>

      <!-- Booking Details -->
      <div style="background-color: white; padding: 30px 20px;">
        <div style="border-left: 4px solid #667eea; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Booking Information</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Invoice Number:</strong> ${booking.invoiceNumber || 'Generated'}</p>
            <p style="margin: 0 0 10px 0;"><strong>Travel Type:</strong> <span style="color: ${isInterstate ? '#e74c3c' : '#28a745'}; font-weight: bold;">${booking.travelType.toUpperCase()}</span></p>
            <p style="margin: 0 0 10px 0;"><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${booking.status}</span></p>
          </div>
        </div>

        <!-- Vehicle Details -->
        <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Vehicle Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Vehicle:</strong> ${vehicle.company} ${vehicle.name || vehicle.model}</p>
            <p style="margin: 0 0 10px 0;"><strong>Registration:</strong> ${vehicle.registeration_number}</p>
            <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${vehicle.car_type} • ${vehicle.seat} Seater</p>
            <p style="margin: 0 0 10px 0;"><strong>Fuel:</strong> ${vehicle.fuel_type} • ${vehicle.transmition_type || vehicle.transmition}</p>
            <p style="margin: 0;"><strong>Vehicle Location:</strong> ${vehicle.city}, ${vehicle.state}</p>
          </div>
        </div>

        <!-- Trip Details -->
        <div style="border-left: 4px solid #ffc107; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Trip Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="flex: 1; margin-right: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #28a745;">📍 Pickup</p>
                <p style="margin: 0 0 5px 0;">${booking.pickUpLocation}</p>
                ${booking.pickUpCity ? `<p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${booking.pickUpCity}, ${booking.pickUpState}</p>` : ''}
                <p style="margin: 0; font-size: 14px; color: #666;">${pickupDate.toLocaleDateString('en-IN')} at ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
              </div>
              <div style="flex: 1; margin-left: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #dc3545;">📍 Drop-off</p>
                <p style="margin: 0 0 5px 0;">${booking.dropOffLocation}</p>
                ${booking.dropOffCity ? `<p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${booking.dropOffCity}, ${booking.dropOffState}</p>` : ''}
                <p style="margin: 0; font-size: 14px; color: #666;">${dropOffDate.toLocaleDateString('en-IN')} at ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
              </div>
            </div>
            <p style="margin: 0; text-align: center; font-weight: bold;">Duration: ${booking.totalDays || 1} day(s)</p>
          </div>
        </div>

        <!-- Simplified Payment Details -->
        <div style="border-left: 4px solid #17a2b8; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Payment Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Vehicle Price (${booking.totalDays || 1} days)</span>
              <span>₹${booking.basePrice}</span>
            </div>
            ${isInterstate ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #e74c3c;">
              <span>Interstate Allowance</span>
              <span>₹${booking.driverAllowance}</span>
            </div>
            ` : ''}
            <hr style="margin: 15px 0; border: none; border-top: 2px solid #dee2e6;">
            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #28a745;">
              <span>Total Amount</span>
              <span>₹${booking.totalPrice}</span>
            </div>
            <p style="margin: 10px 0 0 0; text-align: center;"><strong>Payment Method:</strong> ${booking.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p style="margin: 5px 0 0 0; text-align: center;"><strong>Payment Status:</strong> 
              <span style="color: ${booking.paymentStatus === 'pending' ? '#ffc107' : '#28a745'}; font-weight: bold;">
                ${booking.paymentStatus === 'pending' ? 'Pay at Pickup' : 'Paid'}
              </span>
            </p>
          </div>
        </div>

        ${booking.specialRequests ? `
        <!-- Special Requests -->
        <div style="border-left: 4px solid #6f42c1; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Special Requests</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #6f42c1;">${booking.specialRequests}</p>
          </div>
        </div>
        ` : ''}

        <!-- Instructions -->
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #856404;">📋 Important Instructions</h4>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li style="margin-bottom: 8px;">Carry valid driving license and government ID proof</li>
            <li style="margin-bottom: 8px;">Arrive 15 minutes early for vehicle inspection</li>
            ${isInterstate ? '<li style="margin-bottom: 8px;">Vehicle can be picked up from any location in India</li>' : ''}
            <li style="margin-bottom: 8px;">Vehicle will be sanitized before handover</li>
            ${booking.paymentMethod === 'cash_on_delivery' ? 
              '<li style="margin-bottom: 8px;">Keep exact cash amount ready for payment</li>' : ''
            }
            <li>Contact us immediately for any changes or queries</li>
          </ul>
        </div>

        <!-- PDF Attachment Notice -->
        <div style="background-color: #e7f3ff; border: 1px solid #b8daff; padding: 20px; border-radius: 8px; text-align: center;">
          <h4 style="margin: 0 0 10px 0; color: #004085;">📄 Invoice Attached</h4>
          <p style="margin: 0; color: #004085;">Your detailed PDF invoice is attached to this email for your records.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #343a40; color: white; padding: 30px 20px; text-align: center;">
        <h4 style="margin: 0 0 15px 0;">Need Help?</h4>
        <p style="margin: 0 0 10px 0;">📞 Customer Support: +91-XXXXXXXXXX</p>
        <p style="margin: 0 0 10px 0;">📧 Email: support@driveo.com</p>
        <p style="margin: 0 0 20px 0;">🌐 Website: www.driveo.com</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Thank you for choosing DriveO! Have a safe journey.</p>
      </div>
    </div>
  `;
};

export const enhancedBookCar = async (req, res, next) => {
  try {
    const {
      userId,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      pickupTime,
      dropoffTime,
      totalDays,
      totalAmount,
      paymentMethod = "cash_on_delivery",
      bookingStatus = "Pending"
    } = req.body;

    // Validate required fields
    if (!userId || !vehicleId || !pickupLocation || !dropoffLocation || 
        !pickupDate || !dropoffDate || !totalAmount) {
      return next(errorHandler(400, "All required fields must be provided"));
    }

    // Check if vehicle is available for the selected dates
    const availabilityCheck = await isVehicleAvailable(vehicleId, pickupDate, dropoffDate);
    
    if (!availabilityCheck.available) {
      return next(errorHandler(400, availabilityCheck.reason));
    }

    // Calculate real distance between cities
    const realDistance = getDistanceBetweenCities(pickupLocation, dropoffLocation) || 
                        estimateDistance(pickupLocation, dropoffLocation, 'local');

    // Create booking with enhanced data structure
    const bookingData = {
      userId,
      vehicleId,
      pickUpLocation: pickupLocation,
      dropOffLocation: dropoffLocation,
      pickupDate: new Date(`${pickupDate}T${pickupTime || '10:00'}`),
      dropOffDate: new Date(`${dropoffDate}T${dropoffTime || '10:00'}`),
      totalPrice: totalAmount,
      totalDays: totalDays || 1,
      estimatedDistance: realDistance, // Add real distance
      paymentMethod,
      status: bookingStatus,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "completed" : "completed",
      bookingType: "enhanced_flow",
      createdAt: new Date()
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    // Update vehicle booking status
    await updateVehicleBookingStatus(vehicleId, true);

    // Get user and vehicle details for email
    const userDetails = await User.findById(userId);
    const vehicleDetails = await Vehicle.findById(vehicleId);

    // Generate PDF invoice
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePDF(savedBooking, vehicleDetails, userDetails);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
    }

    // Send confirmation email with PDF
    let emailSent = false;
    if (userDetails?.email && pdfBuffer) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userDetails.email,
          subject: "🎉 Booking Confirmed - DriveO",
          html: generateEnhancedBookingEmailHtml(savedBooking, vehicleDetails, userDetails),
          attachments: pdfBuffer ? [{
            filename: `Invoice-${savedBooking.invoiceNumber || savedBooking._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }] : []
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully!",
      booking: {
        ...savedBooking.toObject(),
        invoiceNumber: savedBooking.invoiceNumber,
        bookingId: savedBooking.bookingId
      },
      emailSent,
      pdfGenerated: !!pdfBuffer
    });

  } catch (error) {
    console.error("Enhanced booking error:", error);
    next(errorHandler(500, "Failed to create booking"));
  }
};

// Generate enhanced booking email HTML
const generateEnhancedBookingEmailHtml = (booking, vehicle, user) => {
  const pickupDate = new Date(booking.pickupDate);
  const dropOffDate = new Date(booking.dropOffDate);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚗 DriveO</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Premium Car Rental Service</p>
      </div>

      <!-- Success Message -->
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; margin: 0; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">🎉 Booking Confirmed!</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your car rental has been successfully booked</p>
      </div>

      <!-- Booking Details -->
      <div style="background-color: white; padding: 30px 20px;">
        <div style="border-left: 4px solid #667eea; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Booking Information</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Invoice Number:</strong> ${booking.invoiceNumber || 'Generated'}</p>
            <p style="margin: 0 0 10px 0;"><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${booking.status}</span></p>
          </div>
        </div>

        <!-- Vehicle Details -->
        <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Vehicle Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Vehicle:</strong> ${vehicle.company} ${vehicle.name || vehicle.model}</p>
            <p style="margin: 0 0 10px 0;"><strong>Registration:</strong> ${vehicle.registeration_number}</p>
            <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${vehicle.car_type} • ${vehicle.seat} Seater</p>
            <p style="margin: 0;"><strong>Fuel:</strong> ${vehicle.fuel_type} • ${vehicle.transmition_type || vehicle.transmition}</p>
          </div>
        </div>

        <!-- Trip Details -->
        <div style="border-left: 4px solid #ffc107; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Trip Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="flex: 1; margin-right: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #28a745;">📍 Pickup</p>
                <p style="margin: 0 0 5px 0;">${booking.pickUpLocation}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">${pickupDate.toLocaleDateString('en-IN')} at ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
              </div>
              <div style="flex: 1; margin-left: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #dc3545;">📍 Drop-off</p>
                <p style="margin: 0 0 5px 0;">${booking.dropOffLocation}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">${dropOffDate.toLocaleDateString('en-IN')} at ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
              </div>
            </div>
            <p style="margin: 0; text-align: center; font-weight: bold;">Duration: ${booking.totalDays || 1} day(s)</p>
          </div>
        </div>

        <!-- Payment Details -->
        <div style="border-left: 4px solid #17a2b8; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Payment Information</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold; color: #28a745;">₹${booking.totalPrice}</p>
            <p style="margin: 0 0 10px 0;"><strong>Payment Method:</strong> ${booking.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p style="margin: 0;"><strong>Payment Status:</strong> 
              <span style="color: ${booking.paymentStatus === 'pending' ? '#ffc107' : '#28a745'}; font-weight: bold;">
                ${booking.paymentStatus === 'pending' ? 'Pay at Pickup' : 'Paid'}
              </span>
            </p>
          </div>
        </div>

        <!-- Important Instructions -->
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #856404;">📋 Important Instructions</h4>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li style="margin-bottom: 8px;">Carry valid driving license and government ID proof</li>
            <li style="margin-bottom: 8px;">Arrive 15 minutes early for vehicle inspection</li>
            <li style="margin-bottom: 8px;">Vehicle will be sanitized before handover</li>
            ${booking.paymentMethod === 'cash_on_delivery' ? 
              '<li style="margin-bottom: 8px;">Keep exact cash amount ready for payment</li>' : ''
            }
            <li>Contact us immediately for any changes or queries</li>
          </ul>
        </div>

        <!-- PDF Attachment Notice -->
        <div style="background-color: #e7f3ff; border: 1px solid #b8daff; padding: 20px; border-radius: 8px; text-align: center;">
          <h4 style="margin: 0 0 10px 0; color: #004085;">📄 Invoice Attached</h4>
          <p style="margin: 0; color: #004085;">Your detailed PDF invoice is attached to this email for your records.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #343a40; color: white; padding: 30px 20px; text-align: center;">
        <h4 style="margin: 0 0 15px 0;">Need Help?</h4>
        <p style="margin: 0 0 10px 0;">📞 Customer Support: +91-XXXXXXXXXX</p>
        <p style="margin: 0 0 10px 0;">📧 Email: support@driveo.com</p>
        <p style="margin: 0 0 20px 0;">🌐 Website: www.driveo.com</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Thank you for choosing DriveO! Have a safe journey.</p>
      </div>
    </div>
  `;
};

export const BookCar = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(401, "bad request on body"));
    }

    const {
      user_id,
      vehicle_id,
      totalPrice,
      pickupDate,
      dropoffDate,
      pickup_location,
      dropoff_location,
      pickup_district,
      paymentMethod = "cash_on_delivery", // Default to cash on delivery
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    // Check if vehicle is available for the selected dates
    const availabilityCheck = await isVehicleAvailable(vehicle_id, pickupDate, dropoffDate);
    
    if (!availabilityCheck.available) {
      return next(errorHandler(400, availabilityCheck.reason));
    }

    // Calculate real distance between cities
    const realDistance = getDistanceBetweenCities(pickup_location, dropoff_location) || 
                        estimateDistance(pickup_location, dropoff_location, 'local');

    const bookingData = {
      pickupDate,
      dropOffDate: dropoffDate,
      userId: user_id,
      pickUpLocation: pickup_location,
      vehicleId: vehicle_id,
      dropOffLocation: dropoff_location,
      pickUpDistrict: pickup_district,
      totalPrice,
      estimatedDistance: realDistance, // Add real distance
      paymentMethod,
      status: "booked",
    };

    // Only add Razorpay fields if payment method is online
    if (paymentMethod === "online") {
      if (!razorpayPaymentId || !razorpayOrderId) {
        return next(errorHandler(400, "Razorpay payment details required for online payment"));
      }
      bookingData.razorpayPaymentId = razorpayPaymentId;
      bookingData.razorpayOrderId = razorpayOrderId;
      bookingData.paymentStatus = "paid";
    } else {
      // For cash on delivery, booking is confirmed (payment will be collected on delivery)
      bookingData.paymentStatus = "completed";
    }

    const book = new Booking(bookingData);
    
    if (!book) {
      console.log("not booked");
      return;
    }

    const booked = await book.save();
    
    // Update vehicle booking status
    await updateVehicleBookingStatus(vehicle_id, true);
    
    // Get user and vehicle details for email
    const userDetails = await User.findById(user_id);
    const vehicleDetails = await Vehicle.findById(vehicle_id);
    
    let emailResult = { success: false, method: 'none' };
    let pdfResult = { success: false, type: 'none' };
    
    // PDF generation is now mandatory - no fallback mechanism
    console.log("Generating PDF with Puppeteer (PDF generation is mandatory)...");
    const pdfBuffer = await generateInvoicePDF(booked, vehicleDetails, userDetails);
    pdfResult = { success: true, type: 'puppeteer', size: pdfBuffer.length };
    
    // Send email with PDF attachment
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userDetails.email,
        subject: "🎉 Booking Confirmed - Your Rent-a-Ride Invoice",
        html: generateBookingEmailHtml(booked, vehicleDetails, userDetails),
        attachments: [
          {
            filename: `Invoice-${booked.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      emailResult = { success: true, method: 'immediate' };
      console.log("Booking confirmation email with PDF sent successfully");
    } catch (emailError) {
      console.error("Error sending booking confirmation email:", emailError);
      emailResult = { success: false, method: 'failed', error: emailError.message };
      // Don't fail the booking if email fails
    }
    
    res.status(200).json({
      message: "Car booked successfully! Confirmation email with PDF invoice sent.",
      booked,
      invoiceNumber: booked.invoiceNumber,
      paymentMethod: booked.paymentMethod,
      paymentStatus: booked.paymentStatus,
      emailResult,
      pdfResult,
      note: "Email sent with mandatory PDF attachment"
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error while booking car"));
  }
};

// Generate booking email HTML
const generateBookingEmailHtml = (bookingDetails, vehicleDetails, userDetails) => {
  const pickupDate = new Date(bookingDetails.pickupDate);
  const dropOffDate = new Date(bookingDetails.dropOffDate);

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2e7d32;">🚗 RENT-A-RIDE</h1>
        <h2 style="color: #666;">Booking Confirmed!</h2>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #2e7d32;">🎉 Your booking is confirmed!</h3>
        <p style="margin: 10px 0; color: #666;">Invoice Number: ${bookingDetails.invoiceNumber}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId || bookingDetails._id}</p>
        <p><strong>Vehicle:</strong> ${vehicleDetails.company} ${vehicleDetails.model} (${vehicleDetails.registeration_number})</p>
        <p><strong>Pickup:</strong> ${bookingDetails.pickUpLocation} on ${pickupDate.toLocaleDateString('en-IN')} at ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
        <p><strong>Drop-off:</strong> ${bookingDetails.dropOffLocation} on ${dropOffDate.toLocaleDateString('en-IN')} at ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
        <p><strong>Total Amount:</strong> ₹${bookingDetails.totalPrice}</p>
        <p><strong>Payment:</strong> ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
      </div>

      <div style="background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #1976d2;">📄 Invoice Attached</h4>
        <p style="margin: 5px 0;">Your detailed PDF invoice is attached to this email.</p>
      </div>

      <div style="background-color: #fff3e0; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #e65100;">📋 Next Steps</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Carry valid driving license and ID proof</li>
          <li>Arrive on time for vehicle pickup</li>
          ${bookingDetails.paymentMethod === 'cash_on_delivery' ? '<li>Keep cash ready for payment</li>' : ''}
          <li>Contact us for any queries</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
        <p>Thank you for choosing Rent-a-Ride!</p>
        <p style="font-size: 12px;">For support: support@rentaride.com</p>
      </div>
    </div>
  `;
};

//createing razorpay instance
export const razorpayOrder = async (req, res, next) => {
  try {
    const { totalPrice, dropoff_location, pickup_district, pickup_location } =
      req.body;

    console.log(totalPrice)
    if (
      !totalPrice ||
      !dropoff_location ||
      !pickup_district ||
      !pickup_location
    ) {

      return next(errorHandler(400, "Missing Required Feilds Process Cancelled")) ;
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: totalPrice * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error occured in razorpayorder"));
  }
};

// -------------------- -------------------

// Get all vehicles with availability status - no location restrictions
export const getAllVehiclesWithAvailability = async (req, res, next) => {
  try {
    const { 
      pickupDate, 
      dropOffDate, 
      pickUpState,
      dropOffState,
      model
    } = req.body;

    if (!pickupDate || !dropOffDate)
      return next(errorHandler(409, "pickup and dropoff dates are required"));

    // Check if pickupDate is before dropOffDate
    if (pickupDate >= dropOffDate)
      return next(errorHandler(409, "Invalid date range"));

    // Get ALL admin-added vehicles regardless of location
    const allVehicles = await Vehicle.find({
      isDeleted: "false",
      isAdminApproved: true,
      isAdminAdded: true
    });

    if (!allVehicles || allVehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vehicles found in the system.",
      });
    }

    // Check availability for each vehicle and add pricing info
    const vehiclesWithAvailability = await Promise.all(
      allVehicles.map(async (vehicle) => {
        try {
          // Check if vehicle is available for the requested dates
          const availabilityCheck = await isVehicleAvailable(vehicle._id, pickupDate, dropOffDate);
          
          // Determine if this is interstate travel
          const isInterstate = pickUpState && dropOffState && pickUpState !== dropOffState;
          
          // Calculate pricing - admin price per day × total days + interstate allowance
          const totalDays = Math.ceil(
            (new Date(dropOffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
          ) || 1;
          const basePricePerDay = vehicle.price || 0;
          const basePrice = basePricePerDay * totalDays;
          const interstateAllowance = isInterstate ? 400 : 0;
          const totalPrice = basePrice + interstateAllowance;
          
          // Get next available date if currently booked
          let nextAvailableDate = null;
          if (!availabilityCheck.available) {
            // Find the earliest date when vehicle becomes available
            const existingBookings = await Booking.find({
              vehicleId: vehicle._id,
              status: { $in: ["booked", "onTrip", "Pending"] },
              dropOffDate: { $gte: new Date() }
            }).sort({ dropOffDate: 1 });
            
            if (existingBookings.length > 0) {
              // Next available date is the day after the latest booking ends
              const latestBooking = existingBookings[existingBookings.length - 1];
              nextAvailableDate = new Date(latestBooking.dropOffDate);
              nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
            }
          }

          return {
            ...vehicle.toObject(),
            isAvailable: availabilityCheck.available,
            availabilityReason: availabilityCheck.reason || null,
            nextAvailableDate: nextAvailableDate,
            isInterstate: isInterstate,
            basePrice: basePrice,
            interstateAllowance: interstateAllowance,
            totalPrice: totalPrice,
            vehicleLocation: `${vehicle.location || 'N/A'}, ${vehicle.city || 'N/A'}, ${vehicle.state || 'N/A'}`,
            travelType: isInterstate ? 'interstate' : 'local'
          };
        } catch (vehicleError) {
          console.error(`Error processing vehicle ${vehicle.registeration_number}:`, vehicleError);
          // Return vehicle with error status
          return {
            ...vehicle.toObject(),
            isAvailable: false,
            availabilityReason: 'Error checking availability',
            error: vehicleError.message
          };
        }
      })
    );

    // Separate available and unavailable vehicles
    const availableVehicles = vehiclesWithAvailability.filter(v => v.isAvailable);
    const unavailableVehicles = vehiclesWithAvailability.filter(v => !v.isAvailable);

    // Sort available vehicles by price, unavailable by next available date
    availableVehicles.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    unavailableVehicles.sort((a, b) => {
      if (!a.nextAvailableDate) return 1;
      if (!b.nextAvailableDate) return -1;
      return new Date(a.nextAvailableDate) - new Date(b.nextAvailableDate);
    });

    // Combine results - available first, then unavailable
    const allVehiclesWithStatus = [...availableVehicles, ...unavailableVehicles];

    return res.status(200).json({
      success: true,
      data: allVehiclesWithStatus,
      summary: {
        total: allVehiclesWithStatus.length,
        available: availableVehicles.length,
        unavailable: unavailableVehicles.length,
        interstate: allVehiclesWithStatus.filter(v => v.isInterstate).length
      },
      searchParams: {
        pickupDate,
        dropOffDate,
        pickUpState: pickUpState || 'Any',
        dropOffState: dropOffState || 'Any',
        interstateAllowance: 400
      }
    });
  } catch (error) {
    console.error('Error in getAllVehiclesWithAvailability:', error);
    return next(
      errorHandler(500, "An error occurred while fetching vehicles with availability.")
    );
  }
};

// Send booking receipt PDF to user email
export const sendBookingReceiptPdf = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return next(errorHandler(400, "Booking ID is required"));
    }

    // Find the booking with vehicle and user details
    const booking = await Booking.findById(bookingId)
      .populate('vehicleId')
      .populate('userId');

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Get user details
    const userDetails = {
      name: booking.userId.name || booking.userId.username,
      email: booking.userId.email,
      phone: booking.userId.phoneNumber
    };

    // Generate PDF receipt using FAST service
    console.log("Generating fast PDF receipt for email...");
    const pdfStartTime = Date.now();
    
    const pdfResult = await generateFastBookingPDF(
      booking.toObject(),
      booking.vehicleId.toObject(),
      userDetails
    );

    const pdfEndTime = Date.now();
    const pdfTime = pdfEndTime - pdfStartTime;
    
    if (!pdfResult.success) {
      return next(errorHandler(500, "Failed to generate PDF receipt"));
    }

    console.log(`Fast PDF generated for email in ${pdfTime}ms`);

    // Send email with PDF attachment using the fast-generated PDF
    const emailResult = await sendBookingNotification(
      userDetails.email,
      booking.toObject(),
      booking.vehicleId.toObject(),
      userDetails,
      pdfResult.buffer // Use the fast-generated PDF buffer
    );

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: "Receipt PDF sent to your email successfully",
        method: emailResult.method,
        pdfGenerationTime: pdfTime
      });
    } else {
      return next(errorHandler(500, "Failed to send email"));
    }

  } catch (error) {
    console.error('Error sending booking receipt PDF:', error);
    return next(errorHandler(500, "An error occurred while sending the receipt PDF"));
  }
};

export const getVehiclesWithoutBooking = async (req, res, next) => {
  try {
    const { pickUpDistrict, pickUpLocation, pickupDate, dropOffDate, model } =
      req.body;

    if (!pickUpDistrict || !pickUpLocation)
      return next(errorHandler(409, "pickup District and location needed"));

    if (!pickupDate || !dropOffDate)
      return next(errorHandler(409, "pickup , dropffdate  is required"));

    // Check if pickupDate is before dropOffDate
    if (pickupDate >= dropOffDate)
      return next(errorHandler(409, "Invalid date range"));

    const vehiclesAvailableAtDate = await availableAtDate(
      pickupDate,
      dropOffDate
    );

    if (!vehiclesAvailableAtDate) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available for the specified time period.",
      });
    }

    const availableVehicles = vehiclesAvailableAtDate.filter(
      (cur) =>
        cur.district === pickUpDistrict &&
        cur.location == pickUpLocation &&
        cur.isDeleted === "false"
    );

    if (!availableVehicles) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available at this location.",
      });
    }

    // If there is no next middleware after this one, send the response
    if (!req.route || !req.route.stack || req.route.stack.length === 1) {
      console.log("hello");
      console.log({ success: "true", data: availableVehicles });
      return res.status(200).json({
        success: true,
        data: availableVehicles,
      });
    }

    // If there is a next middleware, pass control to it
    res.locals.actionResult = [availableVehicles, model];
    next();
  } catch (error) {
    console.log(error);
    return next(
      errorHandler(500, "An error occurred while fetching available vehicles.")
    );
  }
};

//getting all variants of a model which are not booked
export const showAllVariants = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;
    const model = actionResult[1];

    if (!actionResult[0]) {
      next(errorHandler(404, "no actionResult"));
    }
    const allVariants = actionResult[0].filter((cur) => {
      return cur.model === model;
    });

    res.status(200).json(allVariants);
  } catch (error) {
    next(errorHandler(500, "internal error in showAllVariants"));
  }
};

//show i if more vehcles with same model available
export const showOneofkind = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;

    const modelsMap = {};
    const singleVehicleofModel = [];

    if (!actionResult) {
      next(errorHandler(404, "no actionResult"));
      return;
    }

    actionResult[0].forEach((cur) => {
      if (!modelsMap[cur.model]) {
        modelsMap[cur.model] = true;
        singleVehicleofModel.push(cur);
      }
    });

    if (!singleVehicleofModel) {
      next(errorHandler(404, "no vehicles available"));
      return;
    }

    res.status(200).json(singleVehicleofModel);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error in showOneofkind"));
  }
};

//  filtering vehicles
export const filterVehicles = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(401, "bad request no body"));
      return;
    }
    const transformedData = req.body;
    if (!transformedData) {
      next(errorHandler(401, "select filter option first"));
    }
    const generateMatchStage = (data) => {
      const carTypes = [];
      data.forEach((cur) => {
        if (cur.type === "car_type") {
          // Extract the first key of the object and push it into 'cartypes' array
          const firstKey = Object.keys(cur).find((key) => key !== "type");
          if (firstKey) {
            carTypes.push(firstKey);
          }
        }
      });

      const transmitions = [];
      data.forEach((cur) => {
        // If the current element has type equal to 'transmition'
        if (cur.type === "transmition") {
          // Iterate through each key of the current element
          Object.keys(cur).forEach((key) => {
            // Exclude the 'type' key and push only keys with truthy values into 'transmitions' array
            if (key !== "type" && cur[key]) {
              transmitions.push(key);
            }
          });
        }
      });

      return {
        $match: {
          $and: [
            carTypes.length > 0 ? { car_type: { $in: carTypes } } : null,
            transmitions.length > 0
              ? { transmition: { $in: transmitions } }
              : null,
          ].filter((condition) => condition !== null), // Remove null conditions
        },
      };
    };

    const matchStage = generateMatchStage(transformedData);

    const filteredVehicles = await Vehicle.aggregate([matchStage]);
    if (!filteredVehicles) {
      next(errorHandler(401, "no vehicles found"));
      return;
    }
    res.status(200).json({
      status: "success",
      data: {
        filteredVehicles,
      },
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in fiilterVehicles"));
  }
};

export const findBookingsOfUser = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(409, "_id of user is required"));
      return;
    }
    const { userId } = req.body;
    const convertedUserId = new mongoose.Types.ObjectId(userId);

    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
    ]);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal error in findBookingOfUser"));
  }
};

//api to ge the latestbookings details
export const latestbookings = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    console.log(user_id);
    const convertedUserId = new mongoose.Types.ObjectId(user_id);

    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
      {
        $sort:
          /**
           * Provide any number of field/order pairs.
           */
          {
            "bookingDetails.createdAt": -1,
          },
      },
      {
        $limit:
          /**
           * Provide the number of documents to limit.
           */
          1,
      },
    ]);

    if (!bookings) {
      res.status(404, "error no such booking");
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in latestbookings"));
  }
};

//send booking details to user email
export const sendBookingDetailsEamil = async (req, res, next) => {
  try {
    console.log("Generating and sending invoice email");
    const { toEmail, data } = req.body;
    
    if (!toEmail || !data || !data[0]) {
      return next(errorHandler(400, "Email and booking data are required"));
    }

    const bookingDetails = data[0].bookingDetails;
    const vehicleDetails = data[0].vehicleDetails;
    
    // Get user details
    const userDetails = await User.findById(bookingDetails.userId);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(bookingDetails, vehicleDetails, userDetails);

    const generateEmailHtml = (bookingDetails, vehicleDetails) => {
      const pickupDate = new Date(bookingDetails.pickupDate);
      const dropOffDate = new Date(bookingDetails.dropOffDate);

      return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
              <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #333;">Rent-a-Ride</h1>
                  <h2 style="color: #666;">Booking Confirmation</h2>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Booking Information</h3>
                  <p><strong>Invoice Number:</strong> ${bookingDetails.invoiceNumber || 'N/A'}</p>
                  <p><strong>Booking ID:</strong> ${bookingDetails.bookingId || bookingDetails._id}</p>
                  <p><strong>Booking Date:</strong> ${new Date(bookingDetails.createdAt).toLocaleDateString()}</p>
                  <p><strong>Payment Method:</strong> ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p><strong>Payment Status:</strong> ${bookingDetails.paymentStatus === 'pending' ? 'Pay at Pickup' : 'Paid'}</p>
              </div>

              <div style="margin-bottom: 20px;">
                  <h3>Trip Details</h3>
                  <p><strong>Pickup Location:</strong> ${bookingDetails.pickUpLocation}</p>
                  <p><strong>Pickup Date:</strong> ${pickupDate.getDate()}/${pickupDate.getMonth() + 1}/${pickupDate.getFullYear()} ${pickupDate.getHours()}:${pickupDate.getMinutes().toString().padStart(2, '0')}</p>
                  <p><strong>Drop-off Location:</strong> ${bookingDetails.dropOffLocation}</p>
                  <p><strong>Drop-off Date:</strong> ${dropOffDate.getDate()}/${dropOffDate.getMonth() + 1}/${dropOffDate.getFullYear()} ${dropOffDate.getHours()}:${dropOffDate.getMinutes().toString().padStart(2, '0')}</p>
              </div>

              <div style="background-color: #e8f5e8; padding: 15px; text-align: center; margin-bottom: 20px;">
                  <h3 style="margin: 0; color: #2e7d32;">Total Amount: ₹${bookingDetails.totalPrice}</h3>
                  ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 
                    '<p style="margin: 5px 0; color: #666;">To be paid at vehicle pickup</p>' : 
                    '<p style="margin: 5px 0; color: #666;">Payment completed online</p>'
                  }
              </div>

              <div style="background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                  <h4 style="margin-top: 0; color: #1976d2;">📄 Invoice Attached</h4>
                  <p style="margin: 5px 0;">Your detailed invoice is attached as a PDF file. You can download, print, or save it for your records.</p>
              </div>

              <div style="border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #666;">
                  <p><strong>Important Notes:</strong></p>
                  <ul>
                      <li>Please carry a valid driving license and ID proof</li>
                      <li>Vehicle inspection will be done before handover</li>
                      ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 
                        '<li>Payment to be made in cash at the time of vehicle pickup</li>' : ''
                      }
                      <li>For any queries, contact our support team</li>
                  </ul>
                  <p style="text-align: center; margin-top: 20px;">Thank you for choosing Rent-a-Ride!</p>
              </div>
          </div>
      `;
    };

    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Rent-a-Ride - Booking Confirmation & Invoice",
      html: generateEmailHtml(bookingDetails, vehicleDetails),
      attachments: [
        {
          filename: `Invoice-${bookingDetails.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        next(errorHandler(500, "Error sending email"));
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({
          message: "Invoice sent successfully",
          invoiceNumber: bookingDetails.invoiceNumber
        });
      }
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in sendBookingDetailsEmail"));
  }
};

// Generate invoice for cash on delivery bookings
export const generateInvoice = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).populate('vehicleId').populate('userId');
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const invoiceData = {
      invoiceNumber: booking.invoiceNumber,
      bookingId: booking._id,
      customerName: booking.userId?.name || 'Customer',
      customerEmail: booking.userId?.email || '',
      vehicleDetails: booking.vehicleId,
      bookingDetails: booking,
      totalAmount: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    };

    res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      invoice: invoiceData
    });

  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error generating invoice"));
  }
};

// Download PDF invoice
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).populate('vehicleId').populate('userId');
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const pdfBuffer = await generateInvoicePDF(booking, booking.vehicleId, booking.userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${booking.invoiceNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error generating PDF"));
  }
};
// Update booking status (for completing trips, cancellations, etc.)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["notBooked", "booked", "onTrip", "notPicked", "canceled", "overDue", "tripCompleted"];
    
    if (!validStatuses.includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    // Update booking status
    booking.status = status;
    await booking.save();
    
    // If trip is completed or canceled, make vehicle available again
    if (status === "tripCompleted" || status === "canceled") {
      await updateVehicleBookingStatus(booking.vehicleId, false);
    }
    
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking
    });
    
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error updating booking status"));
  }
};

// Check vehicle availability for specific dates
export const checkVehicleAvailability = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, dropoffDate } = req.body;
    
    if (!vehicleId || !pickupDate || !dropoffDate) {
      return next(errorHandler(400, "Vehicle ID, pickup date, and dropoff date are required"));
    }
    
    const availabilityCheck = await isVehicleAvailable(vehicleId, pickupDate, dropoffDate);
    
    res.status(200).json({
      success: true,
      available: availabilityCheck.available,
      reason: availabilityCheck.reason || null,
      vehicle: availabilityCheck.vehicle || null
    });
    
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error checking vehicle availability"));
  }
};
// Test email functionality
export const testEmailServices = async (req, res, next) => {
  try {
    const { email, testType = 'all' } = req.body;
    
    if (!email) {
      return next(errorHandler(400, "Email is required for testing"));
    }
    
    const results = {};
    
    if (testType === 'otp' || testType === 'all') {
      try {
        const { generateOTP, sendVerificationOTP } = await import('../../services/emailService.js');
        const otp = generateOTP();
        await sendVerificationOTP(email, otp, 'Test User');
        results.otp = { success: true, message: 'OTP email sent successfully', otp };
      } catch (error) {
        results.otp = { success: false, error: error.message };
      }
    }
    
    if (testType === 'welcome' || testType === 'all') {
      try {
        const { sendWelcomeEmail } = await import('../../services/emailService.js');
        await sendWelcomeEmail(email, 'Test User');
        results.welcome = { success: true, message: 'Welcome email sent successfully' };
      } catch (error) {
        results.welcome = { success: false, error: error.message };
      }
    }
    
    if (testType === 'booking' || testType === 'all') {
      try {
        // Create sample booking data for testing
        const sampleBooking = {
          _id: 'TEST123456789',
          invoiceNumber: 'INV-TEST-001',
          pickupDate: new Date(),
          dropOffDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          pickUpLocation: 'Test Pickup Location',
          dropOffLocation: 'Test Drop Location',
          totalPrice: 2500,
          paymentMethod: 'cash_on_delivery',
          paymentStatus: 'pending',
          createdAt: new Date()
        };
        
        const sampleVehicle = {
          company: 'Test Company',
          model: 'Test Model',
          registeration_number: 'TEST1234'
        };
        
        const sampleUser = {
          name: 'Test User',
          email: email
        };
        
        await sendBookingNotification(email, sampleBooking, sampleVehicle, sampleUser);
        results.booking = { success: true, message: 'Booking notification sent successfully' };
      } catch (error) {
        results.booking = { success: false, error: error.message };
      }
    }
    
    if (testType === 'pdf' || testType === 'all') {
      try {
        // Test PDF generation and email
        const sampleBooking = {
          _id: 'TEST123456789',
          invoiceNumber: 'INV-TEST-001',
          pickupDate: new Date(),
          dropOffDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          pickUpLocation: 'Test Pickup Location',
          dropOffLocation: 'Test Drop Location',
          totalPrice: 2500,
          paymentMethod: 'cash_on_delivery',
          paymentStatus: 'pending',
          createdAt: new Date()
        };
        
        const sampleVehicle = {
          company: 'Test Company',
          model: 'Test Model',
          registeration_number: 'TEST1234',
          car_type: 'sedan',
          seats: 5,
          fuel_type: 'petrol',
          transmition: 'manual',
          year_made: 2023
        };
        
        const sampleUser = {
          name: 'Test User',
          email: email,
          phone: '9876543210'
        };
        
        const pdfBuffer = await generateInvoicePDF(sampleBooking, sampleVehicle, sampleUser);
        
        // Send email with PDF attachment
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Test PDF Invoice - Rent-a-Ride",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Test PDF Invoice</h2>
              <p>This is a test email to verify PDF invoice generation and email functionality.</p>
              <p>Your test PDF invoice is attached to this email.</p>
              <p>If you received this email with the PDF attachment, the system is working correctly!</p>
            </div>
          `,
          attachments: [
            {
              filename: `Test-Invoice-${sampleBooking.invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };
        
        await transporter.sendMail(mailOptions);
        results.pdf = { success: true, message: 'PDF invoice email sent successfully' };
      } catch (error) {
        results.pdf = { success: false, error: error.message };
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Email service tests completed',
      results,
      testType,
      email
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    next(errorHandler(500, "Error testing email services"));
  }
};
