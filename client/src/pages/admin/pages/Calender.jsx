
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const Calender = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/allBookings');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBookings(data);
        
        // Transform bookings to calendar events
        const calendarEvents = data.map(booking => ({
          id: booking._id,
          title: `${booking.vehicleId?.name || 'Vehicle'} - ${booking.userId?.name || 'Customer'}`,
          start: new Date(booking.pickupDate),
          end: new Date(booking.dropOffDate),
          resource: {
            bookingId: booking.bookingId,
            customer: booking.userId?.name,
            vehicle: booking.vehicleId?.name,
            status: booking.bookingStatus,
            amount: booking.totalAmount,
            pickup: booking.pickupLocation,
            dropoff: booking.dropOffLocation
          }
        }));
        
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Date', 'Booking ID', 'Customer', 'Vehicle', 'Pickup', 'Dropoff', 'Status', 'Amount'],
      ...bookings.map(booking => [
        new Date(booking.pickupDate).toLocaleDateString(),
        booking.bookingId || `BK${booking._id?.toString().slice(-6)}`,
        booking.userId?.name || 'Unknown',
        booking.vehicleId?.name || 'Unknown Vehicle',
        booking.pickupLocation || '',
        booking.dropOffLocation || '',
        booking.bookingStatus || 'Pending',
        booking.totalAmount || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-bookings-${new Date().toISOString().split('T')[0]}.csv`;
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
          type: 'calendar',
          data: bookings,
          title: 'Calendar Bookings Report'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to text export
      const textContent = `Calendar Bookings Report\n\n${bookings.map(booking => 
        `${new Date(booking.pickupDate).toLocaleDateString()} - ${booking.userId?.name} - ${booking.vehicleId?.name} - ₹${booking.totalAmount}`
      ).join('\n')}`;
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource?.status) {
      case 'Confirmed':
        backgroundColor = '#28a745';
        break;
      case 'Pending':
        backgroundColor = '#ffc107';
        break;
      case 'Cancelled':
        backgroundColor = '#dc3545';
        break;
      default:
        backgroundColor = '#6c757d';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Calendar</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaFilePdf />
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Cancelled</span>
        </div>
      </div>

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          popup
          tooltipAccessor={(event) => 
            `${event.resource?.customer} - ${event.resource?.vehicle}\nPickup: ${event.resource?.pickup}\nAmount: ₹${event.resource?.amount}`
          }
        />
      </div>
    </div>
  );
};

export default Calender;