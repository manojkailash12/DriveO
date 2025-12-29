import { useDispatch, useSelector } from "react-redux";
import { toggleNavbarPage } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";
import { useState } from "react";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [imageError, setImageError] = useState(false);
  
  // Generate avatar URL with better fallback
  const getAvatarUrl = () => {
    if (currentUser?.profilePicture && !imageError) {
      return currentUser.profilePicture;
    }
    // Use a more generic avatar instead of initials to avoid "AD name" issue
    return "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=";
  };
  
  return (
    <div className="dark:text-gray-200 dark:bg-secondary-dark-bg rounded-xl w-[280px] p-5 absolute top-0 right-0 bg-no-repeat bg-blue-50 h-52">
      <div>
        <div className="flex justify-between w-full items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl()}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
            <p className="font-bold text-gray-400 break-all overflow-hidden max-w-[120px] text-sm">
              {currentUser?.username || currentUser?.email || "User"}
            </p>
          </div>
          <button className="text-black" onClick={() => dispatch(toggleNavbarPage('userProfile'))}>
            <div className="hover:bg-slate-200 px-3 py-1 rounded-full">×</div>
          </button>
        </div>

        <div className="mt-4">
          <p className="text-2xl text-black font-semibold">Hi, {currentUser?.username || "User"}!</p>
          <p className="text-sm text-gray-600 mt-1">{currentUser?.email}</p>
          {currentUser?.phoneNumber && (
            <p className="text-sm text-gray-600">{currentUser.phoneNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
