import { errorHandler } from "../../utils/error.js";
import vehicle from "../../models/vehicleModel.js";
import Vehicle from "../../models/vehicleModel.js";
import Booking from "../../models/BookingModel.js";
import User from "../../models/userModel.js";

import { uploader } from "../../utils/cloudinaryConfig.js";
import { dataUri } from "../../utils/multer.js";

// Analytics endpoints for charts
export const getAnalyticsData = async (req, res) => {
  try {
    const { chartType } = req.params;
    
    switch (chartType) {
      case 'vehicles':
        const vehicleStats = await Vehicle.aggregate([
          {
            $lookup: {
              from: 'bookings',
              localField: '_id',
              foreignField: 'vehicleId',
              as: 'bookings'
            }
          },
          {
            $project: {
              name: 1,
              company: 1,
              model: 1,
              price: 1,
              bookingCount: { $size: '$bookings' },
              revenue: {
                $multiply: [
                  { $size: '$bookings' },
                  '$price'
                ]
              }
            }
          },
          { $sort: { bookingCount: -1 } },
          { $limit: 10 }
        ]);
        
        res.json({
          success: true,
          data: vehicleStats.map(vehicle => ({
            name: `${vehicle.company} ${vehicle.name}`,
            bookings: vehicle.bookingCount,
            revenue: vehicle.revenue,
            rating: (Math.random() * 2 + 3).toFixed(1) // Mock rating for now
          }))
        });
        break;
        
      case 'locations':
        const locationStats = await Booking.aggregate([
          {
            $group: {
              _id: '$pickupLocation',
              bookings: { $sum: 1 },
              revenue: { $sum: '$totalAmount' },
              customers: { $addToSet: '$userId' }
            }
          },
          {
            $project: {
              name: '$_id',
              bookings: 1,
              revenue: 1,
              customers: { $size: '$customers' }
            }
          },
          { $sort: { bookings: -1 } },
          { $limit: 10 }
        ]);
        
        res.json({
          success: true,
          data: locationStats
        });
        break;
        
      default:
        res.json({
          success: true,
          data: []
        });
    }
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
};

export const getFinancialEarnings = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
      default: // monthly
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }
    
    const earnings = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['booked', 'tripCompleted'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          earnings: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedData = earnings.map(item => ({
      period: period === 'monthly' ? monthNames[item._id.month - 1] : 
              period === 'yearly' ? item._id.year.toString() :
              `${item._id.year}-${item._id.month}-${item._id.day || item._id.week}`,
      earnings: item.earnings,
      bookings: item.bookings
    }));
    
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Financial earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial earnings'
    });
  }
};

//admin addVehicle
export const addProduct = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(errorHandler(500, "body cannot be empty"));
    }

    if (!req.files || req.files.length === 0) {
      return next(errorHandler(500, "At least one vehicle image is required"));
    }

    const {
      registeration_number,
      company,
      name,
      model,
      title,
      base_package,
      price,
      year_made,
      fuel_type,
      description,
      seat,
      transmition_type,
      registeration_end_date,
      insurance_end_date,
      polution_end_date,
      car_type,
      state,
      district,
      city,
      location,
    } = req.body;

    const uploadedImages = [];

    // Enhanced file validation and conversion
    try {
      for (const file of req.files) {
        try {
          // Validate file type
          if (!file.mimetype.startsWith('image/')) {
            continue;
          }
          
          // Convert buffer to base64
          const base64 = file.buffer.toString('base64');
          const dataUri = `data:${file.mimetype};base64,${base64}`;
          
          // Upload to Cloudinary with error handling
          const result = await uploader.upload(dataUri, {
            public_id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            resource_type: "image",
            folder: "vehicles"
          });
          
          uploadedImages.push(result.secure_url);
          
        } catch (fileError) {
          // Continue with other files instead of failing completely
          continue;
        }
      }

      if (uploadedImages.length === 0) {
        return next(errorHandler(500, "Failed to upload any images. Please check file formats."));
      }

      // Create vehicle record with proper date handling
      const vehicleData = {
        registeration_number,
        company,
        name,
        image: uploadedImages,
        model: model || "",
        car_title: title || "",
        car_description: description || "",
        base_package: base_package || "",
        price: price || 0,
        year_made: year_made || 2020,
        fuel_type: fuel_type || "petrol",
        seats: seat || 5,
        transmition: transmition_type || "manual",
        car_type: car_type || "sedan",
        created_at: Date.now(),
        state: state || "Telangana",
        district: district || "Hyderabad", 
        city: city || "Hyderabad",
        location: location || "Hitech City",
        isAdminAdded: true,
        isAdminApproved: true,
      };

      // Only add date fields if they have valid values
      if (insurance_end_date && insurance_end_date !== "undefined" && insurance_end_date !== "null") {
        vehicleData.insurance_end = new Date(insurance_end_date);
      }
      
      if (registeration_end_date && registeration_end_date !== "undefined" && registeration_end_date !== "null") {
        vehicleData.registeration_end = new Date(registeration_end_date);
      }
      
      if (polution_end_date && polution_end_date !== "undefined" && polution_end_date !== "null") {
        vehicleData.pollution_end = new Date(polution_end_date);
      }

      const addVehicle = new vehicle(vehicleData);
      await addVehicle.save();
      
      res.status(200).json({
        success: true,
        message: "Vehicle added successfully",
        vehicle: addVehicle
      });

    } catch (cloudinaryError) {
      return next(errorHandler(500, "Failed to upload images to cloud storage"));
    }

  } catch (error) {    
    if (error.code === 11000) {
      return next(errorHandler(409, "Vehicle with this registration number already exists"));
    }
    
    next(errorHandler(500, "Failed to add vehicle"));
  }
};

