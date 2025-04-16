"use client";
import { Button } from "antd";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome to Home Page</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>User Information</h2>
        <p>
          <strong>Name:</strong> {user.name} {user.lname}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Login:</strong> {user.login}
        </p>
      </div>
      <Button type="primary" danger onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default HomePage;
