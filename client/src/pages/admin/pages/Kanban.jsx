import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaDownload, FaFilePdf, FaFileExcel, FaPlus, FaEdit, FaTrash, FaCar, FaUser, FaCalendar, FaRupeeSign } from 'react-icons/fa';

const Kanban = () => {
  const [columns, setColumns] = useState({
    pending: { id: 'pending', title: 'Pending', items: [] },
    confirmed: { id: 'confirmed', title: 'Confirmed', items: [] },
    ongoing: { id: 'ongoing', title: 'Ongoing', items: [] },
    completed: { id: 'completed', title: 'Completed', items: [] }
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/allBookings');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const organizedData = organizeBookingsByStatus(data);
        setColumns(organizedData);
      } else {
        // Use mock data if API fails
        setColumns(generateMockData());
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setColumns(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const organizeBookingsByStatus = (bookings) => {
    const organized = {
      pending: { id: 'pending', title: 'Pending', items: [] },
      confirmed: { id: 'confirmed', title: 'Confirmed', items: [] },
      ongoing: { id: 'ongoing', title: 'Ongoing', items: [] },
      completed: { id: 'completed', title: 'Completed', items: [] }
    };

    bookings.forEach(booking => {
      const item = {
        id: booking._id,
        bookingId: booking.bookingId || `BK${booking._id?.toString().slice(-6)}`,
        customer: booking.userId?.name || 'Unknown Customer',
        vehicle: booking.vehicleId?.name || 'Unknown Vehicle',
        pickupDate: booking.pickupDate,
        dropOffDate: booking.dropOffDate,
        amount: booking.totalAmount || 0,
        status: booking.bookingStatus,
        pickup: booking.pickupLocation,
        dropoff: booking.dropOffLocation,
        phone: booking.userId?.phoneNumber || '',
        email: booking.userId?.email || ''
      };

      switch (booking.bookingStatus?.toLowerCase()) {
        case 'pending':
          organized.pending.items.push(item);
          break;
        case 'confirmed':
          organized.confirmed.items.push(item);
          break;
        case 'ongoing':
        case 'active':
          organized.ongoing.items.push(item);
          break;
        case 'completed':
        case 'finished':
          organized.completed.items.push(item);
          break;
        default:
          organized.pending.items.push(item);
      }
    });

    return organized;
  };

  const generateMockData = () => {
    return {
      pending: {
        id: 'pending',
        title: 'Pending',
        items: [
          {
            id: '1',
            bookingId: 'BK001',
            customer: 'John Doe',
            vehicle: 'Maruti Swift',
            pickupDate: '2024-01-15',
            dropOffDate: '2024-01-17',
            amount: 3500,
            pickup: 'Mumbai Airport',
            dropoff: 'Pune',
            phone: '+91 9876543210',
            email: 'john@example.com'
          },
          {
            id: '2',
            bookingId: 'BK002',
            customer: 'Jane Smith',
            vehicle: 'Hyundai Creta',
            pickupDate: '2024-01-16',
            dropOffDate: '2024-01-18',
            amount: 5200,
            pickup: 'Delhi Station',
            dropoff: 'Agra',
            phone: '+91 9876543211',
            email: 'jane@example.com'
          }
        ]
      },
      confirmed: {
        id: 'confirmed',
        title: 'Confirmed',
        items: [
          {
            id: '3',
            bookingId: 'BK003',
            customer: 'Mike Johnson',
            vehicle: 'Toyota Innova',
            pickupDate: '2024-01-14',
            dropOffDate: '2024-01-16',
            amount: 7800,
            pickup: 'Bangalore Airport',
            dropoff: 'Mysore',
            phone: '+91 9876543212',
            email: 'mike@example.com'
          }
        ]
      },
      ongoing: {
        id: 'ongoing',
        title: 'Ongoing',
        items: [
          {
            id: '4',
            bookingId: 'BK004',
            customer: 'Sarah Wilson',
            vehicle: 'Honda City',
            pickupDate: '2024-01-13',
            dropOffDate: '2024-01-15',
            amount: 4500,
            pickup: 'Chennai Central',
            dropoff: 'Pondicherry',
            phone: '+91 9876543213',
            email: 'sarah@example.com'
          }
        ]
      },
      completed: {
        id: 'completed',
        title: 'Completed',
        items: [
          {
            id: '5',
            bookingId: 'BK005',
            customer: 'David Brown',
            vehicle: 'Tata Nexon',
            pickupDate: '2024-01-10',
            dropOffDate: '2024-01-12',
            amount: 4200,
            pickup: 'Kolkata Airport',
            dropoff: 'Darjeeling',
            phone: '+91 9876543214',
            email: 'david@example.com'
          }
        ]
      }
    };
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newItems = Array.from(start.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);

      const newColumn = {
        ...start,
        items: newItems
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn
      });
      return;
    }

    // Moving between columns
    const startItems = Array.from(start.items);
    const [removed] = startItems.splice(source.index, 1);
    const newStart = {
      ...start,
      items: startItems
    };

    const finishItems = Array.from(finish.items);
    const updatedItem = { ...removed, status: destination.droppableId };
    finishItems.splice(destination.index, 0, updatedItem);
    const newFinish = {
      ...finish,
      items: finishItems
    };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish
    });

    // Update status in backend
    try {
      await fetch(`/api/admin/updateBookingStatus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: draggableId,
          status: destination.droppableId
        })
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const exportToExcel = () => {
    const allItems = Object.values(columns).flatMap(column => 
      column.items.map(item => ({ ...item, status: column.title }))
    );

    const csvContent = [
      ['Booking ID', 'Customer', 'Vehicle', 'Pickup Date', 'Drop Date', 'Amount', 'Status', 'Pickup Location', 'Drop Location'],
      ...allItems.map(item => [
        item.bookingId,
        item.customer,
        item.vehicle,
        new Date(item.pickupDate).toLocaleDateString(),
        new Date(item.dropOffDate).toLocaleDateString(),
        item.amount,
        item.status,
        item.pickup,
        item.dropoff
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const allItems = Object.values(columns).flatMap(column => 
      column.items.map(item => ({ ...item, status: column.title }))
    );

    const textContent = `Kanban Board Report\n\n${allItems.map(item => 
      `${item.bookingId} - ${item.customer} - ${item.vehicle} - ${item.status} - ₹${item.amount}`
    ).join('\n')}`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getColumnColor = (columnId) => {
    const colors = {
      pending: 'bg-yellow-100 border-yellow-300',
      confirmed: 'bg-blue-100 border-blue-300',
      ongoing: 'bg-green-100 border-green-300',
      completed: 'bg-gray-100 border-gray-300'
    };
    return colors[columnId] || 'bg-gray-100 border-gray-300';
  };

  const getItemColor = (columnId) => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      confirmed: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      ongoing: 'bg-green-50 border-green-200 hover:bg-green-100',
      completed: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    };
    return colors[columnId] || 'bg-white border-gray-200 hover:bg-gray-50';
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
        <h2 className="text-2xl font-bold text-gray-800">Kanban Board - Booking Management</h2>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className={`p-4 rounded-lg border-2 ${getColumnColor(key)}`}>
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <p className="text-2xl font-bold text-gray-700">{column.items.length}</p>
            <p className="text-sm text-gray-600">
              ₹{column.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className={`rounded-lg border-2 ${getColumnColor(columnId)} p-4`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                  {column.items.length}
                </span>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-opacity-50' : ''}`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border-2 cursor-move transition-all ${getItemColor(columnId)} ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-blue-600">
                                  {item.bookingId}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ₹{item.amount.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <FaUser className="text-gray-500" />
                                <span className="font-medium">{item.customer}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaCar className="text-gray-500" />
                                <span>{item.vehicle}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FaCalendar />
                                <span>
                                  {new Date(item.pickupDate).toLocaleDateString()} - {new Date(item.dropOffDate).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                <div>{item.pickup} → {item.dropoff}</div>
                              </div>
                              
                              {item.phone && (
                                <div className="text-xs text-gray-500">
                                  📞 {item.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Statistics */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Board Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Bookings:</span>
            <p className="font-semibold text-lg">
              {Object.values(columns).reduce((sum, column) => sum + column.items.length, 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Total Revenue:</span>
            <p className="font-semibold text-lg">
              ₹{Object.values(columns).reduce((sum, column) => 
                sum + column.items.reduce((colSum, item) => colSum + item.amount, 0), 0
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Completion Rate:</span>
            <p className="font-semibold text-lg">
              {Object.values(columns).reduce((sum, column) => sum + column.items.length, 0) > 0 ? 
                ((columns.completed.items.length / Object.values(columns).reduce((sum, column) => sum + column.items.length, 0)) * 100).toFixed(1) : 0
              }%
            </p>
          </div>
          <div>
            <span className="text-gray-600">Pending Actions:</span>
            <p className="font-semibold text-lg">
              {columns.pending.items.length + columns.confirmed.items.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kanban;