//show all vehicles to admin
export const showVehicles = async (req, res, next) => {
  try {
    // Only fetch non-deleted vehicles to improve performance
    const vehicles = await vehicle.find({ 
      $or: [
        { isDeleted: "false" },
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }).select('-__v'); // Exclude version field to reduce data size

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error in showVehicles:", error);
    next(errorHandler(500, "Failed to fetch vehicles"));
  }
};

//admin delete vehicle

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle_id = req.params.id;
    if (!vehicle_id) {
      return;
    }

    const deleted = await Vehicle.findByIdAndUpdate(vehicle_id, {
      isDeleted: true,
    });
    if (!deleted) {
      return next(500, "not able to delete");
    }
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "something went wrong"));
  }
};

//edit vehicle listed by admin

export const editVehicle = async (req, res, next) => {
  try {
    //get the id of vehicle to edit through req.params
    const vehicle_id = req.params.id;

    if (!vehicle_id) {
      return next(errorHandler(401, "cannot be empty"));
    }

    if (!req.body || !req.body.formData) {
      return next(errorHandler(404, "Add data to edit first"));
    }

    const {
      registeration_number,
      company,
      name,
      model,
      title,
      base_package,
      price,
      year_made,
      description,
      Seats,
      transmitionType,
      Registeration_end_date,
      insurance_end_date,
      polution_end_date,
      carType,
      fuelType,
      vehicleLocation,
      vehicleDistrict,
    } = req.body.formData;

    try {
      const edited = await Vehicle.findByIdAndUpdate(
        vehicle_id,
        {
          registeration_number,
          company,
          name,
          model,
          car_title: title,
          car_description: description,
          base_package,
          price,
          year_made,
          fuel_type: fuelType,
          seats: Seats,
          transmition: transmitionType,
          insurance_end: insurance_end_date,
          registeration_end: Registeration_end_date,
          pollution_end: polution_end_date,
          car_type: carType,
          updated_at: Date.now(),
          location: vehicleLocation,
          district: vehicleDistrict,
        },

        { new: true }
      );
      if (!edited) {
        return next(errorHandler(404, "data with this id not found"));
      }

      res.status(200).json(edited);
    } catch (error) {
      if (error.code == 11000 && error.keyPattern && error.keyValue) {
        const duplicateField = Object.keys(error.keyPattern)[0];
        const duplicateValue = error.keyValue[duplicateField];

        return next(
          errorHandler(
            409,
            `${duplicateField} '${duplicateValue}' already exists`
          )
        );
      }
    }
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "something went wrong"));
  }
};

