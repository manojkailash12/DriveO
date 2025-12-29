import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaSearch, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'sonner';

const EnhancedBookingFlow = () => {
  const { currentUser } = useSelector(state => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [bookingDetails, setBookingDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    seatPreference: '',
    searchTerm: '',
    customPickupLocation: '',
    customDropoffLocation: '',
    useCustomPickup: false,
    useCustomDropoff: false
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  // Common Indian cities for dropdown
  const commonCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
  ];

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, bookingDetails.seatPreference, bookingDetails.searchTerm]);

  const fetchAllVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/showVehicles');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setVehicles(data);
        setFilteredVehicles(data);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Filter by seat preference
    if (bookingDetails.seatPreference) {
      filtered = filtered.filter(vehicle => 
        parseInt(vehicle.seat) === parseInt(bookingDetails.seatPreference)
      );
    }

    // Filter by search term
    if (bookingDetails.searchTerm) {
      const searchLower = bookingDetails.searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.name?.toLowerCase().includes(searchLower) ||
        vehicle.company?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower) ||
        vehicle.car_type?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleInputChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    if (value === 'custom') {
      setBookingDetails(prev => ({
        ...prev,
        [field]: '',
        [`useCustom${field.charAt(0).toUpperCase() + field.slice(1).replace('Location', '')}`]: true
      }));
    } else {
      setBookingDetails(prev => ({
        ...prev,
        [field]: value,
        [`useCustom${field.charAt(0).toUpperCase() + field.slice(1).replace('Location', '')}`]: false
      }));
    }
  };

  const calculateTotalDays = () => {
    if (bookingDetails.pickupDate && bookingDetails.dropoffDate) {
      const pickup = new Date(bookingDetails.pickupDate);
      const dropoff = new Date(bookingDetails.dropoffDate);
      const diffTime = Math.abs(dropoff - pickup);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return 1;
  };

  const calculateTotalAmount = () => {
    if (!selectedVehicle) return 0;
    const days = calculateTotalDays();
    const baseAmount = selectedVehicle.price * days;
    const serviceFee = 50;
    return baseAmount + serviceFee;
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const pickupLocation = bookingDetails.useCustomPickup ? 
          bookingDetails.customPickupLocation : bookingDetails.pickupLocation;
        const dropoffLocation = bookingDetails.useCustomDropoff ? 
          bookingDetails.customDropoffLocation : bookingDetails.dropoffLocation;
        
        if (!pickupLocation || !dropoffLocation || !bookingDetails.pickupDate || !bookingDetails.dropoffDate) {
          toast.error('Please fill all location and date fields');
          return false;
        }
        
        if (new Date(bookingDetails.pickupDate) >= new Date(bookingDetails.dropoffDate)) {
          toast.error('Drop-off date must be after pickup date');
          return false;
        }
        return true;
        
      case 2:
        if (!selectedVehicle) {
          toast.error('Please select a vehicle');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      
      const finalPickupLocation = bookingDetails.useCustomPickup ? 
        bookingDetails.customPickupLocation : bookingDetails.pickupLocation;
      const finalDropoffLocation = bookingDetails.useCustomDropoff ? 
        bookingDetails.customDropoffLocation : bookingDetails.dropoffLocation;

      const bookingData = {
        userId: currentUser._id,
        vehicleId: selectedVehicle._id,
        pickupLocation: finalPickupLocation,
        dropoffLocation: finalDropoffLocation,
        pickupDate: bookingDetails.pickupDate,
        dropoffDate: bookingDetails.dropoffDate,
        pickupTime: bookingDetails.pickupTime,
        dropoffTime: bookingDetails.dropoffTime,
        totalDays: calculateTotalDays(),
        totalAmount: calculateTotalAmount(),
        paymentMethod: paymentMethod,
        bookingStatus: 'Pending'
      };

      const response = await fetch('/api/user/enhancedBookCar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking confirmed successfully! Confirmation email sent.');
        
        // Reset form
        setCurrentStep(1);
        setSelectedVehicle(null);
        setBookingDetails({
          pickupLocation: '',
          dropoffLocation: '',
          pickupDate: '',
          dropoffDate: '',
          pickupTime: '10:00',
          dropoffTime: '10:00',
          seatPreference: '',
          searchTerm: '',
          customPickupLocation: '',
          customDropoffLocation: '',
          useCustomPickup: false,
          useCustomDropoff: false
        });
        
        // Show success message with booking details
        if (data.booking.bookingId) {
          toast.success(`Booking ID: ${data.booking.bookingId}`, { duration: 8000 });
        }
        if (data.booking.invoiceNumber) {
          toast.success(`Invoice: ${data.booking.invoiceNumber}`, { duration: 8000 });
        }
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderLocationAndDateStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Select Pickup & Drop-off Details</h2>
      
      {/* Location Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Pickup Location
          </label>
          {!bookingDetails.useCustomPickup ? (
            <select
              value={bookingDetails.pickupLocation}
              onChange={(e) => handleLocationChange('pickupLocation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select pickup city</option>
              {commonCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
              <option value="custom">Other (Type custom location)</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={bookingDetails.customPickupLocation}
                onChange={(e) => handleInputChange('customPickupLocation', e.target.value)}
                placeholder="Enter custom pickup location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleLocationChange('pickupLocation', '')}
                className="text-sm text-blue-600 hover:underline"
              >
                Choose from list instead
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Drop-off Location
          </label>
          {!bookingDetails.useCustomDropoff ? (
            <select
              value={bookingDetails.dropoffLocation}
              onChange={(e) => handleLocationChange('dropoffLocation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select drop-off city</option>
              {commonCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
              <option value="custom">Other (Type custom location)</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={bookingDetails.customDropoffLocation}
                onChange={(e) => handleInputChange('customDropoffLocation', e.target.value)}
                placeholder="Enter custom drop-off location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleLocationChange('dropoffLocation', '')}
                className="text-sm text-blue-600 hover:underline"
              >
                Choose from list instead
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Pickup Date
            </label>
            <input
              type="date"
              value={bookingDetails.pickupDate}
              onChange={(e) => handleInputChange('pickupDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline mr-2" />
              Pickup Time
            </label>
            <input
              type="time"
              value={bookingDetails.pickupTime}
              onChange={(e) => handleInputChange('pickupTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Drop-off Date
            </label>
            <input
              type="date"
              value={bookingDetails.dropoffDate}
              onChange={(e) => handleInputChange('dropoffDate', e.target.value)}
              min={bookingDetails.pickupDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline mr-2" />
              Drop-off Time
            </label>
            <input
              type="time"
              value={bookingDetails.dropoffTime}
              onChange={(e) => handleInputChange('dropoffTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Car Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-2" />
            Seat Preference
          </label>
          <select
            value={bookingDetails.seatPreference}
            onChange={(e) => handleInputChange('seatPreference', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any seating capacity</option>
            <option value="5">5 Seater</option>
            <option value="7">7 Seater</option>
            <option value="8">8+ Seater</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaSearch className="inline mr-2" />
            Search Specific Car
          </label>
          <input
            type="text"
            value={bookingDetails.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            placeholder="Search by brand, model, or type..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={nextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next: Select Vehicle
        </button>
      </div>
    </div>
  );

  const renderVehicleSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Vehicles</h2>
        <p className="text-gray-600">
          {filteredVehicles.length} vehicles available
          {bookingDetails.seatPreference && ` (${bookingDetails.seatPreference} seater)`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-8">
          <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No vehicles found matching your criteria</p>
          <button
            onClick={() => {
              setBookingDetails(prev => ({
                ...prev,
                seatPreference: '',
                searchTerm: ''
              }));
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVehicle?._id === vehicle._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={vehicle.image?.[0] || '/placeholder-car.jpg'}
                  alt={`${vehicle.company} ${vehicle.name}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <h3 className="font-bold text-lg mb-2">
                {vehicle.company} {vehicle.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><FaUsers className="inline mr-2" />{vehicle.seat} Seater</p>
                <p><FaCar className="inline mr-2" />{vehicle.fuel_type} • {vehicle.transmition_type}</p>
                <p className="text-lg font-bold text-green-600">
                  <FaRupeeSign className="inline" />{vehicle.price}/day
                </p>
              </div>
              
              {selectedVehicle?._id === vehicle._id && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Selected Vehicle</p>
                  <p className="text-sm text-blue-600">
                    Total: ₹{calculateTotalAmount()} for {calculateTotalDays()} days
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={!selectedVehicle}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Confirm Booking
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Confirm Your Booking</h2>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Trip Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Pickup:</strong> {bookingDetails.useCustomPickup ? bookingDetails.customPickupLocation : bookingDetails.pickupLocation}</p>
              <p><strong>Drop-off:</strong> {bookingDetails.useCustomDropoff ? bookingDetails.customDropoffLocation : bookingDetails.dropoffLocation}</p>
              <p><strong>Dates:</strong> {bookingDetails.pickupDate} to {bookingDetails.dropoffDate}</p>
              <p><strong>Duration:</strong> {calculateTotalDays()} days</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Vehicle Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Vehicle:</strong> {selectedVehicle?.company} {selectedVehicle?.name}</p>
              <p><strong>Type:</strong> {selectedVehicle?.seat} Seater • {selectedVehicle?.fuel_type}</p>
              <p><strong>Rate:</strong> ₹{selectedVehicle?.price}/day</p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">₹{calculateTotalAmount()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            (₹{selectedVehicle?.price} × {calculateTotalDays()} days + ₹50 service fee)
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Payment Method</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <span>Online Payment</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {renderStepIndicator()}
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        {currentStep === 1 && renderLocationAndDateStep()}
        {currentStep === 2 && renderVehicleSelection()}
        {currentStep === 3 && renderConfirmation()}
      </div>
    </div>
  );
};

export default EnhancedBookingFlow;