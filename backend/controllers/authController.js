import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import Jwt from "jsonwebtoken";
import { generateOTP, sendVerificationOTP, sendWelcomeEmail, sendPasswordResetOTP } from "../services/emailService.js";

const expireDate = new Date(Date.now() + 3600000);

// Step 1: Initial registration - sends OTP (supports all roles)
export const signUp = async (req, res, next) => {
  const { username, email, password, role = "user", businessName, phoneNumber, address } = req.body;
  
  // Validate role
  const validRoles = ["user", "vendor", "admin"];
  if (!validRoles.includes(role)) {
    return next(errorHandler(400, "Invalid role. Must be user, vendor, or admin"));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return next(errorHandler(400, "User already exists and is verified"));
      } else {
        // User exists but not verified, resend OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        existingUser.emailVerificationOTP = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();
        
        await sendVerificationOTP(email, otp, username);
        
        return res.status(200).json({ 
          message: "OTP resent to your email. Please verify to complete registration.",
          userId: existingUser._id,
          email: existingUser.email
        });
      }
    }

    // Create new user (not active until email verified)
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Set role-based flags
    const userRoles = {
      isUser: role === "user",
      isVendor: role === "vendor", 
      isAdmin: role === "admin"
    };
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      ...userRoles,
      emailVerificationOTP: otp,
      otpExpiry: otpExpiry,
      isEmailVerified: false,
      isActive: false,
      // Add role-specific fields
      ...(role === "vendor" && { 
        businessName, 
        phoneNumber, 
        address 
      }),
      ...(role === "admin" && { 
        phoneNumber
      })
    });
    
    await newUser.save();
    
    // Send OTP email
    await sendVerificationOTP(email, otp, username);
    
    res.status(200).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registration initiated. Please check your email for verification code.`,
      userId: newUser._id,
      email: newUser.email,
      role: role
    });
  } catch (error) {
    console.error("SignUp error:", error);
    next(error);
  }
};

// ADMIN REGISTRATION - Uses unified signup system
export const adminSignUp = async (req, res, next) => {
  // Set role to admin and use unified signup
  req.body.role = "admin";
  return signUp(req, res, next);
};

// ADMIN REGISTRATION - Step 2: Verify admin OTP and activate account
export const adminVerifyOTP = async (req, res, next) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    if (!user.isAdmin) {
      return next(errorHandler(403, "This endpoint is for admin verification only"));
    }
    
    if (user.isEmailVerified) {
      return next(errorHandler(400, "Email already verified"));
    }
    
    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return next(errorHandler(400, "OTP has expired. Please request a new one."));
    }
    
    // Check if OTP matches
    if (user.emailVerificationOTP !== otp) {
      return next(errorHandler(400, "Invalid OTP"));
    }
    
    // Activate admin account
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationOTP = null;
    user.otpExpiry = null;
    await user.save();
    
    // Send welcome email for admin
    await sendWelcomeEmail(user.email, user.username, true); // true indicates admin welcome
    
    res.status(200).json({ 
      message: "Admin email verified successfully! Your admin account is now active.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        userType: "admin"
      }
    });
  } catch (error) {
    console.error("Admin OTP verification error:", error);
    next(error);
  }
};

// ADMIN REGISTRATION - Resend admin OTP
export const adminResendOTP = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    if (!user.isAdmin) {
      return next(errorHandler(403, "This endpoint is for admin accounts only"));
    }
    
    if (user.isEmailVerified) {
      return next(errorHandler(400, "Email already verified"));
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.emailVerificationOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send OTP email for admin
    await sendVerificationOTP(user.email, otp, user.username, true); // true indicates admin
    
    res.status(200).json({ 
      message: "New admin OTP sent to your email.",
      email: user.email,
      userType: "admin"
    });
  } catch (error) {
    console.error("Admin Resend OTP error:", error);
    next(error);
  }
};

// Step 2: Verify OTP and activate account
export const verifyOTP = async (req, res, next) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    if (user.isEmailVerified) {
      return next(errorHandler(400, "Email already verified"));
    }
    
    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return next(errorHandler(400, "OTP has expired. Please request a new one."));
    }
    
    // Check if OTP matches
    if (user.emailVerificationOTP !== otp) {
      return next(errorHandler(400, "Invalid OTP"));
    }
    
    // Activate account
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationOTP = null;
    user.otpExpiry = null;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);
    
    res.status(200).json({ 
      message: "Email verified successfully! Your account is now active.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    if (user.isEmailVerified) {
      return next(errorHandler(400, "Email already verified"));
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.emailVerificationOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send OTP email
    await sendVerificationOTP(user.email, otp, user.username);
    
    res.status(200).json({ 
      message: "New OTP sent to your email.",
      email: user.email
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    next(error);
  }
};

//refreshTokens
export const refreshToken = async (req, res, next) => {
  // const refreshToken = req.cookies.refresh_token;

  if (!req.headers.authorization) {
    return next(errorHandler(403, "bad request no header provided"));
  }

  const refreshToken = req.headers.authorization.split(" ")[1].split(",")[0];
  const accessToken = req.headers.authorization.split(" ")[1].split(",")[1];

  console.log(refreshToken);
  console.log(accessToken);

  if (!refreshToken) {
    // res.clearCookie("access_token", "refresh_token");
    return next(errorHandler(401, "You are not authenticated"));
  }

  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);

    if (!user) return next(errorHandler(403, "Invalid refresh token"));
    if (user.refreshToken !== refreshToken) {
      // res.clearCookie("access_token", "refresh_token");
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newAccessToken = Jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const newRefreshToken = Jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // Update the refresh token in the database for the user
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });

    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        maxAge: 900000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 15 minutes
      .cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 7 days
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(errorHandler(500, "error in refreshToken controller in server"));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "user not found"));
    
    // Check if email is verified
    if (!validUser.isEmailVerified) {
      return next(errorHandler(401, "Please verify your email before signing in"));
    }
    
    // Check if account is active
    if (!validUser.isActive) {
      return next(errorHandler(401, "Account is not active. Please contact support."));
    }
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "wrong credentials"));
    
    let accessToken = "";
    let refreshToken = "";
    accessToken = Jwt.sign({ id: validUser._id }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    }); //accessToken expires in 15 minutes
    refreshToken = Jwt.sign({ id: validUser._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    }); //refreshToken expires in 7 days

    const updatedData = await User.findByIdAndUpdate(
      { _id: validUser._id },
      { refreshToken },
      { new: true }
    ); //store the refresh token in db

    //separating password from the updatedData
    const { password: hashedPassword, isAdmin, ...rest } = updatedData._doc;

    //not sending users hashed password to frontend
    const responsePayload = {
      success: true,
      refreshToken: refreshToken,
      accessToken,
      isAdmin,
      isUser: validUser.isUser,
      ...rest,
    };

    req.user = {
      ...rest,
      isAdmin: validUser.isAdmin,
      isUser: validUser.isUser,
    };

    res.status(200).json(responsePayload);

    next();
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).lean();
    if (user && !user.isUser) {
      return next(errorHandler(409, "email already in use as a vendor"));
    }
    if (user) {
      const { password: hashedPassword, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);

      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          SameSite: "None",
          Domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); //we are generating a random password since there is no password in result
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        profilePicture: req.body.photo,
        password: hashedPassword,
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        isUser: true,
        //we cannot set username to req.body.name because other user may also have same name so we generate a random value and concat it to name
        //36 in toString(36) means random value from 0-9 and a-z
      });
      const savedUser = await newUser.save();
      const userObject = savedUser.toObject();

      const token = Jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
      const { password: hashedPassword2, ...rest } = userObject;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          sameSite: "None",
          secure: true,
          domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(errorHandler(404, "No account found with this email address"));
    }
    
    if (!user.isEmailVerified) {
      return next(errorHandler(400, "Please verify your email first"));
    }
    
    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = otpExpiry;
    await user.save();
    
    // Send password reset OTP
    await sendPasswordResetOTP(email, otp, user.username);
    
    res.status(200).json({ 
      message: "Password reset code sent to your email.",
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

// Reset Password with OTP
export const resetPassword = async (req, res, next) => {
  const { userId, otp, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Check if OTP is expired
    if (new Date() > user.passwordResetOTPExpiry) {
      return next(errorHandler(400, "Reset code has expired. Please request a new one."));
    }
    
    // Check if OTP matches
    if (user.passwordResetOTP !== otp) {
      return next(errorHandler(400, "Invalid reset code"));
    }
    
    // Hash new password
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    
    // Update password and clear reset fields
    user.password = hashedPassword;
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiry = null;
    await user.save();
    
    res.status(200).json({ 
      message: "Password reset successfully! You can now sign in with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};

// Change Password (for logged-in users)
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Verify current password
    const validPassword = bcryptjs.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return next(errorHandler(400, "Current password is incorrect"));
    }
    
    // Hash new password
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ 
      message: "Password changed successfully!"
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};
