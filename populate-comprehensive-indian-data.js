import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import MasterData from './backend/models/masterDataModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Comprehensive Car Data with Hierarchical Structure
const carData = [
  // Maruti Suzuki
  { brand: "Maruti Suzuki", model: "Swift", variant: "VXI", type: "car" },
  { brand: "Maruti Suzuki", model: "Swift", variant: "ZXI", type: "car" },
  { brand: "Maruti Suzuki", model: "Baleno", variant: "Alpha", type: "car" },
  { brand: "Maruti Suzuki", model: "Baleno", variant: "Zeta", type: "car" },
  { brand: "Maruti Suzuki", model: "Dzire", variant: "VXI", type: "car" },
  { brand: "Maruti Suzuki", model: "Dzire", variant: "ZXI", type: "car" },
  { brand: "Maruti Suzuki", model: "Vitara Brezza", variant: "ZXI+", type: "car" },
  { brand: "Maruti Suzuki", model: "Ertiga", variant: "ZXI+", type: "car" },
  { brand: "Maruti Suzuki", model: "Alto K10", variant: "VXI", type: "car" },
  { brand: "Maruti Suzuki", model: "WagonR", variant: "ZXI", type: "car" },
  
  // Hyundai
  { brand: "Hyundai", model: "i20", variant: "Asta", type: "car" },
  { brand: "Hyundai", model: "i20", variant: "Sportz", type: "car" },
  { brand: "Hyundai", model: "Creta", variant: "SX(O)", type: "car" },
  { brand: "Hyundai", model: "Creta", variant: "SX", type: "car" },
  { brand: "Hyundai", model: "Verna", variant: "SX(O)", type: "car" },
  { brand: "Hyundai", model: "Venue", variant: "SX+", type: "car" },
  { brand: "Hyundai", model: "Grand i10 Nios", variant: "Asta", type: "car" },
  
  // Tata
  { brand: "Tata", model: "Nexon", variant: "XZ+", type: "car" },
  { brand: "Tata", model: "Nexon", variant: "XM", type: "car" },
  { brand: "Tata", model: "Harrier", variant: "XZ+", type: "car" },
  { brand: "Tata", model: "Safari", variant: "XZ+", type: "car" },
  { brand: "Tata", model: "Altroz", variant: "XZ+", type: "car" },
  { brand: "Tata", model: "Tiago", variant: "XZ+", type: "car" },
  { brand: "Tata", model: "Punch", variant: "Adventure", type: "car" },
  
  // Mahindra
  { brand: "Mahindra", model: "XUV700", variant: "AX7", type: "car" },
  { brand: "Mahindra", model: "XUV300", variant: "W8(O)", type: "car" },
  { brand: "Mahindra", model: "Scorpio-N", variant: "Z8L", type: "car" },
  { brand: "Mahindra", model: "Thar", variant: "LX", type: "car" },
  
  // Honda
  { brand: "Honda", model: "City", variant: "ZX", type: "car" },
  { brand: "Honda", model: "Amaze", variant: "VX", type: "car" },
  { brand: "Honda", model: "Jazz", variant: "VX", type: "car" },
  
  // Toyota
  { brand: "Toyota", model: "Innova Crysta", variant: "ZX", type: "car" },
  { brand: "Toyota", model: "Fortuner", variant: "4x4", type: "car" },
  { brand: "Toyota", model: "Glanza", variant: "G", type: "car" },
  
  // Kia
  { brand: "Kia", model: "Seltos", variant: "GTX+", type: "car" },
  { brand: "Kia", model: "Sonet", variant: "GTX+", type: "car" },
  { brand: "Kia", model: "Carens", variant: "Luxury+", type: "car" }
];

