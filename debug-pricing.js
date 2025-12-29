// Debug pricing calculation
const testPricing = () => {
  // Test data
  const vehicle = {
    basePrice: 1300,
    price: 1300
  };
  
  const bookingDetails = {
    pickupDate: '2024-12-29',
    dropoffDate: '2024-12-31',
    pickupState: 'Karnataka',
    dropoffState: 'Tamil Nadu'
  };
  
  // Calculate total days
  const totalDays = Math.ceil(
    (new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24)
  ) || 1;
  
  console.log('Total days:', totalDays);
  
  // Check if interstate
  const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                      bookingDetails.pickupState !== bookingDetails.dropoffState;
  
  console.log('Is interstate:', isInterstate);
  
  // Calculate pricing
  const basePricePerDay = vehicle.basePrice || vehicle.price || 0;
  const basePrice = basePricePerDay * totalDays;
  const interstateAllowance = isInterstate ? 400 : 0;
  const totalPrice = basePrice + interstateAllowance;
  
  console.log('Base price per day:', basePricePerDay);
  console.log('Base price (total):', basePrice);
  console.log('Interstate allowance:', interstateAllowance);
  console.log('Total price:', totalPrice);
  
  // Expected: 1300 * 2 = 2600 + 400 = 3000
};

testPricing();