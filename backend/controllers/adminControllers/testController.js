import Booking from "../../models/BookingModel.js";

// Test database connection
export const testDatabase = async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Simple count query to test connection
    const count = await Booking.countDocuments();
    console.log(`Database test successful. Found ${count} bookings.`);
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      bookingCount: count
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
};