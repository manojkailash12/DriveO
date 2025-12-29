import BookingsTable from "./BookingsTable";

const Bookings = () => {
  return (
    <div className="p-6 space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Orders Management</h1>
          <p className="text-black font-bold mt-1">Manage all customer bookings and orders</p>
        </div>
      </div>

      {/* Bookings Table */}
      <BookingsTable />
    </div>
  );
};

export default Bookings;
