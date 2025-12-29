import mongoose from 'mongoose';
import { generateInvoiceNumber, generateBookingId, getCurrentCounters } from '../services/sequenceService.js';
import dotenv from 'dotenv';

dotenv.config();

// Test the sequential number generation
async function testSequentialNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Testing Sequential Number Generation ===\n');

    // Test invoice number generation
    console.log('Generating Invoice Numbers:');
    for (let i = 1; i <= 5; i++) {
      const invoiceNumber = await generateInvoiceNumber();
      console.log(`${i}. ${invoiceNumber}`);
    }

    console.log('\nGenerating Booking IDs:');
    for (let i = 1; i <= 5; i++) {
      const bookingId = await generateBookingId();
      console.log(`${i}. ${bookingId}`);
    }

    // Check current counters
    console.log('\nCurrent Counters:');
    const counters = await getCurrentCounters();
    console.log('Invoice Counter:', counters.invoiceCount);
    console.log('Booking Counter:', counters.bookingCount);

    console.log('\n=== Test Completed ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testSequentialNumbers();