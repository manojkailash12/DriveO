import { useSelector } from "react-redux";
import UniversalProfile from "../../../components/UniversalProfile";

const AdminProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
          <p className="text-gray-600 mt-1">Manage your admin account settings</p>
        </div>
        
        <div className="p-6">
          <UniversalProfile userRole="admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;