import { errorHandler } from "../../utils/error.js";
import Booking from "../../models/BookingModel.js";

// Get comprehensive financial data
export const getFinancialData = async (req, res, next) => {
  try {
    console.log('Financial data request received:', req.query);
    const { period = 'all', status = 'all' } = req.query;
    
    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = {
          createdAt: { $gte: weekStart }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      default:
        // All time - no date filter
        break;
    }

    // Simplified query - get all bookings first
    console.log('Querying bookings with date filter:', dateFilter);
    const bookings = await Booking.find(dateFilter)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${bookings.length} bookings`);

    // Calculate financial metrics - use flexible field names
    const completedBookings = bookings.filter(booking => {
      const bookingStatus = booking.status || booking.bookingStatus || '';
      return ['booked', 'tripCompleted', 'Pending', 'onTrip', 'Confirmed', 'Completed'].includes(bookingStatus);
    });
    
    const pendingBookings = bookings.filter(booking => {
      const bookingStatus = booking.status || booking.bookingStatus || '';
      return ['notBooked', 'canceled', 'Cancelled'].includes(bookingStatus);
    });

    // Calculate earnings using flexible field names
    const totalEarnings = completedBookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || booking.totalAmount || 0), 0
    );

    const pendingPayments = pendingBookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || booking.totalAmount || 0), 0
    );

    // Transform bookings for frontend - simplified
    const transformedBookings = bookings.slice(0, 50).map(booking => ({
      id: booking._id,
      bookingId: booking.bookingId || `BK${booking._id.toString().slice(-6)}`,
      customerName: 'Customer',
      customerEmail: '',
      vehicleName: 'Vehicle',
      amount: booking.totalPrice || booking.totalAmount || 0,
      status: booking.status || booking.bookingStatus || 'Unknown',
      paymentMethod: booking.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment',
      paymentStatus: booking.paymentStatus || 'completed',
      bookingDate: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : '',
      duration: `${booking.totalDays || 1} days`,
      pickupDate: booking.pickupDate ? booking.pickupDate.toISOString().split('T')[0] : '',
      dropoffDate: booking.dropOffDate ? booking.dropOffDate.toISOString().split('T')[0] : ''
    }));

    // Generate monthly earnings data from actual bookings
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      // Get bookings for this month
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate < monthEnd;
      });
      
      const monthEarnings = monthBookings
        .filter(booking => ['booked', 'tripCompleted', 'Pending', 'onTrip', 'Confirmed', 'Completed'].includes(booking.status || booking.bookingStatus))
        .reduce((sum, booking) => sum + (booking.totalPrice || booking.totalAmount || 0), 0);
      
      monthlyEarnings.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        earnings: monthEarnings,
        bookings: monthBookings.length
      });
    }

    // Create sample transactions from bookings
    const transactions = completedBookings.slice(0, 10).map((booking, index) => ({
      id: index + 1,
      transactionId: `TXN${booking._id.toString().slice(-6)}`,
      bookingId: booking.bookingId || `BK${booking._id.toString().slice(-6)}`,
      amount: booking.totalPrice || booking.totalAmount || 0,
      type: 'Credit',
      status: 'Success',
      date: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : '',
      method: booking.paymentMethod === 'online' ? 'UPI' : 'Cash'
    }));

    // Payment method distribution - use actual data
    const paymentMethods = bookings.reduce((acc, booking) => {
      const method = booking.paymentMethod || 'cash_on_delivery';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const totalBookings = bookings.length;
    const paymentMethodData = Object.entries(paymentMethods).map(([method, count]) => ({
      name: method === 'online' ? 'Online Payment' : 
            method === 'upi' ? 'UPI' : 'Cash on Delivery',
      value: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
      color: method === 'online' ? '#82ca9d' : 
             method === 'upi' ? '#ffc658' : '#8884d8'
    }));

    const financialData = {
      totalEarnings,
      totalOrders: bookings.length,
      totalTransactions: transactions.length,
      pendingPayments,
      bookings: transformedBookings,
      transactions,
      monthlyEarnings,
      paymentMethodData
    };

    console.log('Sending financial data:', {
      totalEarnings,
      totalOrders: bookings.length,
      totalTransactions: transactions.length
    });

    res.status(200).json({
      success: true,
      data: financialData
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    console.error('Error stack:', error.stack);
    next(errorHandler(500, "Failed to fetch financial data"));
  }
};

// Get earnings data
export const getFinancialEarnings = async (req, res, next) => {
  try {
    const { period = '6months' } = req.query;
    
    let months = 6;
    if (period === '12months') months = 12;
    if (period === '3months') months = 3;

    // Get actual bookings for the period
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    
    const earningsData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      // Get bookings for this month
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate < monthEnd;
      });
      
      const monthEarnings = monthBookings
        .filter(booking => ['booked', 'tripCompleted', 'Pending', 'onTrip', 'Confirmed', 'Completed'].includes(booking.status || booking.bookingStatus))
        .reduce((sum, booking) => sum + (booking.totalPrice || booking.totalAmount || 0), 0);
      
      earningsData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: monthEarnings,
        bookings: monthBookings.length
      });
    }

    res.status(200).json({
      success: true,
      data: earningsData
    });

  } catch (error) {
    console.error('Error fetching earnings data:', error);
    next(errorHandler(500, "Failed to fetch earnings data"));
  }
};

// Get transactions data
export const getFinancialTransactions = async (req, res, next) => {
  try {
    const { limit = 50, status = 'all' } = req.query;
    
    // Mock transactions data
    const transactions = Array.from({ length: parseInt(limit) }, (_, index) => ({
      id: index + 1,
      transactionId: `TXN${String(index + 1).padStart(6, '0')}`,
      bookingId: `BK${String(index + 1).padStart(6, '0')}`,
      customerName: `Customer ${index + 1}`,
      vehicleName: `Vehicle ${index + 1}`,
      amount: Math.floor(Math.random() * 5000) + 1000,
      type: 'Credit',
      status: Math.random() > 0.1 ? 'Success' : 'Pending',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      method: Math.random() > 0.5 ? 'UPI' : 'Cash',
      paymentMethod: Math.random() > 0.5 ? 'Online Payment' : 'Cash on Delivery'
    }));

    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error fetching transactions data:', error);
    next(errorHandler(500, "Failed to fetch transactions data"));
  }
};