import express from 'express';
import { signUp, signIn, google, refreshToken, verifyOTP, resendOTP, adminSignUp, adminVerifyOTP, adminResendOTP, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router()

// User registration routes
router.post('/signup', signUp)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', resendOTP)

// Admin registration routes
router.post('/admin/signup', adminSignUp)
router.post('/admin/verify-otp', adminVerifyOTP)
router.post('/admin/resend-otp', adminResendOTP)

// Password reset routes
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/change-password', verifyToken, changePassword)

// Common routes
router.post('/signin', signIn)
router.post('/google', google)
router.post('/refreshToken', refreshToken)

export default router