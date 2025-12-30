

import React, { useState, useEffect } from 'react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    try {
      setLoading(true);
      
      // Fetch users (customers)
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      
      // Fetch bookings to get customer activity
      const bookingsResponse = await fetch('/api/admin/allBookings');
      const bookingsData = await bookingsResponse.json();
      
      // Filter only regular customers (not admins or vendors)
      const regularCustomers = Array.isArray(usersData) 
        ? usersData.filter(user => !user.isAdmin && !user.isVendor)
        : [];
      
      // Add booking statistics to customers
      const customersWithStats = regularCustomers.map(customer => {
        const customerBookings = Array.isArray(bookingsData) 
          ? bookingsData.filter(booking => booking.userId === customer._id)
          : [];
        
        const totalSpent = customerBookings.reduce((sum, booking) => 
          sum + (booking.totalPrice || booking.totalAmount || 0), 0
        );
        
        const lastBooking = customerBookings.length > 0 
          ? new Date(Math.max(...customerBookings.map(b => new Date(b.createdAt))))
          : null;

        return {
          ...customer,
          totalBookings: customerBookings.length,
          totalSpent,
          lastBooking,
          status: customerBookings.length > 0 ? 'Active' : 'Inactive'
        };
      });

      setCustomers(customersWithStats);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setError(null);
    } catch (err) {
      console.error('Customers fetch error:', err);
      setError(err.message);
      setCustomers([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Total Bookings', 'Total Spent', 'Last Booking', 'Status', 'Joined Date'],
      ...filteredCustomers.map(customer => [
        customer.username || customer.name || '',
        customer.email || '',
        customer.phoneNumber || '',
        customer.totalBookings || 0,
        customer.totalSpent || 0,
        customer.lastBooking ? customer.lastBooking.toLocaleDateString() : 'Never',
        customer.status || 'Inactive',
        new Date(customer.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredCustomers = customers
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (customer.username || customer.name || '').toLowerCase().includes(searchLower) ||
             (customer.email || '').toLowerCase().includes(searchLower) ||
             (customer.phoneNumber || '').includes(searchTerm);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.username || a.name || '').localeCompare(b.username || b.name || '');
        case 'bookings':
          return (b.totalBookings || 0) - (a.totalBookings || 0);
        case 'spent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (customer) => {
    if (customer.totalBookings > 5) return 'bg-green-100 text-green-800';
    if (customer.totalBookings > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getCustomerLevel = (customer) => {
    if (customer.totalBookings > 10) return 'VIP';
    if (customer.totalBookings > 5) return 'Premium';
    if (customer.totalBookings > 0) return 'Regular';
    return 'New';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchCustomersData}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800"><strong>Customer Management</strong></h1>
        <button
          onClick={exportToExcel}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <span>📊</span>
          <span className="font-bold"><strong>Export Excel</strong></span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="recent"><strong>Recently Joined</strong></option>
              <option value="name"><strong>Name A-Z</strong></option>
              <option value="bookings"><strong>Most Bookings</strong></option>
              <option value="spent"><strong>Highest Spent</strong></option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-bold"><strong>Total Customers</strong></p>
              <p className="text-2xl font-bold"><strong>{customers.length}</strong></p>
            </div>
            <div className="text-3xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-bold"><strong>Active Customers</strong></p>
              <p className="text-2xl font-bold"><strong>{customers.filter(c => c.totalBookings > 0).length}</strong></p>
            </div>
            <div className="text-3xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-bold"><strong>VIP Customers</strong></p>
              <p className="text-2xl font-bold"><strong>{customers.filter(c => c.totalBookings > 10).length}</strong></p>
            </div>
            <div className="text-3xl opacity-80">👑</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-bold"><strong>Total Revenue</strong></p>
              <p className="text-2xl font-bold">
                <strong>{formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}</strong>
              </p>
            </div>
            <div className="text-3xl opacity-80">💰</div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            <strong>Customers List ({filteredCustomers.length} of {customers.length})</strong>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Customer</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Contact Information</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Customer Level</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Total Bookings</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Total Amount Spent</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Last Booking Date</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Date Joined</strong>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <strong>Actions</strong>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={customer.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.username || customer.name || 'Customer')}&background=random`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            <strong>{customer.username || customer.name || 'Unknown'}</strong>
                          </div>
                          <div className="text-sm font-semibold text-gray-500">
                            <strong>ID: {customer._id.slice(-6)}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        <strong>{customer.email}</strong>
                      </div>
                      <div className="text-sm font-semibold text-gray-500">
                        <strong>{customer.phoneNumber || 'No phone'}</strong>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(customer)}`}>
                        <strong>{getCustomerLevel(customer)}</strong>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      <strong>{customer.totalBookings || 0}</strong>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      <strong>{formatCurrency(customer.totalSpent || 0)}</strong>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">
                      <strong>{customer.lastBooking ? customer.lastBooking.toLocaleDateString() : 'Never'}</strong>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">
                      <strong>{new Date(customer.createdAt).toLocaleDateString()}</strong>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3 font-bold">
                        <strong>View Details</strong>
                      </button>
                      <button className="text-green-600 hover:text-green-900 font-bold">
                        <strong>Contact</strong>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-bold">
                    <strong>{searchTerm ? 'No customers match your search' : 'No customers found'}</strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;