import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  //i should make a isUser field or this will become so messy in future
  const isUserOnly =
    currentUser && !currentUser.isAdmin && !currentUser.isVendor;
  return isUserOnly ? <Outlet /> : <Navigate to={"/signin"} />;
}

export const PrivateSignin = () => {
  const { currentUser } = useSelector((state) => state.user);
  
  // Allow access to signin pages if no user is logged in
  if (!currentUser) {
    return <Outlet />;
  }

  // Get current path to handle vendor signin specially
  const currentPath = window.location.pathname;
  
  // Allow regular users to access vendor signin page to switch roles
  if (currentPath === '/vendorSignin' && currentUser && !currentUser.isAdmin && !currentUser.isVendor) {
    return <Outlet />;
  }

  // Allow regular users to access vendor signup page
  if (currentPath === '/vendorSignup' && currentUser && !currentUser.isAdmin && !currentUser.isVendor) {
    return <Outlet />;
  }

  // Check the user's role and redirect accordingly for other signin pages
  if (currentUser.isAdmin) {
    return <Navigate to="/adminDashboard" />;
  } else if (currentUser.isVendor) {
    return <Navigate to="/vendorDashboard" />;
  } else {
    // For regular signin/signup pages, redirect regular users to homepage
    if (currentPath === '/signin' || currentPath === '/signup') {
      return <Navigate to="/" />;
    }
    // For other cases, allow access
    return <Outlet />;
  }
};

export default PrivateRoute;