// Comprehensive Location Data - Focus on South Indian States with All Districts
const locationData = [
  // Karnataka - ALL Districts with 15+ locations each (Primary focus as vehicles are from Karnataka)
  // Hydgalore Urban District
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Koramangala", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Indiranagar", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Whitefield", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Electronic City", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "HSR Layout", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "BTM Layout", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Jayanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Marathahalli", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Bannerghatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Yelahanka", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Sarjapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Bellandur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Hebbal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Rajajinagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Malleshwaram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Basavanagudi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "JP Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Vijayanagar", type: "location", category: "administrative" },

  // Raichur District (Special focus as requested)
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Station Road", type: "location", category: "administrative"},
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Gandhi Chowk", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Jawahar Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Shivaji Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Nehru Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Ambedkar Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Basava Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Lingasugur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Manvi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Sindhanur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Devadurga", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Lingsugur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Maski", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Sirwar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Raichur", city: "Raichur", location: "Yelaburga", type: "location", category: "administrative" },

  // Mysore District
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Palace Road", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Chamundi Hills", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Bannimantap", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Hebbal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Jayalakshmipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Kuvempunagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Lakshmipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Nazarbad", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Ramakrishnanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Saraswathipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Siddarthanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Srirampura", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Vidyaranyapuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Vijayanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Yadavagiri", type: "location", category: "administrative" },

  // Hubli-Dharwad District
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Old Hubli", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Dharwad City", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Gokul Road", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Keshwapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Vidyanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Saptapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Kelgeri", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Unkal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Rayapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Navanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Hosur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Deshpande Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Akshay Park", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Tarihal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Kusugal", type: "location", category: "administrative" },

  // Dakshina Kannada District (Mangalore)
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Hampankatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kadri", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kankanady", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kodialbail", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Lalbagh", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Mallikatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Pandeshwar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Pumpwell", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Surathkal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Ullal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Valencia", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Vamanjoor", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Yeyyadi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Bondel", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Deralakatte", type: "location", category: "administrative" },
  // Gulbarga District
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Super Market", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Jewargi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Afzalpur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Aland", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Chincholi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Chitapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Gulbarga Rural", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Sedam", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Shahabad", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Shorapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Yadgir", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Basavakalyan", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Bidar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Humnabad", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Gulbarga", city: "Gulbarga", location: "Bhalki", type: "location", category: "administrative" },

  // Bijapur District
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Station Road", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Gol Gumbaz", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Basavan Bagewadi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Bagalkot", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Badami", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Bilagi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Chadchan", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Hungund", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Ilkal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Indi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Jamkhandi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Mudhol", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Rabkavi Banhatti", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Sindgi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bijapur", city: "Bijapur", location: "Talikota", type: "location", category: "administrative" },

  // Telangana - Selected Major Districts (Reduced as requested)
  // Hyderabad District
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Hitech City", type: "location", category: "administrative", is_popular: true },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Gachibowli", type: "location", category: "administrative", is_popular: true },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Jubilee Hills", type: "location", category: "administrative", is_popular: true },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Banjara Hills", type: "location", category: "administrative", is_popular: true },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Secunderabad", type: "location", category: "administrative", is_popular: true },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Madhapur", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Kondapur", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Kukatpally", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Miyapur", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Begumpet", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Ameerpet", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Dilsukhnagar", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "LB Nagar", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Uppal", type: "location", category: "administrative" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", location: "Charminar", type: "location", category: "administrative" },
  
  // Karnataka - All Major Districts with 15+ locations each
  // Bangalore Urban District
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Koramangala", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Indiranagar", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Whitefield", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Electronic City", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "HSR Layout", type: "location", category: "administrative", is_popular: true },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "BTM Layout", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Jayanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Marathahalli", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Bannerghatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Yelahanka", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Sarjapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Bellandur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Hebbal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Rajajinagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Malleshwaram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Basavanagudi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "JP Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", location: "Vijayanagar", type: "location", category: "administrative" },

  // Mysore District
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Palace Road", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Chamundi Hills", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Bannimantap", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Hebbal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Jayalakshmipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Kuvempunagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Lakshmipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Nazarbad", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Ramakrishnanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Saraswathipuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Siddarthanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Srirampura", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Vidyaranyapuram", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Vijayanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Mysore", city: "Mysore", location: "Yadavagiri", type: "location", category: "administrative" },

  // Hubli-Dharwad District
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Old Hubli", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Dharwad City", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Gokul Road", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Keshwapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Vidyanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Saptapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Dharwad", location: "Kelgeri", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Unkal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Rayapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Navanagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Hosur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Deshpande Nagar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Akshay Park", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Tarihal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Hubli-Dharwad", city: "Hubli", location: "Kusugal", type: "location", category: "administrative" },

  // Dakshina Kannada District (Mangalore)
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Hampankatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kadri", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kankanady", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Kodialbail", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Lalbagh", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Mallikatta", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Pandeshwar", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Pumpwell", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Surathkal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Ullal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Valencia", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Vamanjoor", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Yeyyadi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Bondel", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Dakshina Kannada", city: "Mangalore", location: "Deralakatte", type: "location", category: "administrative" },

  // Belgaum District
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Camp Area", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Tilakwadi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Shahapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Hindwadi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Vadgaon", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Khanapur", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Athani", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Bailhongal", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Chikkodi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Gokak", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Hukkeri", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Mudalgi", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Parasgad", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Ramdurg", type: "location", category: "administrative" },
  { state: "Karnataka", district: "Belgaum", city: "Belgaum", location: "Soundatti", type: "location", category: "administrative" },
  
  // Andhra Pradesh - All Major Districts with 15+ locations each
  // Visakhapatnam District
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Beach Road", type: "location", category: "administrative", is_popular: true },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Dwaraka Nagar", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "MVP Colony", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Siripuram", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Gajuwaka", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Madhurawada", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Rushikonda", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Seethammadhara", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Lawsons Bay", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Pendurthi", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Anakapalle", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Bheemunipatnam", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Narsipatnam", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Padmanabham", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam", location: "Yelamanchili", type: "location", category: "administrative" },

  // Guntur District
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Brodipet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Lakshmipuram", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Arundelpet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Kothapet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Nagarampalem", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Pattabhipuram", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Syamalanagar", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Vidyanagar", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Amaravathi", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Bapatla", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Chilakaluripet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Macherla", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Narasaraopet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Repalle", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Guntur", city: "Guntur", location: "Sattenapalle", type: "location", category: "administrative" },

  // Krishna District (Vijayawada)
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "MG Road", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Benz Circle", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Governorpet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Labbipet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Patamatalanka", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Suryaraopet", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Tadepalli", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Undavalli", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Gannavaram", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Gudivada", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Jaggayyapeta", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Machilipatnam", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Nandigama", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Nuzvidu", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada", location: "Tiruvuru", type: "location", category: "administrative" },

  // Chittoor District (Tirupati)
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Tirumala", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Alipiri", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Balaji Colony", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Kapila Theertham", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Leela Mahal", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Renigunta", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Settipalli", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Srikalahasti", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Chandragiri", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Chittoor", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Madanapalle", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Palamaner", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Punganur", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Puttur", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Chittoor", city: "Tirupati", location: "Vayalpad", type: "location", category: "administrative" },

  // Kurnool District
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Kurnool City", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Adoni", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Allagadda", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Atmakur", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Banaganapalle", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Dhone", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Emmiganur", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Gadwal", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Holagunda", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Kodumur", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Kosigi", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Mantralayam", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Nandyal", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Orvakal", type: "location", category: "administrative" },
  { state: "Andhra Pradesh", district: "Kurnool", city: "Kurnool", location: "Yemmiganur", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Andheri", type: "location", category: "administrative", is_popular: true },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Bandra", type: "location", category: "administrative", is_popular: true },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Juhu", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Powai", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Colaba", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Worli", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai City", city: "Mumbai", location: "Lower Parel", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai Suburban", city: "Mumbai", location: "Borivali", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Mumbai Suburban", city: "Mumbai", location: "Malad", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Koregaon Park", type: "location", category: "administrative", is_popular: true },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Hinjewadi", type: "location", category: "administrative", is_popular: true },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Kothrud", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Viman Nagar", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Wakad", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Pune", city: "Pune", location: "Baner", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Nashik", city: "Nashik", location: "College Road", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Nagpur", city: "Nagpur", location: "Sitabuldi", type: "location", category: "administrative" },
  { state: "Maharashtra", district: "Aurangabad", city: "Aurangabad", location: "CIDCO", type: "location", category: "administrative" },
  
  // Tamil Nadu - All Major Districts with 15+ locations each
  // Chennai District
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "T. Nagar", type: "location", category: "administrative", is_popular: true },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Anna Nagar", type: "location", category: "administrative", is_popular: true },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Velachery", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "OMR", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Adyar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Nungambakkam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Mylapore", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Tambaram", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Chrompet", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Porur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Guindy", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Egmore", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Kilpauk", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Kodambakkam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Vadapalani", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Ashok Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Besant Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", location: "Sholinganallur", type: "location", category: "administrative" },

  // Coimbatore District
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "RS Puram", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Peelamedu", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Gandhipuram", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Saibaba Colony", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Singanallur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Vadavalli", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Saravanampatty", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Kuniyamuthur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Podanur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Sulur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Thudiyalur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Ukkadam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Kalapatti", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Mettupalayam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", location: "Pollachi", type: "location", category: "administrative" },

  // Madurai District
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Anna Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "KK Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Meenakshi Amman Temple", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Goripalayam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Sellur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Vilangudi", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Pasumalai", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Thiruparankundram", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Avaniyapuram", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Kalligudi", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Melur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Peraiyur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Sedapatti", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Thirumangalam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Madurai", city: "Madurai", location: "Usilampatti", type: "location", category: "administrative" },

  // Tiruchirappalli District
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Cantonment", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Srirangam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Thillai Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "K K Nagar", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Puthur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Woraiyur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Ariyamangalam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Lalgudi", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Manachanallur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Manapparai", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Musiri", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Srirangam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Thiruverumbur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Thuraiyur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Trichy", location: "Uppiliapuram", type: "location", category: "administrative" },

  // Salem District
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Junction", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Fairlands", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Ammapet", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Hasthampatti", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Kitchipalayam", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Kondalampatti", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Swarnapuri", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Yercaud", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Attur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Edappadi", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Gangavalli", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Mettur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Omalur", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Sankari", type: "location", category: "administrative" },
  { state: "Tamil Nadu", district: "Salem", city: "Salem", location: "Vazhapadi", type: "location", category: "administrative" },
  
  // Goa - Multiple Districts
  { state: "Goa", district: "North Goa", city: "Panaji", location: "18th June Road", type: "location", category: "administrative" },
  { state: "Goa", district: "South Goa", city: "Margao", location: "Market Area", type: "location", category: "administrative" },

  // Kerala - Major Districts
  { state: "Kerala", district: "Thiruvananthapuram", city: "Thiruvananthapuram", location: "Secretariat", type: "location", category: "administrative" },
  { state: "Kerala", district: "Kochi", city: "Kochi", location: "Marine Drive", type: "location", category: "administrative" },
  { state: "Kerala", district: "Kozhikode", city: "Kozhikode", location: "Beach Road", type: "location", category: "administrative" },
  { state: "Kerala", district: "Thrissur", city: "Thrissur", location: "Round", type: "location", category: "administrative" },
  { state: "Kerala", district: "Kollam", city: "Kollam", location: "Chinnakada", type: "location", category: "administrative" },
  { state: "Kerala", district: "Palakkad", city: "Palakkad", location: "Town Hall", type: "location", category: "administrative" },
  { state: "Kerala", district: "Malappuram", city: "Malappuram", location: "Mini Civil Station", type: "location", category: "administrative" },
  { state: "Kerala", district: "Kannur", city: "Kannur", location: "Fort Road", type: "location", category: "administrative" },
  { state: "Kerala", district: "Kasaragod", city: "Kasaragod", location: "Central Market", type: "location", category: "administrative" },
  { state: "Kerala", district: "Wayanad", city: "Kalpetta", location: "Main Bazaar", type: "location", category: "administrative" },

  // Rajasthan - Major Districts
  { state: "Rajasthan", district: "Jaipur", city: "Jaipur", location: "Pink City", type: "location", category: "administrative", is_popular: true },
  { state: "Rajasthan", district: "Jodhpur", city: "Jodhpur", location: "Blue City", type: "location", category: "administrative", is_popular: true },
  { state: "Rajasthan", district: "Udaipur", city: "Udaipur", location: "City Palace", type: "location", category: "administrative", is_popular: true },
  { state: "Rajasthan", district: "Jaisalmer", city: "Jaisalmer", location: "Golden City", type: "location", category: "administrative", is_popular: true },
  { state: "Rajasthan", district: "Bikaner", city: "Bikaner", location: "Junagarh Fort", type: "location", category: "administrative" },
  { state: "Rajasthan", district: "Ajmer", city: "Ajmer", location: "Dargah Sharif", type: "location", category: "administrative" },
  { state: "Rajasthan", district: "Kota", city: "Kota", location: "City Fort", type: "location", category: "administrative" },
  { state: "Rajasthan", district: "Bharatpur", city: "Bharatpur", location: "Bird Sanctuary", type: "location", category: "administrative" },
  { state: "Rajasthan", district: "Alwar", city: "Alwar", location: "City Palace", type: "location", category: "administrative" },
  { state: "Rajasthan", district: "Sikar", city: "Sikar", location: "Havelis", type: "location", category: "administrative" },

  // Gujarat - Major Districts
  { state: "Gujarat", district: "Ahmedabad", city: "Ahmedabad", location: "Sabarmati Ashram", type: "location", category: "administrative", is_popular: true },
  { state: "Gujarat", district: "Surat", city: "Surat", location: "Diamond Market", type: "location", category: "administrative", is_popular: true },
  { state: "Gujarat", district: "Vadodara", city: "Vadodara", location: "Laxmi Vilas Palace", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Rajkot", city: "Rajkot", location: "Watson Museum", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Bhavnagar", city: "Bhavnagar", location: "Takhteshwar Temple", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Jamnagar", city: "Jamnagar", location: "Lakhota Lake", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Junagadh", city: "Junagadh", location: "Girnar Hills", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Gandhinagar", city: "Gandhinagar", location: "Akshardham", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Anand", city: "Anand", location: "Amul Dairy", type: "location", category: "administrative" },
  { state: "Gujarat", district: "Kutch", city: "Bhuj", location: "Kutch Museum", type: "location", category: "administrative" },

  // Madhya Pradesh - Major Districts
  { state: "Madhya Pradesh", district: "Bhopal", city: "Bhopal", location: "Upper Lake", type: "location", category: "administrative", is_popular: true },
  { state: "Madhya Pradesh", district: "Indore", city: "Indore", location: "Rajwada Palace", type: "location", category: "administrative", is_popular: true },
  { state: "Madhya Pradesh", district: "Gwalior", city: "Gwalior", location: "Gwalior Fort", type: "location", category: "administrative", is_popular: true },
  { state: "Madhya Pradesh", district: "Jabalpur", city: "Jabalpur", location: "Marble Rocks", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Ujjain", city: "Ujjain", location: "Mahakaleshwar Temple", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Sagar", city: "Sagar", location: "Lakha Banjara Lake", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Dewas", city: "Dewas", location: "Tekri Temple", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Satna", city: "Satna", location: "Chitrakoot", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Ratlam", city: "Ratlam", location: "Kedareshwar Temple", type: "location", category: "administrative" },
  { state: "Madhya Pradesh", district: "Singrauli", city: "Waidhan", location: "Coal Mines", type: "location", category: "administrative" },

  // Uttar Pradesh - Major Districts
  { state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", location: "Hazratganj", type: "location", category: "administrative", is_popular: true },
  { state: "Uttar Pradesh", district: "Kanpur", city: "Kanpur", location: "Mall Road", type: "location", category: "administrative", is_popular: true },
  { state: "Uttar Pradesh", district: "Agra", city: "Agra", location: "Taj Mahal", type: "location", category: "administrative", is_popular: true },
  { state: "Uttar Pradesh", district: "Varanasi", city: "Varanasi", location: "Dashashwamedh Ghat", type: "location", category: "administrative", is_popular: true },
  { state: "Uttar Pradesh", district: "Meerut", city: "Meerut", location: "Suraj Kund Park", type: "location", category: "administrative" },
  { state: "Uttar Pradesh", district: "Allahabad", city: "Prayagraj", location: "Sangam", type: "location", category: "administrative" },
  { state: "Uttar Pradesh", district: "Bareilly", city: "Bareilly", location: "Fun City", type: "location", category: "administrative" },
  { state: "Uttar Pradesh", district: "Aligarh", city: "Aligarh", location: "AMU", type: "location", category: "administrative" },
  { state: "Uttar Pradesh", district: "Moradabad", city: "Moradabad", location: "Brass City", type: "location", category: "administrative" },
  { state: "Uttar Pradesh", district: "Saharanpur", city: "Saharanpur", location: "Wood Carving", type: "location", category: "administrative" },

  // West Bengal - Major Districts
  { state: "West Bengal", district: "Kolkata", city: "Kolkata", location: "Victoria Memorial", type: "location", category: "administrative", is_popular: true },
  { state: "West Bengal", district: "Howrah", city: "Howrah", location: "Howrah Bridge", type: "location", category: "administrative", is_popular: true },
  { state: "West Bengal", district: "Durgapur", city: "Durgapur", location: "Steel City", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Siliguri", city: "Siliguri", location: "Mahananda Wildlife Sanctuary", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Asansol", city: "Asansol", location: "Kalyaneshwari Temple", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Malda", city: "Malda", location: "Adina Mosque", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Kharagpur", city: "Kharagpur", location: "IIT Kharagpur", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Haldia", city: "Haldia", location: "Port", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Darjeeling", city: "Darjeeling", location: "Tiger Hill", type: "location", category: "administrative" },
  { state: "West Bengal", district: "Cooch Behar", city: "Cooch Behar", location: "Palace", type: "location", category: "administrative" },

  // Bihar - Major Districts
  { state: "Bihar", district: "Patna", city: "Patna", location: "Gandhi Maidan", type: "location", category: "administrative", is_popular: true },
  { state: "Bihar", district: "Gaya", city: "Gaya", location: "Bodh Gaya", type: "location", category: "administrative", is_popular: true },
  { state: "Bihar", district: "Muzaffarpur", city: "Muzaffarpur", location: "Litchi Gardens", type: "location", category: "administrative" },
  { state: "Bihar", district: "Bhagalpur", city: "Bhagalpur", location: "Silk City", type: "location", category: "administrative" },
  { state: "Bihar", district: "Purnia", city: "Purnia", location: "Kali Mandir", type: "location", category: "administrative" },
  { state: "Bihar", district: "Darbhanga", city: "Darbhanga", location: "Raj Palace", type: "location", category: "administrative" },
  { state: "Bihar", district: "Bihar Sharif", city: "Bihar Sharif", location: "Nalanda University", type: "location", category: "administrative" },
  { state: "Bihar", district: "Arrah", city: "Arrah", location: "Veer Kunwar Singh Park", type: "location", category: "administrative" },
  { state: "Bihar", district: "Begusarai", city: "Begusarai", location: "Industrial Area", type: "location", category: "administrative" },
  { state: "Bihar", district: "Katihar", city: "Katihar", location: "Railway Junction", type: "location", category: "administrative" },

  // Odisha - Major Districts
  { state: "Odisha", district: "Bhubaneswar", city: "Bhubaneswar", location: "Lingaraj Temple", type: "location", category: "administrative", is_popular: true },
  { state: "Odisha", district: "Cuttack", city: "Cuttack", location: "Silver City", type: "location", category: "administrative" },
  { state: "Odisha", district: "Rourkela", city: "Rourkela", location: "Steel Plant", type: "location", category: "administrative" },
  { state: "Odisha", district: "Berhampur", city: "Berhampur", location: "Silk City", type: "location", category: "administrative" },
  { state: "Odisha", district: "Sambalpur", city: "Sambalpur", location: "Hirakud Dam", type: "location", category: "administrative" },
  { state: "Odisha", district: "Puri", city: "Puri", location: "Jagannath Temple", type: "location", category: "administrative", is_popular: true },
  { state: "Odisha", district: "Balasore", city: "Balasore", location: "Chandipur Beach", type: "location", category: "administrative" },
  { state: "Odisha", district: "Baripada", city: "Baripada", location: "Simlipal National Park", type: "location", category: "administrative" },
  { state: "Odisha", district: "Jharsuguda", city: "Jharsuguda", location: "Industrial Hub", type: "location", category: "administrative" },
  { state: "Odisha", district: "Koraput", city: "Koraput", location: "Tribal Museum", type: "location", category: "administrative" }
];

async function populateComprehensiveIndianData() {
  try {
    console.log('🇮🇳 Populating Comprehensive Indian Data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing master data
    await MasterData.deleteMany({});
    console.log('🧹 Cleared existing master data');
    
    // Add location data
    console.log('📍 Adding location data...');
    for (let i = 0; i < locationData.length; i++) {
      const data = {
        id: `location_${i + 1}`,
        ...locationData[i]
      };
      await MasterData.create(data);
    }
    console.log(`✅ Added ${locationData.length} locations`);
    
    // Add car data
    console.log('🚗 Adding car data...');
    for (let i = 0; i < carData.length; i++) {
      const data = {
        id: `car_${i + 1}`,
        ...carData[i]
      };
      await MasterData.create(data);
    }
    console.log(`✅ Added ${carData.length} car variants`);
    
    console.log('\n🎉 Comprehensive Indian Data Populated Successfully!');
    console.log('📊 Summary:');
    
    const states = new Set(locationData.filter(d => d.state).map(d => d.state));
    const districts = new Set(locationData.filter(d => d.district).map(d => d.district));
    const cities = new Set(locationData.filter(d => d.city).map(d => d.city));
    const carBrands = new Set(carData.map(d => d.brand));
    const carModels = new Set(carData.map(d => d.model));
    
    console.log(`   🏛️ States: ${states.size}`);
    console.log(`   🏙️ Districts: ${districts.size}`);
    console.log(`   🌆 Cities: ${cities.size}`);
    console.log(`   📍 Total Locations: ${locationData.length}`);
    console.log(`   🚗 Car Brands: ${carBrands.size}`);
    console.log(`   🚙 Car Models: ${carModels.size}`);
    console.log(`   🚗 Total Car Variants: ${carData.length}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}
populateComprehensiveIndianData();