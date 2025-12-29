import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';

// Simple distance calculation for common routes
const getEstimatedDistance = (pickup, dropoff) => {
  if (!pickup || !dropoff) return null;
  
  const normalize = (str) => str.toLowerCase().replace(/[^\w]/g, '');
  const p = normalize(pickup);
  const d = normalize(dropoff);
  
  // Common routes with known distances
  const routes = {
    'raichurchennai': 587,
    'chennairaichur': 587,
    'hyderabadbangalore': 569,
    'bangalorehyderabad': 569,
    'hyderabadchennai': 625,
    'chennaihyderabad': 625,
    'bangalorechennai': 346,
    'chennaibangalore': 346,
    'mumbaihyderabad': 711,
    'hyderabadmumbai': 711,
    'delhihyderabad': 1569,
    'hyderabaddelhi': 1569,
  };
  
  const key1 = p + d;
  const key2 = d + p;
  
  return routes[key1] || routes[key2] || null;
};

const BookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/allBookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleStatusChange = (e, params) => {
    const newStatus = e.target.value;
    const bookingId = params.id;

    const changeVehicleStatus = async () => {
      try {
        const isStatusChanged = await fetch("/api/admin/changeStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: bookingId,
            status: newStatus,
          }),
        });

        if (!isStatusChanged.ok) {
          return;
        }
        fetchBookings()

      } catch (error) {
        console.log(error);
      }
    };

    changeVehicleStatus();
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Booking ID', 'Customer Name', 'Vehicle', 'Pickup Location', 'Pickup Date', 'Dropoff Location', 'Dropoff Date', 'Status', 'Total Amount', 'Phone', 'Email'],
      ...bookings.map(booking => [
        booking._id?.slice(-8) || 'N/A',
        booking.userId?.name || booking.userId?.username || 'Unknown',
        `${booking.vehicleDetails?.company || ''} ${booking.vehicleDetails?.name || booking.vehicleDetails?.model || ''}`.trim() || 
        `${booking.vehicleId?.company || ''} ${booking.vehicleId?.name || booking.vehicleId?.model || ''}`.trim() || 
        'Unknown Vehicle',
        booking.pickUpLocation || booking.pickupLocation || '',
        new Date(booking.pickupDate).toLocaleDateString(),
        booking.dropOffLocation || '',
        new Date(booking.dropOffDate).toLocaleDateString(),
        booking.status || booking.bookingStatus || 'Pending',
        booking.totalAmount || booking.totalPrice || 0,
        booking.userId?.phoneNumber || '',
        booking.userId?.email || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/admin/financial/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bookings',
          data: bookings,
          title: 'Bookings Report'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to text export
      const textContent = `Bookings Report\n\n${bookings.map(booking => 
        `${booking._id?.slice(-8)} - ${booking.userId?.name || 'Unknown'} - ${booking.vehicleDetails?.name || 'Unknown Vehicle'} - ${booking.status || 'Pending'}`
      ).join('\n')}`;
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  //all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  //columns with increased width
  const columns = [
    {
      field: "image",
      headerName: "Vehicle Image",
      width: 120,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "5px",
            objectFit: "contain",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "bookingId",
      headerName: "Booking ID",
      width: 120,
      renderCell: (params) => (
        <span className="font-mono text-sm">
          {params.value?.slice(-8) || 'N/A'}
        </span>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      width: 150,
    },
    {
      field: "vehicleName",
      headerName: "Vehicle Name",
      width: 150,
    },
    {
      field: "Pickup_Location",
      headerName: "Pickup Location",
      width: 180,
    },
    { 
      field: "Pickup_Date", 
      headerName: "Pickup Date", 
      width: 150,
      renderCell: (params) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
    { 
      field: "Dropoff_Location", 
      headerName: "Dropoff Location", 
      width: 180 
    },
    {
      field: "Dropoff_Date",
      headerName: "Dropoff Date",
      width: 150,
      renderCell: (params) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
    {
      field: "distance",
      headerName: "Distance (km)",
      width: 120,
      renderCell: (params) => {
        if (typeof params.value === 'number') {
          return (
            <span className="font-semibold text-blue-600">
              {params.value} km
            </span>
          );
        } else if (typeof params.value === 'string') {
          return (
            <span className="text-xs text-gray-500">
              {params.value}
            </span>
          );
        } else {
          return (
            <span className="text-gray-400">
              N/A
            </span>
          );
        }
      },
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 130,
      renderCell: (params) => (
        <span className="font-semibold text-green-600">
          ₹{params.value?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      field: "Vehicle_Status",
      headerName: "Current Status",
      width: 150,
      renderCell: (params) => {
        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case 'booked': return 'bg-blue-200 text-blue-800';
            case 'ontrip': return 'bg-yellow-200 text-yellow-800';
            case 'tripcompleted': return 'bg-green-200 text-green-800';
            case 'canceled': return 'bg-red-200 text-red-800';
            case 'overdue': return 'bg-orange-200 text-orange-800';
            default: return 'bg-gray-200 text-gray-800';
          }
        };
        
        return (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(params.value)}`}>
            {params.value}
          </div>
        );
      },
    },
    {
      field: "Change_Status",
      headerName: "Change Status",
      width: 160,
      renderCell: (params) => {
        return (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={params.selectedValue}
            onChange={(e) => {
              handleStatusChange(e, params)
            }}
          >
            {params.value.map((cur, idx) => (
              <option key={idx} value={cur}>
                {cur.charAt(0).toUpperCase() + cur.slice(1)}
              </option>
            ))}
          </select>
        )
      }
    },
  ];

  //rows
  const rows =
    bookings?.map((cur) => ({
      id: cur._id,
      bookingId: cur._id,
      image: cur.vehicleDetails?.image?.[0] || cur.vehicleId?.image?.[0] || '/placeholder-car.jpg',
      customerName: cur.userId?.name || cur.userId?.username || 'Unknown Customer',
      vehicleName: `${cur.vehicleDetails?.company || ''} ${cur.vehicleDetails?.name || cur.vehicleDetails?.model || ''}`.trim() || 
                   `${cur.vehicleId?.company || ''} ${cur.vehicleId?.name || cur.vehicleId?.model || ''}`.trim() || 
                   'Unknown Vehicle',
      Pickup_Location: cur.pickUpLocation || cur.pickupLocation || 'Not specified',
      Pickup_Date: cur.pickupDate,
      Dropoff_Location: cur.dropOffLocation || 'Not specified',
      Dropoff_Date: cur.dropOffDate,
      distance: cur.estimatedDistance || 
                getEstimatedDistance(cur.pickUpLocation || cur.pickupLocation, cur.dropOffLocation) ||
                (cur.pickUpLocation && cur.dropOffLocation ? 
                  `${cur.pickUpLocation} to ${cur.dropOffLocation}` : null),
      totalAmount: cur.totalAmount || cur.totalPrice || 0,
      Vehicle_Status: cur.status || cur.bookingStatus || 'Pending',
      Change_Status: [
        "notBooked",
        "booked",
        "onTrip",
        "notPicked",
        "canceled",
        "overDue",
        "tripCompleted",
      ],
    })) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-black font-bold">Loading bookings...</span>
      </div>
    );
  }

  return (
    <>
      {/* Export Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <FaFileExcel />
          Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          <FaFilePdf />
          Export PDF
        </button>
      </div>

      {/* Enhanced Table Container */}
      <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-black">
            All Bookings ({bookings.length} total)
          </h3>
        </div>
        
        <div className="p-4">
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                ".MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "&.MuiDataGrid-root": {
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                },
                ".MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f9fafb",
                  borderBottom: "2px solid #e5e7eb",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#000000",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                },
                ".MuiDataGrid-cell": {
                  borderBottom: "1px solid #f3f4f6",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#000000",
                },
                ".MuiDataGrid-row:hover": {
                  backgroundColor: "#f8fafc",
                },
                ".MuiDataGrid-footerContainer": {
                  borderTop: "2px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  "& .MuiTablePagination-root": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                  "& .MuiTablePagination-selectLabel": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                  "& .MuiTablePagination-displayedRows": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
};

export default BookingsTable;
