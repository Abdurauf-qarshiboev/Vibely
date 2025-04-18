import { createContext, useContext, useState } from "react";
import { api } from "../helpers/api.js";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // Using Ant Design for messages

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  // const signup = async (signupUser) => {
  //   const apiUser = {
  //     username: signupUser.username,
  //     password: signupUser.password,
  //     firstName: signupUser.firstName,
  //     lastName: signupUser.lastName,
  //     email: signupUser.email,
  //     phone: signupUser.phone,
  //   };

  //   console.log("Signing up with:", apiUser);

  //   try {
  //     const { data } = await api.post("auth/register", apiUser);
  //     console.log("Signup response:", data);

  //     if (data?.error) {
  //       message.warning(`${data.error?.message || "Registration failed"}`);
  //     } else {
  //       message.success(
  //         "Successfully registered. You can now login with your credentials."
  //       );
  //       navigate("/auth/login");
  //     }
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     message.error(
  //       error?.response?.data?.error?.message ||
  //         "Registration failed! Please try again."
  //     );
  //   }
  // };

  const signup = async (signupUser) => {
    // Format the data exactly as shown in your Postman screenshot
    const apiUser = {
      username: signupUser.username,
      password: signupUser.password,
      firstName: signupUser.firstName,
      lastName: signupUser.lastName,
      email: signupUser.email,
      phone: signupUser.phone,
      role: "USER"
    };

    console.log("Signing up with:", apiUser);

    try {

      const { data } = await api.post("auth/register", apiUser);
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
      console.log(data);
      setUser({ ...data });
      setIsAuth(true);
    } catch (err) {
      console.log(err);
      // logout();
    }
  };

  // const updateUserStatus = async (status) => {
  //   try {
  //     const userId = user._id;
  //     const { data } = await api.put(`users/profile`, status);
  //     setUser({ ...data });
  //     message.success("User updated successfully!");
  //   } catch (error) {
  //     console.error(error);
  //     message.error("Failed to update user!");
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        signup,
        login,
        logout,
        checkUser,
        // updateUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
