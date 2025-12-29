import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../../redux/user/userSlice";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "password required" }),
});

function VendorSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("api/vendor/vendorsignin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.succes === false) {
        dispatch(signInFailure(data));
        return;
      }
      if (data.isVendor) {
        navigate("/vendorDashboard");
        dispatch(signInSuccess(data));
      }
    } catch (error) {
      dispatch(signInFailure(error));
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

        <div className="max-w-lg lg:max-w-xl xl:max-w-2xl w-full space-y-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/30">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 lg:px-8 py-5 lg:py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Vendor Sign In</h1>
                <p className="text-blue-100 text-sm">Vehicle Owner Portal</p>
              </div>
              <Link to="/">
                <div className="px-3 py-2 font-bold text-white hover:bg-blue-600 rounded-lg transition-colors">
                  ✕
                </div>
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8 xl:p-10 space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🚗</div>
                <p className="text-gray-600">Welcome back! Sign in to manage your vehicles</p>
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 bg-white/95 transition-all duration-200"
                  placeholder="Email Address"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 bg-white/95 transition-all duration-200"
                  placeholder="Password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 lg:py-4 px-6 text-base lg:text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In as Vendor"
                )}
              </button>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-base text-gray-600">
                    Don't have a vendor account?{" "}
                    <Link to="/vendorsignup" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                      Sign Up
                    </Link>
                  </p>
                </div>
                
                <div className="text-center">
                  <Link to="/forgot-password" className="text-sm lg:text-base text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                {isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm text-center">
                      {isError.message || "Something went wrong"}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default VendorSignin;
