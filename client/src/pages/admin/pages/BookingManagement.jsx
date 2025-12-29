import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaDownload, FaFilter, FaSearch, FaCar, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'sonner';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
    paymentMethod: 'all'
  });

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/allBookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
        calculateStats(data.bookings || []);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingData) => {
    const totalBookings = bookingData.length;
    const pendingBookings = bookingData.filter(b => b.bookingStatus === 'Pending').length;
    const confirmedBookings = bookingData.filter(b => b.bookingStatus === 'Confirmed').length;
    const totalRevenue = bookingData
      .filter(b => b.bookingStatus === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue
    });
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => 
        booking.bookingStatus?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(booking => 
          new Date(booking.createdAt) >= startDate
        );
      }
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(booking => 
        booking.paymentMethod === filters.paymentMethod
      );
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.userId?.name?.toLowerCase().includes(searchLower) ||
        booking.userId?.email?.toLowerCase().includes(searchLower) ||
        booking.vehicleId?.name?.toLowerCase().includes(searchLower) ||
        booking.vehicleId?.company?.toLowerCase().includes(searchLower) ||
        booking.pickupLocation?.toLowerCase().includes(searchLower) ||
        booking.dropoffLocation?.toLowerCase().includes(searchLower) ||
        booking.bookingId?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch('/api/admin/changeStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        fetchBookings(); // Refresh the list
      } else {
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating booking status');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const exportBookings = async () => {
    try {
      const response = await fetch('/api/admin/financial/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookings: filteredBookings,
          type: 'bookings'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Bookings exported successfully');
      } else {
        toast.error('Failed to export bookings');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting bookings');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Management</h1>
        <p className="text-gray-600">Manage all car rental bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaCar className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUser className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaRupeeSign className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            onClick={exportBookings}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            <span>Export PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search bookings..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                status: 'all',
                dateRange: 'all',
                searchTerm: '',
                paymentMethod: 'all'
              })}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            All Bookings ({filteredBookings.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.bookingId || `BK${booking._id?.slice(-6)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.userId?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.userId?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.vehicleId?.company} {booking.vehicleId?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.vehicleId?.seat} Seater • {booking.vehicleId?.fuel_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <FaMapMarkerAlt className="inline mr-1 text-green-500" />
                      {booking.pickupLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      <FaMapMarkerAlt className="inline mr-1 text-red-500" />
                      {booking.dropoffLocation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.pickupDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {formatDate(booking.dropoffDate)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {booking.totalDays || 1} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      
                      <select
                        value={booking.bookingStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedBooking.userId?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedBooking.userId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedBooking.userId?.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Vehicle:</strong> {selectedBooking.vehicleId?.company} {selectedBooking.vehicleId?.name}</p>
                  <p><strong>Model:</strong> {selectedBooking.vehicleId?.model}</p>
                  <p><strong>Seats:</strong> {selectedBooking.vehicleId?.seat} Seater</p>
                  <p><strong>Fuel:</strong> {selectedBooking.vehicleId?.fuel_type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Pickup:</strong> {selectedBooking.pickupLocation}</p>
                  <p><strong>Drop-off:</strong> {selectedBooking.dropoffLocation}</p>
                  <p><strong>Pickup Date:</strong> {formatDate(selectedBooking.pickupDate)}</p>
                  <p><strong>Drop-off Date:</strong> {formatDate(selectedBooking.dropoffDate)}</p>
                  <p><strong>Duration:</strong> {selectedBooking.totalDays || 1} days</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</p>
                  <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBooking.bookingStatus)}`}>
                      {selectedBooking.bookingStatus || 'Pending'}
                    </span>
                  </p>
                  <p><strong>Booking Date:</strong> {formatDate(selectedBooking.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;