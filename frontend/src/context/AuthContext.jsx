import { createContext, useContext, useState } from "react";
import { api } from "../helpers/api";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // Using Ant Design for messages

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const signup = async (userData) => {
    try {
      console.log("Signing up with:", userData);
      const { data } = await api.post("auth/register", userData);
      console.log("Signup response:", data);
      if (data?.error) {
        message.warning(data.error?.message || "Registration failed");
      } else {
        message.success(
          "Successfully registered. You can now login with your credentials."
        );
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          "Registration failed! Please try again."
      );
    }
  };

  const login = async (loginUser) => {
    console.log("Logging in with:", loginUser);

    try {
      const { data } = await api.post(`auth/login`, loginUser);
      if (data) console.log("Login response:", data);
      sessionStorage.setItem("token", data.data?.token);
      setUser({ ...data.data?.user });
      setIsAuth(true);
      message.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      message.error(
        err?.response?.data?.error?.message || "Invalid username or password"
      );
    }
  };

  const logout = () => {
    setUser({});
    setIsAuth(false);
    sessionStorage.removeItem("token");
    navigate("/auth/login");
    message.success("Successfully logged out!");
  };

  const checkUser = async () => {
    try {
      const { data } = await api.get("auth/check-user");
      console.log("Check user data:", data?.data);

      // Convert object to JSON string before storing in sessionStorage
      const currentUser = { ...data.data };
      sessionStorage.setItem("user", JSON.stringify(currentUser));

      setUser(currentUser);
      setIsAuth(true);
    } catch (err) {
      console.log(err);
      logout();
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        signup,
        login,
        logout,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Last updated: 2025-04-21 16:38:16 by Quvonchbek-Qurbonovs
