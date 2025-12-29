import { errorHandler } from "../../utils/error.js";
import User from "../../models/userModel.js";
import Booking from "../../models/BookingModel.js";

// Get all users with timeout handling
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "Failed to fetch users"));
  }
};

// Get all vendors with timeout handling
export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ isVendor: true })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .lean();

    // Add vehicle count for each vendor (simplified)
    const vendorsWithStats = vendors.map(vendor => ({
      ...vendor,
      vehicleCount: 0 // Placeholder - can be optimized later with proper indexing
    }));

    res.status(200).json(vendorsWithStats);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "Failed to fetch vendors"));
  }
};

// Get user details with booking history
export const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Get user's booking history with timeout
    const bookings = await Booking.find({ userId })
      .populate('vehicleId', 'company model registeration_number')
      .sort({ createdAt: -1 })
      .limit(50) // Limit to recent 50 bookings
      .lean();

    const userWithStats = {
      ...user,
      totalBookings: bookings.length,
      totalSpent: bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      bookings
    };

    res.status(200).json(userWithStats);
  } catch (error) {
    console.error('Error fetching user details:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "Failed to fetch user details"));
  }
};

// Suspend/Activate user
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "Failed to update user status"));
  }
};

// Approve vendor
export const approveVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isApproved: true },
      { new: true }
    ).select('-password -refreshToken');

    if (!vendor) {
      return next(errorHandler(404, "Vendor not found"));
    }

    if (!vendor.isVendor) {
      return next(errorHandler(400, "User is not a vendor"));
    }

    res.status(200).json({
      success: true,
      message: "Vendor approved successfully",
      vendor
    });
  } catch (error) {
    console.error('Error approving vendor:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "Failed to approve vendor"));
  }
};

// Get customer analytics with optimized queries
export const getCustomerAnalytics = async (req, res, next) => {
  try {
    // Get all regular customers (not admins or vendors) with timeout
    const customers = await User.find({ 
      isAdmin: { $ne: true }, 
      isVendor: { $ne: true } 
    }).select('-password -refreshToken')
      .lean();

    // Use aggregation for better performance
    const customerStats = await User.aggregate([
      {
        $match: {
          isAdmin: { $ne: true },
          isVendor: { $ne: true }
        }
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "userId",
          as: "bookings",
          pipeline: [
            {
              $project: {
                totalPrice: 1,
                createdAt: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          totalBookings: { $size: "$bookings" },
          totalSpent: { $sum: "$bookings.totalPrice" },
          lastBooking: { $max: "$bookings.createdAt" },
          status: {
            $cond: {
              if: { $gt: [{ $size: "$bookings" }, 0] },
              then: "Active",
              else: "Inactive"
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          bookings: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json(customerStats);
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      // Fallback to simpler query
      try {
        console.log('Attempting fallback customer query...');
        const simpleCustomers = await User.find({ 
          isAdmin: { $ne: true }, 
          isVendor: { $ne: true } 
        }).select('-password -refreshToken')
          .limit(100)
          .lean();
        
        // Add basic stats without complex calculations
        const customersWithBasicStats = simpleCustomers.map(customer => ({
          ...customer,
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: null,
          status: 'Unknown'
        }));
        
        return res.status(200).json(customersWithBasicStats);
      } catch (fallbackError) {
        console.error('Fallback customer query also failed:', fallbackError);
        return next(errorHandler(500, "Database timeout - please try again"));
      }
    }
    
    next(errorHandler(500, "Failed to fetch customer analytics"));
  }
};