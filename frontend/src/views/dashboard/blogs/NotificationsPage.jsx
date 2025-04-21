/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { api } from "@/helpers/api";
import { useTheme } from "@/context/ThemeContext";
import FollowRequests from "./notifications/FollowRequests";
import { message, Spin } from "antd";

// Import other components as needed

export default function NotificationsPage() {
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Fetch follow requests
  const fetchFollowRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/follow-requests");

      if (response.data && response.data.success) {
        setFollowRequests(response.data.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching follow requests:", error);
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Handle request updates (approve/reject)
  const handleRequestHandled = (requestId, action) => {
    setFollowRequests((prev) =>
      prev.filter((req) => req.request_id !== requestId)
    );

    // You could update other relevant state here if needed
    // For example, increment follower count if approved
  };

  // Initial data load
  useEffect(() => {
    fetchFollowRequests();

    // Add other notification fetching here
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Follow requests section */}
            <FollowRequests
              requests={followRequests}
              onRequestHandled={handleRequestHandled}
            />

            {/* Other notification types can go here */}
          </>
        )}
      </div>
    </div>
  );
}
