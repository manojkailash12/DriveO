import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/userModel.js';
import Booking from '../models/BookingModel.js';
import Vehicle from '../models/vehicleModel.js';

const createIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔄 Creating database indexes...');

    // User model indexes
    console.log('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 });
    await User.collection.createIndex({ isAdmin: 1 });
    await User.collection.createIndex({ isVendor: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ isActive: 1 });
    
    // Compound indexes for User
    await User.collection.createIndex({ isAdmin: 1, isVendor: 1 });
    await User.collection.createIndex({ email: 1, isVendor: 1 });

    // Booking model indexes
    console.log('Creating Booking indexes...');
    await Booking.collection.createIndex({ userId: 1 });
    await Booking.collection.createIndex({ vehicleId: 1 });
    await Booking.collection.createIndex({ status: 1 });
    await Booking.collection.createIndex({ createdAt: -1 });
    await Booking.collection.createIndex({ pickupDate: 1 });
    await Booking.collection.createIndex({ dropOffDate: 1 });
    await Booking.collection.createIndex({ bookingId: 1 }, { unique: true });
    await Booking.collection.createIndex({ invoiceNumber: 1 });
    
    // Compound indexes for Booking
    await Booking.collection.createIndex({ userId: 1, createdAt: -1 });
    await Booking.collection.createIndex({ vehicleId: 1, status: 1 });
    await Booking.collection.createIndex({ vehicleId: 1, pickupDate: 1, dropOffDate: 1 });
    await Booking.collection.createIndex({ status: 1, createdAt: -1 });

    // Vehicle model indexes
    console.log('Creating Vehicle indexes...');
    await Vehicle.collection.createIndex({ registeration_number: 1 }, { unique: true });
    await Vehicle.collection.createIndex({ company: 1 });
    await Vehicle.collection.createIndex({ model: 1 });
    await Vehicle.collection.createIndex({ isDeleted: 1 });
    await Vehicle.collection.createIndex({ isApproved: 1 });
    await Vehicle.collection.createIndex({ createdAt: -1 });
    await Vehicle.collection.createIndex({ pricePerDay: 1 });
    
    // Compound indexes for Vehicle
    await Vehicle.collection.createIndex({ isDeleted: 1, isApproved: 1 });
    await Vehicle.collection.createIndex({ company: 1, model: 1 });

    // Text indexes for search functionality
    console.log('Creating text search indexes...');
    await User.collection.createIndex({ 
      username: 'text', 
      email: 'text' 
    });
    
    await Vehicle.collection.createIndex({ 
      company: 'text', 
      model: 'text', 
      registeration_number: 'text' 
    });

    console.log('✅ All indexes created successfully!');
    
    // List all indexes to verify
    console.log('\n📋 Current indexes:');
    
    const userIndexes = await User.collection.listIndexes().toArray();
    console.log('User indexes:', userIndexes.map(idx => idx.name));
    
    const bookingIndexes = await Booking.collection.listIndexes().toArray();
    console.log('Booking indexes:', bookingIndexes.map(idx => idx.name));
    
    const vehicleIndexes = await Vehicle.collection.listIndexes().toArray();
    console.log('Vehicle indexes:', vehicleIndexes.map(idx => idx.name));

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createIndexes();