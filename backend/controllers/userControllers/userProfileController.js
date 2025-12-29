import User from "../../models/userModel.js";
import { errorHandler } from "../../utils/error.js";
import bcryptjs from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      user: rest
    });
  } catch (error) {
    next(error);
  }
};

//user profile update
export const editUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { username, email, phoneNumber, adress } = req.body;

    const updateData = {
      username,
      email,
      phoneNumber,
      adress,
    };

    // If a new profile image was uploaded
    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(409).json({ message: "Data not updated" });
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: rest
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(errorHandler(400, "Current password and new password are required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Verify current password
    const isCurrentPasswordValid = bcryptjs.compareSync(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(errorHandler(400, "Current password is incorrect"));
    }

    // Hash new password
    const hashedNewPassword = bcryptjs.hashSync(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedNewPassword }
    });

    res.status(200).json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    next(error);
  }
};
