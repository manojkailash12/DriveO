import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TravelAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    totalTrips: 0,
    totalDistance: 0,
    averageTripDuration: 0,
    popularRoutes: [],
    vehicleUtilization: [],
    monthlyTrends: [],
    revenueByRoute: []
  });
  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    fetchTravelAnalytics();
  }, [selectedPeriod]);

  const fetchTravelAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings data for travel analytics
      const bookingsResponse = await fetch('/api/admin/allBookings');
      let bookings = [];
      if (bookingsResponse.ok) {
        bookings = await bookingsResponse.json();
      }

      // Store raw bookings for PDF export
      setRawBookings(bookings);

      // Process data for analytics
      const processedData = processTravelData(bookings);
      console.log('Processed analytics data:', processedData); // Debug log
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error('Failed to fetch travel analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTravelData = (bookings) => {
    if (!Array.isArray(bookings)) return analyticsData;

    const now = new Date();
    const periodDays = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const filteredBookings = bookings.filter(booking => 
      new Date(booking.createdAt) >= cutoffDate
    );

    // Calculate total trips
    const totalTrips = filteredBookings.length;

    // Calculate total distance from booking data
    let totalDistance = 0;
    let totalDuration = 0;
    
    filteredBookings.forEach(booking => {
      // Use actual distance from booking if available, otherwise estimate
      if (booking.estimatedDistance && booking.estimatedDistance > 0) {
        totalDistance += booking.estimatedDistance;
      } else {
        // Fallback estimation based on travel type
        const isInterstate = booking.travelType === 'interstate' || 
                            (booking.pickUpState && booking.dropOffState && 
                             booking.pickUpState !== booking.dropOffState);
        totalDistance += isInterstate ? 450 : 120; // Interstate avg: 450km, Local avg: 120km
      }
      
      // Use actual duration if available, otherwise estimate based on booking dates
      if (booking.estimatedDuration && booking.estimatedDuration > 0) {
        totalDuration += booking.estimatedDuration;
      } else {
        // Calculate duration from pickup and dropoff dates
        const pickupDate = new Date(booking.pickupDate);
        const dropoffDate = new Date(booking.dropOffDate);
        
        // Ensure valid dates
        if (!isNaN(pickupDate.getTime()) && !isNaN(dropoffDate.getTime())) {
          const durationInDays = Math.max(1, Math.ceil((dropoffDate - pickupDate) / (1000 * 60 * 60 * 24)));
          totalDuration += durationInDays * 8; // Estimate 8 hours per day
        } else {
          // Fallback: assume 1 day trip
          totalDuration += 8;
        }
      }
    });

    // Calculate average trip duration in hours
    let averageTripDuration = 0;
    if (totalTrips > 0 && totalDuration > 0 && !isNaN(totalDuration)) {
      averageTripDuration = Math.round((totalDuration / totalTrips) * 10) / 10;
    }

    // Calculate popular routes
    const routeCount = {};
    const routeRevenue = {};
    
    filteredBookings.forEach(booking => {
      const pickupLocation = booking.pickUpLocation || booking.pickUpCity || 'Unknown Location';
      const dropoffLocation = booking.dropOffLocation || booking.dropOffCity || 'Unknown Location';
      const route = `${pickupLocation} → ${dropoffLocation}`;
      
      routeCount[route] = (routeCount[route] || 0) + 1;
      const revenue = booking.totalPrice || booking.totalAmount || 0;
      routeRevenue[route] = (routeRevenue[route] || 0) + (isNaN(revenue) ? 0 : revenue);
    });

    const popularRoutes = Object.entries(routeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ 
        route, 
        count: count || 0, 
        revenue: routeRevenue[route] || 0 
      }));

    // Calculate vehicle utilization
    const vehicleUsage = {};
    filteredBookings.forEach(booking => {
      const company = booking.vehicleDetails?.company || 'Unknown';
      const model = booking.vehicleDetails?.model || booking.vehicleDetails?.name || 'Vehicle';
      const vehicleKey = `${company} ${model}`.trim();
      vehicleUsage[vehicleKey] = (vehicleUsage[vehicleKey] || 0) + 1;
    });

    const vehicleUtilization = Object.entries(vehicleUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([vehicle, trips]) => ({ vehicle, trips: trips || 0 }));

    // Calculate monthly trends (simplified)
    const monthlyData = {};
    filteredBookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, trips]) => ({ month, trips: trips || 0 }));

    return {
      totalTrips,
      totalDistance: isNaN(totalDistance) ? 0 : Math.round(totalDistance),
      averageTripDuration: isNaN(averageTripDuration) ? 0 : averageTripDuration,
      popularRoutes,
      vehicleUtilization,
      monthlyTrends,
      revenueByRoute: popularRoutes
    };
  };

  const exportTravelAnalytics = async (format) => {
    try {
      if (format === 'excel') {
        const csvContent = [
          ['Travel Analytics Report - DriveO'],
          ['Generated on:', new Date().toLocaleDateString()],
          ['Period:', selectedPeriod],
          [''],
          ['Summary'],
          ['Total Trips', analyticsData.totalTrips],
          ['Estimated Total Distance (km)', analyticsData.totalDistance],
          ['Average Trip Duration (hours)', analyticsData.averageTripDuration],
          [''],
          ['Popular Routes'],
          ['Route', 'Trip Count', 'Revenue'],
          ...analyticsData.popularRoutes.map(route => [route.route, route.count, route.revenue]),
          [''],
          ['Vehicle Utilization'],
          ['Vehicle', 'Trip Count'],
          ...analyticsData.vehicleUtilization.map(vehicle => [vehicle.vehicle, vehicle.trips])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `travel-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const response = await fetch('/api/admin/export/analytics-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'travel-analytics',
            title: 'DriveO Travel Analytics Report',
            data: rawBookings || [],
            period: selectedPeriod
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `travel-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading travel analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Travel Analytics</h1>
          <p className="text-gray-600">Comprehensive travel insights and patterns</p>
        </div>
        <button
          onClick={() => navigate('/adminDashboard/adminHome')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Period Selector and Export Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => exportTravelAnalytics('excel')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => exportTravelAnalytics('pdf')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Trips</p>
              <p className="text-3xl font-bold">{analyticsData.totalTrips || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🚗</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Est. Distance (km)</p>
              <p className="text-3xl font-bold">{isNaN(analyticsData.totalDistance) ? '0' : analyticsData.totalDistance.toLocaleString()}</p>
            </div>
            <div className="text-4xl opacity-80">📍</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg. Duration (hrs)</p>
              <p className="text-3xl font-bold">{isNaN(analyticsData.averageTripDuration) ? '0' : analyticsData.averageTripDuration}</p>
            </div>
            <div className="text-4xl opacity-80">⏱️</div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Routes */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Routes</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.popularRoutes.map((route, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{route.route}</p>
                  <p className="text-xs text-gray-600">{route.count || 0} trips</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{isNaN(route.revenue) ? '0' : route.revenue.toLocaleString()}</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.popularRoutes[0]?.count > 0 ? (route.count / analyticsData.popularRoutes[0].count) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Utilization */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Utilization</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.vehicleUtilization.map((vehicle, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{vehicle.vehicle}</p>
                  <p className="text-xs text-gray-600">{vehicle.trips || 0} trips</p>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.vehicleUtilization[0]?.trips > 0 ? (vehicle.trips / analyticsData.vehicleUtilization[0].trips) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Trends</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {analyticsData.monthlyTrends.map((month, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{month.month}</p>
                <p className="text-2xl font-bold text-blue-600">{month.trips || 0}</p>
                <p className="text-xs text-gray-600">trips</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/adminDashboard/orders')}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">View Bookings</div>
          </button>
          <button
            onClick={() => navigate('/adminDashboard/financial')}
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm">Financial Reports</div>
          </button>
          <button
            onClick={fetchTravelAnalytics}
            className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm">Refresh Data</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelAnalytics;