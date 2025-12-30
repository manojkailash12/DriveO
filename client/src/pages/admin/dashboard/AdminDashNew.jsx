import { Routes, Route } from "react-router-dom";
import { Navbar, SideBar } from "../components/index.jsx";
import {
  AllVehicles,
  AllUsers,
  AllVendors,
  Calender,
  ColorPicker,
  Customers,
  Editor,
  VenderVehicleRequests,
  Financial,
  AdminProfile,
} from "../pages";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import EnhancedAdminDashboard from "../pages/EnhancedAdminDashboard.jsx";
import Bookings from "../components/Bookings.jsx";
import TravelAnalytics from "../pages/TravelAnalytics.jsx";
import { setActiveMenu } from "../../../redux/adminSlices/adminDashboardSlice/index.js";

function AdminDashNew() {
  const { activeMenu } = useSelector((state) => state.adminDashboardSlice);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {activeMenu ? (
        <div className="w-72 fixed inset-y-0 left-0 z-50 bg-white shadow-lg lg:static lg:inset-0">
          <SideBar />
        </div>
      ) : (
        <div className="w-0 lg:w-16">
          <SideBar />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${activeMenu ? 'lg:ml-0' : ''}`}>
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b">
          <Navbar />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="w-full px-6 py-6">
            <Routes>
              <Route path="/" element={<EnhancedAdminDashboard/>}/>
              <Route path="/adminHome" element={<EnhancedAdminDashboard />} />
              <Route path="/allVehicles" element={<AllVehicles />} />
              <Route path="/allUsers" element={<AllUsers />} />
              <Route path="/allVendors" element={<AllVendors />} />
              <Route path="/calender" element={<Calender />} />
              <Route path="/colorPicker" element={<ColorPicker />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/vendorVehicleRequests" element={<VenderVehicleRequests />} />
              <Route path="/orders" element={<Bookings />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/travelAnalytics" element={<TravelAnalytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashNew;
