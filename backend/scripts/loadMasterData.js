import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import MasterData from '../models/masterDataModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Comprehensive Indian location data with proper IDs
const indianLocationsData = [
  // Mumbai
  { id: 'LOC_MH_MUM_001', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Andheri East' },
  { id: 'LOC_MH_MUM_002', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Andheri West' },
  { id: 'LOC_MH_MUM_003', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Bandra' },
  { id: 'LOC_MH_MUM_004', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Juhu' },
  { id: 'LOC_MH_MUM_005', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Powai' },
  { id: 'LOC_MH_MUM_006', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Malad' },
  { id: 'LOC_MH_MUM_007', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Borivali' },
  { id: 'LOC_MH_MUM_008', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Thane' },
  { id: 'LOC_MH_MUM_009', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Navi Mumbai' },
  { id: 'LOC_MH_MUM_010', type: 'location', state: 'Maharashtra', district: 'Mumbai', location: 'Goregaon' },

  // Delhi
  { id: 'LOC_DL_DEL_001', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Connaught Place' },
  { id: 'LOC_DL_DEL_002', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Karol Bagh' },
  { id: 'LOC_DL_DEL_003', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Lajpat Nagar' },
  { id: 'LOC_DL_DEL_004', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Rajouri Garden' },
  { id: 'LOC_DL_DEL_005', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Dwarka' },
  { id: 'LOC_DL_DEL_006', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Rohini' },
  { id: 'LOC_DL_DEL_007', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Janakpuri' },
  { id: 'LOC_DL_DEL_008', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Saket' },
  { id: 'LOC_DL_DEL_009', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Vasant Kunj' },
  { id: 'LOC_DL_DEL_010', type: 'location', state: 'Delhi', district: 'Delhi', location: 'Gurgaon' },

  // Bangalore
  { id: 'LOC_KA_BLR_001', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Koramangala' },
  { id: 'LOC_KA_BLR_002', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Indiranagar' },
  { id: 'LOC_KA_BLR_003', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Whitefield' },
  { id: 'LOC_KA_BLR_004', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Electronic City' },
  { id: 'LOC_KA_BLR_005', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Marathahalli' },
  { id: 'LOC_KA_BLR_006', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'BTM Layout' },
  { id: 'LOC_KA_BLR_007', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Jayanagar' },
  { id: 'LOC_KA_BLR_008', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'HSR Layout' },
  { id: 'LOC_KA_BLR_009', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Sarjapur Road' },
  { id: 'LOC_KA_BLR_010', type: 'location', state: 'Karnataka', district: 'Bangalore', location: 'Banashankari' },

  // Chennai
  { id: 'LOC_TN_CHE_001', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'T. Nagar' },
  { id: 'LOC_TN_CHE_002', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Anna Nagar' },
  { id: 'LOC_TN_CHE_003', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Velachery' },
  { id: 'LOC_TN_CHE_004', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Adyar' },
  { id: 'LOC_TN_CHE_005', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'OMR' },
  { id: 'LOC_TN_CHE_006', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Tambaram' },
  { id: 'LOC_TN_CHE_007', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Porur' },
  { id: 'LOC_TN_CHE_008', type: 'location', state: 'Tamil Nadu', district: 'Chennai', location: 'Chrompet' },

  // Hyderabad
  { id: 'LOC_TS_HYD_001', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Banjara Hills' },
  { id: 'LOC_TS_HYD_002', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Jubilee Hills' },
  { id: 'LOC_TS_HYD_003', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Gachibowli' },
  { id: 'LOC_TS_HYD_004', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Hitech City' },
  { id: 'LOC_TS_HYD_005', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Kondapur' },
  { id: 'LOC_TS_HYD_006', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Madhapur' },
  { id: 'LOC_TS_HYD_007', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Kukatpally' },
  { id: 'LOC_TS_HYD_008', type: 'location', state: 'Telangana', district: 'Hyderabad', location: 'Secunderabad' },

  // Pune
  { id: 'LOC_MH_PUN_001', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Koregaon Park' },
  { id: 'LOC_MH_PUN_002', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Baner' },
  { id: 'LOC_MH_PUN_003', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Wakad' },
  { id: 'LOC_MH_PUN_004', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Hinjewadi' },
  { id: 'LOC_MH_PUN_005', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Kothrud' },
  { id: 'LOC_MH_PUN_006', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Viman Nagar' },
  { id: 'LOC_MH_PUN_007', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Aundh' },
  { id: 'LOC_MH_PUN_008', type: 'location', state: 'Maharashtra', district: 'Pune', location: 'Magarpatta' }
];

// Popular Indian car models data with proper IDs
const indianCarsData = [
  // Maruti Suzuki
  { id: 'CAR_MS_001', type: 'car', brand: 'Maruti Suzuki', model: 'Swift' },
  { id: 'CAR_MS_002', type: 'car', brand: 'Maruti Suzuki', model: 'Baleno' },
  { id: 'CAR_MS_003', type: 'car', brand: 'Maruti Suzuki', model: 'Dzire' },
  { id: 'CAR_MS_004', type: 'car', brand: 'Maruti Suzuki', model: 'Alto' },
  { id: 'CAR_MS_005', type: 'car', brand: 'Maruti Suzuki', model: 'Wagon R' },
  { id: 'CAR_MS_006', type: 'car', brand: 'Maruti Suzuki', model: 'Vitara Brezza' },
  { id: 'CAR_MS_007', type: 'car', brand: 'Maruti Suzuki', model: 'Ertiga' },
  { id: 'CAR_MS_008', type: 'car', brand: 'Maruti Suzuki', model: 'Ciaz' },

  // Hyundai
  { id: 'CAR_HY_001', type: 'car', brand: 'Hyundai', model: 'i20' },
  { id: 'CAR_HY_002', type: 'car', brand: 'Hyundai', model: 'Verna' },
  { id: 'CAR_HY_003', type: 'car', brand: 'Hyundai', model: 'Creta' },
  { id: 'CAR_HY_004', type: 'car', brand: 'Hyundai', model: 'Venue' },
  { id: 'CAR_HY_005', type: 'car', brand: 'Hyundai', model: 'Grand i10' },
  { id: 'CAR_HY_006', type: 'car', brand: 'Hyundai', model: 'Tucson' },

  // Tata
  { id: 'CAR_TA_001', type: 'car', brand: 'Tata', model: 'Nexon' },
  { id: 'CAR_TA_002', type: 'car', brand: 'Tata', model: 'Harrier' },
  { id: 'CAR_TA_003', type: 'car', brand: 'Tata', model: 'Altroz' },
  { id: 'CAR_TA_004', type: 'car', brand: 'Tata', model: 'Tigor' },
  { id: 'CAR_TA_005', type: 'car', brand: 'Tata', model: 'Safari' },

  // Mahindra
  { id: 'CAR_MA_001', type: 'car', brand: 'Mahindra', model: 'XUV700' },
  { id: 'CAR_MA_002', type: 'car', brand: 'Mahindra', model: 'Scorpio' },
  { id: 'CAR_MA_003', type: 'car', brand: 'Mahindra', model: 'Thar' },
  { id: 'CAR_MA_004', type: 'car', brand: 'Mahindra', model: 'Bolero' },
  { id: 'CAR_MA_005', type: 'car', brand: 'Mahindra', model: 'XUV300' },

  // Honda
  { id: 'CAR_HO_001', type: 'car', brand: 'Honda', model: 'City' },
  { id: 'CAR_HO_002', type: 'car', brand: 'Honda', model: 'Amaze' },
  { id: 'CAR_HO_003', type: 'car', brand: 'Honda', model: 'WR-V' },
  { id: 'CAR_HO_004', type: 'car', brand: 'Honda', model: 'Jazz' },

  // Toyota
  { id: 'CAR_TO_001', type: 'car', brand: 'Toyota', model: 'Innova Crysta' },
  { id: 'CAR_TO_002', type: 'car', brand: 'Toyota', model: 'Fortuner' },
  { id: 'CAR_TO_003', type: 'car', brand: 'Toyota', model: 'Yaris' },
  { id: 'CAR_TO_004', type: 'car', brand: 'Toyota', model: 'Glanza' },

  // Kia
  { id: 'CAR_KI_001', type: 'car', brand: 'Kia', model: 'Seltos' },
  { id: 'CAR_KI_002', type: 'car', brand: 'Kia', model: 'Sonet' },
  { id: 'CAR_KI_003', type: 'car', brand: 'Kia', model: 'Carnival' },

  // MG
  { id: 'CAR_MG_001', type: 'car', brand: 'MG', model: 'Hector' },
  { id: 'CAR_MG_002', type: 'car', brand: 'MG', model: 'ZS EV' },
  { id: 'CAR_MG_003', type: 'car', brand: 'MG', model: 'Astor' }
];

async function loadMasterData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing master data
    console.log('🗑️ Clearing existing master data...');
    await MasterData.deleteMany({});

    // Insert location data
    console.log('📍 Loading Indian location data...');
    await MasterData.insertMany(indianLocationsData);
    console.log(`✅ Loaded ${indianLocationsData.length} locations`);

    // Insert car data
    console.log('🚗 Loading Indian car models data...');
    await MasterData.insertMany(indianCarsData);
    console.log(`✅ Loaded ${indianCarsData.length} car models`);

    // Summary
    const totalRecords = await MasterData.countDocuments();
    const locationCount = await MasterData.countDocuments({ type: 'location' });
    const carCount = await MasterData.countDocuments({ type: 'car' });

    console.log('\n📊 Master Data Loading Summary:');
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Locations: ${locationCount}`);
    console.log(`Car Models: ${carCount}`);
    console.log('\n🎉 Master data loaded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading master data:', error);
    process.exit(1);
  }
}

// Run the script
loadMasterData();