import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaEye, FaEyeSlash, FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'sonner';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../redux/user/userSlice';

const UniversalProfile = ({ userRole = 'user' }) => {
  const dispatch = useDispatch();
  const { currentUser, isLoading } = useSelector(state => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.username || currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || currentUser.phone || '',
        address: currentUser.adress || currentUser.address || '',
        profileImage: currentUser.profilePicture || currentUser.profileImage || ''
      });
      setImagePreview(currentUser.profilePicture || currentUser.profileImage || '');
    }
  }, [currentUser]);

  // Add effect to refresh user data when component mounts
  useEffect(() => {
    const refreshUserData = async () => {
      if (currentUser?._id) {
        try {
          const response = await fetch(`/api/user/profile/${currentUser._id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              dispatch(updateUserSuccess(data.user));
            }
          }
        } catch (error) {
          console.log('Error refreshing user data:', error);
        }
      }
    };

    refreshUserData();
  }, []); // Run once when component mounts

  const refreshProfile = async () => {
    if (currentUser?._id) {
      try {
        const response = await fetch(`/api/user/profile/${currentUser._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            dispatch(updateUserSuccess(data.user));
            toast.success('Profile refreshed successfully!');
          }
        }
      } catch (error) {
        console.log('Error refreshing user data:', error);
        toast.error('Failed to refresh profile');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      dispatch(updateUserStart());
      
      const formData = new FormData();
      formData.append('username', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phoneNumber', profileData.phone);
      formData.append('adress', profileData.address);
      
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const response = await fetch(`/api/user/editUserProfile/${currentUser._id}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        dispatch(updateUserSuccess(data.user));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setImageFile(null);
        // Update local state with the new data
        setProfileData({
          name: data.user.username || data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phoneNumber || data.user.phone || '',
          address: data.user.adress || data.user.address || '',
          profileImage: data.user.profilePicture || data.user.profileImage || ''
        });
        setImagePreview(data.user.profilePicture || data.user.profileImage || '');
      } else {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      toast.error('Error updating profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`/api/user/changePassword/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Error updating password');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-3xl text-gray-400" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <FaCamera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentUser.username || currentUser.name}</h1>
            <p className="text-gray-600 capitalize">{userRole} Profile</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={refreshProfile}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FaSave />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setImageFile(null);
                  setImagePreview(currentUser.profilePicture || currentUser.profileImage || '');
                  // Reset form data to current user data
                  setProfileData({
                    name: currentUser.username || currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phoneNumber || currentUser.phone || '',
                    address: currentUser.adress || currentUser.address || '',
                    profileImage: currentUser.profilePicture || currentUser.profileImage || ''
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Address
            </label>
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showPasswordSection ? 'Hide' : 'Change Password'}
          </button>
        </div>

        {showPasswordSection && (
          <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handlePasswordUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalProfile;