"use client";

import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SignupPage = () => {
  const [user, setUser] = useState({
    name: "",
    lname: "",
    email: "",
    phone: "",
    login: "",
    password: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();

  // Refs for input focus
  const nameInputRef = useRef(null);
  const lnameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const loginInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Focus functions
  const focusLname = () => lnameInputRef.current?.focus();
  const focusEmail = () => emailInputRef.current?.focus();
  const focusPhone = () => phoneInputRef.current?.focus();
  const focusLogin = () => loginInputRef.current?.focus();
  const focusPassword = () => passwordInputRef.current?.focus();

  // Check if personal info is complete
  const isInfosComplete = useMemo(() => {
    return !(user.name && user.lname && user.email && user.phone);
  }, [user.name, user.lname, user.email, user.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!user.name) newErrors.name = "Ismni kiriting!";
    if (!user.lname) newErrors.lname = "Familiyani kiriting!";
    if (!user.email) newErrors.email = "Emailni kiriting!";
    if (!user.phone) newErrors.phone = "Telefon raqamni kiriting!";
    if (!user.login) newErrors.login = "Loginni kiriting!";
    if (!user.password) newErrors.password = "Parolni kiriting!";
    else if (user.password.length < 6)
      newErrors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      await signup(user);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUser({ ...user, avatar: e.target.files[0] });
    }
  };

  const formatPhoneNumber = (value) => {
    // Format phone number as (XX)-XXX-XX-XX
    const numbers = value.replace(/\D/g, "");
    let formatted = "";

    if (numbers.length > 0) formatted += `(${numbers.substring(0, 2)}`;
    if (numbers.length > 2) formatted += `)-${numbers.substring(2, 5)}`;
    if (numbers.length > 5) formatted += `-${numbers.substring(5, 7)}`;
    if (numbers.length > 7) formatted += `-${numbers.substring(7, 9)}`;

    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setUser({ ...user, phone: formatted });

    if (errors.phone) {
      setErrors({ ...errors, phone: "" });
    }
  };

  return (
    <div className="signup bg-white p-5 rounded-2xl w-[600px] max-h-[90vh] overflow-y-auto">
      <h1 className="title text-xl font-bold mb-4 text-center">
        Ro`yxatdan o`tish
      </h1>
      <p className="text-center text-sm text-red-500 mb-4">
        * Iltimos, ro`yxatdan o`tish uchun quyidagi formani kerakli ma`lumotlar
        bilan to`ldiring.
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-sm font-medium text-gray-500">
            Shaxsiy ma`lumotlar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ism
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="name"
                name="name"
                type="text"
                ref={nameInputRef}
                value={user.name}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && focusLname()}
                placeholder="Sadulla"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="lname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Familiya
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="lname"
                name="lname"
                type="text"
                ref={lnameInputRef}
                value={user.lname}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && focusEmail()}
                placeholder="Abdullaev"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.lname ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>
            {errors.lname && (
              <p className="mt-1 text-sm text-red-600">{errors.lname}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      ref={emailInputRef}
                      value={user.email}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === "Enter" && focusPhone()}
                      placeholder="adminbek"
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-r-none`}
                    />
                  </div>
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                    @gmail.com
                  </span>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefon raqam
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                    +998
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    ref={phoneInputRef}
                    value={user.phone}
                    onChange={handlePhoneChange}
                    placeholder="(93)-165-65-10"
                    className={`block w-full px-3 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-md rounded-l-none shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profil rasmi
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {user.avatar ? (
                  <img
                    src={URL.createObjectURL(user.avatar) || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="mx-auto h-24 w-24 object-cover rounded-full"
                  />
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-2 pt-4">
          <h2 className="text-sm font-medium text-gray-500">Login va Parol</h2>
        </div>

        <div>
          <label
            htmlFor="login"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Login
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isInfosComplete ? (
              <div className="group">
                <input
                  id="login"
                  name="login"
                  type="text"
                  ref={loginInputRef}
                  value={user.login}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && focusPassword()}
                  placeholder="adminbek"
                  disabled={isInfosComplete}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Shaxsiy ma`lumotlar to`ldirilmagan
                  </span>
                </div>
              </div>
            ) : (
              <input
                id="login"
                name="login"
                type="text"
                ref={loginInputRef}
                value={user.login}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && focusPassword()}
                placeholder="adminbek"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.login ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            )}
          </div>
          {errors.login && (
            <p className="mt-1 text-sm text-red-600">{errors.login}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isInfosComplete ? (
              <div className="group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  ref={passwordInputRef}
                  value={user.password}
                  onChange={handleInputChange}
                  placeholder="adminbek12345"
                  disabled={isInfosComplete}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Shaxsiy ma`lumotlar to`ldirilmagan
                  </span>
                </div>
              </div>
            ) : (
              <input
                id="password"
                name="password"
                type="password"
                ref={passwordInputRef}
                value={user.password}
                onChange={handleInputChange}
                placeholder="adminbek12345"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            )}
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-4"
        >
          Ro`yxatdan o`tish
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Akkaunt bormi?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-blue-600 hover:text-blue-400"
        >
          Tizimga kiring
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