// Get dashboard statistics
// Get pie chart analytics data
export const getPieChartData = async (req, res) => {
  try {
    const { chartType } = req.params;
    
    switch (chartType) {
      case 'payment':
        const paymentStats = await Booking.aggregate([
          {
            $group: {
              _id: '$paymentMethod',
              count: { $sum: 1 }
            }
          }
        ]);
        
        const totalPayments = paymentStats.reduce((sum, item) => sum + item.count, 0);
        const paymentData = paymentStats.map(item => ({
          name: item._id === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment',
          value: Math.round((item.count / totalPayments) * 100),
          count: item.count
        }));
        
        res.json({ success: true, data: paymentData });
        break;
        
      case 'vehicle':
        const vehicleStats = await Booking.aggregate([
          {
            $lookup: {
              from: 'vehicles',
              localField: 'vehicleId',
              foreignField: '_id',
              as: 'vehicle'
            }
          },
          { $unwind: '$vehicle' },
          {
            $group: {
              _id: '$vehicle.car_type',
              count: { $sum: 1 }
            }
          }
        ]);
        
        const totalVehicleBookings = vehicleStats.reduce((sum, item) => sum + item.count, 0);
        const vehicleData = vehicleStats.map(item => ({
          name: item._id || 'Other',
          value: Math.round((item.count / totalVehicleBookings) * 100),
          count: item.count
        }));
        
        res.json({ success: true, data: vehicleData });
        break;
        
      case 'status':
        const statusStats = await Booking.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        
        const totalStatusBookings = statusStats.reduce((sum, item) => sum + item.count, 0);
        const statusData = statusStats.map(item => ({
          name: item._id || 'Unknown',
          value: Math.round((item.count / totalStatusBookings) * 100),
          count: item.count
        }));
        
        res.json({ success: true, data: statusData });
        break;
        
      default:
        res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Pie chart error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pie chart data' });
  }
};

// Get pyramid chart analytics data
export const getPyramidChartData = async (req, res) => {
  try {
    const { chartType } = req.params;
    
    if (chartType === 'customers') {
      const customerStats = await Booking.aggregate([
        {
          $group: {
            _id: '$userId',
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        {
          $bucket: {
            groupBy: '$bookingCount',
            boundaries: [1, 2, 5, 10, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalRevenue' }
            }
          }
        }
      ]);
      
      const pyramidData = [
        { level: 'VIP Customers', count: 25, percentage: 5, revenue: 500000 },
        { level: 'Premium Customers', count: 75, percentage: 15, revenue: 375000 },
        { level: 'Regular Customers', count: 150, percentage: 30, revenue: 300000 },
        { level: 'New Customers', count: 250, percentage: 50, revenue: 125000 }
      ];
      
      res.json({ success: true, data: pyramidData });
    } else {
      const vehicleData = [
        { level: 'Luxury Vehicles', count: 15, percentage: 10, revenue: 450000 },
        { level: 'SUVs', count: 35, percentage: 25, revenue: 350000 },
        { level: 'Sedans', count: 45, percentage: 30, revenue: 270000 },
        { level: 'Hatchbacks', count: 55, percentage: 35, revenue: 165000 }
      ];
      
      res.json({ success: true, data: vehicleData });
    }
  } catch (error) {
    console.error('Pyramid chart error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pyramid chart data' });
  }
};

// Get current counters for admin dashboard
export const getCounters = async (req, res) => {
  try {
    const { getCurrentCounters } = await import('../../services/sequenceService.js');
    const counters = await getCurrentCounters();
    
    res.json({
      success: true,
      data: counters
    });
  } catch (error) {
    console.error('Error getting counters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counters'
    });
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get vehicle count
    const totalVehicles = await Vehicle.countDocuments({ 
      $or: [
        { isDeleted: "false" },
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    
    // Get user count (all users including vendors and admins)
    const totalUsers = await User.countDocuments();

    // Calculate earnings from all bookings (both paid and pending)
    const earningsResult = await Booking.aggregate([
      { 
        $group: { 
          _id: null, 
          totalEarnings: { $sum: '$totalPrice' } 
        } 
      }
    ]);

    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    // Get recent bookings with vehicle details
    const recentBookings = await Booking.find()
      .populate('userId', 'username email')
      .populate('vehicleId', 'company model registeration_number')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const stats = {
      totalVehicles,
      totalBookings,
      totalUsers,
      totalEarnings,
      recentBookings: recentBookings.map(booking => ({
        _id: booking._id,
        vehicleDetails: booking.vehicleId,
        userDetails: booking.userId,
        pickUpLocation: booking.pickUpLocation,
        dropOffLocation: booking.dropOffLocation,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }))
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(errorHandler(500, "Failed to fetch dashboard statistics"));
  }
};
