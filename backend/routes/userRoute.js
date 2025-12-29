import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { updateUser ,deleteUser , signOut } from "../controllers/userControllers/userController.js";
import { checkAvailability, listAllVehicles, searchCar, showVehicleDetails } from "../controllers/userControllers/userAllVehiclesController.js";
import { editUserProfile, changePassword, upload, getUserProfile } from "../controllers/userControllers/userProfileController.js";
import { BookCar, enhancedBookCar, simplifiedCrossStateBooking, razorpayOrder, getVehiclesWithoutBooking, getAllVehiclesWithAvailability, filterVehicles, showOneofkind, showAllVariants, findBookingsOfUser, sendBookingDetailsEamil, latestbookings, generateInvoice, downloadInvoicePDF, updateBookingStatus, checkVehicleAvailability, testEmailServices, sendBookingReceiptPdf } from "../controllers/userControllers/userBookingController.js";
import { saveDraftBooking, getUserDraftBookings, deleteDraftBooking, completeDraftBooking } from "../controllers/userControllers/draftBookingController.js";


const router = express.Router()


//Removed verifyToken middleware because of (cors) unable to set and access cookie since i am using free domain from vercel

router.post('/update/:id',updateUser)
router.delete('/delete/:id',deleteUser)
router.get('/signout',signOut)
router.get('/listAllVehicles',listAllVehicles)
router.post('/showVehicleDetails',showVehicleDetails)
router.get('/profile/:id', getUserProfile)
router.post('/editUserProfile/:id', upload.single('profileImage'), editUserProfile)
router.post('/changePassword/:id', changePassword)
// router.post('/searchCar',searchCar)
// router.post('/checkAvailability',checkAvailability)
router.post('/razorpay',verifyToken,razorpayOrder)
router.post('/bookCar',BookCar)
router.post('/enhancedBookCar',enhancedBookCar)
router.post('/simplifiedCrossStateBooking',simplifiedCrossStateBooking)
router.post('/filterVehicles',filterVehicles)
router.post('/getVehiclesWithoutBooking',getVehiclesWithoutBooking,showAllVariants)
router.post('/getAllVehiclesWithAvailability',getAllVehiclesWithAvailability)
router.post('/showSingleofSameModel',getVehiclesWithoutBooking,showOneofkind)
router.post('/findBookingsOfUser',findBookingsOfUser)
router.post('/latestbookings',latestbookings)
router.post('/sendBookingDetailsEamil',sendBookingDetailsEamil)
router.post('/sendBookingReceiptPdf',sendBookingReceiptPdf)
router.get('/generateInvoice/:bookingId',generateInvoice)
router.get('/downloadInvoice/:bookingId',downloadInvoicePDF)
router.put('/updateBookingStatus/:bookingId',updateBookingStatus)
router.post('/checkVehicleAvailability',checkVehicleAvailability)
router.post('/test-email-services',testEmailServices)

// Draft booking routes
router.post('/saveDraftBooking', saveDraftBooking)
router.get('/getDraftBookings/:userId', getUserDraftBookings)
router.delete('/deleteDraftBooking/:draftId', deleteDraftBooking)
router.patch('/completeDraftBooking/:draftId', completeDraftBooking)

export default router;
