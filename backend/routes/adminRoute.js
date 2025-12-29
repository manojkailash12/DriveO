import express from "express"
import { adminAuth, adminProfiile, addVehicle, updateVehicle, deleteVehicle as removeVehicle, getAllVehicles, getVehicleById } from "../controllers/adminControllers/adminController.js"
import { signIn } from "../controllers/authController.js"
import { signOut  } from "../controllers/userControllers/userController.js"
import { addProduct, deleteVehicle, editVehicle, getDashboardStats, getAnalyticsData, getFinancialEarnings, getPieChartData, getPyramidChartData, getCounters } from "../controllers/adminControllers/dashboardController.js"
import { showVehicles } from "../controllers/adminControllers/dashboardController.js"
import { multerUploads } from "../utils/multer.js"
import { insertDummyData } from "../controllers/adminControllers/masterCollectionController.js"
import { getCarModelData } from "../controllers/adminControllers/masterCollectionController.js"
import { approveVendorVehicleRequest, fetchVendorVehilceRequests, rejectVendorVehicleRequest } from "../controllers/adminControllers/vendorVehilceRequests.js"
import { allBookings, changeStatus } from "../controllers/adminControllers/bookingsController.js"
import { getFinancialData, getFinancialTransactions } from "../controllers/adminControllers/financialController.js"
import { testDatabase } from "../controllers/adminControllers/testController.js"
import { getAllUsers, getAllVendors, getUserDetails, toggleUserStatus, approveVendor, getCustomerAnalytics } from "../controllers/adminControllers/userManagementController.js"
import { exportPDF } from "../controllers/adminControllers/pdfExportController.js"
import { verifyToken } from "../utils/verifyUser.js"





const router = express.Router()

router.post('/dashboard',signIn,adminAuth)
router.post('/profile',adminProfiile)
router.get('/signout',signOut)
router.post('/addProduct',multerUploads,addProduct)
router.get('/showVehicles',showVehicles)
router.get('/dashboard/stats', getDashboardStats)
router.get('/counters', getCounters)
router.delete('/deleteVehicle/:id',deleteVehicle)
router.put('/editVehicle/:id',editVehicle)
router.get('/dummyData',insertDummyData)
router.get('/getVehicleModels',getCarModelData)
router.get('/fetchVendorVehilceRequests',fetchVendorVehilceRequests)
router.post('/approveVendorVehicleRequest',approveVendorVehicleRequest)
router.post('/rejectVendorVehicleRequest',rejectVendorVehicleRequest)
router.get('/allBookings',allBookings)
router.post('/changeStatus',changeStatus)

// Financial management routes
router.get('/financial/data', getFinancialData)
router.get('/financial/earnings', getFinancialEarnings)
router.get('/financial/transactions', getFinancialTransactions)
router.post('/financial/export-pdf', exportPDF)

// Test route
router.get('/test/database', testDatabase)

// Export routes
router.post('/export/analytics-pdf', exportPDF)

// Analytics routes for charts
router.get('/analytics/:chartType', getAnalyticsData)
router.get('/analytics/pie/:chartType', getPieChartData)
router.get('/analytics/pyramid/:chartType', getPyramidChartData)

// User and vendor management routes
router.get('/users', getAllUsers)
router.get('/vendors', getAllVendors)
router.get('/customers', getCustomerAnalytics)
router.get('/users/:userId', getUserDetails)
router.put('/users/:userId/status', toggleUserStatus)
router.post('/vendors/:vendorId/approve', approveVendor)

// New enhanced admin vehicle management routes
router.post('/vehicles', addVehicle)
router.get('/vehicles', getAllVehicles)
router.get('/vehicles/:vehicleId', getVehicleById)
router.put('/vehicles/:vehicleId', updateVehicle)
router.delete('/vehicles/:vehicleId', removeVehicle)

export default router