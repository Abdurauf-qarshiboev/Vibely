import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "../../../helpers/api";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";

const EditProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    private: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        private: user.private || false,
      });

      // Load avatar preview if exists
      if (user.avatar) {
        fetchAvatar(user.avatar);
      }
    }
  }, [user]);

  const fetchAvatar = async (avatarId) => {
    try {
      const response = await api.get(`/images/${avatarId}`, {
        responseType: "blob",
      });

      if (response && response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setPreviewUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showToast("Avatar image must be less than 5MB", "error");
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showToast("Only JPEG, JPG and PNG images are allowed", "error");
        return;
      }

      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatar) return null;

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", avatar);

      const response = await api.post("/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        return response.data.data.id;
      }
      return null;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showToast("Error uploading avatar image", "error");
      return null;
    } finally {
      setAvatarLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\+[0-9]{10,15}$/.test(formData.phone)) {
      errors.phone = "Invalid phone format (e.g., +1234567890)";
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the form errors", "error");
      return;
    }

    setLoading(true);

    try {
      // Upload avatar if changed
      let avatarId = null;
      if (avatar) {
        avatarId = await uploadAvatar();
      }

      // Prepare data for API
      const profileData = { ...formData };

      // Add avatar ID if uploaded
      if (avatarId) {
        profileData.avatar = avatarId;
      }

      // Update profile
      const response = await api.put("/users/profile", profileData);

      if (response.data && response.data.success) {
        showToast("Profile updated successfully", "success");

        // Refresh user data
        await refreshUser();

        // Navigate back to profile page
        navigate(`/user/${formData.username}`);
      } else {
        showToast(response.data.message || "Error updating profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating profile";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        isDark ? "text-white" : "text-gray-800"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div
                className={`w-32 h-32 rounded-full overflow-hidden ${
                  !previewUrl
                    ? `bg-gray-200 ${
                        isDark ? "border-gray-600" : "border-gray-300"
                      } border-2`
                    : ""
                } flex items-center justify-center cursor-pointer`}
                onClick={triggerFileInput}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}

                {/* Overlay for hover effect */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />

              {previewUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-red-500 text-sm mt-2 block mx-auto hover:text-red-600"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.username
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-white"
              } rounded-md focus:outline-none ${
                isDark ? "focus:border-blue-400" : "focus:border-blue-500"
              }`}
              placeholder="Username"
            />
            {formErrors.username && (
              <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
            )}
          </div>

          {/* First Name and Last Name - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.firstName
                    ? "border-red-500"
                    : isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-300 bg-white"
                } rounded-md focus:outline-none ${
                  isDark ? "focus:border-blue-400" : "focus:border-blue-500"
                }`}
                placeholder="First Name"
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.lastName
                    ? "border-red-500"
                    : isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-300 bg-white"
                } rounded-md focus:outline-none ${
                  isDark ? "focus:border-blue-400" : "focus:border-blue-500"
                }`}
                placeholder="Last Name"
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.email
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-white"
              } rounded-md focus:outline-none ${
                isDark ? "focus:border-blue-400" : "focus:border-blue-500"
              }`}
              placeholder="Email"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.phone
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-white"
              } rounded-md focus:outline-none ${
                isDark ? "focus:border-blue-400" : "focus:border-blue-500"
              }`}
              placeholder="Phone (e.g., +1234567890)"
            />
            {formErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
            )}
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Format: +[country code][phone number] (e.g., +998123456789)
            </p>
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-white"
              } rounded-md focus:outline-none ${
                isDark ? "focus:border-blue-400" : "focus:border-blue-500"
              }`}
              placeholder="Tell something about yourself..."
            />
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Write a short bio to let people know more about you.
            </p>
          </div>

          {/* Private Account Toggle */}
          <div className="flex items-center">
            <input
              id="private"
              name="private"
              type="checkbox"
              checked={formData.private}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="private" className="ml-2 block text-sm">
              Private Account
            </label>
          </div>
          <p
            className={`text-xs -mt-4 ml-6 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            When your account is private, only people you approve can see your
            posts and information.
          </p>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded-md ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || avatarLoading}
              className={`px-4 py-2 rounded-md bg-blue-600 text-white ${
                loading || avatarLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {loading || avatarLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
