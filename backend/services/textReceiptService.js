/**
 * Ultra-fast text-based receipt generation
 * Fallback when PDF generation fails - generates in milliseconds
 */

export const generateTextReceipt = (bookingDetails, vehicleDetails, userDetails) => {
  const pickupDate = new Date(bookingDetails.pickupDate);
  const dropOffDate = new Date(bookingDetails.dropOffDate);
  const bookingDate = new Date(bookingDetails.createdAt);
  const isInterstate = bookingDetails.travelType === 'interstate';

  return `
═══════════════════════════════════════════════════════════════
                    DriveO
                      BOOKING RECEIPT
═══════════════════════════════════════════════════════════════

Generated: ${bookingDate.toLocaleDateString('en-IN')} ${bookingDate.toLocaleTimeString('en-IN')}

BOOKING INFORMATION
───────────────────────────────────────────────────────────────
Booking ID:      ${bookingDetails.bookingId || bookingDetails._id}
Invoice Number:  ${bookingDetails.invoiceNumber || 'N/A'}
Travel Type:     ${isInterstate ? 'INTERSTATE' : 'LOCAL'}
Status:          ${bookingDetails.status || 'Confirmed'}

CUSTOMER DETAILS
───────────────────────────────────────────────────────────────
Name:            ${userDetails.name || userDetails.username || 'N/A'}
Email:           ${userDetails.email || 'N/A'}
Phone:           ${userDetails.phone || userDetails.phoneNumber || 'N/A'}

VEHICLE DETAILS
───────────────────────────────────────────────────────────────
Vehicle:         ${vehicleDetails.company} ${vehicleDetails.name || vehicleDetails.model}
Registration:    ${vehicleDetails.registeration_number}
Type:            ${vehicleDetails.car_type || 'N/A'}

TRIP DETAILS
───────────────────────────────────────────────────────────────
Pickup Location: ${bookingDetails.pickUpLocation}
${bookingDetails.pickUpCity ? `Pickup City:     ${bookingDetails.pickUpCity}, ${bookingDetails.pickUpState || ''}` : ''}
Pickup Date:     ${pickupDate.toLocaleDateString('en-IN')} ${pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}

Drop-off Location: ${bookingDetails.dropOffLocation}
${bookingDetails.dropOffCity ? `Drop-off City:   ${bookingDetails.dropOffCity}, ${bookingDetails.dropOffState || ''}` : ''}
Drop-off Date:   ${dropOffDate.toLocaleDateString('en-IN')} ${dropOffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}

Duration:        ${bookingDetails.totalDays || 1} day(s)

PAYMENT DETAILS
───────────────────────────────────────────────────────────────
Base Price:      ₹${bookingDetails.basePrice || 0}
${bookingDetails.driverAllowance > 0 ? `Interstate Allowance: ₹${bookingDetails.driverAllowance}` : ''}
Payment Method:  ${bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}
Payment Status:  ${bookingDetails.paymentStatus === 'completed' ? 'Paid' : 'Pending'}

TOTAL AMOUNT:    ₹${bookingDetails.totalPrice}
${bookingDetails.paymentStatus === 'completed' ? '(Payment completed)' : '(To be paid at pickup)'}

${bookingDetails.specialRequests ? `
SPECIAL REQUESTS
───────────────────────────────────────────────────────────────
${bookingDetails.specialRequests}
` : ''}

IMPORTANT NOTES
───────────────────────────────────────────────────────────────
• Please carry valid driving license and government ID proof
• Vehicle inspection will be conducted before handover
• For support: support@driveo.com
• Thank you for choosing DriveO!

═══════════════════════════════════════════════════════════════
This is a computer-generated receipt.
═══════════════════════════════════════════════════════════════
`;
};

export default { generateTextReceipt };