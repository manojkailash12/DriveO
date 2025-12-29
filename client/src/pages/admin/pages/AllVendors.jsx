

import React, { useState, useEffect } from 'react';

const AllVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      
      const data = await response.json();
      setVendors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Vendors fetch error:', err);
      setError(err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Business Name', 'Status', 'Vehicles', 'Joined Date'],
      ...filteredVendors.map(vendor => [
        vendor.username || vendor.name || '',
        vendor.email || '',
        vendor.phoneNumber || '',
        vendor.businessName || '',
        vendor.isApproved ? 'Approved' : 'Pending',
        vendor.vehicleCount || 0,
        new Date(vendor.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = (vendor.username || vendor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && vendor.isApproved) ||
                         (filterStatus === 'pending' && !vendor.isApproved);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (vendor) => {
    return vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchVendors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchVendors}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">All Vendors</h1>
        <button
          onClick={exportToExcel}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <span>📊</span>
          <span>Export Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Vendors</p>
              <p className="text-2xl font-bold">{vendors.length}</p>
            </div>
            <div className="text-3xl opacity-80">🏪</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold">{vendors.filter(v => v.isApproved).length}</p>
            </div>
            <div className="text-3xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{vendors.filter(v => !v.isApproved).length}</p>
            </div>
            <div className="text-3xl opacity-80">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + (v.vehicleCount || 0), 0)}</p>
            </div>
            <div className="text-3xl opacity-80">🚗</div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Vendors List ({filteredVendors.length} of {vendors.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={vendor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.username || vendor.name || 'Vendor')}&background=random`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.username || vendor.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {vendor._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.businessName || 'Not provided'}</div>
                      <div className="text-sm text-gray-500">{vendor.businessType || 'General'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.email}</div>
                      <div className="text-sm text-gray-500">{vendor.phoneNumber || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(vendor)}`}>
                        {vendor.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.vehicleCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </button>
                      {!vendor.isApproved && (
                        <button 
                          onClick={() => handleApproveVendor(vendor._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-900">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' ? 'No vendors match your filters' : 'No vendors found'}
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

export default AllVendors;