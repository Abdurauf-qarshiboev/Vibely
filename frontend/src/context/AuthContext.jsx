"use client";

import { createContext, useContext, useState } from "react";
import { api } from "../helpers/api.js";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // Using Ant Design for messages

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const signup = async (signupUser) => {
    try {
      const { data } = await api.post("auth/register", signupUser);
      setUser(signupUser);
      if (data?.error) {
        message.warning(
          "Bunday foydalanuvchi mavjud! Iltimos, boshqa login yozing!"
        );
      } else {
        message.success(
          "Muvafaqqiyatli ro`yhatdan o`tdingiz. Tizimga login va parolingiz orqali kirishingiz mumkin."
        );
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      message.error(
        "Ro`yxatdan o`tishda xatolik yuz berdi! Iltimos, qayta urinib ko`ring."
      );
    }
  };

  const login = async (loginUser) => {
    console.log(loginUser);
    // try {
    //   const { data } = await api.post(`/auth/login`, loginUser);
    //   if (data) console.log(data);
    //   sessionStorage.setItem("token", data.token);
    //   setUser({ ...data.user });
    //   setIsAuth(true);
    //   navigate("/home");
    // } catch (err) {
    //   console.error(err);
    //   message.error(err?.response?.data.message);
    // }
  };

  const logout = () => {
    setUser({});
    setIsAuth(false);
    sessionStorage.removeItem("token");
    navigate("/login");
    message.success("Tizimdan muvaffaqiyatli chiqdingiz!");
  };

  const checkUser = async () => {
    try {
      const { data } = await api.get("auth/checkuser");
      setUser({ ...data });
      setIsAuth(true);
    } catch (err) {
      console.log(err);
      logout();
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const userId = user._id;
      const { data } = await api.put(`auth/update/${userId}`, updatedUser);
      setUser({ ...data });
      message.success("Foydalanuvchi muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error(error);
      message.error("Foydalanuvchini yangilashda xatolik yuz berdi!");
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
