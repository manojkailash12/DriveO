import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//zod validation schema
const schema = z.object({
  username: z.string().min(3, { message: "minimum 3 characters required" }),
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  password: z.string().min(4, { message: "minimum 4 characters required" }),
  role: z.enum(["user", "vendor", "admin"], { message: "Please select a role" }),
  phoneNumber: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => {
  // Conditional validation for vendor and admin roles
  if (data.role === "vendor") {
    return data.phoneNumber && data.businessName && data.address;
  }
  if (data.role === "admin") {
    return data.phoneNumber;
  }
  return true;
}, {
  message: "Please fill all required fields for the selected role",
  path: ["role"]
});

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: {
      role: "user"
    }
  });

  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  
  const selectedRole = watch("role");

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      
      if (!res.ok) {
        setError(true);
        setErrorMessage(data.message || "Registration failed");
        return;
      }
      
      // Show OTP modal
      setOtpData({
        userId: data.userId,
        email: data.email,
        role: data.role
      });
      setShowOTPModal(true);
      setError(false);
    } catch (error) {
      setLoading(false);
      setError(true);
      setErrorMessage("Network error. Please try again.");
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }
    
    setOtpLoading(true);
    setError(false);
    setErrorMessage("");
    
    try {
      const endpoint = otpData.role === "admin" ? "/api/auth/admin/verify-otp" : "/api/auth/verify-otp";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: otpData.userId,
          otp: otp
        }),
      });
      
      const data = await res.json();
      setOtpLoading(false);
      
      if (!res.ok) {
        setError(true);
        setErrorMessage(data.message || "OTP verification failed");
        return;
      }
      
      // Success - redirect to signin
      setShowOTPModal(false);
      navigate("/signin", { 
        state: { 
          message: `${otpData.role.charAt(0).toUpperCase() + otpData.role.slice(1)} account created successfully! Please sign in.`,
          type: "success"
        }
      });
    } catch (error) {
      setOtpLoading(false);
      setError(true);
      setErrorMessage("Network error. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setError(false);
    setErrorMessage("");
    
    try {
      const endpoint = otpData.role === "admin" ? "/api/auth/admin/resend-otp" : "/api/auth/resend-otp";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: otpData.userId
        }),
      });
      
      const data = await res.json();
      setOtpLoading(false);
      
      if (!res.ok) {
        setError(true);
        setErrorMessage(data.message || "Failed to resend OTP");
        return;
      }
      
      setErrorMessage("New OTP sent to your email!");
    } catch (error) {
      setOtpLoading(false);
      setError(true);
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Tourism Background */}
        <div className="absolute inset-0 z-0">
          {/* Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-orange-200"></div>
          
          {/* Animated Clouds */}
          <div className="absolute top-10 left-0 w-full h-32 opacity-80">
            <div className="cloud cloud-1 absolute top-4 bg-white rounded-full w-24 h-8 animate-float-slow"></div>
            <div className="cloud cloud-2 absolute top-8 bg-white rounded-full w-32 h-10 animate-float-medium"></div>
            <div className="cloud cloud-3 absolute top-2 bg-white rounded-full w-20 h-6 animate-float-fast"></div>
          </div>
          
          {/* Mountains */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1200 300" className="w-full h-64 opacity-70">
              <polygon points="0,300 200,100 400,180 600,80 800,160 1000,60 1200,140 1200,300" fill="#4a5568" className="animate-pulse-slow"/>
              <polygon points="0,300 150,150 350,200 550,120 750,180 950,100 1200,160 1200,300" fill="#2d3748" className="animate-pulse-slower"/>
            </svg>
          </div>
          
          {/* Animated Trees */}
          <div className="absolute bottom-16 left-10 w-8 h-16 bg-green-600 rounded-t-full animate-sway"></div>
          <div className="absolute bottom-16 left-20 w-6 h-12 bg-green-700 rounded-t-full animate-sway-reverse"></div>
          <div className="absolute bottom-16 right-20 w-10 h-20 bg-green-600 rounded-t-full animate-sway"></div>
          <div className="absolute bottom-16 right-40 w-7 h-14 bg-green-700 rounded-t-full animate-sway-reverse"></div>
          
          {/* Animated Birds */}
          <div className="absolute top-20 left-1/4 animate-fly">
            <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
            <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
          </div>
          <div className="absolute top-32 right-1/3 animate-fly-reverse">
            <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
            <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
          </div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="particle particle-1 absolute w-1 h-1 bg-yellow-300 rounded-full animate-float-particle"></div>
            <div className="particle particle-2 absolute w-1 h-1 bg-yellow-200 rounded-full animate-float-particle-slow"></div>
            <div className="particle particle-3 absolute w-1 h-1 bg-orange-300 rounded-full animate-float-particle-fast"></div>
          </div>
        </div>

        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full space-y-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/30">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 lg:px-8 py-5 lg:py-6 flex justify-between items-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Sign Up</h1>
              <Link to="/">
                <div className="px-3 py-2 font-bold text-white hover:bg-green-600 rounded-lg transition-colors">
                  ✕
                </div>
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8 xl:p-10 space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-4">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* User Role Button */}
                  <button
                    type="button"
                    onClick={() => setValue("role", "user")}
                    className={`p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRole === "user"
                        ? "border-green-500 bg-green-50 text-green-800 shadow-lg transform scale-105"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-green-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedRole === "user" 
                          ? "border-green-500 bg-green-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedRole === "user" && (
                          <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-semibold text-base">User</div>
                        <div className="text-xs text-gray-500">Book and rent vehicles</div>
                      </div>
                    </div>
                  </button>

                  {/* Vendor Role Button */}
                  <button
                    type="button"
                    onClick={() => setValue("role", "vendor")}
                    className={`p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRole === "vendor"
                        ? "border-blue-500 bg-blue-50 text-blue-800 shadow-lg transform scale-105"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedRole === "vendor" 
                          ? "border-blue-500 bg-blue-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedRole === "vendor" && (
                          <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🚗</div>
                        <div className="font-semibold text-base">Vendor</div>
                        <div className="text-xs text-gray-500">List and manage vehicles</div>
                      </div>
                    </div>
                  </button>

                  {/* Admin Role Button */}
                  <button
                    type="button"
                    onClick={() => setValue("role", "admin")}
                    className={`p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRole === "admin"
                        ? "border-purple-500 bg-purple-50 text-purple-800 shadow-lg transform scale-105"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedRole === "admin" 
                          ? "border-purple-500 bg-purple-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedRole === "admin" && (
                          <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">⚙️</div>
                        <div className="font-semibold text-base">Admin</div>
                        <div className="text-xs text-gray-500">Manage the platform</div>
                      </div>
                    </div>
                  </button>
                </div>
                
                {/* Hidden input for form validation */}
                <input type="hidden" {...register("role")} />
                
                {errors.role && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    id="username"
                    className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                    placeholder="Username"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                    placeholder="Email Address"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                    placeholder="Password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Conditional fields based on role */}
                {(selectedRole === "vendor" || selectedRole === "admin") && (
                  <div className={selectedRole === "vendor" ? "" : "md:col-span-2"}>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                      placeholder="Phone Number"
                      {...register("phoneNumber")}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-2">
                        Phone number is required for {selectedRole}s
                      </p>
                    )}
                  </div>
                )}

                {selectedRole === "vendor" && (
                  <>
                    <div>
                      <input
                        type="text"
                        id="businessName"
                        className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                        placeholder="Business Name"
                        {...register("businessName")}
                      />
                      {errors.businessName && (
                        <p className="text-red-500 text-sm mt-2">
                          Business name is required for vendors
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <textarea
                        id="address"
                        className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200 resize-none"
                        placeholder="Business Address"
                        rows="3"
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-2">
                          Address is required for vendors
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 lg:py-4 px-6 text-base lg:text-lg font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
              
              <div className="text-center">
                <p className="text-base text-gray-600">
                  Have an account?{" "}
                  <Link to="/signin" className="text-green-600 hover:text-green-500 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
                {isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-600 text-sm">
                      {errorMessage || "Something went wrong"}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-md lg:max-w-lg w-full mx-4 p-6 lg:p-8 shadow-2xl border border-white/20">
            <h2 className="text-xl lg:text-2xl font-bold mb-4 text-center">Verify Email</h2>
            <p className="text-gray-600 mb-6 text-center text-sm lg:text-base">
              We've sent a 6-digit verification code to<br />
              <strong className="text-green-600">{otpData?.email}</strong>
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 lg:py-4 border border-gray-300 rounded-lg text-center text-xl lg:text-2xl tracking-widest focus:outline-none focus:ring-3 focus:ring-green-500/50 focus:border-green-500 bg-white/95 transition-all duration-200"
                placeholder="000000"
                maxLength="6"
              />
            </div>
            
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm text-center">
                  {errorMessage}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleOTPVerification}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 lg:py-4 px-6 text-base lg:text-lg font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {otpLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify"
                )}
              </button>
              <button
                onClick={handleResendOTP}
                disabled={otpLoading}
                className="w-full bg-gray-500 text-white py-3 lg:py-4 px-6 text-base lg:text-lg font-semibold rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {otpLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Resend OTP"
                )}
              </button>
              <button
                onClick={() => setShowOTPModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 py-3 lg:py-4 transition-colors text-base lg:text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SignUp;
