import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
});

const resetSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits" }).max(6, { message: "OTP must be 6 digits" }),
  newPassword: z.string().min(4, { message: "Password must be at least 4 characters" }),
  confirmPassword: z.string().min(4, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({ resolver: zodResolver(emailSchema) });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const handleEmailStep = async (formData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset code");
        return;
      }

      setEmail(formData.email);
      setUserId(data.userId);
      setSuccess("Reset code sent to your email!");
      setStep(2);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStep = async (formData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setSuccess("Password reset successfully! You can now sign in with your new password.");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend code");
        return;
      }

      setSuccess("New reset code sent to your email!");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-blue-500 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h1>
            <Link to="/signin">
              <div className="px-3 py-1 font-bold text-white hover:bg-blue-600 rounded-md transition-colors">
                ✕
              </div>
            </Link>
          </div>

          {step === 1 ? (
            // Step 1: Email Input
            <form onSubmit={handleEmailSubmit(handleEmailStep)} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Enter your email"
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{emailErrors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>

              <div className="text-center">
                <Link to="/signin" className="text-sm text-blue-600 hover:text-blue-500">
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            // Step 2: OTP and New Password
            <form onSubmit={handleResetSubmit(handleResetStep)} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  id="otp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="000000"
                  maxLength="6"
                  {...registerReset("otp")}
                />
                {resetErrors.otp && (
                  <p className="text-red-500 text-xs mt-1">{resetErrors.otp.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="New Password"
                  {...registerReset("newPassword")}
                />
                {resetErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{resetErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Confirm New Password"
                  {...registerReset("confirmPassword")}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-500"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
  );
}

export default ForgotPassword;