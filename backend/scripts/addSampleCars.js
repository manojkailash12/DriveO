import mongoose from 'mongoose';
import Vehicle from '../models/vehicleModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleCars = [
  {
    registeration_number: "KA01AB1234",
    car_title: "Maruti Swift Dzire",
    car_description: "Comfortable sedan perfect for city rides",
    company: "Maruti Suzuki",
    name: "Swift Dzire",
    model: "Dzire",
    year_made: 2022,
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    description: "Well-maintained sedan with excellent fuel efficiency",
    title: "Maruti Swift Dzire - Reliable & Comfortable",
    price: 2500,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "sedan",
    location: "Koramangala",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA02CD5678",
    car_title: "Honda City",
    car_description: "Premium sedan with advanced features",
    company: "Honda",
    name: "City",
    model: "City",
    year_made: 2023,
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    description: "Luxury sedan with automatic transmission and premium interiors",
    title: "Honda City - Premium Comfort",
    price: 3500,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "sedan",
    location: "Indiranagar",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA03EF9012",
    car_title: "Hyundai Creta",
    car_description: "Spacious SUV perfect for family trips",
    company: "Hyundai",
    name: "Creta",
    model: "Creta",
    year_made: 2023,
    fuel_type: "diesel",
    seats: 5,
    transmition: "automatic",
    description: "Modern SUV with excellent ground clearance and comfort",
    title: "Hyundai Creta - Family SUV",
    price: 4500,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "suv",
    location: "Whitefield",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA04GH3456",
    car_title: "Maruti Alto",
    car_description: "Compact and economical car for city drives",
    company: "Maruti Suzuki",
    name: "Alto",
    model: "Alto",
    year_made: 2021,
    fuel_type: "petrol",
    seats: 4,
    transmition: "manual",
    description: "Budget-friendly hatchback with great fuel economy",
    title: "Maruti Alto - Budget Friendly",
    price: 1800,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "hatchback",
    location: "Jayanagar",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA05IJ7890",
    car_title: "Toyota Innova Crysta",
    car_description: "Premium MPV for large groups and families",
    company: "Toyota",
    name: "Innova Crysta",
    model: "Innova Crysta",
    year_made: 2022,
    fuel_type: "diesel",
    seats: 7,
    transmition: "manual",
    description: "Spacious MPV perfect for group travel and long trips",
    title: "Toyota Innova Crysta - Premium MPV",
    price: 5500,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "mpv",
    location: "Electronic City",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA06KL2345",
    car_title: "Mahindra XUV300",
    car_description: "Compact SUV with robust build quality",
    company: "Mahindra",
    name: "XUV300",
    model: "XUV300",
    year_made: 2023,
    fuel_type: "diesel",
    seats: 5,
    transmition: "manual",
    description: "Sturdy compact SUV with excellent safety features",
    title: "Mahindra XUV300 - Compact SUV",
    price: 3800,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "suv",
    location: "HSR Layout",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA07MN6789",
    car_title: "Tata Nexon",
    car_description: "Stylish compact SUV with modern features",
    company: "Tata",
    name: "Nexon",
    model: "Nexon",
    year_made: 2023,
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    description: "Feature-rich compact SUV with excellent build quality",
    title: "Tata Nexon - Modern Compact SUV",
    price: 3200,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "suv",
    location: "BTM Layout",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  },
  {
    registeration_number: "KA08OP0123",
    car_title: "Hyundai i20",
    car_description: "Premium hatchback with sporty design",
    company: "Hyundai",
    name: "i20",
    model: "i20",
    year_made: 2022,
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    description: "Stylish hatchback with premium features and comfort",
    title: "Hyundai i20 - Premium Hatchback",
    price: 2800,
    base_package: "24 hours",
    with_or_without_fuel: true,
    car_type: "hatchback",
    location: "Marathahalli",
    district: "Bangalore",
    isBooked: false,
    isAdminAdded: true,
    addedBy: 'admin',
    isAdminApproved: true,
    isRejected: false,
    isDeleted: 'false',
    created_at: new Date().toISOString()
  }
];

const addSampleCars = async () => {
  try {
    // Debug: Check if MONGO_URI is loaded
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if cars already exist
    for (const car of sampleCars) {
      const existingCar = await Vehicle.findOne({ 
        registeration_number: car.registeration_number 
      });
      
      if (!existingCar) {
        await Vehicle.create(car);
        console.log(`Added: ${car.car_title} (${car.registeration_number})`);
      } else {
        console.log(`Skipped: ${car.car_title} (${car.registeration_number}) - already exists`);
      }
    }

    console.log('Sample cars added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample cars:', error);
    process.exit(1);
  }
};

addSampleCars();