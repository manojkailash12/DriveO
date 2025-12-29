import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import MasterData from '../models/masterDataModel.js';
import Vehicle from '../models/vehicleModel.js';
import User from '../models/userModel.js';
import Booking from '../models/BookingModel.js';

async function addPerformanceIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Adding performance indexes...');

    // MasterData indexes for location queries
    await MasterData.collection.createIndex({ state: 1 });
    await MasterData.collection.createIndex({ state: 1, district: 1 });
    await MasterData.collection.createIndex({ state: 1, district: 1, city: 1 });
    await MasterData.collection.createIndex({ state: 1, district: 1, city: 1, location: 1 });
    await MasterData.collection.createIndex({ tourist_place: 1 });
    console.log('✅ MasterData indexes added');

    // Vehicle indexes for search and filtering
    await Vehicle.collection.createIndex({ registeration_number: 1 });
    await Vehicle.collection.createIndex({ company: 1 });
    await Vehicle.collection.createIndex({ availability: 1 });
    await Vehicle.collection.createIndex({ isAdminApproved: 1 });
    await Vehicle.collection.createIndex({ price: 1 });
    await Vehicle.collection.createIndex({ location: 1 });
    await Vehicle.collection.createIndex({ 
      company: 1, 
      availability: 1, 
      isAdminApproved: 1 
    }); // Compound index for common queries
    console.log('✅ Vehicle indexes added');

    // User indexes for authentication and search
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ phone: 1 });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isVerified: 1 });
    console.log('✅ User indexes added');

    // Booking indexes for date range queries
    await Booking.collection.createIndex({ pickup_date: 1 });
    await Booking.collection.createIndex({ dropoff_date: 1 });
    await Booking.collection.createIndex({ user_id: 1 });
    await Booking.collection.createIndex({ vehicle_id: 1 });
    await Booking.collection.createIndex({ status: 1 });
    await Booking.collection.createIndex({ 
      pickup_date: 1, 
      dropoff_date: 1 
    }); // Compound index for date range queries
    await Booking.collection.createIndex({ 
      vehicle_id: 1, 
      pickup_date: 1, 
      dropoff_date: 1 
    }); // For availability checks
    console.log('✅ Booking indexes added');

    // Text indexes for search functionality
    await Vehicle.collection.createIndex({
      company: 'text',
      name: 'text',
      model: 'text',
      car_title: 'text',
      car_description: 'text'
    });
    console.log('✅ Text search indexes added');

    console.log('🎉 All performance indexes added successfully!');
    
    // Show index statistics
    const collections = [
      { name: 'MasterData', model: MasterData },
      { name: 'Vehicle', model: Vehicle },
      { name: 'User', model: User },
      { name: 'Booking', model: Booking }
    ];

    for (const collection of collections) {
      const indexes = await collection.model.collection.indexes();
      console.log(`\n📋 ${collection.name} Indexes (${indexes.length}):`);
      indexes.forEach(index => {
        const keys = Object.keys(index.key).join(', ');
        console.log(`  - ${index.name}: {${keys}}`);
      });
    }

  } catch (error) {
    console.error('❌ Error adding indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addPerformanceIndexes();