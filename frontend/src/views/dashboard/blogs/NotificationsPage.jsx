import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/helpers/api";
import { useTheme } from "@/context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  UserIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { getImageUrl } from "../../../utils/ImageHelpers";
import { message, Button, Spin, Badge, Empty, Tooltip } from "antd";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});
  const [avatarUrls, setAvatarUrls] = useState({});
  const [processingIds, setProcessingIds] = useState({});
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");

      if (response.data && response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (processingIds[notificationId]) return;

    setProcessingIds((prev) => ({ ...prev, [notificationId]: true }));

    try {
      await api.put(`notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error("Failed to update notification");
    } finally {
      setProcessingIds((prev) => ({ ...prev, [notificationId]: false }));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );

      setUnreadCount(0);
      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      message.error("Failed to update notifications");
    }
  };

  // Handle follow requests (approve/reject)
  const handleFollowRequest = async (followId, action, username) => {
    if (processingIds[followId]) return;

    setProcessingIds((prev) => ({ ...prev, [followId]: true }));

    try {
      if (action === "approve") {
        await api.post(`users/follow-requests/${followId}/approve`);
        message.success("Follow request approved");
      } else {
        await api.delete(`users/follow-requests/${followId}/reject`);
        message.success("Follow request rejected");
      }

      // Remove from pending requests in session storage if needed
      if (action === "reject" && username) {
        let requestedByOthers = JSON.parse(
          sessionStorage.getItem("requestedByOthers") || "[]"
        );
        requestedByOthers = requestedByOthers.filter(
          (user) => user !== username
        );
        sessionStorage.setItem(
          "requestedByOthers",
          JSON.stringify(requestedByOthers)
        );
      }

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error);
      message.error(`Failed to ${action} request`);
    } finally {
      setProcessingIds((prev) => ({ ...prev, [followId]: false }));
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      // If less than 24 hours ago, show relative time
      if (Date.now() - date.getTime() < 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      // Otherwise show formatted date
      return format(date, "MMM d, yyyy • h:mm a");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Load avatar URLs
  useEffect(() => {
    const loadAvatars = async () => {
      const newAvatarUrls = { ...avatarUrls };

      for (const notification of notifications) {
        const user = notification.fromUser;
        if (user && user.avatar && !avatarUrls[user.username]) {
          try {
            const url = await getImageUrl(
              user.avatar,
              imageCache,
              setImageCache
            );
            if (url) {
              newAvatarUrls[user.username] = url;
            }
          } catch (error) {
            console.error(`Error loading avatar for ${user.username}:`, error);
          }
        }
      }

      setAvatarUrls(newAvatarUrls);
    };

    if (notifications.length > 0) {
      loadAvatars();
    }
  }, [notifications, imageCache, avatarUrls]);

  // Initial data load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Render notification content based on type
  const renderNotificationContent = (notification) => {
    const { type, fromUser, followId } = notification;

    switch (type) {
      case "FOLLOW_REQUEST":
        return (
          <>
            <div className="flex-1">
              <p className="mb-1">
                <Link
                  to={`/profile/${fromUser.username}`}
                  className="font-semibold hover:underline"
                >
                  {fromUser.username}
                </Link>
                {" wants to follow you"}
              </p>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleFollowRequest(followId, "reject", fromUser.username)
                  }
                  loading={processingIds[followId]}
                >
                  Decline
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    handleFollowRequest(followId, "approve", fromUser.username)
                  }
                  loading={processingIds[followId]}
                >
                  Accept
                </Button>
              </div>
            </div>
          </>
        );

      case "FOLLOW_ACCEPT":
        return (
          <div className="flex-1">
            <p className="mb-1">
              <Link
                to={`/profile/${fromUser.username}`}
                className="font-semibold hover:underline"
              >
                {fromUser.username}
              </Link>
              {" accepted your follow request"}
            </p>
            <Button
              size="small"
              type="default"
              onClick={() => navigate(`/profile/${fromUser.username}`)}
            >
              View Profile
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex-1">
            <p className="mb-1">
              <Link
                to={`/profile/${fromUser.username}`}
                className="font-semibold hover:underline"
              >
                {fromUser.username}
              </Link>
              {" sent you a notification"}
            </p>
          </div>
        );
    }
  };

  // Get notification icon based on type
  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case "FOLLOW_REQUEST":
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <UserPlusIcon className="w-5 h-5 text-blue-500" />
          </div>
        );

      case "FOLLOW_ACCEPT":
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          </div>
        );

      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <CheckIcon className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>

          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                icon={<EyeIcon className="w-5 h-5" />}
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            </Tooltip>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-4 rounded-lg ${
                  notification.read
                    ? isDark
                      ? "bg-gray-800/70"
                      : "bg-white"
                    : isDark
                    ? "bg-blue-900/30"
                    : "bg-blue-50"
                } ${
                  isDark ? "border-gray-800" : "border-gray-100"
                } border shadow-sm`}
              >
                {/* User Avatar */}
                <Link
                  to={`/profile/${notification.fromUser.username}`}
                  className="relative mr-4 flex-shrink-0"
                >
                  {avatarUrls[notification.fromUser.username] ? (
                    <img
                      src={avatarUrls[notification.fromUser.username]}
                      alt={`${notification.fromUser.username}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  {notification.fromUser.verified && (
                    <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </Link>

                {/* Type icon */}
                <div className="mr-4 mt-1">
                  {getNotificationTypeIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1">
                  {renderNotificationContent(notification)}

                  {/* Time */}
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mt-1`}
                  >
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>

                {/* Read Button */}
                {!notification.read && (
                  <Tooltip title="Mark as read">
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className={`p-2 rounded-full ${
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                      disabled={processingIds[notification.id]}
                    >
                      <EyeIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            description="No notifications yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  );
}
