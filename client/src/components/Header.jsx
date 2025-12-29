import styles from "../index";
import { navLinks } from "../constants";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdMenuOpen } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { Drawer } from "antd";
import { signOut } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import driveOLogo from "../Assets/driveo-logo.png";


function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [nav, setNav] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "GET",
        credentials: 'include'
      });
      const data = await res.json();
      if (data) {
        dispatch(signOut());
        navigate("/signin");
      }
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  return (
    <div
      className={`w-full   flex justify-between items-center px-6 sm:px-12 md:px-18 lg:py-6 lg:px-28 pt-10 mt-5 md:mt-10 sm:max-w-[900px] lg:max-w-[1500px] mx-auto `}
    >
      <Link to="/">
        <div className="flex items-center gap-3">
          <img 
            src={driveOLogo} 
            alt="DriveO Logo" 
            className="w-12 h-12 object-contain"
          />
          <div className="text-[20px] md:text-[24px] lg:text-[28px] font-poppins font-bold">
            DriveO
          </div>
        </div>
      </Link>

      <div className="hidden lg:block">
        <ul className="flex list-none">
          {navLinks.map((navlink, index) => (
            <li
              key={index}
              className={`${index != navLinks.length - 1 ? "mx-4" : "mx-0"}`}
            >
              <Link
                to={navlink.path}
                className={`text-black  font-poppins cursor-pointer font-semibold`}
              >
                {navlink.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <div className="hidden md:inline-flex">
          <Link to={"/signIn"}>
            {currentUser && !currentUser.isAdmin && !currentUser.isVendor ? (
              ""
            ) : (
              <button
                id="signin"
                className={`border-[1px] hidden lg:inline-flex border-green-500 py-1 text-[12px] md:text-[14px] sm:py-[7px] px-2 sm:px-4 font-normal sm:font-semibold rounded-md `}
              >
                Sign In
              </button>
            )}
          </Link>
        </div>
        <div className="hidden lg:flex items-center justify-center relative">
          {currentUser && !currentUser.isAdmin && !currentUser.isVendor ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <img
                  src={`${currentUser.profilePicture}`}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Hi, {currentUser.username}</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-600 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`${currentUser.profilePicture}`}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-lg">{currentUser.username}</p>
                        <p className="text-sm text-gray-600 break-all overflow-hidden">{currentUser.email}</p>
                        {currentUser.phoneNumber && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {currentUser.phoneNumber}
                          </p>
                        )}
                        {currentUser.adress && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {currentUser.adress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link 
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">View Profile</p>
                        <p className="text-xs text-gray-500">Manage your account settings</p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/orders"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors group"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">My Orders</p>
                        <p className="text-xs text-gray-500">View your booking history</p>
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 mb-2">Account</p>
                      <p className="text-sm font-medium text-gray-800 break-all overflow-hidden">{currentUser.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleSignout();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-gray-500">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:inline-flex">
              <Link to={"/signup"}>
                <button id="signup" className={`${styles.button} `}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>


        {/*  Mobile Menu */}
        <div className="relative lg:hidden flex justify-center items-center">
          <button onClick={() => setNav(!nav)}>
            <div>{nav ? <MdMenuOpen /> : <RxHamburgerMenu />}</div>
          </button>
          <Drawer
            onClose={() => setNav(false)}
            open={nav}
          >
            <div className="flex flex-col items-start justify-between gap-y-10">
              {navLinks.map((navlink, index) => (
            
                  <Link
                    key={index}
                    to={navlink.path}
                    className="text-[26px]"
                    onClick={() => setNav(false)}
                  >
                    {navlink.title}
                  </Link>
              
              ))}

              {currentUser && !currentUser.isAdmin && !currentUser.isVendor && (
                <div>
                  <Link to={"/profile"}>
                    <div id="signup" className={` rounded-md font-semibold text-[24px]`}>
                      Profile
                    </div>
                  </Link>
                </div>
              )}

              <div>
                <Link to={"/signIn"}>
                  {currentUser &&
                  !currentUser.isAdmin &&
                  !currentUser.isVendor ? (
                    ""
                  ) : (
                    <button
                      id="signin"
                      className={` rounded-md  text-[24px] font-semibold  `}
                    >
                      Sign In
                    </button>
                  )}
                </Link>
              </div>

              <div>
                {currentUser &&
                !currentUser.isAdmin &&
                !currentUser.isVendor ? (
                  ""
                ) : (
                  <div>
                    <Link to={"/signup"}>
                      <button
                        id="signup"
                        className=" rounded-md  text-[24px] font-semibold "
                      >
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Drawer>
          {nav && (
            <div>
              <div className="absolute top-6 z-10 right-0  ">
                <Link to={"/signIn"}>
                  {currentUser &&
                  !currentUser.isAdmin &&
                  !currentUser.isVendor ? (
                    ""
                  ) : (
                    <button
                      id="signin"
                      className={`border-[1px] w-[80px]  border-green-500 bg-green-500  py-1 text-[10px]   px-2  font-normal sm:font-semibold  `}
                    >
                      Sign In
                    </button>
                  )}
                </Link>
              </div>

              <div>
                {currentUser &&
                  !currentUser.isAdmin &&
                  !currentUser.isVendor && (
                    <div className="hidden lg:inline-flex">
                      <Link to={"/signup"}>
                        <button id="signup" className={`${styles.button} `}>
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
