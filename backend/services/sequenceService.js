import Counter from "../models/counterModel.js";

// Generate next invoice number (INV001, INV002, etc.)
export const generateInvoiceNumber = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'invoice_counter',
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    
    // Format: INV001, INV002, ..., INV500, etc.
    if (counter.sequence_value === 1) {
      return 'INV001';
    }
    return `INV${counter.sequence_value}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based if counter fails
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  }
};

// Generate next booking ID (BId0001, BId0002, etc.)
export const generateBookingId = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'booking_counter',
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    
    // Format: BId0001, BId0002, etc. (always 4 digits)
    const paddedNumber = counter.sequence_value.toString().padStart(4, '0');
    return `BId${paddedNumber}`;
  } catch (error) {
    console.error('Error generating booking ID:', error);
    // Fallback to timestamp-based if counter fails
    const timestamp = Date.now().toString().slice(-4);
    return `BId${timestamp}`;
  }
};

// Get current counters (for admin dashboard)
export const getCurrentCounters = async () => {
  try {
    const invoiceCounter = await Counter.findById('invoice_counter');
    const bookingCounter = await Counter.findById('booking_counter');
    
    return {
      invoiceCount: invoiceCounter?.sequence_value || 0,
      bookingCount: bookingCounter?.sequence_value || 0
    };
  } catch (error) {
    console.error('Error getting counters:', error);
    return { invoiceCount: 0, bookingCount: 0 };
  }
};

// Reset counters (admin function - use with caution)
export const resetCounters = async () => {
  try {
    await Counter.findByIdAndUpdate('invoice_counter', { sequence_value: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('booking_counter', { sequence_value: 0 }, { upsert: true });
    return { success: true, message: 'Counters reset successfully' };
  } catch (error) {
    console.error('Error resetting counters:', error);
    return { success: false, message: 'Failed to reset counters' };
  }
};