import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaArrowLeft, 
  FaArrowRight, FaCheck, FaUser, FaShieldAlt, FaSave, FaHistory,
  FaClock, FaTrash, FaPlay
} from 'react-icons/fa';
import { toast } from 'sonner';
import { setPageLoading } from '../../redux/user/userSlice';
import { displayRazorpay } from './Razorpay';

const EnhancedBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [existingDrafts, setExistingDrafts] = useState([]);
  
  const [bookingDetails, setBookingDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00'
  });

  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    drivingLicense: '',
    emergencyContact: ''
  });

  const [additionalServices, setAdditionalServices] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    extraDriver: false
  });

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'cash_on_delivery',
    couponCode: '',
    discount: 0
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector(state => state.user.currentUser);

  const steps = [
    { number: 1, title: 'Select Vehicle', icon: FaCar },
    { number: 2, title: 'Trip Details', icon: FaMapMarkerAlt },
    { number: 3, title: 'Personal Info', icon: FaUser },
    { number: 4, title: 'Payment', icon: FaRupeeSign }
  ];

  useEffect(() => {
    fetchVehicles();
    if (currentUser) {
      fetchUserDrafts();
    }
    
    // Pre-select vehicle if coming from vehicle details
    if (location.state?.selectedVehicle) {
      setSelectedVehicle(location.state.selectedVehicle);
      setCurrentStep(2);
    }
  }, [location.state, currentUser]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (currentUser && (selectedVehicle || draftId)) {
      const interval = setInterval(() => {
        saveDraftBooking(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser, selectedVehicle, bookingDetails, personalDetails, additionalServices, paymentDetails]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/showVehicles');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };
}
  const fetchUserDrafts = async ()