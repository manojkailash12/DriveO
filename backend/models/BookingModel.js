import mongoose from "mongoose";
import { generateInvoiceNumber, generateBookingId } from "../services/sequenceService.js";

const userSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  pickupDate: { type: Date, required: true },
  dropOffDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional, if needed
  pickUpLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  
  // Enhanced location fields for cross-state travel
  pickUpCity: { type: String, required: false },
  pickUpState: { type: String, required: false },
  pickUpDistrict: { type: String, required: false },
  dropOffCity: { type: String, required: false },
  dropOffState: { type: String, required: false },
  dropOffDistrict: { type: String, required: false },
  
  // Travel type for cross-state bookings
  travelType: {
    type: String,
    enum: ["local", "intercity", "interstate"],
    default: "local"
  },
  
  // Additional charges for cross-state travel
  basePrice: { type: Number, required: false },
  crossStateCharges: { type: Number, default: 0 },
  tollCharges: { type: Number, default: 0 },
  driverAllowance: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  
  // Distance information
  estimatedDistance: { type: Number, required: false }, // Distance in kilometers
  
  paymentMethod: { 
    type: String, 
    enum: ["online", "cash_on_delivery"], 
    default: "cash_on_delivery" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed", "completed"], 
    default: "pending" 
  },
  razorpayOrderId: { type: String, required: false },
  razorpayPaymentId: { type: String, required: false },
  invoiceNumber: { type: String, unique: true },
  bookingId: { type: String, unique: true }, // Custom booking ID (BId0001, BId0002, etc.)
  totalDays: { type: Number, default: 1 },
  pickupTime: { type: String, default: "10:00" },
  dropoffTime: { type: String, default: "10:00" },
  bookingType: { type: String, default: "standard" }, // standard, enhanced_flow, etc.
  
  // Enhanced booking features
  specialRequests: { type: String, required: false },
  estimatedDistance: { type: Number, required: false }, // in kilometers
  estimatedDuration: { type: Number, required: false }, // in hours
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status:{
    type:String,
    enum:["notBooked","booked","onTrip","notPicked","canceled","overDue","tripCompleted","Pending"],
    default:"notBooked"
  }
});

// Generate invoice number and booking ID before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate sequential invoice number (INV001, INV002, etc.)
      if (!this.invoiceNumber) {
        this.invoiceNumber = await generateInvoiceNumber();
      }
      
      // Generate sequential booking ID (BId0001, BId0002, etc.)
      if (!this.bookingId) {
        this.bookingId = await generateBookingId();
      }
    } catch (error) {
      console.error('Error generating sequential numbers:', error);
      // Fallback to timestamp-based numbers
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${timestamp}-${random}`;
      }
      if (!this.bookingId) {
        this.bookingId = `BId-${timestamp}`;
      }
    }
  }
  next();
});

const Booking = mongoose.model("Booking", userSchema);

export default Booking;
