import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openPages,
  setScreenSize,
  showSidebarOrNot,
  toggleSidebar,
} from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";
import { signOut } from "../../../redux/user/userSlice";
import { AiOutlineMenu } from "react-icons/ai";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FiUser, FiDollarSign, FiShoppingBag, FiLogOut } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Chat, Notification } from ".";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chat, notification, screenSize } = useSelector(
    (state) => state.adminDashboardSlice
  );
  const { currentUser } = useSelector((state) => state.user);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate avatar URL with better fallback
  const getAvatarUrl = () => {
    if (currentUser?.profilePicture && !imageError) {
      return currentUser.profilePicture;
    }
    // Use a more generic avatar instead of initials to avoid "AD name" issue
    return "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=";
  };

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth));

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      dispatch(showSidebarOrNot(false));
    } else {
      dispatch(showSidebarOrNot(true));
    }
  }, [screenSize]);

  // Handle logout
  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/admin/signout');
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      dispatch(signOut());
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
  };

  // Handle dropdown menu clicks
  const handleDropdownClick = (action) => {
    setIsProfileDropdownOpen(false);
    switch (action) {
      case 'profile':
        navigate('/adminDashboard/profile');
        break;
      case 'financial':
        navigate('/adminDashboard/financial');
        break;
      case 'orders':
        navigate('/adminDashboard/orders');
        break;
      case 'signout':
        handleSignOut();
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [currentUser?.profilePicture]);

  const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    <TooltipComponent content={title} position={"BottomCenter"}>
      <button
        type="button"
        onClick={customFunc}
        style={{ color, dotColor }}
        className="relative text-xl p-3  hover:bg-gray-100  rounded-full mb-2"
      >
        <span
          style={{ background: dotColor }}
          className="absolute inline-flex rounded-full right-[8px] top-2  h-2 w-2"
        ></span>
        {icon}
      </button>
    </TooltipComponent>
  );

  NavButton.propTypes = {
    title: PropTypes.string.isRequired,
    customFunc: PropTypes.func.isRequired,
    icon: PropTypes.node, // assuming icon can be any renderable component
    color: PropTypes.string,
    dotColor: PropTypes.string,
  };

  return (
    <div className="flex justify-between p-2 md:mx-6 relative">
      <div>
        <NavButton
          title="Menu"
          customFunc={() => dispatch(toggleSidebar())}
          color={"blue"}
          icon={<AiOutlineMenu />}
        />
      </div>

      <div className="flex justify-between">
       

        <NavButton
          title="Chat"
          customFunc={() => dispatch(openPages("chat"))}
          color={"blue"}
          dotColor={"cyan"}
          icon={<BsChatLeft />}
        />

        <NavButton
          title="Notification"
          customFunc={() => dispatch(openPages("notification"))}
          color={"blue"}
          dotColor={"gold"}
          icon={<RiNotification3Line />}
        />
        <div className="profile-dropdown relative">
          <TooltipComponent content="profile" position="BottomCenter">
            <div
              className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded-lg mt-2"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <img 
                src={getAvatarUrl()}
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-gray-300" 
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
              <p>
                <span className="text-[12px] text-gray-400">Hi,</span>{" "}
                <span className="text-gray-400 font-semi-bold text-[12px] break-all overflow-hidden max-w-[120px] inline-block">
                  {currentUser?.username || currentUser?.email || "User"}
                </span>
              </p>
              <MdKeyboardArrowDown className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </TooltipComponent>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => handleDropdownClick('profile')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FiUser className="w-4 h-4" />
                View Profile
              </button>
              <button
                onClick={() => handleDropdownClick('financial')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FiDollarSign className="w-4 h-4" />
                View Financial Reports
              </button>
              <button
                onClick={() => handleDropdownClick('orders')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FiShoppingBag className="w-4 h-4" />
                View Orders
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => handleDropdownClick('signout')}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        
        {chat && <div className="relative top-9 right-0"><Chat /></div>}
        {notification && <div className="relative top-9 right-0"><Notification /></div>}
      </div>
    </div>
  );
};

export default Navbar;
