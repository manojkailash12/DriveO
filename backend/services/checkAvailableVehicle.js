import Booking from "../models/BookingModel.js";
import Vehicle from "../models/vehicleModel.js";

//returning vehicles that are not booked in selected Date
export async function availableAtDate(pickupDate, dropOffDate) {
  try {
    // Find all active bookings that overlap with the requested date range
    const activeBookings = await Booking.find({
      $and: [
        {
          $or: [
            { pickupDate: { $lt: dropOffDate }, dropOffDate: { $gt: pickupDate } }, // Overlap condition
            { pickupDate: { $gte: pickupDate, $lt: dropOffDate } }, // Start within range
            { dropOffDate: { $gt: pickupDate, $lte: dropOffDate } }, // End within range
            {
              pickupDate: { $lte: pickupDate },
              dropOffDate: { $gte: dropOffDate },
            }, // Booking includes the entire time range
          ]
        },
        {
          // Only consider bookings that are active (not completed, canceled, or failed)
          status: { 
            $in: ["booked", "onTrip", "notPicked"] 
          }
        }
      ]
    });

    // Get vehicle IDs that are currently booked
    const bookedVehicleIds = activeBookings.map((booking) => booking.vehicleId);
    const uniqueBookedVehicleIds = [...new Set(bookedVehicleIds)];

    // Find available vehicles (not booked, not deleted, and admin approved)
    const availableVehicles = await Vehicle.find({
      _id: { $nin: uniqueBookedVehicleIds }, // Not in booked vehicles
      isDeleted: 'false', // Not deleted
      isAdminApproved: true, // Admin approved
      isRejected: false // Not rejected
    });

    return availableVehicles || [];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Check if a specific vehicle is available for booking
export async function isVehicleAvailable(vehicleId, pickupDate, dropOffDate) {
  try {
    // Check if vehicle exists and is not deleted
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      isDeleted: 'false',
      isAdminApproved: true,
      isRejected: false
    });

    if (!vehicle) {
      return { available: false, reason: "Vehicle not found or not available" };
    }

    // Check for overlapping active bookings
    const conflictingBooking = await Booking.findOne({
      vehicleId: vehicleId,
      $and: [
        {
          $or: [
            { pickupDate: { $lt: dropOffDate }, dropOffDate: { $gt: pickupDate } },
            { pickupDate: { $gte: pickupDate, $lt: dropOffDate } },
            { dropOffDate: { $gt: pickupDate, $lte: dropOffDate } },
            {
              pickupDate: { $lte: pickupDate },
              dropOffDate: { $gte: dropOffDate },
            }
          ]
        },
        {
          status: { 
            $in: ["booked", "onTrip", "notPicked"] 
          }
        }
      ]
    });

    if (conflictingBooking) {
      return { 
        available: false, 
        reason: "Vehicle is already booked for the selected dates",
        conflictingBooking: conflictingBooking._id
      };
    }

    return { available: true, vehicle };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Update vehicle booking status
export async function updateVehicleBookingStatus(vehicleId, isBooked) {
  try {
    await Vehicle.findByIdAndUpdate(vehicleId, { isBooked });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
