import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/helpers/api";
import { useAuth } from "@/context/AuthContext";
import { message } from "antd";

const PasswordUpdateModal = ({ isOpen, closeModal }) => {
  const { theme } = useTheme();
  const { checkUser } = useAuth();
  const isDark = theme === "dark";
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!passwords.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/update-password", passwords);

      if (response.data && response.data.success) {
        // Store the new token
        sessionStorage.setItem("token", response.data.data.token);

        // Refresh user data
        await checkUser();

        message.success("Password updated successfully");
        closeModal();
      } else {
        message.error(response.data?.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      message.error(
        error.response?.data?.message || "Failed to update password"
      );

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 401) {
        setErrors({ oldPassword: "Current password is incorrect" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => !loading && closeModal()}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                  isDark ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Update Password
                  </Dialog.Title>
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Old Password Field */}
                  <div>
                    <label
                      htmlFor="oldPassword"
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="oldPassword"
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={passwords.oldPassword}
                        onChange={handleChange}
                        disabled={loading}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.oldPassword
                            ? "border-red-500"
                            : isDark
                            ? "border-gray-700 bg-gray-800 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.oldPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={handleChange}
                        disabled={loading}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.newPassword
                            ? "border-red-500"
                            : isDark
                            ? "border-gray-700 bg-gray-800 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      className={`mr-3 px-4 py-2 text-sm font-medium rounded-md ${
                        isDark
                          ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                        loading
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PasswordUpdateModal;
