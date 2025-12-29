import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaCar, FaMapMarkerAlt, FaRupeeSign, FaArrowLeft, FaArrowRight, FaCheck, FaSave, FaPlay } from 'react-icons/fa';
import { toast } from 'sonner';
import { setPageLoading } from '../../redux/user/userSlice';
import { displayRazorpay } from './Razorpay';
import { debounce, cachedFetch } from '../../utils/performance';

const BookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    seatPreference: '', // 5 or 7 seater preference
    searchTerm: '', // Search for specific car models
    customPickupLocation: '', // Custom location if not in dropdown
    customDropoffLocation: '' // Custom location if not in dropdown
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedBookings, setSavedBookings] = useState([]);
  const [showSavedBookings, setShowSavedBookings] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector(state => state.user.currentUser);

  // Auto-save booking progress
  const saveBookingProgress = useCallback(async () => {
    if (!currentUser || !selectedVehicle) return;
    
    try {
      const response = await fetch('/api/user/saveDraftBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
          vehicleId: selectedVehicle._id,
          currentStep,
          bookingDetails,
          paymentMethod,
          couponCode,
          discount
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Draft booking saved successfully');
      }
    } catch (error) {
      console.error('Error saving draft booking:', error);
    }
  }, [currentUser, selectedVehicle, currentStep, bookingDetails, paymentMethod, couponCode, discount]);

  // Load saved bookings
  const loadSavedBookings = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/user/getDraftBookings/${currentUser._id}`);
      const data = await response.json();
      
      if (data.success) {
        setSavedBookings(data.draftBookings);
      }
    } catch (error) {
      console.error('Error loading draft bookings:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchVehicles();
    loadSavedBookings();
    
    // If coming from vehicle details page, pre-select vehicle
    if (location.state?.selectedVehicle) {
      setSelectedVehicle(location.state.selectedVehicle);
      setCurrentStep(2);
    }
  }, [location.state, loadSavedBookings]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (currentStep > 1 && selectedVehicle) {
      const interval = setInterval(saveBookingProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [currentStep, selectedVehicle, saveBookingProgress]);

  // Debounced save function for better performance
  const debouncedSave = useMemo(
    () => debounce(saveBookingProgress, 2000),
    [saveBookingProgress]
  );

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Fetch ALL vehicles regardless of location - user can book any car
      const data = await cachedFetch('/api/admin/showVehicles');
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on seat preference and search
  const getFilteredVehicles = () => {
    let filtered = vehicles;
    
    // Filter by seat count if specified
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
        vehicle.model?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const resumeBooking = (savedBooking) => {
    setCurrentStep(savedBooking.currentStep);
    setSelectedVehicle(savedBooking.vehicleId);
    setBookingDetails(savedBooking.bookingDetails);
    setPaymentMethod(savedBooking.paymentMethod);
    setCouponCode(savedBooking.couponCode || '');
    setDiscount(savedBooking.discount || 0);
    setShowSavedBookings(false);
    toast.success('Booking resumed successfully!');
  };

  const deleteSavedBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/user/deleteDraftBooking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser._id })
      });

      const data = await response.json();
      if (data.success) {
        loadSavedBookings();
        toast.success('Saved booking deleted');
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting draft booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Trigger debounced save when details change
    if (currentStep > 1 && selectedVehicle) {
      debouncedSave();
    }
  };

  const applyCoupon = () => {
    if (couponCode === 'WELCOME50') {
      setDiscount(50);
      toast.success('Coupon applied! ₹50 discount added.');
    } else if (couponCode === 'NEWUSER100') {
      setDiscount(100);
      toast.success('Coupon applied! ₹100 discount added.');
    } else {
      setDiscount(0);
      toast.error('Invalid coupon code');
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedVehicle || !bookingDetails.pickupDate || !bookingDetails.dropoffDate) return 0;
    
    const start = new Date(bookingDetails.pickupDate);
    const end = new Date(bookingDetails.dropoffDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const basePrice = selectedVehicle.price * Math.max(1, days);
    const serviceFee = 50;
    const total = basePrice + serviceFee - discount;
    
    return Math.max(0, total);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return selectedVehicle !== null;
      case 2:
        return bookingDetails.pickupLocation && 
               bookingDetails.dropoffLocation && 
               bookingDetails.pickupDate && 
               bookingDetails.dropoffDate;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      saveBookingProgress();
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleBookingSubmit = async () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      navigate('/signin');
      return;
    }

    const orderData = {
      user_id: currentUser._id,
      vehicle_id: selectedVehicle._id,
      totalPrice: calculateTotalPrice(),
      pickupDate: bookingDetails.pickupDate,
      dropoffDate: bookingDetails.dropoffDate,
      pickup_location: bookingDetails.pickupLocation,
      dropoff_location: bookingDetails.dropoffLocation,
      paymentMethod,
      couponCode: discount > 0 ? couponCode : null,
      discount
    };

    try {
      dispatch(setPageLoading(true));
      
      if (paymentMethod === 'cash_on_delivery') {
        const result = await fetch("/api/user/bookCar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderData,
            paymentStatus: 'pending'
          }),
        });
        
        const response = await result.json();
        
        if (response.success) {
          toast.success("Booking confirmed! Payment will be collected on delivery.");
          
          // Mark booking as complete in database
          if (savedBookings.length > 0) {
            try {
              const matchingDraft = savedBookings.find(b => 
                b.vehicleId?._id === selectedVehicle._id && 
                b.bookingDetails.pickupLocation === bookingDetails.pickupLocation &&
                b.bookingDetails.dropoffLocation === bookingDetails.dropoffLocation &&
                b.bookingDetails.pickupDate === bookingDetails.pickupDate
              );
              
              if (matchingDraft) {
                await fetch(`/api/user/completeDraftBooking/${matchingDraft._id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: currentUser._id })
                });
              }
            } catch (error) {
              console.error('Error completing draft booking:', error);
            }
          }
          
          // Send confirmation email
          try {
            await fetch("/api/user/sendBookingDetailsEamil", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                toEmail: currentUser.email, 
                data: response.booking 
              }),
            });
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
          }
          
          navigate("/orders");
        } else {
          toast.error(response.message || "Booking failed");
        }
      } else {
        const razorpayResponse = await displayRazorpay(orderData, navigate, dispatch);
        if (!razorpayResponse?.ok) {
          toast.error(razorpayResponse?.message || "Payment failed");
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
            currentStep >= step 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
              : 'border-gray-300 text-gray-400 hover:border-blue-300'
          }`}>
            {currentStep > step ? <FaCheck /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 transition-all duration-300 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderSavedBookings = () => (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800">Resume Previous Booking</h3>
        <button
          onClick={() => setShowSavedBookings(!showSavedBookings)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showSavedBookings ? 'Hide' : 'Show'} ({savedBookings.length})
        </button>
      </div>
      
      {showSavedBookings && (
        <div className="space-y-3">
          {savedBookings.map((booking) => (
            <div key={booking._id} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{booking.vehicleId?.name}</p>
                  <p className="text-sm text-gray-600">
                    {booking.bookingDetails.pickupLocation} → {booking.bookingDetails.dropoffLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.bookingDetails.pickupDate} | Step {booking.currentStep}/3
                  </p>
                  <p className="text-xs text-gray-400">
                    Saved: {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => resumeBooking(booking)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FaPlay size={12} />
                    Resume
                  </button>
                  <button
                    onClick={() => deleteSavedBooking(booking._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVehicleSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaCar className="text-blue-600" />
        Select Your Vehicle
      </h2>
      
      {savedBookings.length > 0 && renderSavedBookings()}
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedVehicle?._id === vehicle._id
                  ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleVehicleSelect(vehicle)}
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                loading="lazy"
              />
              <h3 className="font-semibold text-lg">{vehicle.name}</h3>
              <p className="text-gray-600">{vehicle.company} {vehicle.model}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600 font-bold">₹{vehicle.price}/day</span>
                <span className="text-sm text-gray-500">{vehicle.seats} seats</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>{vehicle.fuelType} • {vehicle.transmission}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" />
        Booking Details
      </h2>

      {selectedVehicle && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-800">Selected Vehicle</h3>
          <div className="flex items-center gap-4">
            <img 
              src={selectedVehicle.image} 
              alt={selectedVehicle.name} 
              className="w-16 h-16 object-cover rounded-lg shadow-md" 
              loading="lazy"
            />
            <div>
              <p className="font-medium text-lg">{selectedVehicle.name}</p>
              <p className="text-blue-600 font-semibold">₹{selectedVehicle.price}/day</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Location *
          </label>
          <input
            type="text"
            value={bookingDetails.pickupLocation}
            onChange={(e) => handleBookingDetailsChange('pickupLocation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter pickup location"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Drop-off Location *
          </label>
          <input
            type="text"
            value={bookingDetails.dropoffLocation}
            onChange={(e) => handleBookingDetailsChange('dropoffLocation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter drop-off location"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Date *
          </label>
          <input
            type="date"
            value={bookingDetails.pickupDate}
            onChange={(e) => handleBookingDetailsChange('pickupDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Drop-off Date *
          </label>
          <input
            type="date"
            value={bookingDetails.dropoffDate}
            onChange={(e) => handleBookingDetailsChange('dropoffDate', e.target.value)}
            min={bookingDetails.pickupDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Time
          </label>
          <input
            type="time"
            value={bookingDetails.pickupTime}
            onChange={(e) => handleBookingDetailsChange('pickupTime', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Drop-off Time
          </label>
          <input
            type="time"
            value={bookingDetails.dropoffTime}
            onChange={(e) => handleBookingDetailsChange('dropoffTime', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Manual Save Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={saveBookingProgress}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <FaSave />
          Save Progress
        </button>
      </div>
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaRupeeSign className="text-blue-600" />
        Payment & Confirmation
      </h2>

      {/* Booking Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4 text-gray-800">Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Vehicle:</span>
            <span className="font-medium">{selectedVehicle?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pickup:</span>
            <span className="text-right max-w-xs truncate">{bookingDetails.pickupLocation}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Drop-off:</span>
            <span className="text-right max-w-xs truncate">{bookingDetails.dropoffLocation}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {bookingDetails.pickupDate && bookingDetails.dropoffDate
                ? `${Math.ceil((new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24))} days`
                : '0 days'}
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-3 text-gray-800">Apply Coupon</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={applyCoupon}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
          >
            Apply
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Try: <span className="font-mono bg-gray-100 px-2 py-1 rounded">WELCOME50</span> (₹50 off) or <span className="font-mono bg-gray-100 px-2 py-1 rounded">NEWUSER100</span> (₹100 off)
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-3 text-gray-800">Price Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>₹{selectedVehicle ? selectedVehicle.price * Math.max(1, Math.ceil((new Date(bookingDetails.dropoffDate) - new Date(bookingDetails.pickupDate)) / (1000 * 60 * 60 * 24))) : 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee:</span>
            <span>₹50</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">₹{calculateTotalPrice()}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-3 text-gray-800">Payment Method</h4>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 mt-1"
            />
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-sm text-gray-600">Pay when you receive the vehicle (Recommended)</div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 mt-1"
            />
            <div>
              <div className="font-medium">Online Payment</div>
              <div className="text-sm text-gray-600">Pay now using Razorpay (Cards, UPI, Net Banking)</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {renderStepIndicator()}
        
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
          {currentStep === 1 && renderVehicleSelection()}
          {currentStep === 2 && renderBookingDetails()}
          {currentStep === 3 && renderPaymentDetails()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md'
              }`}
            >
              <FaArrowLeft />
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  validateStep(currentStep)
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleBookingSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md transition-all duration-200"
              >
                <FaCheck />
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;