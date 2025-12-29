import mongoose from 'mongoose';

const draftBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  bookingDetails: {
    pickupLocation: String,
    dropoffLocation: String,
    pickupDate: String,
    dropoffDate: String,
    pickupTime: String,
    dropoffTime: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online'],
    default: 'cash_on_delivery'
  },
  couponCode: String,
  discount: {
    type: Number,
    default: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
draftBookingSchema.index({ userId: 1, isComplete: 1 });
draftBookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

const DraftBooking = mongoose.model('DraftBooking', draftBookingSchema);

export default DraftBooking;