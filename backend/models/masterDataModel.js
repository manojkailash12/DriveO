import mongoose from "mongoose";

const masterDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  // Location hierarchy
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  mandal: {
    type: String, // For Telangana/Andhra Pradesh
  },
  taluka: {
    type: String, // For Karnataka/Maharashtra
  },
  tehsil: {
    type: String, // For North Indian states
  },
  city: {
    type: String,
  },
  village: {
    type: String,
  },
  location: {
    type: String,
  },
  // Location type and category
  type: {
    type: String,
    enum: ["location", "car", "tourist_place", "temple", "city", "village", "district", "state"],
  },
  category: {
    type: String,
    enum: ["administrative", "tourist", "religious", "historical", "natural", "cultural", "adventure", "beach", "hill_station", "wildlife", "heritage"]
  },
  // Car related fields
  model: {
    type: String,
  },
  variant: {
    type: String,
  },
  photoUrl: {
    type: String
  },
  brand: {
    type: String
  },
  // Tourist place details
  description: {
    type: String,
  },
  famous_for: {
    type: String,
  },
  best_time_to_visit: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Coordinates for mapping
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  // Additional metadata
  pincode: {
    type: String,
  },
  is_popular: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
});

const MasterData = mongoose.model("MasterData", masterDataSchema);

export default MasterData;


