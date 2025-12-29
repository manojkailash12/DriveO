import DraftBooking from '../../models/draftBookingModel.js';

// Save draft booking
export const saveDraftBooking = async (req, res) => {
  try {
    const { userId, vehicleId, currentStep, bookingDetails, paymentMethod, couponCode, discount } = req.body;

    // Find existing draft for same user, vehicle, and location
    const existingDraft = await DraftBooking.findOne({
      userId,
      vehicleId,
      'bookingDetails.pickupLocation': bookingDetails.pickupLocation,
      'bookingDetails.dropoffLocation': bookingDetails.dropoffLocation,
      'bookingDetails.pickupDate': bookingDetails.pickupDate,
      isComplete: false
    });

    if (existingDraft) {
      // Update existing draft
      existingDraft.currentStep = currentStep;
      existingDraft.bookingDetails = bookingDetails;
      existingDraft.paymentMethod = paymentMethod;
      existingDraft.couponCode = couponCode;
      existingDraft.discount = discount;
      existingDraft.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset expiry
      
      await existingDraft.save();
      
      res.json({
        success: true,
        message: 'Draft booking updated successfully',
        draftBooking: existingDraft
      });
    } else {
      // Create new draft
      const newDraft = new DraftBooking({
        userId,
        vehicleId,
        currentStep,
        bookingDetails,
        paymentMethod,
        couponCode,
        discount
      });

      await newDraft.save();

      res.json({
        success: true,
        message: 'Draft booking saved successfully',
        draftBooking: newDraft
      });
    }
  } catch (error) {
    console.error('Error saving draft booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft booking',
      error: error.message
    });
  }
};

// Get user's draft bookings
export const getUserDraftBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const draftBookings = await DraftBooking.find({
      userId,
      isComplete: false
    })
    .populate('vehicleId', 'name company model image price seats fuelType transmission')
    .sort({ updatedAt: -1 })
    .limit(10);

    res.json({
      success: true,
      draftBookings
    });
  } catch (error) {
    console.error('Error fetching draft bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch draft bookings',
      error: error.message
    });
  }
};

// Delete draft booking
export const deleteDraftBooking = async (req, res) => {
  try {
    const { draftId } = req.params;
    const { userId } = req.body;

    const deletedDraft = await DraftBooking.findOneAndDelete({
      _id: draftId,
      userId
    });

    if (!deletedDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Draft booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting draft booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete draft booking',
      error: error.message
    });
  }
};

// Mark draft as complete
export const completeDraftBooking = async (req, res) => {
  try {
    const { draftId } = req.params;
    const { userId } = req.body;

    const updatedDraft = await DraftBooking.findOneAndUpdate(
      { _id: draftId, userId },
      { isComplete: true },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Draft booking marked as complete',
      draftBooking: updatedDraft
    });
  } catch (error) {
    console.error('Error completing draft booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete draft booking',
      error: error.message
    });
  }
};