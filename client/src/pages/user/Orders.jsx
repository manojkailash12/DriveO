import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdCurrencyRupee } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";
import { CiLocationOn } from "react-icons/ci";
import { FaMapMarkedAlt, FaMoneyBillWave, FaFilePdf, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import UserOrderDetailsModal from "../../components/UserOrderDetailsModal";
import {
  setIsOrderModalOpen,
  setSingleOrderDetails,
} from "../../redux/user/userSlice";

export default function Orders() {
  const { _id } = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, local, intercity, interstate
  const [sendingPdf, setSendingPdf] = useState({}); // Track PDF sending state for each booking
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/findBookingsOfUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: _id,
        }),
      });

      const data = await res.json();
      if (data) {
        setBookings(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Send PDF receipt to email
  const sendPdfToEmail = async (bookingId) => {
    try {
      setSendingPdf(prev => ({ ...prev, [bookingId]: true }));
      
      const response = await fetch('/api/user/sendBookingReceiptPdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Receipt PDF sent to your email successfully!');
      } else {
        toast.error(data.message || 'Failed to send PDF receipt');
      }
    } catch (error) {
      console.error('Error sending PDF:', error);
      toast.error('Failed to send PDF receipt. Please try again.');
    } finally {
      setSendingPdf(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDetailsModal = (bookingDetails, vehicleDetails) => {
    dispatch(setIsOrderModalOpen(true));
    dispatch(setSingleOrderDetails(bookingDetails, vehicleDetails));
  };

  // Filter bookings based on travel type
  const filteredBookings = bookings && bookings.length > 0 ? 
    bookings.filter(booking => {
      if (filter === "all") return true;
      const travelType = booking.bookingDetails.travelType || 'local';
      return travelType === filter;
    }) : [];

  // Get travel type badge color
  const getTravelTypeBadge = (travelType) => {
    switch (travelType) {
      case 'interstate':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'intercity':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'local':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'onTrip':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tripCompleted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-full mx-auto py-20 px-4" style={{ minWidth: '1400px' }}>
      <UserOrderDetailsModal />
      
      {/* Back Button and Header */}
      <div className="mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-bold"
        >
          <FaArrowLeft className="text-lg" />
          <strong>Back</strong>
        </button>
        
        <h1 className="text-4xl font-bold mb-2 text-black"><strong>Your Bookings</strong></h1>
        <div className="text-sm font-bold text-gray-800 mb-6">
          <strong>{bookings && bookings.length > 0 ? 
            `Manage all your car rental bookings - Local, Intercity & Interstate travel` : 
            "No bookings yet - Start your journey with DriveO!"
          }</strong>
        </div>

        {/* Filter Tabs */}
        {bookings && bookings.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'local', 'interstate'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <strong>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</strong>
                {filterType !== 'all' && bookings && (
                  <span className="ml-1 text-xs font-bold">
                    <strong>({bookings.filter(b => (b.bookingDetails.travelType || 'local') === filterType).length})</strong>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-black font-bold"><strong>Loading your bookings...</strong></span>
        </div>
      )}

      {/* No Bookings State */}
      {!loading && (!bookings || bookings.length === 0) && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2"><strong>No Bookings Yet</strong></h3>
          <p className="text-gray-600 font-bold mb-6"><strong>Start your journey by booking your first car!</strong></p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            <strong>Browse Vehicles</strong>
          </button>
        </div>
      )}

      {/* Bookings List */}
      {!loading && filteredBookings && filteredBookings.length > 0 && (
        <div className="space-y-6">
          {filteredBookings.map((cur, idx) => {
            const pickupDate = new Date(cur.bookingDetails.pickupDate);
            const dropoffDate = new Date(cur.bookingDetails.dropOffDate);
            const travelType = cur.bookingDetails.travelType || 'local';
            const isInterstate = travelType === 'interstate';

            return (
              <div
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                key={idx}
                style={{ minWidth: '1300px' }}
              >
                {/* Travel Type Header */}
                <div className={`px-6 py-3 ${
                  isInterstate ? 'bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200' :
                  'bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isInterstate ? 'bg-red-200 text-red-700' :
                        'bg-green-200 text-green-700'
                      }`}>
                        {isInterstate ? <FaMapMarkedAlt /> : <CiLocationOn />}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getTravelTypeBadge(travelType)}`}>
                          <strong>{travelType.toUpperCase()} TRAVEL</strong>
                        </span>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          <strong>Booking ID: {cur.bookingDetails.bookingId || cur.bookingDetails._id}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(cur.bookingDetails.status)}`}>
                        <strong>{cur.bookingDetails.status.toUpperCase()}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Vehicle Image */}
                    <div className="lg:col-span-1">
                      <img
                        alt={cur.vehicleDetails.name}
                        className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                        src={cur.vehicleDetails.image[0]}
                      />
                      <div className="mt-3 text-center">
                        <h3 className="font-bold text-lg text-black">
                          <strong>{cur.vehicleDetails.company} {cur.vehicleDetails.name || cur.vehicleDetails.model}</strong>
                        </h3>
                        <p className="text-sm font-bold text-gray-700"><strong>{cur.vehicleDetails.registeration_number}</strong></p>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pickup Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600 font-bold">
                            <CiLocationOn className="text-lg" />
                            <span><strong>Pickup Location</strong></span>
                          </div>
                          <div className="pl-6">
                            <p className="font-bold text-black text-lg"><strong>{cur.bookingDetails.pickUpLocation}</strong></p>
                            {cur.bookingDetails.pickUpCity && (
                              <p className="text-sm font-bold text-gray-700">
                                <strong>{cur.bookingDetails.pickUpCity}, {cur.bookingDetails.pickUpState}</strong>
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-700">
                              <div className="flex items-center gap-1">
                                <CiCalendarDate />
                                <span><strong>{pickupDate.toLocaleDateString('en-IN')}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IoMdTime />
                                <span><strong>{pickupDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dropoff Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-600 font-bold">
                            <CiLocationOn className="text-lg" />
                            <span><strong>Drop-off Location</strong></span>
                          </div>
                          <div className="pl-6">
                            <p className="font-bold text-black text-lg"><strong>{cur.bookingDetails.dropOffLocation}</strong></p>
                            {cur.bookingDetails.dropOffCity && (
                              <p className="text-sm font-bold text-gray-700">
                                <strong>{cur.bookingDetails.dropOffCity}, {cur.bookingDetails.dropOffState}</strong>
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-700">
                              <div className="flex items-center gap-1">
                                <CiCalendarDate />
                                <span><strong>{dropoffDate.toLocaleDateString('en-IN')}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IoMdTime />
                                <span><strong>{dropoffDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Pricing for Cross-State */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-green-600" />
                            <span className="font-bold text-black"><strong>Total Amount</strong></span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-3xl font-bold text-green-600">
                              <MdCurrencyRupee />
                              <span><strong>{cur.bookingDetails.totalPrice}</strong></span>
                            </div>
                            {cur.bookingDetails.driverAllowance > 0 && (
                              <p className="text-xs font-bold text-gray-700">
                                <strong>Includes ₹{cur.bookingDetails.driverAllowance} interstate allowance</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mt-3 flex items-center justify-between text-sm font-bold">
                          <span className="text-black"><strong>Payment Method: {cur.bookingDetails.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</strong></span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            cur.bookingDetails.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            <strong>{cur.bookingDetails.paymentStatus === 'pending' ? 'Pay at Pickup' : 'Paid'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-3 justify-end">
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => sendPdfToEmail(cur.bookingDetails._id)}
                          disabled={sendingPdf[cur.bookingDetails._id]}
                        >
                          {sendingPdf[cur.bookingDetails._id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <strong>Sending...</strong>
                            </>
                          ) : (
                            <>
                              <FaFilePdf />
                              <FaEnvelope />
                              <strong>Send Receipt PDF</strong>
                            </>
                          )}
                        </button>
                        <button
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                          onClick={() => handleDetailsModal(cur)}
                        >
                          <strong>View Details</strong>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results for Filter */}
      {!loading && bookings && bookings.length > 0 && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2"><strong>No {filter} bookings found</strong></h3>
          <p className="text-gray-600 font-bold"><strong>Try selecting a different filter to see your bookings.</strong></p>
        </div>
      )}
    </div>
  );
}
