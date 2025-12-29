import Booking from "../../models/BookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

export const allBookings = async (req, res, next) => {
  try {
    // Define the aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
          pipeline: [
            {
              $project: {
                company: 1,
                name: 1,
                model: 1,
                registeration_number: 1,
                pricePerDay: 1,
                image: { $slice: ["$image", 1] } // Only get first image
              }
            }
          ]
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                email: 1,
                phoneNumber: 1
              }
            }
          ]
        },
      },
      {
        $addFields: {
          vehicleDetails: { $arrayElemAt: ["$vehicleDetails", 0] },
          userDetails: { $arrayElemAt: ["$userDetails", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          bookingId: 1,
          invoiceNumber: 1,
          pickUpLocation: 1,
          dropOffLocation: 1,
          pickupDate: 1,
          dropOffDate: 1,
          totalPrice: 1,
          status: 1,
          paymentMethod: 1,
          createdAt: 1,
          vehicleDetails: 1,
          userId: "$userDetails"
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 1000 // Limit results to prevent memory issues
      }
    ];

    // Execute the aggregation with timeout
    const bookings = await Booking.aggregate(pipeline).exec();

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in allBookings:', error);
    
    // If timeout error, try a simpler query
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      try {
        console.log('Attempting fallback query...');
        const simpleBookings = await Booking.find({})
          .populate('vehicleId', 'company name model registeration_number image')
          .populate('userId', 'username email phoneNumber')
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();
        
        return res.status(200).json(simpleBookings);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return next(errorHandler(500, "Database timeout - please try again"));
      }
    }
    
    next(errorHandler(500, "Error fetching bookings"));
  }
};

//chnage bookings status
export const changeStatus = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(409, "bad request vehicle id and new status needed"));
      return;
    }
    const { id, status } = req.body;

    const statusChanged = await Booking.findByIdAndUpdate(
      id, 
      { status: status },
      { new: true } // Remove maxTimeMS as it may not be supported
    );

    if (!statusChanged) {
      next(errorHandler(404, "status not changed or wrong id"));
      return;
    }
    res.status(200).json({ message: "status changed" });
  } catch (error) {
    console.error('Error in changeStatus:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return next(errorHandler(500, "Database timeout - please try again"));
    }
    next(errorHandler(500, "error in changeStatus"));
  }
};
