import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
export default function App() {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Simulate login logic
    console.log(data);
    const success = await fakeLogin(data); // Replace with your real logic

    if (success) {
      navigate("/dashboard"); // or wherever
    } else {
      alert("Barcha maydonlarni to`ldiring!");
    }
  };

  const fakeLogin = async ({ login, password }) => {
    // Simulate a login check
    return login === "admin" && password === "1234";
  };

  const handleKeyPress = (e, nextInputId) => {
    if (e.key === "Enter") {
      setFocus(nextInputId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl w-[400px] mx-auto">
      <h1 className="text-center text-xl font-bold mb-4">Tizimga kirish</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Login</label>
          <input
            type="text"
            {...register("login", { required: "Loginni kiriting!" })}
            onKeyUp={(e) => handleKeyPress(e, "password")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.login && (
            <p className="text-sm text-red-500">{errors.login.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            {...register("password", { required: "Parolni kiriting!" })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded submit-btn"
        >
          Kirish
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4 text-sm">
        Akkaunt yo`qmi?{" "}
        <Link
          to="/signup"
          className="font-semibold text-blue-600 hover:text-blue-400"
        >
          Ro`yxatdan o`ting
        </Link>
      </p>
    </div>
  );
}