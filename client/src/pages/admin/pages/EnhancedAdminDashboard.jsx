import React, { useState, useEffect } from 'react';
import { Button } from "../components";
import { useNavigate } from 'react-router-dom';

const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    totalVehicles: 0,
    totalUsers: 0,
    recentBookings: [],
    vehicleLocations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 30 seconds, but only if component is still mounted
    const interval = setInterval(() => {
      // Add a check to prevent unnecessary API calls
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Fetch dashboard statistics with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      let statsData = {};
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      } else {
        console.warn('Failed to fetch stats, using defaults');
      }
      
      // Fetch recent bookings
      const bookingsResponse = await fetch('/api/admin/allBookings');
      let bookingsData = [];
      if (bookingsResponse.ok) {
        bookingsData = await bookingsResponse.json();
      } else {
        console.warn('Failed to fetch bookings, using defaults');
      }
      
      // Fetch vehicles with locations
      const vehiclesResponse = await fetch('/api/admin/showVehicles');
      let vehiclesData = [];
      if (vehiclesResponse.ok) {
        vehiclesData = await vehiclesResponse.json();
      } else {
        console.warn('Failed to fetch vehicles, using defaults');
      }
      
      setDashboardStats({
        totalEarnings: statsData.totalEarnings || 0,
        totalBookings: statsData.totalBookings || 0,
        totalVehicles: statsData.totalVehicles || 0,
        totalUsers: statsData.totalUsers || 0,
        recentBookings: Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : [],
        vehicleLocations: Array.isArray(vehiclesData) ? vehiclesData.slice(0, 10) : []
      });
      
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.name === 'AbortError' ? 'Request timeout' : err.message);
      // Set default values on error to prevent crashes
      setDashboardStats({
        totalEarnings: 0,
        totalBookings: 0,
        totalVehicles: 0,
        totalUsers: 0,
        recentBookings: [],
        vehicleLocations: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToExcel = async () => {
    try {
      const allBookingsResponse = await fetch('/api/admin/allBookings');
      let allBookings = [];
      if (allBookingsResponse.ok) {
        allBookings = await allBookingsResponse.json();
      }
      
      const csvContent = [
        ['Date', 'Vehicle', 'Customer', 'Pickup', 'Dropoff', 'Amount', 'Status', 'Payment Method'],
        ...Array.isArray(allBookings) ? allBookings.map(booking => [
          new Date(booking.createdAt).toLocaleDateString(),
          `${booking.vehicleDetails?.company || ''} ${booking.vehicleDetails?.model || ''}`,
          booking.userDetails?.username || '',
          booking.pickUpLocation || '',
          booking.dropOffLocation || '',
          booking.totalPrice || 0,
          booking.status || '',
          booking.paymentMethod || 'Cash on Delivery'
        ]) : []
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `driveo-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/admin/export/analytics-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'analytics',
          title: 'DriveO Analytics Report',
          data: dashboardStats.recentBookings || []
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `driveo-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Export to PDF failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      booked: 'bg-blue-100 text-blue-800',
      onTrip: 'bg-green-100 text-green-800',
      tripCompleted: 'bg-gray-100 text-gray-800',
      canceled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !dashboardStats.totalEarnings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Export Buttons - Moved to center */}
      <div className="flex justify-center space-x-3 mb-6">
        <button
          onClick={exportToExcel}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <span>📊</span>
          <span>Export to Excel</span>
        </button>
        <button
          onClick={exportToPDF}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <span>📄</span>
          <span>Export Report</span>
        </button>
        <button
          onClick={() => navigate('/adminDashboard/travelAnalytics')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <span>🚗</span>
          <span>Travel Analytics</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalEarnings)}</p>
            </div>
            <div className="text-3xl opacity-80 bg-white/20 p-3 rounded-full">💰</div>
          </div>
          <div className="mt-3 text-green-100 text-xs flex items-center">
            <span className="w-2 h-2 bg-green-200 rounded-full mr-2 animate-pulse"></span>
            Auto-updated • Last: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
            </div>
            <div className="text-3xl opacity-80 bg-white/20 p-3 rounded-full">📋</div>
          </div>
          <div className="mt-3 text-blue-100 text-xs">
            Cash on Delivery Supported
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold">{dashboardStats.totalVehicles}</p>
            </div>
            <div className="text-3xl opacity-80 bg-white/20 p-3 rounded-full">🚗</div>
          </div>
          <div className="mt-3 text-purple-100 text-xs">
            Fleet Management
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{dashboardStats.totalUsers}</p>
            </div>
            <div className="text-3xl opacity-80 bg-white/20 p-3 rounded-full">👥</div>
          </div>
          <div className="mt-3 text-orange-100 text-xs">
            Multi-role Support
          </div>
        </div>
      </div>

      {/* Recent Bookings and Vehicle Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
            <button 
              onClick={fetchDashboardData}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardStats.recentBookings.length > 0 ? (
              dashboardStats.recentBookings.map((booking, index) => (
                <div key={booking._id || index} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {booking.vehicleDetails?.company} {booking.vehicleDetails?.model}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {booking.pickUpLocation} → {booking.dropOffLocation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-green-600 text-sm">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Vehicle Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Fleet Overview</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardStats.vehicleLocations.length > 0 ? (
              dashboardStats.vehicleLocations.map((vehicle, index) => (
                <div key={vehicle._id || index} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {vehicle.company} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        📍 {vehicle.location}, {vehicle.city}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.registeration_number}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`w-3 h-3 rounded-full ${vehicle.isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <p className="text-xs text-gray-500 mt-1">
                        {vehicle.isBooked ? 'On Trip' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚗</div>
                <p>No vehicle data available</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button 
              onClick={() => navigate('/adminDashboard/allVehicles')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              🚗 Manage Vehicles
            </button>
          </div>
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Earnings Overview</h3>
            <select className="border rounded px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/adminDashboard/addProducts')}
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <div className="text-xl mb-1">➕</div>
              <div className="text-xs">Add Vehicle</div>
            </button>
            <button 
              onClick={() => navigate('/adminDashboard/financial')}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <div className="text-xl mb-1">📊</div>
              <div className="text-xs">View Reports</div>
            </button>
            <button 
              onClick={() => navigate('/adminDashboard/allUsers')}
              className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <div className="text-xl mb-1">👥</div>
              <div className="text-xs">Manage Users</div>
            </button>
            <button 
              onClick={() => navigate('/adminDashboard/allVehicles')}
              className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <div className="text-xl mb-1">🚗</div>
              <div className="text-xs">All Vehicles</div>
            </button>
            <button 
              onClick={() => navigate('/adminDashboard/orders')}
              className="bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <div className="text-xl mb-1">📋</div>
              <div className="text-xs">View Orders</div>
            </button>
            <button 
              onClick={() => navigate('/adminDashboard/customers')}
              className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <div className="text-xl mb-1">👤</div>
              <div className="text-xs">Customers</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
