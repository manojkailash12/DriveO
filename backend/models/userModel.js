import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber:{
      type:String,
      sparse: true, // Allow multiple null values
      required: function() { return this.isVendor || this.isAdmin; }
    },
    adress:{
      type:String,
    },
    // Vendor-specific fields
    businessName: {
      type: String,
      required: function() { return this.isVendor; }
    },
    address: {
      type: String,
      required: function() { return this.isVendor; }
    },
    // Admin-specific fields (simplified)
    phoneNumber: {
      type: String,
      required: function() { return this.isAdmin || this.isVendor; }
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=",
    },
    isUser: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVendor: {
      type: Boolean,
      default: false,
    },
    refreshToken:{
      type:String,
      default:""
    },
    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    // Account status
    isActive: {
      type: Boolean,
      default: false, // Account is inactive until email is verified
    },
    // Password reset fields
    passwordResetOTP: {
      type: String,
      default: null,
    },
    passwordResetOTPExpiry: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
