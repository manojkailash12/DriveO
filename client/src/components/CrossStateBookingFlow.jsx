import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaArrowRight, 
  FaCheck, FaUser, FaRoute, FaMapMarkedAlt, FaExclamationTriangle,
  FaInfoCircle, FaMoneyBillWave, FaArrowLeft, FaHome
} from 'react-icons/fa';
import { toast } from 'sonner';

const CrossStateBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  
  const [bookingDetails, setBookingDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupCity: '',
    pickupState: '',
    pickupDistrict: '',
    dropoffCity: '',
    dropoffState: '',
    dropoffDistrict: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    allowCrossState: true
  });

  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    drivingLicense: '',
    emergencyContact: ''
  });

  const [travelDetails, setTravelDetails] = useState({
    estimatedDistance: 0,
    estimatedDuration: 0,
    specialRequests: '',
    travelType: 'local'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'cash_on_delivery',
    basePrice: 0,
    crossStateCharges: 0,
    tollCharges: 0,
    driverAllowance: 0,
    totalAmount: 0
  });

  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser);

  const steps = [
    { number: 1, title: 'Search Vehicles', icon: FaCar },
    { number: 2, title: 'Trip Details', icon: FaMapMarkerAlt },
    { number: 3, title: 'Personal Info', icon: FaUser },
    { number: 4, title: 'Payment', icon: FaRupeeSign }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Search for ALL vehicles with availability status - no location restrictions
  const searchVehicles = async () => {
    // Validate required fields
    if (!bookingDetails.pickupDate || !bookingDetails.dropoffDate) {
      toast.error('Please select pickup and dropoff dates');
      return;
    }

    if (!bookingDetails.pickupLocation || !bookingDetails.dropoffLocation) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }

    // Validate date range
    const pickupDate = new Date(bookingDetails.pickupDate);
    const dropoffDate = new Date(bookingDetails.dropoffDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      toast.error('Pickup date cannot be in the past');
      return;
    }

    if (dropoffDate <= pickupDate) {
      toast.error('Dropoff date must be after pickup date');
      return;
    }

    try {
      setLoading(true);
      setVehicles([]); // Clear previous results
      setSearchResults(null);

      console.log('Searching vehicles with data:', {
        pickupDate: bookingDetails.pickupDate,
        dropOffDate: bookingDetails.dropoffDate,
        pickUpState: bookingDetails.pickupState,
        dropOffState: bookingDetails.dropoffState
      });

      const response = await fetch('/api/user/getAllVehiclesWithAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupDate: bookingDetails.pickupDate,
          dropOffDate: bookingDetails.dropoffDate,
          pickUpState: bookingDetails.pickupState,
          dropOffState: bookingDetails.dropoffState
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setVehicles(data.data || []);
        setSearchResults(data);
        
        if (data.data && data.data.length > 0) {
          toast.success(`Found ${data.data.length} vehicles (${data.summary?.available || 0} available, ${data.summary?.unavailable || 0} currently booked)`);
          
          // Force scroll to results section
          setTimeout(() => {
            const resultsSection = document.querySelector('.search-results-section');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          toast.warning('No vehicles found for the selected criteria');
        }
      } else {
        toast.error(data.message || 'No vehicles found');
        setVehicles([]);
        setSearchResults({ data: [], summary: { total: 0, available: 0, unavailable: 0 } });
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
      toast.error('Failed to search vehicles. Please check your connection and try again.');
      setVehicles([]);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price - admin price per day × total days + interstate allowance
  const calculateTotalPrice = (vehicle) => {
    const basePricePerDay = vehicle.basePrice || vehicle.price || 0;
    const totalDays = Math.ceil(
      (new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24)
    ) || 1;
    
    // Determine if this is interstate travel based on pickup and dropoff states
    const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                        bookingDetails.pickupState !== bookingDetails.dropoffState;
    
    const basePrice = basePricePerDay * totalDays;
    const interstateAllowance = isInterstate ? 400 : 0;
    return basePrice + interstateAllowance;
  };

  // Handle vehicle selection
  const selectVehicle = (vehicle) => {
    const totalDays = Math.ceil(
      (new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24)
    ) || 1;
    
    // Determine if this is interstate travel based on pickup and dropoff states
    const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                        bookingDetails.pickupState !== bookingDetails.dropoffState;
    
    const basePricePerDay = vehicle.basePrice || vehicle.price || 0;
    const basePrice = basePricePerDay * totalDays;
    const interstateAllowance = isInterstate ? 400 : 0;
    const totalPrice = basePrice + interstateAllowance;
    
    setSelectedVehicle(vehicle);
    setTravelDetails(prev => ({
      ...prev,
      travelType: isInterstate ? 'interstate' : 'local',
      estimatedDistance: 0
    }));
    setPaymentDetails(prev => ({
      ...prev,
      basePrice: basePrice,
      crossStateCharges: 0, // No additional cross-state charges
      tollCharges: 0, // No toll charges
      driverAllowance: interstateAllowance, // Only ₹400 for interstate
      totalAmount: totalPrice
    }));
    setCurrentStep(2);
  };

  // Submit simplified cross-state booking
  const submitBooking = async () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      return;
    }

    try {
      setLoading(true);
      const totalDays = Math.ceil(
        (new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24)
      ) || 1;

      // Determine if this is interstate travel
      const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                          bookingDetails.pickupState !== bookingDetails.dropoffState;

      const bookingData = {
        userId: currentUser._id,
        vehicleId: selectedVehicle._id,
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation,
        pickupCity: bookingDetails.pickupCity,
        pickupState: bookingDetails.pickupState,
        dropoffCity: bookingDetails.dropoffCity,
        dropoffState: bookingDetails.dropoffState,
        pickupDate: bookingDetails.pickupDate,
        dropoffDate: bookingDetails.dropoffDate,
        pickupTime: bookingDetails.pickupTime,
        dropoffTime: bookingDetails.dropoffTime,
        totalDays,
        specialRequests: travelDetails.specialRequests,
        paymentMethod: paymentDetails.paymentMethod,
        bookingStatus: 'booked',
        isInterstate: isInterstate,
        travelType: isInterstate ? 'interstate' : 'local'
      };

      // Show processing message
      toast.loading('Processing your booking...', { id: 'booking-process' });

      const response = await fetch('/api/user/simplifiedCrossStateBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss('booking-process');
      
      if (data.success) {
        toast.success('Booking confirmed successfully!');
        
        // Show confirmation about PDF and email with timing info
        if (data.pdfGenerated && data.emailSent) {
          toast.success('Receipt PDF generated and sent to your email instantly!', { duration: 4000 });
        } else if (data.pdfGenerated) {
          toast.success('Receipt PDF generated instantly - check your orders', { duration: 4000 });
        }
        
        navigate('/profile/orders');
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.dismiss('booking-process');
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get travel type badge
  const getTravelTypeBadge = (travelType) => {
    switch (travelType) {
      case 'interstate':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'local':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get availability badge
  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      {/* Animated Tourism Background */}
      <div className="absolute inset-0 z-0">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-orange-200"></div>
        
        {/* Animated Clouds */}
        <div className="absolute top-10 left-0 w-full h-32 opacity-80">
          <div className="cloud cloud-1 absolute top-4 bg-white rounded-full w-24 h-8 animate-float-slow"></div>
          <div className="cloud cloud-2 absolute top-8 bg-white rounded-full w-32 h-10 animate-float-medium"></div>
          <div className="cloud cloud-3 absolute top-2 bg-white rounded-full w-20 h-6 animate-float-fast"></div>
        </div>
        
        {/* Mountains */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 300" className="w-full h-64 opacity-70">
            <polygon points="0,300 200,100 400,180 600,80 800,160 1000,60 1200,140 1200,300" fill="#4a5568" className="animate-pulse-slow"/>
            <polygon points="0,300 150,150 350,200 550,120 750,180 950,100 1200,160 1200,300" fill="#2d3748" className="animate-pulse-slower"/>
          </svg>
        </div>
        
        {/* Animated Trees */}
        <div className="absolute bottom-16 left-10 w-8 h-16 bg-green-600 rounded-t-full animate-sway"></div>
        <div className="absolute bottom-16 left-20 w-6 h-12 bg-green-700 rounded-t-full animate-sway-reverse"></div>
        <div className="absolute bottom-16 right-20 w-10 h-20 bg-green-600 rounded-t-full animate-sway"></div>
        <div className="absolute bottom-16 right-40 w-7 h-14 bg-green-700 rounded-t-full animate-sway-reverse"></div>
        
        {/* Animated Birds */}
        <div className="absolute top-20 left-1/4 animate-fly">
          <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
          <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
        </div>
        <div className="absolute top-32 right-1/3 animate-fly-reverse">
          <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
          <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="particle particle-1 absolute w-1 h-1 bg-yellow-300 rounded-full animate-float-particle"></div>
          <div className="particle particle-2 absolute w-1 h-1 bg-yellow-200 rounded-full animate-float-particle-slow"></div>
          <div className="particle particle-3 absolute w-1 h-1 bg-orange-300 rounded-full animate-float-particle-fast"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-lg hover:bg-white/95 transition-all duration-200 shadow-lg border border-white/20 font-medium"
          >
            <FaArrowLeft className="text-lg" />
            <FaHome className="text-lg" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-white/20">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? <FaCheck /> : <step.icon />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <FaArrowRight className="ml-4 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Search Vehicles */}
        {currentStep === 1 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">Search Available Vehicles</h2>
            
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  value={bookingDetails.pickupLocation}
                  onChange={(e) => setBookingDetails(prev => ({...prev, pickupLocation: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter pickup location"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pickup City
                </label>
                <input
                  type="text"
                  value={bookingDetails.pickupCity}
                  onChange={(e) => setBookingDetails(prev => ({...prev, pickupCity: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter pickup city"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pickup State
                </label>
                <select
                  value={bookingDetails.pickupState}
                  onChange={(e) => setBookingDetails(prev => ({...prev, pickupState: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Drop-off Location *
                </label>
                <input
                  type="text"
                  value={bookingDetails.dropoffLocation}
                  onChange={(e) => setBookingDetails(prev => ({...prev, dropoffLocation: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter drop-off location"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Drop-off City
                </label>
                <input
                  type="text"
                  value={bookingDetails.dropoffCity}
                  onChange={(e) => setBookingDetails(prev => ({...prev, dropoffCity: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter drop-off city"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Drop-off State
                </label>
                <select
                  value={bookingDetails.dropoffState}
                  onChange={(e) => setBookingDetails(prev => ({...prev, dropoffState: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  value={bookingDetails.pickupDate}
                  onChange={(e) => setBookingDetails(prev => ({...prev, pickupDate: e.target.value}))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Drop-off Date *
                </label>
                <input
                  type="date"
                  value={bookingDetails.dropoffDate}
                  onChange={(e) => setBookingDetails(prev => ({...prev, dropoffDate: e.target.value}))}
                  min={bookingDetails.pickupDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <button
              onClick={searchVehicles}
              disabled={loading || !bookingDetails.pickupDate || !bookingDetails.dropoffDate}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <FaCar />
                  Search Vehicles
                </>
              )}
            </button>

            {/* Loading State */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-blue-700">Searching for available vehicles...</p>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults && vehicles.length > 0 && (
              <div className="mt-8 search-results-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">All Vehicles ({vehicles.length})</h3>
                  {searchResults.summary && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
                      Available: <span className="font-semibold text-green-600">{searchResults.summary.available}</span> | 
                      Booked: <span className="font-semibold text-red-600">{searchResults.summary.unavailable}</span> | 
                      Interstate: <span className="font-semibold text-blue-600">{searchResults.summary.interstate}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle._id} className={`border border-gray-200 rounded-lg overflow-hidden transition-shadow bg-white/95 backdrop-blur-sm ${
                      vehicle.isAvailable ? 'hover:shadow-lg' : ''
                    }`}>
                      <img
                        src={vehicle.image?.[0] || '/placeholder-car.jpg'}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">
                            {vehicle.company} {vehicle.name || vehicle.model}
                          </h4>
                          <div className="flex gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityBadge(vehicle.isAvailable)}`}>
                              {vehicle.isAvailable ? 'AVAILABLE' : 'BOOKED'}
                            </span>
                            {(() => {
                              const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                                                  bookingDetails.pickupState !== bookingDetails.dropoffState;
                              return isInterstate && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTravelTypeBadge('interstate')}`}>
                                  INTERSTATE
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{vehicle.registeration_number}</p>
                        <p className="text-sm text-gray-600 mb-3">{vehicle.vehicleLocation}</p>
                        
                        {!vehicle.isAvailable && vehicle.nextAvailableDate && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                            <p className="text-xs text-yellow-800">
                              <FaExclamationTriangle className="inline mr-1" />
                              Next available: {new Date(vehicle.nextAvailableDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm text-gray-500">Price per day:</span>
                            <p className="text-lg font-bold text-green-600">₹{vehicle.basePrice || vehicle.price}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">Total Price:</span>
                            <p className="text-lg font-bold text-blue-600">₹{calculateTotalPrice(vehicle)}</p>
                            {(() => {
                              const isInterstate = bookingDetails.pickupState && bookingDetails.dropoffState && 
                                                  bookingDetails.pickupState !== bookingDetails.dropoffState;
                              return isInterstate && (
                                <p className="text-xs text-gray-500">+₹400 interstate</p>
                              );
                            })()}
                          </div>
                        </div>

                        <button
                          onClick={() => selectVehicle(vehicle)}
                          disabled={!vehicle.isAvailable}
                          className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
                            vehicle.isAvailable 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {vehicle.isAvailable ? 'Select Vehicle' : 'Currently Booked'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {searchResults && vehicles.length === 0 && (
              <div className="mt-8 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <FaExclamationTriangle className="text-yellow-600 text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Vehicles Found</h3>
                  <p className="text-yellow-700">
                    No vehicles are available for the selected dates. Please try different dates or contact support.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Trip Details */}
        {currentStep === 2 && selectedVehicle && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
            
            {/* Selected Vehicle Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Selected Vehicle</h3>
              <div className="flex items-center gap-4">
                <img
                  src={selectedVehicle.image?.[0] || '/placeholder-car.jpg'}
                  alt={selectedVehicle.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{selectedVehicle.company} {selectedVehicle.name}</p>
                  <p className="text-sm text-gray-600">{selectedVehicle.registeration_number}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTravelTypeBadge(travelDetails.travelType)}`}>
                    {travelDetails.travelType === 'interstate' ? 'INTERSTATE' : 'LOCAL'} TRAVEL
                  </span>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={bookingDetails.pickupTime}
                    onChange={(e) => setBookingDetails(prev => ({...prev, pickupTime: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Drop-off Time
                  </label>
                  <input
                    type="time"
                    value={bookingDetails.dropoffTime}
                    onChange={(e) => setBookingDetails(prev => ({...prev, dropoffTime: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={travelDetails.specialRequests}
                  onChange={(e) => setTravelDetails(prev => ({...prev, specialRequests: e.target.value}))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Any special requirements or requests..."
                />
              </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personal Information */}
        {currentStep === 3 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={personalDetails.fullName}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={personalDetails.phoneNumber}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, phoneNumber: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Driving License Number
                </label>
                <input
                  type="text"
                  value={personalDetails.drivingLicense}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, drivingLicense: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter your driving license number (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={personalDetails.emergencyContact}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, emergencyContact: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                disabled={!personalDetails.fullName || !personalDetails.phoneNumber || !personalDetails.email}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {currentStep === 4 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>
            
            {/* Simplified Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" />
                Price Breakdown
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Admin Set Price ({Math.ceil((new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24)) || 1} days)</span>
                  <span>₹{paymentDetails.basePrice}</span>
                </div>
                
                {paymentDetails.driverAllowance > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Interstate Allowance</span>
                    <span>₹{paymentDetails.driverAllowance}</span>
                  </div>
                )}
                
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{paymentDetails.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentDetails.paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentDetails(prev => ({...prev, paymentMethod: e.target.value}))}
                    className="mr-3"
                  />
                  <span>Cash on Delivery (Pay at pickup)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentDetails.paymentMethod === 'online'}
                    onChange={(e) => setPaymentDetails(prev => ({...prev, paymentMethod: e.target.value}))}
                    className="mr-3"
                  />
                  <span>Online Payment</span>
                </label>
              </div>
            </div>

            {/* Simplified Terms and Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">Important Terms</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Government ID required for verification</li>
                <li>• Driving license recommended but not mandatory</li>
                <li>• Vehicle can be picked up from any location in India</li>
                <li>• Interstate travel adds only ₹400 allowance fee</li>
                <li>• Admin-set prices are maintained for all bookings</li>
                <li>• Vehicle must be returned to agreed location</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={submitBooking}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : `Confirm Booking - ₹${paymentDetails.totalAmount}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossStateBookingFlow;