import { useState } from "react";
import Modal from "../../components/CustomModal";
import { TbEditCircle } from "react-icons/tb";

//mui
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { editUserProfile, setUpdated } from "../../redux/user/userSlice";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ProfileEdit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const { username, email, phoneNumber, adress, _id, profilePicture } = useSelector(
    (state) => state.user.currentUser
  );

  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  const editProfileData = async (data, id) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('adress', data.adress);
      
      // Add profile image if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await fetch(`/api/user/editUserProfile/${id}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch(editUserProfile(result.user));
          dispatch(setUpdated(true));
          toast.success("Profile updated successfully!");
          setProfileImage(null);
        } else {
          toast.error(result.message || "Failed to update profile");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating profile");
    }
  };

  const changePassword = async (data) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }

      const response = await fetch(`/api/user/changePassword/${_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully!");
        resetPassword();
        setIsPasswordModalOpen(false);
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error changing password");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button type="button" className="text-blue-500 hover:text-blue-700" onClick={() => setIsModalOpen(true)}>
          <TbEditCircle size={20} />
        </button>
        <button 
          type="button" 
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => setIsPasswordModalOpen(true)}
        >
          Change Password
        </button>
      </div>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="bg-white mt-10 rounded-md max-w-[600px] min-w-[360px]"
      >
        <form onSubmit={handleSubmit((data) => editProfileData(data, _id))}>
          <div className="p-8">
            <h2 className="font-bold text-lg mb-4">Edit Your Profile</h2>
            
            {/* Profile Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={profilePicture || '/default-avatar.png'}
                  alt="Current profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {profileImage && (
                <p className="text-sm text-green-600 mt-1">New image selected: {profileImage.name}</p>
              )}
            </div>

            <div className="flex flex-col mx-auto md:min-w-[500px] gap-4 my-6">
              <TextField
                id="username"
                label="Name"
                variant="outlined"
                {...register("username")}
                defaultValue={username}
                fullWidth
              />

              <TextField
                id="email"
                label="Email"
                variant="outlined"
                defaultValue={email}
                {...register("email")}
                fullWidth
              />
              
              <TextField
                id="phoneNumber"
                label="Phone"
                type="tel"
                variant="outlined"
                defaultValue={phoneNumber}
                {...register("phoneNumber")}
                fullWidth
              />

              <TextField
                id="adress"
                label="Address"
                multiline
                rows={3}
                defaultValue={adress}
                {...register("adress")}
                fullWidth
              />
            </div>

            <div className="flex justify-end items-center gap-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                onClick={() => {
                  setIsModalOpen(false);
                  setProfileImage(null);
                  reset(); // Reset form to original values
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        className="bg-white mt-10 rounded-md max-w-[500px] min-w-[360px]"
      >
        <form onSubmit={handlePasswordSubmit(changePassword)}>
          <div className="p-8">
            <h2 className="font-bold text-lg mb-4">Change Password</h2>
            
            <div className="flex flex-col gap-4 my-6">
              <TextField
                id="currentPassword"
                label="Current Password"
                type="password"
                variant="outlined"
                {...registerPassword("currentPassword", { required: "Current password is required" })}
                fullWidth
                required
              />

              <TextField
                id="newPassword"
                label="New Password"
                type="password"
                variant="outlined"
                {...registerPassword("newPassword", { 
                  required: "New password is required",
                  minLength: { value: 4, message: "Password must be at least 4 characters" }
                })}
                fullWidth
                required
              />

              <TextField
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                {...registerPassword("confirmPassword", { required: "Please confirm your password" })}
                fullWidth
                required
              />
            </div>

            <div className="flex justify-end items-center gap-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  resetPassword();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
              >
                Change Password
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProfileEdit;
